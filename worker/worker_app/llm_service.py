from __future__ import annotations

import json
import logging
from typing import Any

import requests

from worker_app.settings import get_settings

settings = get_settings()
logger = logging.getLogger(__name__)


def _build_prompt(summary: dict[str, Any]) -> str:
    summary_json = json.dumps(summary, indent=2)
    return (
        "You are a data analysis expert. "
        "Given the following dataset summary, generate actionable insights and observations. "
        "Do not assume any specific column names. "
        "Identify interesting patterns, trends, anomalies, and correlations. "
        "If there are datetime trends, mention them. "
        "If there are strong correlations or outliers, highlight them. "
        "Structure your response with: Executive Summary, Key Metrics, Notable Trends, Anomalies, and Recommendations. "
        "Use clear bullet points.\n\n"
        f"Dataset Summary:\n{summary_json}"
    )


def _fallback_summary(summary: dict[str, Any]) -> str:
    overview = summary.get("dataset_overview", {})
    num_rows = overview.get("num_rows", 0)
    num_columns = overview.get("num_columns", 0)
    missing = overview.get("missing_values", 0)
    numeric_cols = list(summary.get("numeric_analysis", {}).keys())
    categorical_cols = list(summary.get("categorical_analysis", {}).keys())
    trend_series = list(summary.get("trends", {}).get("series", {}).keys())
    outlier_columns = list(summary.get("anomalies", {}).get("outlier_counts", {}).keys())
    fallback = [
        "Executive Summary",
        f"Dataset has {num_rows} rows, {num_columns} columns, and {missing} missing values.",
        "",
        "Key Metrics",
        f"Numeric columns: {', '.join(numeric_cols) if numeric_cols else 'None'}.",
        f"Categorical columns: {', '.join(categorical_cols) if categorical_cols else 'None'}.",
        "",
        "Notable Trends",
        f"Trend-ready numeric columns: {', '.join(trend_series) if trend_series else 'None'}.",
        "",
        "Anomalies",
        f"Columns with detected outliers: {', '.join(outlier_columns) if outlier_columns else 'None'}.",
        "",
        "Recommendations",
        "Review columns with high missing values and outliers. Explore top categories and trends for further insights."
    ]
    return "\n".join(fallback)


def generate_insight_summary(metrics: dict[str, Any]) -> str:
    if not settings.gemini_api_key:
        logger.warning(
            "GEMINI_API_KEY is not configured; using fallback template summary. "
            "Set GEMINI_API_KEY in environment variables to enable AI-generated insights."
        )
        return _fallback_summary(metrics)

    endpoint = (
        "https://generativelanguage.googleapis.com/v1beta/models/"
        f"{settings.gemini_model}:generateContent?key={settings.gemini_api_key}"
    )
    payload = {
        "contents": [
            {
                "role": "user",
                "parts": [{"text": _build_prompt(metrics)}],
            }
        ],
        "generationConfig": {
            "temperature": 0.2,
            "maxOutputTokens": 800,
        },
    }

    try:
        response = requests.post(endpoint, json=payload, timeout=45)
        response.raise_for_status()
        body = response.json()
    except requests.RequestException:
        return _fallback_summary(metrics)

    candidates = body.get("candidates", [])
    if not candidates:
        return _fallback_summary(metrics)

    parts = candidates[0].get("content", {}).get("parts", [])
    text = "\n".join(part.get("text", "") for part in parts).strip()
    return text or _fallback_summary(metrics)
