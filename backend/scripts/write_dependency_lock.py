import argparse
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def main() -> int:
    parser = argparse.ArgumentParser(description="Write a resolved backend dependency lock.")
    parser.add_argument("--runtime", action="store_true", help="write production dependencies")
    args = parser.parse_args()
    output_name = "requirements.lock" if args.runtime else "requirements-dev.lock"
    freeze = subprocess.run(
        [sys.executable, "-m", "pip", "freeze", "--exclude-editable"],
        check=True,
        capture_output=True,
        text=True,
    )
    lines = [
        line
        for line in freeze.stdout.splitlines()
        if not line.lower().startswith(("salesmora-backend==", "salesmora-backend @"))
    ]
    target = ROOT / output_name
    target.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"Wrote {output_name} with {len(lines)} pinned dependencies.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
