"use client";

import React from "react";
import { motion } from "framer-motion";

interface MetricCardProps {
  value: string | number;
  label: string;
  variant?: "critical" | "info" | "success" | "warning" | "neutral";
  icon?: React.ReactNode;
  tooltip?: string;
  imageSrc?: string;
}

const variantStyles = {
  critical: "text-[#AA1F76]",
  info: "text-blue-600",
  success: "text-[#51319C]",
  warning: "text-amber-600",
  neutral: "text-[#FFA726]",
};

export default function MetricCard({
  value,
  label,
  variant = "neutral",
  icon,
  tooltip,
  imageSrc,
}: MetricCardProps) {
  return (
    <motion.div
      title={tooltip}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.03 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="relative p-5 rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition overflow-hidden"
    >
      {/* Floating Image */}
      {imageSrc && (
        <motion.img
          src={imageSrc}
          alt="metric visual"
          className="absolute right-3 bottom-0.9 h-28 w-auto object-contain pointer-events-none select-none"
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {/* Label + Icon */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600 font-medium">{label}</p>
        {icon && <div className="text-gray-500">{icon}</div>}
      </div>

      {/* Value */}
      <h2 className={`text-4xl font-semibold ${variantStyles[variant]}`}>
        {value}
      </h2>
    </motion.div>
  );
}