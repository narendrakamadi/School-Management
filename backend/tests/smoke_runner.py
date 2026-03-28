"""Simple smoke harness to verify route registration without a running server."""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from main import app


def main() -> None:
    routes = sorted(
        {
            route.path
            for route in app.routes
            if hasattr(route, "methods") and "HEAD" not in route.methods
        }
    )

    print(f"registered_routes={len(routes)}")
    for path in routes[:20]:
        print(path)


if __name__ == "__main__":
    main()


