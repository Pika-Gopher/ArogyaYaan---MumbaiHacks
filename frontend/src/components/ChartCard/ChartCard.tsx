"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useI18n } from "@/src/context/I18nContext";

const data = [
  { month: "Jan", value: 120 },
  { month: "Feb", value: 180 },
  { month: "Mar", value: 140 },
];

export default function ChartCard() {
  const { t } = useI18n();

  return (
    <div className="p-6 bg-light-neutral-panel rounded-xl">
      {/* TITLE */}
      <h3 className="text-lg font-semibold mb-4">
        {t("chart_card.title")}
      </h3>

      {/* CHART */}
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <XAxis
            dataKey="month"
            tickFormatter={(m) => t("chart_card.tooltip_month") + ": " + m}
          />
          <YAxis />
          <Tooltip
            formatter={(value) => [`${value}`, t("chart_card.tooltip_value")]}
            labelFormatter={(label) => `${t("chart_card.tooltip_month")}: ${label}`}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#0A6CFF"
            strokeWidth={3}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}