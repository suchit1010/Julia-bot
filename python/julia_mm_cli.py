import os
import json
import threading
import time
import requests
import sys
import math
from datetime import datetime
from typing import Any, Dict, Optional, List

from rich.console import Console
from rich.live import Live
from rich.panel import Panel
from rich.table import Table
from rich.layout import Layout
from rich.align import Align
from rich.text import Text
from rich import box
from rich.columns import Columns
from rich.progress import Progress, SpinnerColumn, TextColumn
from rich.rule import Rule
from rich.markdown import Markdown
from rich.measure import Measurement
from rich.traceback import install

install()
console = Console()

DEFAULT_CONFIG = {
    "base_url": "http://localhost:8080/v1",
    "api_key": None,
    "refresh_interval": 5
}


def load_config(path: str = "config.json") -> Dict[str, Any]:
    cfg = DEFAULT_CONFIG.copy()
    # Environment variables override
    cfg["base_url"] = os.environ.get("JULIAMM_BASE_URL", cfg["base_url"])
    cfg["api_key"] = os.environ.get("JULIAMM_API_KEY", cfg["api_key"])
    cfg["refresh_interval"] = int(os.environ.get("JULIAMM_REFRESH", cfg["refresh_interval"]))
    if os.path.exists(path):
        try:
            with open(path, "r") as f:
                filecfg = json.load(f)
            cfg.update(filecfg)
        except Exception as e:
            console.print(f"[red]Failed to load config.json: {e}[/red]")
    return cfg


# ---------- HTTP helper ----------
def api_get(endpoint: str, params: Optional[Dict] = None, cfg: Dict = DEFAULT_CONFIG, timeout: int = 10) -> Any:
    """
    Calls backend GET {base_url}{endpoint}. Returns parsed JSON or raises.
    This intentionally uses real HTTP calls as requested.
    """
    base = cfg.get("base_url", DEFAULT_CONFIG["base_url"]).rstrip("/")
    # endpoint should start with '/'
    url = f"{base}{endpoint}" if endpoint.startswith('/') else f"{base}/{endpoint}"
    headers = {}
    if cfg.get("api_key"):
        headers["Authorization"] = f"Bearer {cfg['api_key']}"
    r = requests.get(url, params=params, headers=headers, timeout=timeout)
    r.raise_for_status()
    # Expect JSON
    return r.json()


def api_post(endpoint: str, data: Optional[Dict] = None, cfg: Dict = DEFAULT_CONFIG, timeout: int = 10) -> Any:
    """
    Calls backend POST {base_url}{endpoint}. Returns parsed JSON or raises.
    """
    base = cfg.get("base_url", DEFAULT_CONFIG["base_url"]).rstrip("/")
    url = f"{base}{endpoint}" if endpoint.startswith('/') else f"{base}/{endpoint}"
    headers = {"Content-Type": "application/json"}
    if cfg.get("api_key"):
        headers["Authorization"] = f"Bearer {cfg['api_key']}"
    r = requests.post(url, json=data or {}, headers=headers, timeout=timeout)
    r.raise_for_status()
    return r.json()


# ---------- Input handling (cross-platform single-key) ----------
def _get_single_key_blocking() -> str:
    """Blocking single-character read. Cross-platform (Windows/Unix)."""
    if os.name == "nt":
        import msvcrt
        ch = msvcrt.getwch()
        return ch
    else:
        import sys, tty, termios
        fd = sys.stdin.fileno()
        old = termios.tcgetattr(fd)
        try:
            tty.setraw(fd)
            ch = sys.stdin.read(1)
            return ch
        finally:
            termios.tcsetattr(fd, termios.TCSADRAIN, old)


def _get_single_key_nonblocking() -> Optional[str]:
    """
    Non-blocking attempt to read a single key — uses select on Unix, msvcrt on Windows.
    Returns None if no key pressed.
    """
    if os.name == "nt":
        import msvcrt
        if msvcrt.kbhit():
            return msvcrt.getwch()
        return None
    else:
        import select, sys, termios, tty
        fd = sys.stdin.fileno()
        old = termios.tcgetattr(fd)
        try:
            tty.setcbreak(fd)
            dr, dw, de = select.select([sys.stdin], [], [], 0)
            if dr:
                return sys.stdin.read(1)
            return None
        finally:
            termios.tcsetattr(fd, termios.TCSADRAIN, old)


