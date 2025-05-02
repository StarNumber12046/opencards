from mitmproxy import http

# Replace this with the domain you want to intercept
TARGET_DOMAIN = "api.skycards.oldapes.com"
LOCAL_IP = "humbly-gentle-skink.ngrok-free.app"
LOCAL_PORT = 443  # Change this if your local service uses a different port


def request(flow: http.HTTPFlow) -> None:
    if TARGET_DOMAIN in flow.request.host:
        if "/airports" in flow.request.url or "/models" in flow.request.path:
            print(f"[MITM] Not redirecting {flow.request.pretty_url} to local IP 🚧")
            return
        print(f"[MITM] Redirecting {flow.request.pretty_url} to local IP 🚧")

        # Preserve path/query while changing host and port
        flow.request.host = LOCAL_IP
        flow.request.port = LOCAL_PORT

        # Avoid SNI mismatch errors if HTTPS
        flow.request.headers["host"] = TARGET_DOMAIN
