"use client";
import React from "react";
import { useI18n } from "@/src/context/I18nContext";

type Props = {
  urgencies: string[];
  medicines: string[];
  onChange: (v: { urgency: string; medicine: string; horizon: string }) => void;
};

export default function AlertsFilterBar({ urgencies, medicines, onChange }: Props) {
  const { t } = useI18n();

  return (
    <div className="flex flex-wrap gap-3 items-center">
      {/* Urgency */}
      <div className="flex items-center gap-2">
        <label className="text-sm">{t("alerts_filter.urgency")}</label>
        <select
          id="urgency-filter"
          defaultValue="All"
          onChange={(e) =>
            onChange({
              urgency: e.target.value,
              medicine: (document.getElementById("medicine-filter") as HTMLSelectElement).value,
              horizon: (document.getElementById("horizon-filter") as HTMLSelectElement).value,
            })
          }
          className="border rounded px-2 py-1"
        >
          <option>{t("alerts_filter.all")}</option>
          {urgencies.map((u) => (
            <option key={u}>{u}</option>
          ))}
        </select>
      </div>

      {/* Medicine */}
      <div className="flex items-center gap-2">
        <label className="text-sm">{t("alerts_filter.medicine")}</label>
        <select
          id="medicine-filter"
          defaultValue="All"
          onChange={(e) =>
            onChange({
              urgency: (document.getElementById("urgency-filter") as HTMLSelectElement)?.value || "All",
              medicine: e.target.value,
              horizon: (document.getElementById("horizon-filter") as HTMLSelectElement).value,
            })
          }
          className="border rounded px-2 py-1"
        >
          <option>{t("alerts_filter.all")}</option>
          {medicines.map((m) => (
            <option key={m}>{m}</option>
          ))}
        </select>
      </div>

      {/* Prediction Horizon */}
      <div className="flex items-center gap-2">
        <label className="text-sm">{t("alerts_filter.prediction_horizon")}</label>
        <select
          id="horizon-filter"
          defaultValue="All"
          onChange={(e) =>
            onChange({
              urgency: (document.getElementById("urgency-filter") as HTMLSelectElement)?.value || "All",
              medicine: (document.getElementById("medicine-filter") as HTMLSelectElement).value || "All",
              horizon: e.target.value,
            })
          }
          className="border rounded px-2 py-1"
        >
          <option value="All">{t("alerts_filter.all")}</option>
          <option value="<7">{t("alerts_filter.stockout_lt_7")}</option>
          <option value="7-14">{t("alerts_filter.stockout_7_14")}</option>
        </select>
      </div>

      {/* Buttons */}
      <div className="ml-auto flex gap-2">
        <button className="px-3 py-1 border rounded">
          {t("alerts_filter.sort_newest")}
        </button>
        <button className="px-3 py-1 bg-blue-600 text-white rounded">
          {t("alerts_filter.export_csv")}
        </button>
      </div>
    </div>
  );
}