# ---------- Shared Application State ----------
class AppState:
    def __init__(self, cfg: Dict):
        self.cfg = cfg
        self.refresh_interval = int(cfg.get("refresh_interval", 5))
        self.last_refresh = 0.0
        self.stop_event = threading.Event()
        self.force_refresh = False

        # which view (1..7) -> default 1
        self.view = 1

        # data containers updated by fetcher thread
        self.data: Dict[str, Any] = {
            "status": {},
            "orders": {},
            "positions": {},
            "trades": {},
            "pnl": {},
            "ai_decisions": {},
            "analysis": {},
        }
        self.errors: Dict[str, str] = {}

        self.start_time = time.time()

    def uptime_str(self) -> str:
        elapsed = int(time.time() - self.start_time)
        h = elapsed // 3600
        m = (elapsed % 3600) // 60
        s = elapsed % 60
        return f"{h}h{m}m{s}s"


# ---------- Background fetcher thread ----------
def fetch_loop(state: AppState):
    """
    Periodically fetch endpoints and store results into state.data.
    Keeps trying; records errors in state.errors.
    Now fetches all available backend endpoints for dashboard views.
    """
    endpoints = {
        "status": "/status",
        "orders": "/open-orders",      # open orders (new endpoint)
        "trades": "/trades",           # trade history
        "positions": "/positions",      # current positions
        "balance": "/balance",          # account balance
        "pnl": "/pnl",                  # realized PnL
        "ai_decisions": "/ai_decisions",
        "analysis": "/analysis",
        "performance": "/performance",
        "agents": "/agents",
        "realtime_data": "/data/realtime",
        # Add more endpoints as needed
    }
    while not state.stop_event.is_set():
        now = time.time()
        do_fetch = state.force_refresh or (now - state.last_refresh) >= state.refresh_interval
        if do_fetch:
            for k, ep in endpoints.items():
                try:
                    data = api_get(ep, cfg=state.cfg)
                    state.data[k] = data
                    state.errors.pop(k, None)
                except Exception as e:
                    state.errors[k] = str(e)
            state.last_refresh = time.time()
            state.force_refresh = False
        # sleep a little, but allow quick stop
        for _ in range(10):
            if state.stop_event.is_set():
                break
            time.sleep(0.1)


# ---------- Rendering helpers for each view ----------
def top_bar(state: AppState) -> Panel:
    cfg = state.cfg
    left = Text.assemble(
        (" JuliaMM ", "bold white on #333344"),
        (" • ", "white"),
        (cfg.get("base_url", ""), "bold cyan"),
        ("  "),
        (f"refresh={state.refresh_interval}s", "yellow"),
        ("  "),
        (f"uptime: {state.uptime_str()}", "green"),
    )
    right = Text(f"View: {state.view}  (1-7)  q=quit  r=refresh  +/- = interval", style="bright_black")
    columns = Columns([left, right], equal=False, expand=True)
    return Panel(columns, style="on #111111", padding=(0, 1))


