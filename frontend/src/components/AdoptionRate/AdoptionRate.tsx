"use client";

import React from "react";
import { motion } from "framer-motion";
import { CheckCircle, XCircle } from "lucide-react";
import { useI18n } from "@/src/context/I18nContext";

export default function AdoptionRateProgressBars({ aiPct }: { aiPct: number }) {
  const { t } = useI18n();
  const manualPct = 100 - aiPct;

  // Colors
  const BLUE = {
    base: "#1868DB",
    light: "#4A8FF0",
    bg: "#E8F1FF",
  };

  const PURPLE = {
    base: "#BF63F4",
    light: "#D892FF",
    bg: "#F6E8FF",
  };

  return (
    <div className="p-4 bg-white rounded shadow-sm">
      <h3 className="text-lg font-medium mb-4">{t("charts.adoption_rate_title")}</h3>

      <div className="space-y-6">

        {/* AI Recommendations Progress */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <CheckCircle size={22} color={BLUE.base} />
              <span className="text-sm font-medium text-gray-700">
                {t("charts.ai_recommendations")}
              </span>
            </div>

            <span className="text-sm font-semibold" style={{ color: BLUE.base }}>
              {aiPct}%
            </span>
          </div>

          <div className="w-full h-3 rounded-full" style={{ background: BLUE.bg }}>
            <motion.div
              className="h-3 rounded-full"
              style={{ background: BLUE.base }}
              initial={{ width: 0 }}
              animate={{ width: `${aiPct}%` }}
              transition={{ duration: 1.1, ease: "easeOut" }}
            />
          </div>
        </motion.div>

        {/* Manual Requests Progress */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <XCircle size={22} color={PURPLE.base} />
              <span className="text-sm font-medium text-gray-700">
                {t("charts.manual_requests")}
              </span>
            </div>

            <span className="text-sm font-semibold" style={{ color: PURPLE.base }}>
              {manualPct}%
            </span>
          </div>

          <div className="w-full h-3 rounded-full" style={{ background: PURPLE.bg }}>
            <motion.div
              className="h-3 rounded-full"
              style={{ background: PURPLE.base }}
              initial={{ width: 0 }}
              animate={{ width: `${manualPct}%` }}
              transition={{ duration: 1.1, ease: "easeOut" }}
            />
          </div>
        </motion.div>

      </div>
    </div>
  );
}