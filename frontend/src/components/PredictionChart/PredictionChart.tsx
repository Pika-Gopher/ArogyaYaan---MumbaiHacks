"use client";

import {
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  YAxis,
} from "recharts";

interface PredictionChartThumbnailProps {
  data: { day: string; stock: number }[];
  color?: string; // default red for stockout
}

export default function PredictionChartThumbnail({
  data,
  color = "#dc2626", // red-600
}: PredictionChartThumbnailProps) {
  return (
    <div className="w-full h-20">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <YAxis hide domain={[0, "auto"]} />
          <Tooltip
            contentStyle={{
              fontSize: "12px",
              backgroundColor: "#1f2937",
              borderRadius: "6px",
              border: "none",
            }}
            labelStyle={{ color: "#fff" }}
          />
          <Line
            type="monotone"
            dataKey="stock"
            stroke={color}
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}