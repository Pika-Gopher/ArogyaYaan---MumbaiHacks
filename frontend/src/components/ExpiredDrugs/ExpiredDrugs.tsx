"use client";
import React from "react";
import { motion } from "framer-motion";
import { useI18n } from "@/src/context/I18nContext";

export default function TopExpiredDrugsTable({
  rows,
}: {
  rows: { drug: string; qty: number; valueINR: number }[];
}) {
  const { t } = useI18n();

  const rowVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1 },
    }),
  };

  return (
    <div className="p-4 bg-white rounded-lg">
      <h3 className="text-lg font-semibold mb-4">
        {t("expired_drugs.title")}
      </h3>

      <table className="w-full text-left text-sm border-collapse">
        <thead className="bg-[#1868DB] text-white">
          <tr>
            <th className="py-2 px-3">
              {t("expired_drugs.drug")}
            </th>
            <th className="py-2 px-3">
              {t("expired_drugs.qty_lost")}
            </th>
            <th className="py-2 px-3">
              {t("expired_drugs.value_inr")}
            </th>
          </tr>
        </thead>

        <tbody>
          {rows.map((r, i) => (
            <motion.tr
              key={i}
              custom={i}
              initial="hidden"
              animate="visible"
              variants={rowVariants}
              className="border-t border-gray-200 cursor-pointer 
                         hover:bg-[#7bb2ff62] hover:bg-opacity-5 transition-colors"
            >
              <td className="py-2 px-3 font-medium">{r.drug}</td>
              <td className="py-2 px-3">{r.qty}</td>
              <td className="py-2 px-3">
                {r.valueINR.toLocaleString("en-IN")}
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}