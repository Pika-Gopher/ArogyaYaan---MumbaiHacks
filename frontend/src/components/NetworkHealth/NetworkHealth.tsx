"use client";
import React, { useMemo } from "react";
import { motion } from "framer-motion";

// ---- Color Theme ----
const brand = {
  primary: "#BF63F4",
  primaryLight: "#D88BFF",
  primaryLighter: "#EAC6FF",
  primaryDark: "#9F38D9",
};

export default function TrendSummaryInsights({
  data,
}: {
  data: { date: string; pctOptimal: number }[];
}) {
  // ---- Derived Calculations ----
  const insights = useMemo(() => {
    if (!data || data.length === 0) return null;

    const sorted = [...data].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const last7 = sorted.slice(-7);
    const firstOf7 = last7[0]?.pctOptimal ?? 0;
    const lastOf7 = last7[last7.length - 1]?.pctOptimal ?? 0;

    const overallTrend =
      lastOf7 > firstOf7
        ? { label: "Improving", icon: "⬆", color: brand.primary }
        : lastOf7 < firstOf7
        ? { label: "Declining", icon: "⬇", color: "#D9534F" }
        : { label: "Stable", icon: "⟳", color: "#777" };

    const best = sorted.reduce((a, b) =>
      a.pctOptimal > b.pctOptimal ? a : b
    );

    const worst = sorted.reduce((a, b) =>
      a.pctOptimal < b.pctOptimal ? a : b
    );

    // Compute fluctuations (standard deviation simplified)
    const values = last7.map((d) => d.pctOptimal);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const variance =
      values.reduce((acc, v) => acc + (v - avg) ** 2, 0) / values.length;
    const sd = Math.sqrt(variance);

    const stability =
      sd < 3
        ? "Very stable (±3%)"
        : sd < 6
        ? "Moderate fluctuations (±6%)"
        : "Highly unstable (>±6%)";

    return {
      overallTrend,
      best,
      worst,
      stability,
    };
  }, [data]);

  if (!insights) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-3 rounded-xl"
      style={{
        borderColor: brand.primaryLighter,
        background: "white",
      }}
    >
      {/* ---- Header ---- */}
      <div
        className="px-4 py-3 rounded-lg mb-4"
        style={{
          background: `linear-gradient(90deg, ${brand.primary} 0%, ${brand.primaryLight} 100%)`,
          color: "white",
        }}
      >
        <h3 className="text-lg font-medium tracking-wide">
          Network Health — Trend Summary & Insights
        </h3>
      </div>

      {/* ---- Insights Container ---- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* ---- Overall Trend ---- */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="p-4 rounded-lg shadow-sm border"
          style={{ borderColor: brand.primaryLighter }}
        >
          <h4 className="text-sm font-medium text-gray-600 mb-1">
            Overall Trend
          </h4>
          <div className="text-xl font-semibold flex items-center gap-2">
            <span style={{ color: insights.overallTrend.color }}>
              {insights.overallTrend.label}
            </span>
            <span className="text-2xl">{insights.overallTrend.icon}</span>
            <span className="text-gray-500 text-sm ml-1">(Last 7 days)</span>
          </div>
        </motion.div>

        {/* ---- Best Day ---- */}
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="p-4 rounded-lg shadow-sm border"
          style={{ borderColor: brand.primaryLighter }}
        >
          <h4 className="text-sm font-medium text-gray-600 mb-1">
            Best Day
          </h4>
          <p className="text-xl font-semibold" style={{ color: brand.primaryDark }}>
            {insights.best.pctOptimal}% 
            <span className="text-gray-700 text-sm ml-2">
              — {insights.best.date}
            </span>
          </p>
        </motion.div>

        {/* ---- Worst Day ---- */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="p-4 rounded-lg shadow-sm border"
          style={{ borderColor: brand.primaryLighter }}
        >
          <h4 className="text-sm font-medium text-gray-600 mb-1">
            🔻 Lowest Day
          </h4>
          <p className="text-xl font-semibold text-red-500">
            {insights.worst.pctOptimal}% 
            <span className="text-gray-700 text-sm ml-2">
              — {insights.worst.date}
            </span>
          </p>
        </motion.div>

        {/* ---- Stability Score ---- */}
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="p-4 rounded-lg shadow-sm border"
          style={{ borderColor: brand.primaryLighter }}
        >
          <h4 className="text-sm font-medium text-gray-600 mb-1">
            ⚠ Stability Score
          </h4>
          <p className="text-base font-medium text-gray-800">
            "{insights.stability}"
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}