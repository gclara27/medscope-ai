#!/usr/bin/env python3
"""Verify pinned production model and demo golden scores — T-902.

Usage:
  python scripts/verify_demo_model.py
  python scripts/verify_demo_model.py --api-base https://medscope-ai-q8tg.onrender.com
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

sys.path.insert(0, str(ROOT))
sys.path.insert(0, str(ROOT / "backend"))

from ml.demo_golden import (  # noqa: E402
    assert_manifest_matches_golden,
    load_demo_golden,
    score_within_tolerance,
)
from ml.training.serialize import (  # noqa: E402
    load_production_manifest,
    validate_production_artifacts,
)

DEFAULT_API_BASE = "https://medscope-ai-q8tg.onrender.com"


def verify_local_artifacts() -> list[str]:
    failures: list[str] = []
    try:
        manifest = load_production_manifest()
        golden = load_demo_golden()
        assert_manifest_matches_golden(manifest, golden)
        validate_production_artifacts()
        print(
            f"Artifacts OK: {manifest.get('model_id')} v{manifest.get('model_version')} "
            f"(checksums pinned)",
        )
    except (AssertionError, FileNotFoundError, ValueError, TypeError) as exc:
        failures.append(f"local artifacts: {exc}")
    return failures


def verify_api(api_base: str) -> list[str]:
    base = api_base.rstrip("/")
    failures: list[str] = []
    golden = load_demo_golden()

    print(f"API: {base}")

    with httpx.Client(timeout=90.0) as client:
        try:
            health = client.get(f"{base}/health")
            health.raise_for_status()
            payload = health.json()
            print(f"Health: ml_ready={payload.get('ml_ready')}")
            if payload.get("ml_ready") is not True:
                failures.append("ml_ready is not true")
        except httpx.HTTPError as exc:
            failures.append(f"health check failed: {exc}")
            return failures

        for scenario_id, scenario in golden["scenarios"].items():
            expected = scenario["expected"]
            try:
                response = client.post(f"{base}/demo/predict", json=scenario["payload"])
            except httpx.HTTPError as exc:
                failures.append(f"{scenario_id}: request failed ({exc})")
                continue

            if response.status_code != 200:
                failures.append(f"{scenario_id}: HTTP {response.status_code}")
                continue

            data = response.json()
            if data.get("model_version") != golden["model_version"]:
                failures.append(
                    f"{scenario_id}: model_version={data.get('model_version')!r} "
                    f"expected {golden['model_version']!r}",
                )
                continue

            if not score_within_tolerance(
                data["risk_score"],
                expected["risk_score"],
                golden["score_tolerance"],
            ):
                failures.append(
                    f"{scenario_id}: risk_score={data['risk_score']} "
                    f"expected {expected['risk_score']}",
                )
                continue

            if data.get("risk_level") != expected["risk_level"]:
                failures.append(
                    f"{scenario_id}: risk_level={data.get('risk_level')!r} "
                    f"expected {expected['risk_level']!r}",
                )
                continue

            print(
                f"OK  {scenario_id}: {data['risk_percent']}% ({data['risk_level']}) "
                f"v{data.get('model_version')}",
            )

        sim = golden["simulation"]
        baseline = golden["scenarios"][sim["baseline_scenario"]]["payload"]
        try:
            response = client.post(
                f"{base}/demo/simulate",
                json={"baseline": baseline, "modifications": sim["modifications"]},
            )
        except httpx.HTTPError as exc:
            failures.append(f"simulation: request failed ({exc})")
            return failures

        if response.status_code != 200:
            failures.append(f"simulation: HTTP {response.status_code}")
        else:
            data = response.json()
            expected = sim["expected"]
            if not score_within_tolerance(
                data["delta_risk_percent"],
                expected["delta_risk_percent"],
                golden["percent_tolerance"],
            ):
                failures.append(
                    f"simulation: delta={data['delta_risk_percent']} "
                    f"expected {expected['delta_risk_percent']}",
                )
            else:
                print(
                    f"OK  simulation: {data['original_risk_percent']}% → "
                    f"{data['simulated_risk_percent']}% (Δ {data['delta_risk_percent']}%)",
                )

    return failures


def main() -> int:
    parser = argparse.ArgumentParser(description="Verify pinned demo model (T-902)")
    parser.add_argument(
        "--api-base",
        default=DEFAULT_API_BASE,
        help=f"Optional API URL to verify live /demo endpoints (default: {DEFAULT_API_BASE})",
    )
    parser.add_argument(
        "--local-only",
        action="store_true",
        help="Only validate artifacts and checksums on disk.",
    )
    args = parser.parse_args()

    failures = verify_local_artifacts()
    if not args.local_only:
        failures.extend(verify_api(args.api_base))

    if failures:
        print("\nFAILED:")
        for item in failures:
            print(f"  - {item}")
        return 1

    print("\nDemo model verification passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
