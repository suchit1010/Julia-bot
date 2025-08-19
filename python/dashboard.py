import json
import requests
import time
import os
from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from rich.layout import Layout

CONFIG_FILE = "config.json"
console = Console()

def load_config():
    if not os.path.exists(CONFIG_FILE):
        raise FileNotFoundError(f"Missing {CONFIG_FILE}")
    with open(CONFIG_FILE, "r") as f:
        return json.load(f)

def fetch_data(base_url, endpoint, method):
    url = f"{base_url}/{endpoint}"
    try:
        if method == "GET":
            r = requests.get(url, timeout=5)
        elif method == "POST":
            r = requests.post(url, timeout=5)
        else:
            return None
        
        if r.status_code == 200:
            return r.json()
        else:
            return None
    except requests.RequestException:
        return None

def make_status_panel(status_data):
    if not status_data:
        return Panel("No data", title="Status", style="red")
    return Panel(json.dumps(status_data, indent=2), title="Status", style="green")

def make_performance_table(perf_data):
    table = Table(title="Performance")
    table.add_column("Metric")
    table.add_column("Value")
    if perf_data:
        for k, v in perf_data.items():
            table.add_row(str(k), str(v))
    else:
        table.add_row("No data", "-")
    return table

def make_agents_table(agents_data):
    table = Table(title="Agents")
    table.add_column("ID")
    table.add_column("Status")
    if agents_data and isinstance(agents_data, list):
        for agent in agents_data:
            table.add_row(str(agent.get("id", "-")), str(agent.get("status", "-")))
    else:
        table.add_row("-", "No data")
    return table

def main():
    config = load_config()
    base_url = config["base_url"]
    endpoints = config.get("endpoints", {})

    while True:
        layout = Layout()
        status_data = fetch_data(base_url, "status", endpoints.get("status", "GET"))
        perf_data = fetch_data(base_url, "performance", endpoints.get("performance", "GET"))
        agents_data = fetch_data(base_url, "agents", endpoints.get("agents", "GET"))

        layout.split_column(
            Layout(make_status_panel(status_data), ratio=1),
            Layout(make_performance_table(perf_data), ratio=2),
            Layout(make_agents_table(agents_data), ratio=2),
        )

        console.clear()
        console.print(layout)
        time.sleep(config.get("refresh_interval", 5))

if __name__ == "__main__":
    main()
