"use client";

import React from "react";
import { motion } from "framer-motion";
import { useI18n } from "@/src/context/I18nContext";

type Preset = "30d" | "90d" | "q1-2024" | "custom";

export default function DateRangeSelector({
  value,
  onChange,
}: {
  value: { from: string; to: string };
  onChange: (v: { from: string; to: string }) => void;
}) {
  const { t } = useI18n();

  const applyPreset = (p: Preset) => {
    const today = new Date();
    let from = new Date();
    let to = today;

    if (p === "30d") from.setDate(today.getDate() - 30);
    if (p === "90d") from.setDate(today.getDate() - 90);
    if (p === "q1-2024") {
      from = new Date("2024-01-01");
      to = new Date("2024-03-31");
    }

    if (p !== "custom")
      onChange({
        from: from.toISOString().slice(0, 10),
        to: to.toISOString().slice(0, 10),
      });
  };

  const presetLabels: Record<Preset, string> = {
    "30d": t("date_range.last_30d"),
    "90d": t("date_range.last_90d"),
    "q1-2024": t("date_range.q1_2024"),
    custom: "",
  };

  return (
    <motion.div
      className="flex flex-col sm:flex-row gap-4 items-start sm:items-center p-3 bg-white rounded-lg shadow-md"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Preset Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <label className="text-sm font-medium mb-1 sm:mb-0">
          {t("date_range.preset")}
        </label>

        <div className="flex gap-2">
          {(["30d", "90d", "q1-2024"] as Preset[]).map((p) => (
            <motion.button
              key={p}
              onClick={() => applyPreset(p)}
              whileHover={{ scale: 1.05, backgroundColor: "#BF63F4", color: "white" }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 rounded-full border border-gray-300 text-sm font-medium transition-colors"
            >
              {presetLabels[p]}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Date Inputs */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">
            {t("date_range.from")}
          </label>
          <motion.input
            type="date"
            value={value.from}
            onChange={(e) => onChange({ ...value, from: e.target.value })}
            className="px-3 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#BF63F4] transition"
            whileFocus={{ scale: 1.02 }}
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">
            {t("date_range.to")}
          </label>
          <motion.input
            type="date"
            value={value.to}
            onChange={(e) => onChange({ ...value, to: e.target.value })}
            className="px-3 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#BF63F4] transition"
            whileFocus={{ scale: 1.02 }}
          />
        </div>
      </div>
    </motion.div>
  );
}