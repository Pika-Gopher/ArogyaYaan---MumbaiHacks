"use client";

import React from "react";
import { motion } from "framer-motion";
import SentimentAnalysisBadge from "../SentimentBadge/SentimentBadge";

type Prediction = {
  id: string;
  title: string;
  problem: string;
  context: string;
  urgency: "Critical" | "High" | "Medium";
  horizonDays: number;
  medicine: string;
  confidence: number;
  phc: string;
  createdAt: string;
  sentiment?: string;
};

export default function PredictionSummaryCard({
  prediction,
  onOpen,
  onEscalate,
}: {
  prediction: Prediction;
  onOpen: () => void;
  onEscalate: () => void;
}) {
  const urgencyColors = {
    Critical: "bg-red-600",
    High: "bg-amber-500",
    Medium: "bg-gray-400",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, boxShadow: "0px 6px 18px rgba(24,104,219,0.18)" }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="
        p-5 rounded-xl shadow-sm bg-white border 
        border-[#E1ECFA] 
        hover:border-[#1868DB]/40 
        relative overflow-hidden
      "
    >
      {/* Decorative gradient bar */}
      <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-[#1868DB] via-[#1A73E8] to-[#1559C1]" />

      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-start gap-3">
            <div
              className={`w-3 h-3 rounded-full mt-1 ${
                urgencyColors[prediction.urgency]
              }`}
            />

            <div>
              <h3 className="font-semibold text-[#1559C1]">
                {prediction.title}
              </h3>

              <p className="text-sm text-gray-700 mt-1">{prediction.problem}</p>

              <p className="text-xs text-gray-500 mt-1">
                PHC: {prediction.phc} • Horizon: {prediction.horizonDays}d •
                Confidence: {prediction.confidence}%
              </p>

              <p className="text-sm text-gray-600 mt-3 leading-relaxed">
                {prediction.context}
              </p>
            </div>
          </div>
        </div>

        {/* Sentiment + Buttons */}
        <div className="ml-4 flex flex-col items-end gap-3">
          {prediction.sentiment && (
            <motion.div
              initial={{ opacity: 0, x: 6 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <SentimentAnalysisBadge text={prediction.sentiment} />
            </motion.div>
          )}

          <div className="flex flex-col gap-2 mt-1">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={onOpen}
              className="
                px-3 py-1 rounded-md border 
                border-[#1868DB] text-[#1868DB] 
                hover:bg-[#E8F1FC] transition
              "
            >
              Review
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={onEscalate}
              className="
                px-3 py-1 rounded-md 
                bg-red-600 text-white 
                hover:bg-red-700 transition
              "
            >
              Escalate
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}