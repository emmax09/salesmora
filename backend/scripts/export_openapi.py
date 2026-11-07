import argparse
import json
from pathlib import Path

from app.main import app

ROOT = Path(__file__).resolve().parents[1]
TARGET = ROOT / "openapi" / "v1.json"


def main() -> int:
    parser = argparse.ArgumentParser(description="Export or verify the versioned OpenAPI v1 file.")
    parser.add_argument("--check", action="store_true", help="fail if the committed spec is stale")
    args = parser.parse_args()
    rendered = json.dumps(app.openapi(), indent=2, ensure_ascii=False) + "\n"
    if args.check:
        if not TARGET.exists() or TARGET.read_text(encoding="utf-8") != rendered:
            print("backend/openapi/v1.json is stale; run python scripts/export_openapi.py")
            return 1
        print("OpenAPI v1 matches the FastAPI routes and response models.")
        return 0
    TARGET.parent.mkdir(parents=True, exist_ok=True)
    TARGET.write_text(rendered, encoding="utf-8")
    print(f"Wrote {TARGET.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
