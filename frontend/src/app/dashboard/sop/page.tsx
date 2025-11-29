"use client";

import GlobalStockInventoryRules from "@/src/components/GlobalStock/GlobalStock";
import TransportRulesForm from "@/src/components/TransportRules/TransportRules";
import SeasonalOverrideConfig from "@/src/components/SeasonalOverride/SeasonalOverride";

export default function SOPConfigPage() {
  return (
    <div className="w-full flex flex-col gap-8 p-6 md:p-10">
      {/* Page Header */}
      <h1 className="text-3xl font-bold tracking-tight">SOP Configuration</h1>
      <p className="text-gray-600 max-w-2xl">
        Configure the rules and guardrails for the Agentic AI and Automation Layer (n8n).
        This panel is restricted to DHO and authorized administrators.
      </p>

      {/* Sections */}
      <div className="space-y-10">
        {/* 1 — Global Stock & Inventory Rules */}
        <GlobalStockInventoryRules />

        {/* 2 — Logistics & Transport Rules */}
        <TransportRulesForm />

        {/* 3 — Seasonal & Override Configuration */}
        <SeasonalOverrideConfig />
      </div>
    </div>
  );
}