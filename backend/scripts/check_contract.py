import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BACKEND_SPEC = ROOT / "openapi" / "v1.json"
FRONTEND_SPEC = ROOT.parent / "frontend" / "packages" / "api-client" / "openapi" / "v1.json"


def main() -> int:
    backend = json.loads(BACKEND_SPEC.read_text(encoding="utf-8"))
    frontend = json.loads(FRONTEND_SPEC.read_text(encoding="utf-8"))
    backend_routes = _operations(backend)
    frontend_routes = _operations(frontend)
    if backend_routes != frontend_routes:
        missing = sorted(backend_routes - frontend_routes)
        stale = sorted(frontend_routes - backend_routes)
        print(
            "Frontend API snapshot differs. "
            f"Missing operations: {missing}; stale operations: {stale}"
        )
        return 1
    print(f"Frontend and backend OpenAPI operations match ({len(backend_routes)} operations).")
    return 0


def _operations(spec: dict) -> set[tuple[str, str]]:
    return {
        (method.upper(), path)
        for path, operations in spec["paths"].items()
        for method in operations
        if method.lower() in {"get", "post", "patch", "put", "delete"}
    }


if __name__ == "__main__":
    sys.exit(main())
