"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/src/context/I18nContext";

import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

interface ApprovalsFilterBarProps {
  onChange: (filters: {
    severity: string | null;
    medicineType: string | null;
    phc: string;
  }) => void;
}

export default function ApprovalsFilterBar({ onChange }: ApprovalsFilterBarProps) {
  const { t } = useI18n();

  const [severity, setSeverity] = useState<string | null>(null);
  const [medicineType, setMedicineType] = useState<string | null>(null);
  const [phc, setPhc] = useState("");

  const update = (updated: Partial<{ severity: string | null; medicineType: string | null; phc: string }>) => {
    const newFilters = {
      severity: updated.severity ?? severity,
      medicineType: updated.medicineType ?? medicineType,
      phc: updated.phc ?? phc,
    };

    setSeverity(newFilters.severity);
    setMedicineType(newFilters.medicineType);
    setPhc(newFilters.phc);

    onChange(newFilters);
  };

  return (
    <div className="w-full bg-white border rounded-xl p-4 flex flex-col md:flex-row gap-4 items-center md:items-end">

      {/* Severity Filter */}
      <div className="flex gap-2">
        <button
          onClick={() => update({ severity: severity === "high" ? null : "high" })}
          className={cn(
            "px-4 py-2 rounded-lg border text-sm font-medium",
            severity === "high"
              ? "bg-red-100 text-red-700 border-red-300"
              : "bg-gray-100 text-gray-600"
          )}
        >
          {t("filterHigh")}
        </button>

        <button
          onClick={() => update({ severity: severity === "medium" ? null : "medium" })}
          className={cn(
            "px-4 py-2 rounded-lg border text-sm font-medium",
            severity === "medium"
              ? "bg-yellow-100 text-yellow-700 border-yellow-300"
              : "bg-gray-100 text-gray-600"
          )}
        >
          {t("filterMedium")}
        </button>
      </div>

      {/* Medicine Type Dropdown */}
      <Select
        onValueChange={(val: string) => update({ medicineType: val })}
      >
        <SelectTrigger className="w-[200px] bg-gray-100">
          <SelectValue placeholder={t("medicineType")} />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="antibiotic">{t("medicineAntibiotic")}</SelectItem>
          <SelectItem value="analgesic">{t("medicineAnalgesic")}</SelectItem>
          <SelectItem value="antiviral">{t("medicineAntiviral")}</SelectItem>
          <SelectItem value="antipyretic">{t("medicineAntipyretic")}</SelectItem>
        </SelectContent>
      </Select>

      {/* PHC Search */}
      <div className="flex items-center w-full md:w-[250px] relative">
        <Search className="absolute left-3 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder={t("searchPhc")}
          value={phc}
          onChange={(e) => update({ phc: e.target.value })}
          className="pl-10 pr-3 py-2 w-full border rounded-lg bg-gray-100 text-sm focus:outline-none"
        />
      </div>
    </div>
  );
}