def status_view(state: AppState) -> Panel:
    data = state.data.get("status", {})
    err = state.errors.get("status")
    if err:
        return Panel(Text(f"Error contacting /status: {err}", style="red"), title="Status", border_style="red")
    # Build panels like your image: metrics + uptime + response history
    agents = data.get("agents", [])
    swarm = data.get("swarm_status", "Unknown")
    trading_active = data.get("trading_active", False)
    uptime = data.get("uptime", "N/A")
    active_symbols = data.get("active_symbols", [])

    left_table = Table.grid(expand=True)
    left_table.add_column(justify="left")
    left_table.add_row(f"Agents Running: [bold]{len(agents)}[/bold]")
    left_table.add_row(f"Swarm: [bold]{swarm}[/bold]")
    left_table.add_row(f"Trading Active: [bold]{'Yes' if trading_active else 'No'}[/bold]")
    left_table.add_row(f"System Uptime: {uptime}")
    left_table.add_row(f"Active Symbols: {', '.join(active_symbols) if active_symbols else 'N/A'}")

    # Response time history -> if provided, render sparkline
    rtimes: List[float] = data.get("response_times", [])  # expecting list of floats (seconds)
    if rtimes and len(rtimes) > 0:
        import statistics
        mn = min(rtimes)
        mx = max(rtimes)
        avg = statistics.mean(rtimes)
        # create ASCII sparkline
        from rich.console import Console
        from rich.measure import Measurement
        spark = "".join("▁▂▃▄▅▆▇█"[min(7, int((v - mn) / (mx - mn + 1e-9) * 7))] for v in rtimes[-56:])
        stats = f"Min: {mn*1000:.0f}ms  Max: {mx*1000:.0f}ms  Avg: {avg*1000:.0f}ms"
    else:
        spark = "(no timing data)"
        stats = ""

    right_panel = Panel(Text(spark + "\n" + stats), title="Response Time History", border_style="blue")
    container = Columns([left_table, right_panel], expand=True)
    return Panel(container, title="System Status", border_style="green")


def orders_view(state: AppState) -> Panel:
    data = state.data.get("orders", {})
    err = state.errors.get("orders")
    if err:
        return Panel(Text(f"Error contacting /orders: {err}", style="red"), title="Orders", border_style="red")
    # The backend returns {"success": true, "orders": [...]}
    orders = data.get("orders", [])
    if isinstance(data, dict) and "orders" in data:
        orders = data["orders"]
    t = Table(title=f"Open Orders ({len(orders)})", box=box.SIMPLE_HEAVY, expand=True)
    t.add_column("Order ID", style="bright_black")
    t.add_column("Symbol", style="cyan")
    t.add_column("Side", style="green")
    t.add_column("Price", style="yellow", justify="right")
    t.add_column("Size", style="white", justify="right")
    t.add_column("Status", style="magenta")
    t.add_column("Age", style="bright_black", justify="right")
    now = time.time()
    for o in orders:
        order_id = str(o.get("order_id", o.get("id", "N/A")))
        symbol = o.get("symbol", "N/A")
        side = o.get("side", o.get("buy_sell", "N/A"))
        price = o.get("price", "N/A")
        size = o.get("size", "N/A")
        status = o.get("status", "N/A")
        created = o.get("created_at")
        age = "-"
        if created:
            try:
                # accept iso or epoch:
                if isinstance(created, (int, float)):
                    age_s = now - float(created)
                else:
                    # try parse
                    age_s = (now - time.mktime(datetime.fromisoformat(str(created)).timetuple()))
                age = f"{int(age_s)}s"
            except Exception:
                age = "-"
        t.add_row(order_id, symbol, side, str(price), str(size), str(status), age)
    return Panel(t, title="Open Orders", border_style="magenta")


def positions_view(state: AppState) -> Panel:
    data = state.data.get("positions", {})
    err = state.errors.get("positions")
    if err:
        return Panel(Text(f"Error contacting /positions: {err}", style="red"), title="Positions", border_style="red")
    positions = data.get("positions", [])
    t = Table(title=f"Open Positions ({len(positions)})", box=box.MINIMAL_DOUBLE_HEAD, expand=True)
    t.add_column("Symbol", style="cyan")
    t.add_column("Entry", style="yellow", justify="right")
    t.add_column("Size", style="white", justify="right")
    t.add_column("Unreal PnL", style="white", justify="right")
    t.add_column("Leverage", style="bright_black", justify="right")
    for p in positions:
        pnl = p.get("unrealized_pnl", 0)
        pnl_text = Text(f"{pnl:.2f}" if isinstance(pnl, (int, float)) else str(pnl))
        pnl_text.style = "green" if (isinstance(pnl, (int, float)) and pnl >= 0) else "red"
        t.add_row(
            p.get("symbol", "N/A"),
            f"{p.get('entry_price', 'N/A')}",
            f"{p.get('size', 'N/A')}",
            pnl_text,
            f"{p.get('leverage', 'N/A')}"
        )
    return Panel(t, title="Positions", border_style="blue")


