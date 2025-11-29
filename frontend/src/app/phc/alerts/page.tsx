"use client";
import React, { useState } from "react";
import AlertsFilterBar from "@/src/components/AlertsBar/AlertsBar";
import PredictionSummaryCard from "@/src/components/PredictionCard/PredictionCard";
import PredictionDetailModal from "@/src/components/PredictionModal/PredictionModal";
import SystemHealthMetrics from "@/src/components/SystemHealth/SystemHealth";

// Mock data types
type Prediction = {
id: string;
title: string;
problem: string;
context: string;
urgency: "Critical" | "High" | "Medium";
horizonDays: number;
medicine: string;
confidence: number; // 0-100
phc: string;
createdAt: string;
sentiment?: string;
series?: Array<{ date: string; forecast: number; factorA?: number; factorB?: number }>; // for chart
};

const MOCK_PREDICTIONS: Prediction[] = Array.from({ length: 8 }).map((_, i) => ({
id: `pred-${i + 1}`,
title: `Stockout risk: Medicine ${String.fromCharCode(65 + i)}`,
problem: `Projected stockout in ${3 + i} days for Medicine ${String.fromCharCode(65 + i)}`,
context: `PHC: Block ${i + 1} — estimated daily consumption increased by ${5 + i}%` ,
urgency: i % 3 === 0 ? "Critical" : i % 3 === 1 ? "High" : "Medium",
horizonDays: 3 + i,
medicine: `Medicine ${String.fromCharCode(65 + i)}`,
confidence: 70 + (i * 3) % 30,
phc: `PHC-${i + 1}`,
createdAt: new Date(Date.now() - i * 3600_000).toISOString(),
sentiment: i % 2 === 0 ? `High urgency: 'severe fever cases'` : undefined,
series: Array.from({ length: 14 }).map((__, d) => ({ date: `2025-11-${10 + d}`, forecast: Math.max(0, 50 - d * (i + 1) * 0.8), factorA: Math.random() * 10 + 20, factorB: Math.random() * 5 + 5 })),
}));

export default function AlertsPage() {
const [predictions] = useState<Prediction[]>(MOCK_PREDICTIONS);
const [filters, setFilters] = useState({ urgency: "All", medicine: "All", horizon: "All" });
const [selected, setSelected] = useState<Prediction | null>(null);


const visible = predictions.filter((p) => {
if (filters.urgency !== "All" && p.urgency !== filters.urgency) return false;
if (filters.medicine !== "All" && p.medicine !== filters.medicine) return false;
if (filters.horizon !== "All") {
if (filters.horizon === "<7" && p.horizonDays >= 7) return false;
if (filters.horizon === "7-14" && (p.horizonDays < 7 || p.horizonDays > 14)) return false;
}
return true;
});

return (
<div className="p-6 space-y-6">
<div className="flex items-start justify-between gap-6">
<div className="flex-1">
<h1 className="text-2xl font-semibold">Alerts & Predictions</h1>
<p className="text-sm text-muted-foreground mt-1">Feed of proactive warnings from the Agentic AI engine.</p>
</div>
<SystemHealthMetrics total={predictions.length} avgConfidence={Math.round(predictions.reduce((a, b) => a + b.confidence, 0) / predictions.length)} />
</div>


<AlertsFilterBar
urgencies={[...new Set(predictions.map((p) => p.urgency))]}
medicines={[...new Set(predictions.map((p) => p.medicine))]}
onChange={(v) => setFilters(v)}
/>


<div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
<div className="col-span-2 space-y-3">
{visible.map((pred) => (
<PredictionSummaryCard key={pred.id} prediction={pred} onOpen={() => setSelected(pred)} onEscalate={() => alert(`Escalated ${pred.id} to Approvals Queue`)} />
))}
{visible.length === 0 && <div className="p-4 text-center text-sm text-gray-600">No predictions match the current filters.</div>}
</div>


<aside className="space-y-4">
<div className="p-4 bg-white rounded-lg shadow-sm">
<h3 className="font-medium">Quick stats</h3>
<ul className="mt-2 text-sm text-gray-700 space-y-1">
<li>Total visible: <strong>{visible.length}</strong></li>
<li>Critical: <strong>{predictions.filter((p) => p.urgency === "Critical").length}</strong></li>
<li>Avg Confidence: <strong>{Math.round(predictions.reduce((a, b) => a + b.confidence, 0) / predictions.length)}%</strong></li>
</ul>
</div>


<div className="p-4 bg-white rounded-lg shadow-sm">
<h3 className="font-medium">Triage Map</h3>
<p className="text-sm text-gray-600 mt-2">Mini map shows PHC locations related to selected prediction (click a card to open).</p>
</div>
</aside>
</div>


{selected && (
<PredictionDetailModal prediction={selected} onClose={() => setSelected(null)} onEscalate={() => alert(`Escalated ${selected.id} from modal`)} />
)}
</div>
);
}