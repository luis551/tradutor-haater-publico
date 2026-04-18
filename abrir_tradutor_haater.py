from __future__ import annotations

import http.server
import socket
import socketserver
import webbrowser
from functools import partial
from pathlib import Path


ROOT = Path(__file__).resolve().parent


class SilentHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, format: str, *args) -> None:
        return


def find_free_port() -> int:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.bind(("localhost", 0))
        return sock.getsockname()[1]


def main() -> None:
    port = find_free_port()
    handler = partial(SilentHandler, directory=str(ROOT))

    with socketserver.TCPServer(("localhost", port), handler) as httpd:
        url = f"http://localhost:{port}/index.html"
        print("Tradutor Haater aberto no navegador.")
        print("Pressione Ctrl+C para encerrar.")
        webbrowser.open(url)
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServidor encerrado.")


if __name__ == "__main__":
    main()
