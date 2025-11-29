"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useI18n } from "@/src/context/I18nContext";

export default function GlobalStockInventoryRules() {
  const { t } = useI18n();

  const [safetyBuffer, setSafetyBuffer] = useState([20]);
  const [substitutionEnabled, setSubstitutionEnabled] = useState(true);
  const [minDays, setMinDays] = useState(7);

  return (
    <Card className="p-6 rounded-2xl shadow-md bg-white border border-gray-200 mt-4">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">
          {t("globalRulesTitle")}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-10">

        {/* Safety Stock Buffer */}
        <div className="space-y-3">
          <Label className="text-base font-medium">{t("safetyBufferLabel")}</Label>
          <p className="text-sm text-gray-500">{t("safetyBufferDesc")}</p>

          <div className="flex items-center gap-4">
            <Slider
              value={safetyBuffer}
              min={10}
              max={50}
              step={1}
              onValueChange={setSafetyBuffer}
              className="w-64"
            />
            <span className="text-sm font-medium w-12">{safetyBuffer}%</span>
          </div>
        </div>

        {/* Therapeutic Substitution Toggle */}
        <div className="flex items-center justify-between py-2 border-t border-gray-200 pt-6">
          <div>
            <Label className="text-base font-medium">{t("enableTherapeuticSub")}</Label>
            <p className="text-sm text-gray-500 w-80">{t("enableTherapeuticSubDesc")}</p>
          </div>
          <Switch checked={substitutionEnabled} onCheckedChange={setSubstitutionEnabled} />
        </div>

        {/* Minimum Days Stock */}
        <div className="pt-6 border-t border-gray-200">
          <Label className="text-base font-medium">{t("minDaysLabel")}</Label>
          <p className="text-sm text-gray-500">{t("minDaysDesc")}</p>

          <Input
            type="number"
            min={1}
            className="mt-3 w-32"
            value={minDays}
            onChange={(e) => setMinDays(Number(e.target.value))}
          />
        </div>
      </CardContent>
    </Card>
  );
}