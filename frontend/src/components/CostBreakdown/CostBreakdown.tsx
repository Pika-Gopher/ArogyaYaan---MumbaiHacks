"use client";
import React from "react";
import { useI18n } from "@/src/context/I18nContext";

const COLORS = ["#1868DB", "#82B536", "#FCA700", "#BF63F4"];

export default function LogisticsCostBreakdown({
  data,
}: {
  data: { name: string; value: number }[];
}) {
  const { t } = useI18n();

  // Find the max value for proportional blocks
  const maxValue = Math.max(...data.map((d) => d.value));

  return (
    <div className="p-4 bg-white rounded shadow-sm">
      <h3 className="text-lg font-medium mb-4">
        {t("logistics_cost_breakdown.title")}
      </h3>

      <div className="flex gap-6">
        {data.map((item, i) => {
          const blocks = Math.round((item.value / maxValue) * 10); // scale to 10 blocks max
          return (
            <div key={i} className="flex flex-col items-center">
              <span className="font-medium mb-2">{item.name}</span>

              <div className="flex flex-col-reverse gap-1">
                {Array.from({ length: blocks }).map((_, idx) => (
                  <div
                    key={idx}
                    style={{ backgroundColor: COLORS[i % COLORS.length] }}
                    className="w-5 h-5 rounded"
                  />
                ))}
              </div>

              <span className="mt-2 text-sm font-semibold">{item.value}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
