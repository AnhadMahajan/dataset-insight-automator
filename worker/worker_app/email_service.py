from __future__ import annotations

from typing import Any

import requests

from worker_app.settings import get_settings

settings = get_settings()


def _summary_to_html(summary: str, metrics: dict[str, Any]) -> str:
    safe_summary = summary.replace("\n", "<br>")
    overview = metrics.get("dataset_overview", {})
    num_rows = overview.get("num_rows", 0)
    num_columns = overview.get("num_columns", 0)
    missing_values = overview.get("missing_values", 0)

    return f"""
    <div style=\"font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto;\">
      <h2>Dataset Insight Report</h2>
      <p><strong>Rows:</strong> {num_rows}</p>
      <p><strong>Columns:</strong> {num_columns}</p>
      <p><strong>Missing Values:</strong> {missing_values}</p>
      <hr />
      <div style=\"line-height: 1.6;\">{safe_summary}</div>
    </div>
    """


def send_summary_email(recipient_email: str, summary: str, metrics: dict[str, Any]) -> None:
    if not settings.resend_api_key:
        return

    payload = {
        "from": settings.resend_from_email,
        "to": [recipient_email],
        "subject": "Your Dataset Insight Report",
        "html": _summary_to_html(summary, metrics),
    }

    response = requests.post(
        "https://api.resend.com/emails",
        headers={
            "Authorization": f"Bearer {settings.resend_api_key}",
            "Content-Type": "application/json",
        },
        json=payload,
        timeout=30,
    )
    response.raise_for_status()
