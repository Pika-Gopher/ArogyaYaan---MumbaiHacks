"use client";

import React from "react";

export default function ReportTypeSelector({ value, onChange }: { value: string; onChange: (v: string) => void }) {
const types = ["Performance (Supply Chain)", "Financial (Waste/Savings)", "Compliance (SOPs)"];
return (
<div className="flex items-center gap-3">
<label className="text-sm">Report</label>
<select value={value} onChange={(e) => onChange(e.target.value)} className="border rounded px-2 py-1">
{types.map((t) => (
<option key={t} value={t}>{t}</option>
))}
</select>
</div>
);
}