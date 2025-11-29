"use client";
import React from "react";
import { ArrowUp, ArrowDown, ArrowRight } from "lucide-react";

type SeriesPoint = {
  date: string;
  forecast: number;
  factorA?: number;
  factorB?: number;
};

type TrendCardsProps = {
  series: SeriesPoint[];
};

export default function TrendCards({ series }: TrendCardsProps) {
  if (!series || series.length === 0) {
    return <p>No data available</p>;
  }

  // Take the last two points for comparison
  const latest = series[series.length - 1];
  const previous = series[series.length - 2] || latest;

  const computeDelta = (current: number, previous: number) => {
    const delta = current - previous;
    const percent = previous ? (delta / previous) * 100 : 0;
    return { delta, percent };
  };

  const forecastDelta = computeDelta(latest.forecast, previous.forecast);
  const factorADelta = latest.factorA !== undefined && previous.factorA !== undefined
    ? computeDelta(latest.factorA, previous.factorA)
    : null;
  const factorBDelta = latest.factorB !== undefined && previous.factorB !== undefined
    ? computeDelta(latest.factorB, previous.factorB)
    : null;

  const renderTrend = (deltaObj: { delta: number; percent: number } | null) => {
    if (!deltaObj) return <span>—</span>;
    const { delta, percent } = deltaObj;
    const isPositive = delta > 0;
    const isNegative = delta < 0;
    const ArrowIcon = isPositive ? ArrowUp : isNegative ? ArrowDown : ArrowRight;
    const color = isPositive ? "text-green-600" : isNegative ? "text-red-600" : "text-gray-500";
    return (
      <span className={`flex items-center gap-1 ${color}`}>
        <ArrowIcon size={16} />
        <strong>{Math.abs(percent).toFixed(1)}%</strong>
      </span>
    );
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* Forecast Card */}
      <div className="p-4 bg-white rounded-lg shadow flex flex-col gap-2">
        <div className="text-sm text-gray-500 dark:text-gray-400">Forecast</div>
        <div className="text-xl font-bold">{latest.forecast.toLocaleString()}</div>
        <div className="flex items-center gap-2">{renderTrend(forecastDelta)}</div>
        <div className="text-xs text-gray-400">Next projected: {latest.forecast.toLocaleString()} units</div>
        <div className="text-xs text-gray-400">Date: {latest.date}</div>
      </div>

      {/* Historical Trend Card */}
      <div className="p-4 bg-white rounded-lg shadow flex flex-col gap-2">
        <div className="text-sm text-gray-500 dark:text-gray-400">Historical Trend</div>
        <div className="text-xl font-bold">{latest.factorA?.toLocaleString() ?? "—"}</div>
        <div className="flex items-center gap-2">{renderTrend(factorADelta)}</div>
        <div className="text-xs text-gray-400">vs previous: {previous.factorA?.toLocaleString() ?? "—"}</div>
        <div className="text-xs text-gray-400">Date: {latest.date}</div>
      </div>

      {/* Other Factor Card */}
      <div className="p-4 bg-white rounded-lg shadow flex flex-col gap-2">
        <div className="text-sm text-gray-500 dark:text-gray-400">Other Factor</div>
        <div className="text-xl font-bold">{latest.factorB?.toLocaleString() ?? "—"}</div>
        <div className="flex items-center gap-2">{renderTrend(factorBDelta)}</div>
        <div className="text-xs text-gray-400">vs previous: {previous.factorB?.toLocaleString() ?? "—"}</div>
        <div className="text-xs text-gray-400">Date: {latest.date}</div>
      </div>
    </div>
  );
}