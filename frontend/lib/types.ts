export type JobStatus = "queued" | "processing" | "completed" | "failed";

export interface DatasetColumn {
  name: string;
  dtype: string;
  inferred_type: "numeric" | "categorical" | "datetime";
}

export interface ColumnTypeBuckets {
  numeric: string[];
  categorical: string[];
  datetime: string[];
}

export interface DatasetOverview {
  num_rows: number;
  num_columns: number;
  missing_values: number;
  missing_values_by_column: Record<string, number>;
  detected_column_types: ColumnTypeBuckets;
  columns: DatasetColumn[];
}

export interface NumericColumnSummary {
  count: number;
  missing: number;
  mean: number | null;
  std: number | null;
  min: number | null;
  p25: number | null;
  median: number | null;
  p75: number | null;
  max: number | null;
  sum: number | null;
}

export type NumericAnalysis = Record<string, NumericColumnSummary>;

export interface CategoryPoint {
  label: string;
  count: number;
  percentage: number;
}

export interface CategoricalColumnSummary {
  unique_values: number;
  top_categories: CategoryPoint[];
}

export type CategoricalAnalysis = Record<string, CategoricalColumnSummary>;

export interface CorrelationPair {
  left: string;
  right: string;
  correlation: number;
  abs_correlation: number;
}

export interface CorrelationsSummary {
  matrix: Record<string, Record<string, number | null>>;
  strongest_pairs: CorrelationPair[];
}

export interface AnomaliesSummary {
  method: string;
  outlier_counts: Record<string, number>;
  outlier_indices_sample: Record<string, Array<number | string>>;
}

export interface TrendPoint {
  period: string;
  value: number | null;
}

export interface TrendsSummary {
  datetime_column: string | null;
  series: Record<string, TrendPoint[]>;
}

export interface DatasetSummary {
  dataset_overview: DatasetOverview;
  numeric_analysis: NumericAnalysis;
  categorical_analysis: CategoricalAnalysis;
  correlations: CorrelationsSummary;
  anomalies: AnomaliesSummary;
  trends: TrendsSummary;
}

export interface JobDetail {
  id: string;
  status: JobStatus;
  created_at: string;
  updated_at: string;
  recipient_email: string;
  filename: string;
  metrics: DatasetSummary | null;
  summary: string | null;
  error: string | null;
}

export interface UploadResponse {
  job_id: string;
  status: JobStatus;
  message: string;
}

export interface JobListResponse {
  jobs: JobDetail[];
}
