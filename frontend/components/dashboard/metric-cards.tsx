import { DatasetSummary } from "@/lib/types";

import { KpiCard } from "@/components/dashboard/kpi-card";

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2
  }).format(value);
}

export function MetricCards({ metrics }: { metrics: DatasetSummary }) {
  const overview = metrics.dataset_overview;
  const typeBuckets = overview.detected_column_types;

  const totalCells = overview.num_rows * overview.num_columns;
  const missingRatio = totalCells > 0 ? (overview.missing_values / totalCells) * 100 : 0;

  const strongestCorrelation = metrics.correlations.strongest_pairs[0];
  const outlierColumnCount = Object.keys(metrics.anomalies.outlier_counts).length;
  const trendSeriesCount = Object.keys(metrics.trends.series).length;

  const cards: Array<{
    title: string;
    value: string;
    description: string;
    trendLabel: string;
    trendDirection: "up" | "down";
  }> = [
    {
      title: "Rows",
      value: formatNumber(overview.num_rows),
      description: "Total records in the uploaded dataset",
      trendLabel: `${formatNumber(overview.num_columns)} columns detected`,
      trendDirection: "up"
    },
    {
      title: "Missing Cells",
      value: formatNumber(overview.missing_values),
      description: "Null or empty values across all cells",
      trendLabel: `${missingRatio.toFixed(1)}% missingness`,
      trendDirection: missingRatio > 10 ? "down" : "up"
    },
    {
      title: "Column Types",
      value: `${typeBuckets.numeric.length}/${typeBuckets.categorical.length}/${typeBuckets.datetime.length}`,
      description: "numeric / categorical / datetime",
      trendLabel: `${overview.columns.length} fields profiled`,
      trendDirection: "up"
    },
    {
      title: "Pattern Signal",
      value: strongestCorrelation ? strongestCorrelation.correlation.toFixed(2) : String(outlierColumnCount),
      description: strongestCorrelation
        ? `${strongestCorrelation.left} vs ${strongestCorrelation.right}`
        : "Columns with outliers (IQR)",
      trendLabel: `${trendSeriesCount} trend series available`,
      trendDirection: strongestCorrelation || outlierColumnCount === 0 ? "up" : "down"
    }
  ];

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <KpiCard key={card.title} {...card} />
      ))}
    </section>
  );
}
