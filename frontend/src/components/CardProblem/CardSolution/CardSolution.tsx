"use client";

import { Truck, MoveRight, ShieldCheck } from "lucide-react";
import { useI18n } from "@/src/context/I18nContext";

export interface CardSolutionSectionProps {
  recommendation: string;
  donorStatus: string;
  logistics: {
    distanceKm: number;
    transportMode: string;
    etaHours: number;
  };
}

export default function CardSolutionSection({
  recommendation,
  donorStatus,
  logistics,
}: CardSolutionSectionProps) {
  const { t } = useI18n();

  return (
    <div className="space-y-6 pt-4">

      {/* RECOMMENDATION */}
      <section>
        <h3 className="text-sm font-medium text-gray-500 mb-1">
          {t("card_solution_section.ai_recommendation")}
        </h3>
        <p className="text-gray-800 text-sm">{recommendation}</p>
      </section>

      {/* DONOR STATUS */}
      <section className="bg-green-50 p-3 rounded-lg border border-green-200 flex items-start gap-3">
        <ShieldCheck className="h-5 w-5 text-green-600" />
        <div>
          <h4 className="text-sm font-semibold text-green-700">
            {t("card_solution_section.donor_facility_status")}
          </h4>
          <p className="text-sm text-green-800">{donorStatus}</p>
        </div>
      </section>

      {/* LOGISTICS */}
      <section className="bg-blue-50 p-3 rounded-lg border border-blue-200">
        <h4 className="text-sm font-semibold text-blue-700 mb-2">
          {t("card_solution_section.logistics_plan")}
        </h4>

        <div className="grid grid-cols-3 gap-4 text-sm">

          <div>
            <p className="text-gray-500">{t("card_solution_section.distance")}</p>
            <p className="font-semibold">{logistics.distanceKm} km</p>
          </div>

          <div>
            <p className="text-gray-500">{t("card_solution_section.mode")}</p>
            <div className="flex items-center gap-1">
              <Truck className="h-4 w-4" />
              <span className="font-semibold">{logistics.transportMode}</span>
            </div>
          </div>

          <div>
            <p className="text-gray-500">{t("card_solution_section.eta")}</p>
            <div className="flex items-center gap-1">
              <MoveRight className="h-4 w-4" />
              <span className="font-semibold">
                {logistics.etaHours} {t("card_solution_section.hours")}
              </span>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}