"use client";
import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react"; 

export default function StockoutPreventionBars({
  data,
}: {
  data: { date: string; predicted: number; prevented: number }[];
}) {
  return (
    <div className="p-4 bg-white rounded shadow-sm">
      {/* Title Row */}
      <div className="flex items-center gap-2 mb-4">
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            opacity: [1, 0.8, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="flex items-center justify-center"
        >
          <ShieldCheck size={22} className="text-blue-800" />
        </motion.div>

        <h3 className="text-lg font-medium">Stockout Prevention</h3>
      </div>

      <div className="space-y-4">
        {data.map((item, i) => {
          const baseColor = i % 2 === 0 ? "#1868DB" : "#FCA700";
          const overlayColor = i % 2 === 0 ? "#1FA2FF" : "#FFD56F";

          return (
            <div key={i}>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium">{item.date}</span>
                <span className="text-gray-600">
                  {item.prevented} / {item.predicted}
                </span>
              </div>

              <div className="w-full h-3 bg-gray-200 rounded-full relative overflow-hidden">
                {/* Predicted */}
                <motion.div
                  className="absolute left-0 top-0 h-3 rounded-full"
                  style={{ backgroundColor: baseColor }}
                  initial={{ width: 0 }}
                  animate={{
                    width: `${(item.predicted / 100) * 100}%`,
                  }}
                  transition={{ duration: 0.7, delay: i * 0.1 }}
                />

                {/* Prevented */}
                <motion.div
                  className="absolute left-0 top-0 h-3 rounded-full"
                  style={{ backgroundColor: overlayColor }}
                  initial={{ width: 0 }}
                  animate={{
                    width: `${(item.prevented / item.predicted) * 100}%`,
                  }}
                  transition={{ duration: 0.8, delay: i * 0.1 + 0.1 }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}