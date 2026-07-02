#!/usr/bin/env python3
"""Verify demo flow stability — no critical errors (T-906, KPIs §15).

Checks health, seeds, golden model scores, authenticated MVP API path
(predict → simulate → history → dashboard → analytics), and optional frontend smoke.

Usage:
  python scripts/verify_demo_stability.py
  python scripts/verify_demo_stability.py --api-base http://localhost:8000
  python scripts/verify_demo_stability.py --production
"""

from __future__ import annotations

import argparse
import sys
import time
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
from _venv_bootstrap import reexec_in_project_venv  # noqa: E402

reexec_in_project_venv(ROOT)

import httpx

sys.path.insert(0, str(ROOT))
sys.path.insert(0, str(ROOT / "backend"))

from ml.demo_golden import load_demo_golden, score_within_tolerance  # noqa: E402
from seeds.users import DEMO_PASSWORD, SEED_USERS  # noqa: E402

DEFAULT_API_BASE = "https://medscope-ai-q8tg.onrender.com"
DEFAULT_FRONTEND_URL = "https://medscope-ai-delta.vercel.app"
MAX_INFERENCE_MS = 1000
CLINICIAN_EMAIL = "clinician@medscope.ai"
ADMIN_EMAIL = "admin@medscope.ai"


def _auth_headers(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


def _login(client: httpx.Client, base: str, email: str, password: str) -> str:
    response = client.post(
        f"{base}/auth/login",
        json={"email": email, "password": password},
    )
    if response.status_code != 200:
        raise RuntimeError(f"{email}: login HTTP {response.status_code} — {response.text[:200]}")
    token = response.json().get("access_token")
    if not token:
        raise RuntimeError(f"{email}: missing access_token")
    return token


def check_health(client: httpx.Client, base: str, failures: list[str]) -> None:
    try:
        response = client.get(f"{base}/health")
        response.raise_for_status()
        payload = response.json()
        print(f"  Health: status={payload.get('status')} ml_ready={payload.get('ml_ready')}")
        if payload.get("status") != "ok":
            failures.append("health status is not ok")
        if payload.get("ml_ready") is not True:
            failures.append("ml_ready is not true — warm up /health before demo")
    except httpx.HTTPError as exc:
        failures.append(f"health check failed: {exc}")


def check_seed_logins(client: httpx.Client, base: str, password: str, failures: list[str]) -> None:
    for user in SEED_USERS:
        email = user["email"]
        expected_role = user["role_name"]
        try:
            response = client.post(
                f"{base}/auth/login",
                json={"email": email, "password": password},
            )
        except httpx.HTTPError as exc:
            failures.append(f"seed {email}: request failed ({exc})")
            continue

        if response.status_code != 200:
            failures.append(f"seed {email}: HTTP {response.status_code}")
            continue

        actual_role = response.json().get("user", {}).get("role")
        if actual_role != expected_role:
            failures.append(f"seed {email}: expected role {expected_role}, got {actual_role}")
            continue
        print(f"  OK  seed login {email} ({actual_role})")


def check_demo_golden(client: httpx.Client, base: str, failures: list[str]) -> None:
    golden = load_demo_golden()

    for scenario_id, scenario in golden["scenarios"].items():
        try:
            response = client.post(f"{base}/demo/predict", json=scenario["payload"])
        except httpx.HTTPError as exc:
            failures.append(f"demo {scenario_id}: request failed ({exc})")
            continue

        if response.status_code != 200:
            failures.append(f"demo {scenario_id}: HTTP {response.status_code}")
            continue

        data = response.json()
        expected = scenario["expected"]
        if not score_within_tolerance(
            data["risk_score"],
            expected["risk_score"],
            golden["score_tolerance"],
        ):
            failures.append(f"demo {scenario_id}: risk_score drift")
            continue
        if data.get("risk_level") != expected["risk_level"]:
            failures.append(f"demo {scenario_id}: risk_level mismatch")
            continue
        print(f"  OK  demo/predict {scenario_id} ({data['risk_percent']}%)")

    sim = golden["simulation"]
    baseline = golden["scenarios"][sim["baseline_scenario"]]["payload"]
    try:
        response = client.post(
            f"{base}/demo/simulate",
            json={"baseline": baseline, "modifications": sim["modifications"]},
        )
    except httpx.HTTPError as exc:
        failures.append(f"demo simulate: request failed ({exc})")
        return

    if response.status_code != 200:
        failures.append(f"demo simulate: HTTP {response.status_code}")
        return

    data = response.json()
    if not score_within_tolerance(
        data["delta_risk_percent"],
        sim["expected"]["delta_risk_percent"],
        golden["percent_tolerance"],
    ):
        failures.append("demo simulate: delta drift")
    else:
        print(
            f"  OK  demo/simulate delta {data['delta_risk_percent']}% "
            f"({data['original_risk_percent']}% -> {data['simulated_risk_percent']}%)",
        )


def check_authenticated_demo_flow(
    client: httpx.Client,
    base: str,
    password: str,
    failures: list[str],
) -> None:
    golden = load_demo_golden()
    high = golden["scenarios"]["high-readmission"]
    sim = golden["simulation"]

    try:
        clinician_token = _login(client, base, CLINICIAN_EMAIL, password)
    except RuntimeError as exc:
        failures.append(str(exc))
        return

    headers = _auth_headers(clinician_token)

    started = time.perf_counter()
    try:
        predict_response = client.post(
            f"{base}/predict",
            json=high["payload"],
            headers=headers,
        )
    except httpx.HTTPError as exc:
        failures.append(f"POST /predict: {exc}")
        return

    elapsed_ms = int((time.perf_counter() - started) * 1000)

    if predict_response.status_code != 200:
        failures.append(f"POST /predict: HTTP {predict_response.status_code}")
        return

    prediction: dict[str, Any] = predict_response.json()
    prediction_id = prediction.get("id")
    if not prediction_id:
        failures.append("POST /predict: missing prediction id")
        return

    if prediction.get("prediction_time_ms", 9999) >= MAX_INFERENCE_MS:
        failures.append(
            f"POST /predict: prediction_time_ms={prediction.get('prediction_time_ms')} "
            f"(KPI < {MAX_INFERENCE_MS}ms)",
        )
    if elapsed_ms >= MAX_INFERENCE_MS * 2:
        failures.append(f"POST /predict: client round-trip {elapsed_ms}ms too slow")

    if not prediction.get("shap_explanations"):
        failures.append("POST /predict: missing SHAP explanations")

    expected = high["expected"]
    if not score_within_tolerance(
        prediction["risk_score"],
        expected["risk_score"],
        golden["score_tolerance"],
    ):
        failures.append("POST /predict: risk_score drift vs golden")
    elif prediction.get("risk_level") != expected["risk_level"]:
        failures.append("POST /predict: risk_level mismatch")
    else:
        print(
            f"  OK  POST /predict {prediction['risk_percent']}% "
            f"({prediction['prediction_time_ms']}ms, SHAP={len(prediction['shap_explanations'])})",
        )

    try:
        simulate_response = client.post(
            f"{base}/simulate",
            json={
                "prediction_id": prediction_id,
                "modifications": sim["modifications"],
            },
            headers=headers,
        )
    except httpx.HTTPError as exc:
        failures.append(f"POST /simulate: {exc}")
        return

    if simulate_response.status_code != 200:
        failures.append(f"POST /simulate: HTTP {simulate_response.status_code}")
        return

    simulation = simulate_response.json()
    if not score_within_tolerance(
        simulation["delta_risk_percent"],
        sim["expected"]["delta_risk_percent"],
        golden["percent_tolerance"],
    ):
        failures.append("POST /simulate: delta drift vs golden")
    else:
        print(
            f"  OK  POST /simulate delta {simulation['delta_risk_percent']}% "
            f"({simulation['original_risk_percent']}% -> {simulation['simulated_risk_percent']}%)",
        )

    try:
        history_response = client.get(f"{base}/history", headers=headers)
        history_response.raise_for_status()
        history = history_response.json()
        items = history.get("items") or []
        if not items:
            failures.append("GET /history: empty list")
        else:
            print(f"  OK  GET /history ({len(items)} item(s))")

        detail_response = client.get(
            f"{base}/history/{prediction_id}",
            headers=headers,
        )
        if detail_response.status_code != 200:
            failures.append(f"GET /history/{{id}}: HTTP {detail_response.status_code}")
        else:
            detail = detail_response.json()
            if not detail.get("shap_explanations"):
                failures.append("GET /history/{id}: missing SHAP in detail")
            else:
                print("  OK  GET /history/{id} with SHAP")

        dashboard_response = client.get(f"{base}/dashboard", headers=headers)
        if dashboard_response.status_code != 200:
            failures.append(f"GET /dashboard: HTTP {dashboard_response.status_code}")
        else:
            print("  OK  GET /dashboard")

    except httpx.HTTPError as exc:
        failures.append(f"history/dashboard: {exc}")

    try:
        admin_token = _login(client, base, ADMIN_EMAIL, password)
        analytics_response = client.get(
            f"{base}/analytics",
            headers=_auth_headers(admin_token),
        )
        if analytics_response.status_code != 200:
            failures.append(f"GET /analytics (admin): HTTP {analytics_response.status_code}")
        else:
            analytics = analytics_response.json()
            summary = analytics.get("summary") or {}
            if summary.get("total_predictions") is None:
                failures.append("GET /analytics: missing summary.total_predictions")
            else:
                print("  OK  GET /analytics (admin)")

        clinician_analytics = client.get(f"{base}/analytics", headers=headers)
        if clinician_analytics.status_code != 403:
            failures.append(
                f"GET /analytics (clinician): expected 403, got {clinician_analytics.status_code}",
            )
        else:
            print("  OK  GET /analytics (clinician) -> 403 as expected")

    except httpx.HTTPError as exc:
        failures.append(f"analytics RBAC: {exc}")


def check_frontend_smoke(frontend_url: str, failures: list[str]) -> None:
    base = frontend_url.rstrip("/")
    paths = ("/login", "/demo", "/")
    with httpx.Client(timeout=30.0, follow_redirects=True) as client:
        for path in paths:
            url = f"{base}{path}"
            try:
                response = client.get(url)
            except httpx.HTTPError as exc:
                failures.append(f"frontend {path}: {exc}")
                continue
            if response.status_code >= 400:
                failures.append(f"frontend {path}: HTTP {response.status_code}")
            else:
                print(f"  OK  frontend GET {path} ({response.status_code})")


def verify(
    api_base: str,
    *,
    password: str = DEMO_PASSWORD,
    frontend_url: str | None = None,
) -> list[str]:
    base = api_base.rstrip("/")
    failures: list[str] = []

    print(f"API: {base}")
    if frontend_url:
        print(f"Frontend: {frontend_url.rstrip('/')}")

    with httpx.Client(timeout=90.0) as client:
        print("\n==> Health")
        check_health(client, base, failures)

        print("\n==> Demo seed logins (T-901)")
        check_seed_logins(client, base, password, failures)

        print("\n==> Golden demo endpoints (T-902)")
        check_demo_golden(client, base, failures)

        print("\n==> Authenticated MVP flow (predict -> simulate -> history)")
        check_authenticated_demo_flow(client, base, password, failures)

    if frontend_url:
        print("\n==> Frontend smoke")
        check_frontend_smoke(frontend_url, failures)

    return failures


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Verify demo flow stability (T-906)")
    parser.add_argument(
        "--api-base",
        default=DEFAULT_API_BASE,
        help=f"API base URL (default: {DEFAULT_API_BASE})",
    )
    parser.add_argument(
        "--frontend-url",
        default=None,
        help="Optional frontend base URL for smoke checks",
    )
    parser.add_argument(
        "--production",
        action="store_true",
        help="Use production Render + Vercel URLs",
    )
    parser.add_argument(
        "--password",
        default=DEMO_PASSWORD,
        help="Demo user password",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    api_base = DEFAULT_API_BASE if args.production else args.api_base
    frontend_url = DEFAULT_FRONTEND_URL if args.production else args.frontend_url

    print("T-906 - Demo flow stability (KPIs section 15)")
    failures = verify(api_base, password=args.password, frontend_url=frontend_url)

    if failures:
        print("\nFAILED - critical demo flow issues:")
        for item in failures:
            print(f"  - {item}")
        return 1

    print("\nDemo stability verification passed (T-906).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
