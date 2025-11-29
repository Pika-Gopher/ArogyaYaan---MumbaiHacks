"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";

export default function SOPViolationLog({
  rows,
}: {
  rows: { id: string; date: string; facility: string; rule: string; actor: string; note?: string }[];
}) {
  const [page, setPage] = useState(1);
  const pageSize = 8;
  const total = Math.ceil(rows.length / pageSize);
  const current = rows.slice((page - 1) * pageSize, page * pageSize);

  const rowVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.05 },
    }),
  };

  return (
    <div className="p-4 bg-white rounded-lg">
      <h3 className="text-lg font-semibold mb-4">
        SOP Violation Log
      </h3>

      <table className="w-full text-sm text-left border-collapse">
        <thead className="bg-[#BF63F4] text-white">
          <tr>
            <th className="py-2 px-3">Date</th>
            <th className="py-2 px-3">Facility</th>
            <th className="py-2 px-3">Rule</th>
            <th className="py-2 px-3">Actor</th>
            <th className="py-2 px-3">Note</th>
          </tr>
        </thead>
        <tbody>
          {current.map((r, i) => (
            <motion.tr
              key={r.id}
              custom={i}
              initial="hidden"
              animate="visible"
              variants={rowVariants}
              className="border-t border-gray-200 cursor-pointer hover:bg-[#bf63f43d] hover:bg-opacity-10 transition-colors"
            >
              <td className="py-2 px-3 font-medium">{r.date}</td>
              <td className="py-2 px-3">{r.facility}</td>
              <td className="py-2 px-3">{r.rule}</td>
              <td className="py-2 px-3">{r.actor}</td>
              <td className="py-2 px-3">{r.note || "-"}</td>
            </motion.tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-end gap-2 mt-4">
        <button
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
          className="px-3 py-1 rounded border border-[#BF63F4] text-[#BF63F4] hover:bg-[#BF63F4] hover:text-white transition"
        >
          Prev
        </button>
        <div className="px-3 py-1 font-semibold text-[#BF63F4]">
          {page} / {total}
        </div>
        <button
          disabled={page === total}
          onClick={() => setPage((p) => p + 1)}
          className="px-3 py-1 rounded border border-[#BF63F4] text-[#BF63F4] hover:bg-[#BF63F4] hover:text-white transition"
        >
          Next
        </button>
      </div>
    </div>
  );
}