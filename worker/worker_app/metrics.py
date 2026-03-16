from __future__ import annotations

import math
from pathlib import Path
from typing import Any

import pandas as pd


class MetricError(Exception):
    pass


def load_dataset(file_path: str) -> pd.DataFrame:
    path = Path(file_path)
    if not path.exists():
        raise MetricError("Uploaded file was not found.")

    suffix = path.suffix.lower()
    if suffix == ".csv":
        df = pd.read_csv(path)
    elif suffix in (".xlsx", ".xls"):
        df = pd.read_excel(path)
    else:
        raise MetricError("Unsupported file format.")

    if df.empty:
        raise MetricError("Dataset contains no rows.")

    return df


def _to_serializable(value: Any) -> Any:
    if value is None:
        return None
    if isinstance(value, bool):
        return value
    if isinstance(value, (int, str)):
        return value
    if isinstance(value, float):
        if math.isnan(value) or math.isinf(value):
            return None
        return round(value, 4)
    if isinstance(value, (pd.Timestamp, pd.Period)):
        return str(value)
    if pd.isna(value):
        return None
    if hasattr(value, "item"):
        try:
            return _to_serializable(value.item())
        except Exception:
            return str(value)
    return str(value)


def _infer_datetime_column(series: pd.Series) -> bool:
    if pd.api.types.is_datetime64_any_dtype(series):
        return True

    non_null = series.dropna()
    if non_null.empty:
        return False

    sample = non_null.astype(str).head(500)
    parsed = pd.to_datetime(sample, errors="coerce")
    parse_ratio = float(parsed.notna().mean())
    return parse_ratio >= 0.7


def detect_column_types(df: pd.DataFrame) -> dict[str, list[str]]:
    numeric_cols = [
        col
        for col in df.columns
        if pd.api.types.is_numeric_dtype(df[col]) and not pd.api.types.is_bool_dtype(df[col])
    ]

    datetime_cols: list[str] = []
    for col in df.columns:
        if col in numeric_cols:
            continue
        if _infer_datetime_column(df[col]):
            datetime_cols.append(col)

    categorical_cols = [
        col for col in df.columns if col not in numeric_cols and col not in datetime_cols
    ]

    return {
        "numeric": numeric_cols,
        "categorical": categorical_cols,
        "datetime": datetime_cols,
    }


def _top_category_points(series: pd.Series, total_rows: int) -> list[dict[str, Any]]:
    points: list[dict[str, Any]] = []
    for label, count in series.items():
        count_value = int(count)
        percentage = round((count_value / total_rows) * 100, 2) if total_rows else 0.0
        points.append(
            {
                "label": "(missing)" if pd.isna(label) else str(label),
                "count": count_value,
                "percentage": percentage,
            }
        )
    return points


def _build_numeric_analysis(df: pd.DataFrame, numeric_cols: list[str]) -> dict[str, Any]:
    numeric_analysis: dict[str, Any] = {}
    for col in numeric_cols:
        series = pd.to_numeric(df[col], errors="coerce")
        numeric_analysis[col] = {
            "count": int(series.count()),
            "missing": int(series.isna().sum()),
            "mean": _to_serializable(series.mean()),
            "std": _to_serializable(series.std()),
            "min": _to_serializable(series.min()),
            "p25": _to_serializable(series.quantile(0.25)),
            "median": _to_serializable(series.median()),
            "p75": _to_serializable(series.quantile(0.75)),
            "max": _to_serializable(series.max()),
            "sum": _to_serializable(series.sum()),
        }
    return numeric_analysis


def _build_categorical_analysis(df: pd.DataFrame, categorical_cols: list[str]) -> dict[str, Any]:
    categorical_analysis: dict[str, Any] = {}
    total_rows = int(len(df))
    for col in categorical_cols:
        series = df[col]
        top_categories = series.value_counts(dropna=False).head(10)
        categorical_analysis[col] = {
            "unique_values": int(series.nunique(dropna=True)),
            "top_categories": _top_category_points(top_categories, total_rows),
        }
    return categorical_analysis