def trades_history_view(state: AppState) -> Panel:
    data = state.data.get("trades", {})
    err = state.errors.get("trades")
    if err:
        return Panel(Text(f"Error contacting /trades: {err}", style="red"), title="Trade History", border_style="red")
    trades = data.get("trades", [])[:50]  # show up to 50 recent
    t = Table(title=f"Trade History (showing {len(trades)})", box=box.SIMPLE, expand=True)
    t.add_column("Time", style="bright_black")
    t.add_column("Symbol", style="cyan")
    t.add_column("Side", style="green")
    t.add_column("Price", style="yellow", justify="right")
    t.add_column("Size", style="white", justify="right")
    t.add_column("Realized PnL", style="magenta", justify="right")
    for tr in trades:
        t.add_row(
            str(tr.get("timestamp", tr.get("time", "N/A"))),
            tr.get("symbol", "N/A"),
            tr.get("side", "N/A"),
            str(tr.get("price", "N/A")),
            str(tr.get("size", "N/A")),
            str(tr.get("realized_pnl", "N/A"))
        )
    return Panel(t, title="Trades", border_style="yellow")


def pnl_view(state: AppState) -> Panel:
    data = state.data.get("pnl", {})
    err = state.errors.get("pnl")
    if err:
        return Panel(Text(f"Error contacting /pnl: {err}", style="red"), title="PnL", border_style="red")
    realized = float(data.get("realized", 0))
    unrealized = float(data.get("unrealized", 0))
    total = float(data.get("total", realized + unrealized))
    fees = float(data.get("fees", 0))
    volumes = float(data.get("volumes", 0))
    apy = float(data.get("apy", 0))
    # small bars by ratio
    def bar(value, width=30):
        if volumes <= 0:
            scale = 0
        else:
            scale = min(1.0, value / (volumes or 1.0))
        filled = int(scale * width)
        return "[" + "#" * filled + "-" * (width - filled) + "]"
    left = Table.grid(expand=True)
    left.add_column()
    left.add_row(f"[green]Realized:[/green] ${realized:.2f}")
    left.add_row(f"[yellow]Unrealized:[/yellow] ${unrealized:.2f}")
    left.add_row(f"[bold]Total:[/bold] ${total:.2f}")
    left.add_row(f"[red]Fees:[/red] ${fees:.2f}")
    left.add_row(f"[cyan]Volumes:[/cyan] ${volumes:.2f}")
    left.add_row(f"[magenta]APY:[/magenta] {apy:.2f}%")
    # small per-symbol breakdown if provided
    per_symbol = data.get("by_symbol", {})
    if per_symbol:
        items = []
        for s, val in per_symbol.items():
            items.append(f"{s}: ${val.get('total', 0):.2f}")
        right = Panel("\n".join(items[:10]), title="Per Symbol")
        container = Columns([left, right])
    else:
        container = left
    return Panel(container, title="PnL Overview", border_style="green")


def ai_decisions_view(state: AppState) -> Panel:
    data = state.data.get("ai_decisions", {})
    err = state.errors.get("ai_decisions")
    if err:
        return Panel(Text(f"Error contacting /ai-decisions: {err}", style="red"), title="AI Decisions", border_style="red")
    decisions = data.get("decisions", [])[:20]
    t = Table(title=f"AI Decisions (last {len(decisions)})", box=box.ROUNDED, expand=True)
    t.add_column("Time", style="bright_black")
    t.add_column("Type", style="cyan")
    t.add_column("Value", style="yellow")
    t.add_column("Confidence", style="green", justify="right")
    for d in decisions:
        conf = d.get("confidence", 0)
        conf_label = f"{conf:.2f}%" if isinstance(conf, (int, float)) else str(conf)
        t.add_row(str(d.get("timestamp", "N/A")), d.get("type", "N/A"), str(d.get("value", "N/A")), conf_label)
    return Panel(t, title="AI Decisions", border_style="magenta")


