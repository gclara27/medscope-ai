#!/usr/bin/env python3
"""Verify demo seed users against a running MedScope API — T-901, Database.md §10.

Usage:
  python scripts/verify_demo_seeds.py
  python scripts/verify_demo_seeds.py --api-base http://localhost:8000
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
from _venv_bootstrap import reexec_in_project_venv  # noqa: E402

reexec_in_project_venv(ROOT)

import httpx

sys.path.insert(0, str(ROOT / "backend"))

from seeds.users import DEMO_PASSWORD, SEED_USERS  # noqa: E402

DEFAULT_API_BASE = "https://medscope-ai-q8tg.onrender.com"


def verify(api_base: str, password: str) -> int:
    base = api_base.rstrip("/")
    failures: list[str] = []

    print(f"API: {base}")
    print(f"Password: {'*' * len(password)}")

    with httpx.Client(timeout=90.0) as client:
        try:
            health = client.get(f"{base}/health")
            health.raise_for_status()
            payload = health.json()
            print(f"Health: status={payload.get('status')} ml_ready={payload.get('ml_ready')}")
            if payload.get("ml_ready") is not True:
                failures.append("ml_ready is not true — warm up /health before demo")
        except httpx.HTTPError as exc:
            failures.append(f"health check failed: {exc}")

        for user in SEED_USERS:
            email = user["email"]
            expected_role = user["role_name"]
            try:
                response = client.post(
                    f"{base}/auth/login",
                    json={"email": email, "password": password},
                )
            except httpx.HTTPError as exc:
                failures.append(f"{email}: request failed ({exc})")
                continue

            if response.status_code != 200:
                detail = response.text[:200]
                failures.append(f"{email}: HTTP {response.status_code} — {detail}")
                continue

            data = response.json()
            actual_role = data.get("user", {}).get("role")
            if actual_role != expected_role:
                failures.append(f"{email}: expected role {expected_role}, got {actual_role}")
                continue

            print(f"OK  {email} -> {actual_role}")

    if failures:
        print("\nFAILED:")
        for item in failures:
            print(f"  - {item}")
        return 1

    print(f"\nAll {len(SEED_USERS)} demo seed users verified.")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description="Verify MedScope demo seed logins (T-901)")
    parser.add_argument(
        "--api-base",
        default=DEFAULT_API_BASE,
        help=f"API base URL (default: {DEFAULT_API_BASE})",
    )
    parser.add_argument(
        "--password",
        default=DEMO_PASSWORD,
        help="Demo password (default: seed value from backend/seeds/users.py)",
    )
    args = parser.parse_args()
    return verify(args.api_base, args.password)


if __name__ == "__main__":
    raise SystemExit(main())
