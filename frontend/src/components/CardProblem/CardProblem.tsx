"use client";

import PredictionChartThumbnail from "../PredictionChart/PredictionChart";
import { useI18n } from "@/src/context/I18nContext";

export interface CardProblemSectionProps {
  medicine: string;
  predictionSummary: string;
  context: string;
  chartData: { day: string; stock: number }[];
}

export default function CardProblemSection({
  medicine,
  predictionSummary,
  context,
  chartData,
}: CardProblemSectionProps) {
  const { t } = useI18n();

  return (
    <div className="space-y-4 border-b pb-4">
      {/* MEDICINE */}
      <div>
        <h3 className="text-sm font-medium text-gray-500">
          {t("card_problem_section.medicine")}
        </h3>
        <p className="text-lg font-semibold">{medicine}</p>
      </div>

      {/* PREDICTION + CHART */}
      <div>
        <h3 className="text-sm font-medium text-gray-500">
          {t("card_problem_section.prediction")}
        </h3>
        <p className="text-gray-700 text-sm mb-2">
          {predictionSummary}
        </p>

        <div className="bg-gray-5 rounded-lg p-2 border border-gray-200">
          <PredictionChartThumbnail data={chartData} />
        </div>
      </div>

      {/* CONTEXT */}
      <div>
        <h3 className="text-sm font-medium text-gray-500">
          {t("card_problem_section.context")}
        </h3>
        <p className="text-gray-700 text-sm">{context}</p>
      </div>
    </div>
  );
}