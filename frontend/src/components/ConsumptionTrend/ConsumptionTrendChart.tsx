"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface Props {
  data: any[];
}

const COLORS = ["#2563EB", "#7C3AED", "#DB2777", "#EA580C", "#16A34A"];

export default function ConsumptionTrendChart({ data }: Props) {
  // Extract keys dynamically, excluding 'date'
  const keys = data && data.length > 0 ? Object.keys(data[0]).filter((k) => k !== "date") : [];

  return (
    <div className="w-full h-full flex flex-col">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Disease Detection Radar</h3>
        <p className="text-xs text-gray-500">
          Daily consumption of top 5 drugs. Spikes indicate potential outbreaks.
        </p>
      </div>

      <div className="flex-1 min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
            <XAxis 
              dataKey="date" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: "#6B7280" }} 
              minTickGap={30}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: "#6B7280" }} 
            />
            <Tooltip 
              contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
            />
            <Legend wrapperStyle={{ paddingTop: "20px" }} />
            
            {keys.map((key, index) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={COLORS[index % COLORS.length]}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}