"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

import { DatasetSummary } from "@/lib/types";
import { ChartCard } from "@/components/dashboard/chart-card";

const piePalette = ["#3b82f6", "#14b8a6", "#f59e0b", "#10b981", "#6366f1", "#8b5cf6"];

function truncateLabel(label: string, max = 20): string {
  if (label.length <= max) {
    return label;
  }
  return `${label.slice(0, max - 1)}...`;
}

export function InsightsCharts({ metrics }: { metrics: DatasetSummary }) {
  const tooltipStyle = {
    background: "var(--tooltip-bg)",
    borderColor: "var(--tooltip-border)",
    borderRadius: 10,
    color: "var(--fg)"
  };

  const firstCategoricalEntry = Object.entries(metrics.categorical_analysis).find(
    ([, summary]) => summary.top_categories.length > 0
  );
  const categoricalData = firstCategoricalEntry
    ? firstCategoricalEntry[1].top_categories.map((item) => ({
        label: item.label,
        value: item.count,
        percentage: item.percentage
      }))
    : [];

  const numericMeanData = Object.entries(metrics.numeric_analysis)
    .map(([label, summary]) => {
      const candidate = summary.mean ?? summary.median ?? summary.max;
      return {
        label,
        value: typeof candidate === "number" ? candidate : null
      };
    })
    .filter((item): item is { label: string; value: number } => item.value !== null && Number.isFinite(item.value))
    .slice(0, 10);

  const firstTrendEntry = Object.entries(metrics.trends.series).find(([, series]) => series.length > 1);
  const trendData = firstTrendEntry
    ? firstTrendEntry[1]
        .filter(
          (point): point is { period: string; value: number } =>
            typeof point.value === "number" && Number.isFinite(point.value)
        )
        .map((point) => ({
          period: point.period,
          value: point.value
        }))
    : [];

  const correlationData = metrics.correlations.strongest_pairs.slice(0, 8).map((pair) => ({
    label: `${pair.left} vs ${pair.right}`,
    value: pair.abs_correlation
  }));

  const outlierData = Object.entries(metrics.anomalies.outlier_counts)
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  const hasCharts =
    categoricalData.length > 0 ||
    numericMeanData.length > 0 ||
    trendData.length > 0 ||
    correlationData.length > 0 ||
    outlierData.length > 0;

  if (!hasCharts) {
    return (
      <ChartCard
        title="No Chartable Signals"
        description="The dataset was processed, but no chart-friendly distributions or trends were detected."
        className="lg:col-span-2"
      >
        <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-slate-300/80 bg-slate-50/70 p-6 text-sm text-slate-600 dark:border-slate-600/80 dark:bg-slate-800/40 dark:text-slate-300">
          Try a dataset with at least one numeric or categorical column to unlock visual analytics.
        </div>
      </ChartCard>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {categoricalData.length > 0 && firstCategoricalEntry && (
        <ChartCard
          title={`Top ${firstCategoricalEntry[0]} Categories`}
          description="Most frequent values in the selected categorical column"
        >
          <div className="h-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoricalData}>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="rgba(148,163,184,0.35)" />
                <XAxis
                  dataKey="label"
                  tick={{ fill: "var(--muted)", fontSize: 12 }}
                  tickFormatter={(value) => truncateLabel(String(value), 18)}
                />
                <YAxis tick={{ fill: "var(--muted)", fontSize: 12 }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} animationDuration={600} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      )}

      {trendData.length > 0 && firstTrendEntry && (
        <ChartCard
          title={`${firstTrendEntry[0]} Over Time`}
          description={`Monthly trend based on datetime column ${metrics.trends.datetime_column ?? "(detected)"}`}
        >
          <div className="h-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="rgba(148,163,184,0.35)" />
                <XAxis dataKey="period" tick={{ fill: "var(--muted)", fontSize: 12 }} />
                <YAxis tick={{ fill: "var(--muted)", fontSize: 12 }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#6366f1"
                  strokeWidth={3}
                  dot={{ r: 4.5, fill: "#6366f1" }}
                  activeDot={{ r: 7 }}
                  animationDuration={800}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      )}

      {numericMeanData.length > 0 && (
        <ChartCard
          title="Numeric Center Values"
          description="Mean (or median fallback) across detected numeric columns"
        >
          <div className="h-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={numericMeanData}>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="rgba(148,163,184,0.35)" />
                <XAxis
                  dataKey="label"
                  tick={{ fill: "var(--muted)", fontSize: 12 }}
                  tickFormatter={(value) => truncateLabel(String(value), 18)}
                />
                <YAxis tick={{ fill: "var(--muted)", fontSize: 12 }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="value" fill="#14b8a6" radius={[8, 8, 0, 0]} animationDuration={650} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      )}

      {correlationData.length > 0 && (
        <ChartCard
          title="Strongest Correlations"
          description="Absolute correlation scores between numeric column pairs"
        >
          <div className="h-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={correlationData}>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="rgba(148,163,184,0.35)" />
                <XAxis
                  dataKey="label"
                  tick={{ fill: "var(--muted)", fontSize: 12 }}
                  tickFormatter={(value) => truncateLabel(String(value), 20)}
                />
                <YAxis domain={[0, 1]} tick={{ fill: "var(--muted)", fontSize: 12 }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="value" fill="#f59e0b" radius={[8, 8, 0, 0]} animationDuration={700} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      )}

      {outlierData.length > 0 && (
        <ChartCard
          title="Outlier Distribution"
          description="Detected outlier counts by numeric column"
          className="lg:col-span-2"
        >
          <div className="h-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend />
                <Pie
                  data={outlierData}
                  dataKey="value"
                  nameKey="label"
                  innerRadius={62}
                  outerRadius={104}
                  paddingAngle={3}
                  animationDuration={850}
                >
                  {outlierData.map((point, index) => (
                    <Cell key={point.label} fill={piePalette[index % piePalette.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      )}
    </div>
  );
}
