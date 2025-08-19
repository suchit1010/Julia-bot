import requests

# Both base URLs from your backend logs
BASE_URLS = {
    "yieldswarm": "http://127.0.0.1:8052/api/v1/yieldswarm",
    "ai-swarm": "http://127.0.0.1:8052/api/v1/ai-swarm"
}

# Endpoints for each API
ENDPOINTS = {
    "yieldswarm": ["status", "orders", "positions", "trades"],
    "ai-swarm": [
        "status",
        "start",
        "stop",
        "emergency-stop",
        "performance",
        "agents",
        "data/realtime",
        "config"
    ]
}

for api_name, base_url in BASE_URLS.items():
    print(f"\n=== Testing {api_name} API ===")
    for ep in ENDPOINTS[api_name]:
        url = f"{base_url}/{ep}"
        try:
            r = requests.get(url, timeout=3)
            print(f"{url} -> {r.status_code}")
        except requests.RequestException as e:
            print(f"{url} -> ERROR: {e}")