def analysis_view(state: AppState) -> Panel:
    data = state.data.get("analysis", {})
    err = state.errors.get("analysis")
    if err:
        return Panel(Text(f"Error contacting /analysis: {err}", style="red"), title="Analysis", border_style="red")
    trend = data.get("trends", "N/A")
    sentiment = data.get("sentiment", "N/A")
    optim = data.get("optimizations", "N/A")
    # small ascii bar for sentiment if numeric
    sentiment_bar = ""
    try:
        if isinstance(sentiment, (int, float)):
            pct = max(-100, min(100, sentiment))
            left = max(0, int((pct + 100) / 200 * 20))
            right = 20 - left
            sentiment_bar = "[" + ("+" * left) + ("-" * right) + "]"
        else:
            sentiment_bar = str(sentiment)
    except Exception:
        sentiment_bar = str(sentiment)
    md = Markdown(f"**Trends:** {trend}\n\n**Sentiment:** {sentiment}\n\n**Optimizations:** {optim}\n\n`{sentiment_bar}`")
    return Panel(md, title="Analysis", border_style="blue")


def performance_view(state: AppState) -> Panel:
    """
    Shows the full raw performance report and a summary of key metrics.
    """
    perf = state.data.get("performance", {})
    report = perf.get("performance_report", {})
    raw_report = report.get("raw_report") or perf.get("raw_report") or "No report available."
    metrics = perf.get("realtime_metrics", {})
    summary = []
    if metrics:
        summary.append(f"Trading Iterations: {metrics.get('trading_iterations', 'N/A')}")
        summary.append(f"System Uptime: {metrics.get('system_uptime', 'N/A'):.2f}s" if 'system_uptime' in metrics else "System Uptime: N/A")
        summary.append(f"Agents Active: {metrics.get('agents_active', 'N/A')}")
        summary.append(f"Current Time: {metrics.get('current_time', 'N/A')}")
        # Add more metrics as needed
    if report:
        summary.append(f"Account Performance: Initial ${report.get('Initial Balance', 'N/A')}, Current ${report.get('Current Balance', 'N/A')}, Return {report.get('Total Return', 'N/A')}")
        summary.append(f"Total Trades Executed: {report.get('Total Trades Executed', 'N/A')}")
        summary.append(f"AI Decision Accuracy: {report.get('AI Decision Accuracy', 'N/A')}")
        summary.append(f"Swarm Consensus Rate: {report.get('Swarm Consensus Rate', 'N/A')}")
    summary_text = "\n".join(summary)
    panel = Panel(Text(summary_text, style="green"), title="Performance Summary", border_style="green")
    raw_panel = Panel(Text(str(raw_report), style="bright_black"), title="Full Performance Report", border_style="cyan")
    return Panel(Columns([panel, raw_panel], expand=True), title="Performance", border_style="green")


# ---------- Main renderer ----------
def build_layout(state: AppState) -> Layout:
    layout = Layout()
    layout.split_column(
        Layout(name="header", size=3),
        Layout(name="body", ratio=1),
        Layout(name="footer", size=3),
    )

    layout["header"].update(top_bar(state))

    # body split into main and side
    body = Layout()
    body.split_row(
        Layout(name="main", ratio=3),
        Layout(name="side", ratio=1)
    )

    view = state.view
    if view == 1:
        body["main"].update(status_view(state))
    elif view == 2:
        body["main"].update(orders_view(state))
    elif view == 3:
        body["main"].update(positions_view(state))
    elif view == 4:
        body["main"].update(trades_history_view(state))
    elif view == 5:
        body["main"].update(pnl_view(state))
    elif view == 6:
        body["main"].update(ai_decisions_view(state))
    elif view == 7:
        body["main"].update(analysis_view(state))
    elif view == 8:
        body["main"].update(performance_view(state))
    else:
        body["main"].update(Panel(Text("Unknown view"), title="Error"))

    # side panel: quick info + errors + recent logs/history
    side = Table.grid(expand=True)
    side.add_column()
    side.add_row(f"[bold]Last refresh:[/bold] {datetime.fromtimestamp(state.last_refresh).isoformat() if state.last_refresh else 'Never'}")
    side.add_row(f"[bold]Elapsed:[/bold] {state.uptime_str()}")
    # show small error summary if any
    if state.errors:
        err_text = "\n".join(f"[red]{k}[/red]: {v}" for k, v in state.errors.items())
        side.add_row(Rule("Errors"))
        side.add_row(Text(err_text))
    else:
        side.add_row("[green]No errors[/green]")
    # Show recent logs/history from performance endpoint
    perf = state.data.get("performance", {})
    logs = perf.get("logs") or perf.get("history") or []
    if logs:
        log_text = "\n".join(str(log) for log in logs[-10:])  # show last 10 logs
        side.add_row(Rule("Recent Logs"))
        side.add_row(Text(log_text, style="bright_black"))
    body["side"].update(Panel(side, title="Info"))

    layout["body"].update(body)

    footer_text = Text.assemble(
        (" 1:Status  ", "bold cyan"),
        ("2:Orders  ", "bold magenta"),
        ("3:Positions  ", "bold blue"),
        ("4:History  ", "bold yellow"),
        ("5:PnL  ", "bold green"),
        ("6:AI  ", "bold magenta"),
        ("7:Analysis  ", "bold blue"),
        ("8:Performance  ", "bold cyan"),
        ("  r:refresh  s:start x:stop q:quit  +/-:interval", "bright_black")
    )
    layout["footer"].update(Panel(footer_text, style="on #111111"))
    return layout