def _build_correlations(df: pd.DataFrame, numeric_cols: list[str]) -> dict[str, Any]:
    if len(numeric_cols) < 2:
        return {"matrix": {}, "strongest_pairs": []}

    numeric_df = df[numeric_cols].apply(pd.to_numeric, errors="coerce")
    corr_df = numeric_df.corr()

    matrix: dict[str, dict[str, float | None]] = {}
    for col in corr_df.columns:
        matrix[col] = {
            other: _to_serializable(corr_df.loc[col, other]) for other in corr_df.columns
        }

    strongest_pairs: list[dict[str, Any]] = []
    columns = list(corr_df.columns)
    for i, left in enumerate(columns):
        for right in columns[i + 1 :]:
            value = corr_df.loc[left, right]
            if pd.isna(value):
                continue
            corr_value = float(value)
            strongest_pairs.append(
                {
                    "left": left,
                    "right": right,
                    "correlation": round(corr_value, 4),
                    "abs_correlation": round(abs(corr_value), 4),
                }
            )

    strongest_pairs.sort(key=lambda item: item["abs_correlation"], reverse=True)
    return {
        "matrix": matrix,
        "strongest_pairs": strongest_pairs[:10],
    }


def _build_anomalies(df: pd.DataFrame, numeric_cols: list[str]) -> dict[str, Any]:
    outlier_counts: dict[str, int] = {}
    outlier_indices_sample: dict[str, list[int | str]] = {}

    for col in numeric_cols:
        series = pd.to_numeric(df[col], errors="coerce")
        non_null = series.dropna()
        if non_null.empty:
            continue

        q1 = non_null.quantile(0.25)
        q3 = non_null.quantile(0.75)
        iqr = q3 - q1
        if pd.isna(iqr) or float(iqr) == 0.0:
            continue

        lower = q1 - 1.5 * iqr
        upper = q3 + 1.5 * iqr
        mask = (series < lower) | (series > upper)
        count = int(mask.sum())
        if count <= 0:
            continue

        outlier_counts[col] = count
        sample_indices: list[int | str] = []
        for idx in mask[mask].index.tolist()[:25]:
            if isinstance(idx, int):
                sample_indices.append(idx)
            else:
                sample_indices.append(str(idx))
        outlier_indices_sample[col] = sample_indices

    return {
        "method": "iqr_1.5",
        "outlier_counts": outlier_counts,
        "outlier_indices_sample": outlier_indices_sample,
    }


def _build_trends(df: pd.DataFrame, datetime_cols: list[str], numeric_cols: list[str]) -> dict[str, Any]:
    if not datetime_cols or not numeric_cols:
        return {"datetime_column": None, "series": {}}

    selected_col: str | None = None
    parsed_dates: pd.Series | None = None
    for dt_col in datetime_cols:
        parsed = pd.to_datetime(df[dt_col], errors="coerce")
        if int(parsed.notna().sum()) >= 2:
            selected_col = dt_col
            parsed_dates = parsed
            break

    if selected_col is None or parsed_dates is None:
        return {"datetime_column": None, "series": {}}

    period_series = parsed_dates.dt.to_period("M")
    trend_series: dict[str, list[dict[str, Any]]] = {}

    for num_col in numeric_cols:
        numeric_series = pd.to_numeric(df[num_col], errors="coerce")
        grouped = (
            pd.DataFrame({"period": period_series, "value": numeric_series})
            .dropna(subset=["period", "value"])
            .groupby("period")["value"]
            .mean()
            .sort_index()
        )
        if grouped.empty:
            continue

        trend_series[num_col] = [
            {"period": str(period), "value": _to_serializable(value)}
            for period, value in grouped.items()
        ]

    return {
        "datetime_column": selected_col,
        "series": trend_series,
    }


def analyze_dataset(df: pd.DataFrame) -> dict[str, Any]:
    column_types = detect_column_types(df)
    numeric_cols = column_types["numeric"]
    categorical_cols = column_types["categorical"]
    datetime_cols = column_types["datetime"]

    missing_values_by_column = {
        str(col): int(df[col].isna().sum()) for col in df.columns
    }

    inferred_type_by_column = {
        col: "numeric"
        if col in numeric_cols
        else "datetime"
        if col in datetime_cols
        else "categorical"
        for col in df.columns
    }

    dataset_overview = {
        "num_rows": int(df.shape[0]),
        "num_columns": int(df.shape[1]),
        "missing_values": int(df.isna().sum().sum()),
        "missing_values_by_column": missing_values_by_column,
        "detected_column_types": column_types,
        "columns": [
            {
                "name": str(col),
                "dtype": str(df[col].dtype),
                "inferred_type": inferred_type_by_column[col],
            }
            for col in df.columns
        ],
    }

    return {
        "dataset_overview": dataset_overview,
        "numeric_analysis": _build_numeric_analysis(df, numeric_cols),
        "categorical_analysis": _build_categorical_analysis(df, categorical_cols),
        "correlations": _build_correlations(df, numeric_cols),
        "anomalies": _build_anomalies(df, numeric_cols),
        "trends": _build_trends(df, datetime_cols, numeric_cols),
    }
