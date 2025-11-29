"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function TransferTimeTrendTable({
  data,
}: {
  data: { date: string; bike: number; van: number }[];
}) {
  const [open, setOpen] = useState(false);

  const sorted = [...data].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const brand = {
    primary: "#82B536",
    primaryLight: "#A3CC6E",
    primaryLighter: "#CDE7A7",
    primaryDark: "#6A9A2C",
  };

  return (
    <>
      {/* ---- Card ---- */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 rounded-xl shadow-md border"
        style={{ borderColor: brand.primaryLighter, background: "#ffffff" }}
      >
        {/* ---- Title with Gradient Bar ---- */}
        <div
          className="px-3 py-2 rounded-lg mb-4"
          style={{
            background: `linear-gradient(90deg, ${brand.primary} 0%, ${brand.primaryLight} 100%)`,
            color: "white",
          }}
        >
          <h3 className="text-lg font-semibold tracking-wide">
            Transfer Time Trend (hrs)
          </h3>
        </div>

        {/* ---- Top 3 Table ---- */}
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="text-left text-gray-600 border-b" style={{ borderColor: brand.primaryLighter }}>
              <th className="py-2">Date</th>
              <th>Bike (hrs)</th>
              <th>Van (hrs)</th>
            </tr>
          </thead>

          <tbody>
            {sorted.slice(0, 3).map((row, idx) => (
              <motion.tr
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="border-b last:border-none hover:bg-gray-100/60 cursor-pointer"
                style={{ borderColor: brand.primaryLighter }}
              >
                <td className="py-2">{row.date}</td>
                <td className="font-medium text-gray-800">{row.bike}</td>
                <td className="font-medium text-gray-800">{row.van}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>

        {/* ---- Show More Button ---- */}
        {sorted.length > 3 && (
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setOpen(true)}
            className="mt-4 text-sm font-semibold px-4 py-2 rounded-md transition"
            style={{
              backgroundColor: brand.primary,
              color: "white",
              boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
            }}
          >
            Show More →
          </motion.button>
        )}
      </motion.div>

      {/* ---- Modal ---- */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          >
            {/* ---- Modal Box ---- */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ type: "spring", stiffness: 160, damping: 18 }}
              className="bg-white rounded-2xl shadow-xl w-[75%] max-h-[80vh] p-6 overflow-auto relative"
            >
              {/* Close Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setOpen(false)}
                className="absolute top-4 right-4 text-gray-700 hover:text-black text-xl"
              >
                ✕
              </motion.button>

              <h3 className="text-xl font-semibold mb-4 text-gray-800">
                Full Transfer Time Table
              </h3>

              {/* Full Table */}
              <table className="w-full text-sm border-collapse">
                <thead className="sticky top-0 bg-white shadow-sm">
                  <tr className="text-left text-gray-600 border-b" style={{ borderColor: brand.primaryLight }}>
                    <th className="py-2">Date</th>
                    <th>Bike (hrs)</th>
                    <th>Van (hrs)</th>
                  </tr>
                </thead>

                <tbody>
                  {sorted.map((row, idx) => (
                    <motion.tr
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className="border-b last:border-none hover:bg-gray-50 cursor-pointer"
                      style={{ borderColor: brand.primaryLighter }}
                    >
                      <td className="py-2">{row.date}</td>
                      <td className="font-medium text-gray-900">{row.bike}</td>
                      <td className="font-medium text-gray-900">{row.van}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
