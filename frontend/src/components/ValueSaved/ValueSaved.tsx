"use client";

import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ValueSavedCards({
  data,
}: {
  data: { period: string; valueSaved: number }[];
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const maxValue = useMemo(
    () => Math.max(...data.map((d) => d.valueSaved)),
    [data]
  );

  const YELLOW = {
    base: "#82B536",
    light: "#A4D36B",
    dark: "#6B942C",
    bg: "#F4FBEA",
    border: "#D9EFC0",
  };

  return (
    <div className="p-4 bg-white rounded shadow-sm relative">
      <h3 className="text-lg font-medium mb-4">Monetary Value Saved (INR)</h3>

      {/* Scroll Section + View All Button */}
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-gray-500"></p>

        <button
          onClick={() => setIsModalOpen(true)}
          className="
            text-sm px-3 py-1 rounded-lg
            bg-[#82B536] text-white
            hover:bg-[#6B942C] transition
          "
        >
          View All
        </button>
      </div>

      {/* Horizontal Scrollable Cards */}
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-[#CFE6A4] scrollbar-track-transparent">
        {data.map((item, index) => {
          const height = (item.valueSaved / maxValue) * 180;

          return (
            <motion.div
              key={index}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{ scale: 1.05, translateY: -4 }}
              className="
                flex flex-col items-center
                rounded-xl p-3 min-w-[90px]
                bg-[#F4FBEA] border border-[#D9EFC0]
                shadow-sm cursor-pointer
              "
            >
              <div className="flex flex-col justify-end h-48 w-full">
                <motion.div
                  style={{ height }}
                  className="w-full rounded-md"
                  animate={{ backgroundColor: YELLOW.base }}
                  whileHover={{ backgroundColor: YELLOW.dark }}
                />
              </div>

              <p className="mt-3 text-sm font-medium text-gray-700">
                {item.period}
              </p>
              <p className="text-xs text-gray-500">
                ₹{item.valueSaved.toLocaleString()}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* ---------------- MODAL POPUP ---------------- */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
            />

            {/* Modal Container */}
            <motion.div
              className="
                fixed z-50 left-1/2 top-1/2 
                w-[75%] max-h-[75%] overflow-y-auto 
                transform -translate-x-1/2 -translate-y-1/2 
                bg-white rounded-2xl p-6 shadow-xl
              "
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 180, damping: 20 }}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">All Savings Data</h2>

                <button
                  onClick={() => setIsModalOpen(false)}
                  className="
                    px-4 py-2 rounded-lg bg-[#82B536] text-white 
                    hover:bg-[#6B942C] transition
                  "
                >
                  Close
                </button>
              </div>

              {/* Enlarged Cards Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {data.map((item, index) => {
                  const height = (item.valueSaved / maxValue) * 220;

                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.04 }}
                      whileHover={{ scale: 1.05 }}
                      className="
                        flex flex-col items-center
                        p-4 rounded-xl bg-[#F4FBEA] border border-[#D9EFC0]
                        shadow-md cursor-pointer
                      "
                    >
                      <div className="flex flex-col justify-end h-60 w-full">
                        <motion.div
                          style={{ height }}
                          className="w-full rounded-md"
                          animate={{ backgroundColor: YELLOW.base }}
                          whileHover={{ backgroundColor: YELLOW.dark }}
                        />
                      </div>

                      <p className="mt-4 text-lg font-semibold">{item.period}</p>
                      <p className="text-sm text-gray-600">
                        ₹{item.valueSaved.toLocaleString()}
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}