# ---------- Input thread ----------
def input_loop(state: AppState):
    """
    Non-blocking input loop that listens for keys and mutates state.
    """
    try:
        while not state.stop_event.is_set():
            ch = _get_single_key_nonblocking()
            if not ch:
                time.sleep(0.1)
                continue
            # normalize
            if isinstance(ch, str):
                key = ch.lower()
            else:
                key = str(ch)
            if key in ("q", "\x03"):  # q or Ctrl-C
                state.stop_event.set()
                break
            elif key in ("1", "2", "3", "4", "5", "6", "7", "8"):
                try:
                    state.view = int(key)
                    state.force_refresh = True
                except:
                    pass
            elif key == "r":
                state.force_refresh = True
            elif key == "+":
                state.refresh_interval = max(1, state.refresh_interval - 1)
            elif key == "-":
                state.refresh_interval = state.refresh_interval + 1
            elif key == "s":
                # Start trading (POST to /start)
                try:
                    result = api_post("/start", {"symbols": ["ETHUSDT"], "max_capital": 100}, cfg=state.cfg)
                    state.errors["start"] = "Started trading: " + str(result)
                    state.force_refresh = True
                except Exception as e:
                    state.errors["start"] = "Start error: " + str(e)
            elif key == "x":
                # Stop trading (POST to /stop)
                try:
                    result = api_post("/stop", {}, cfg=state.cfg)
                    state.errors["stop"] = "Stopped trading: " + str(result)
                    state.force_refresh = True
                except Exception as e:
                    state.errors["stop"] = "Stop error: " + str(e)
            # ignore others
    except Exception:
        # If input fails (e.g., on some environments), gracefully stop
        state.stop_event.set()


def health_check(cfg):
    endpoints = ["/positions", "/trades", "/open-orders", "/balance"]
    for ep in endpoints:
        try:
            data = api_get(ep, cfg=cfg)
            print(f"{ep}: OK, {len(data.get('positions', data.get('trades', data.get('orders', []))))} items")
        except Exception as e:
            print(f"{ep}: ERROR - {e}")

if __name__ == "__main__":
    cfg = load_config()
    health_check(cfg)

# ---------- Entrypoint ----------
def main():
    cfg = load_config("config.json")
    state = AppState(cfg)

    fetcher = threading.Thread(target=fetch_loop, args=(state,), daemon=True)
    fetcher.start()

    input_thread = threading.Thread(target=input_loop, args=(state,), daemon=True)
    input_thread.start()

    console.print("[bold]JuliaMM Dashboard[/bold] — connecting to [cyan]" + cfg.get("base_url", "") + "[/cyan]")
    # Use rich.Live to continuously render layout
    with Live(build_layout(state), screen=True, redirect_stderr=False, refresh_per_second=4) as live:
        try:
            while not state.stop_event.is_set():
                # trigger redraw
                live.update(build_layout(state))
                # small sleep to remain responsive
                time.sleep(0.25)
        except KeyboardInterrupt:
            state.stop_event.set()
        finally:
            state.stop_event.set()
            # wait a little to let threads exit
            time.sleep(0.2)
    console.print("Exiting...")

if __name__ == "__main__":
    main()