"use client";
import React from "react";


const MUMBAI_PHCS = [
{ id: "PHC-WAD", name: "Wadala PHC", zone: "South" },
{ id: "PHC-AND", name: "Andheri PHC", zone: "West" },
{ id: "PHC-MAL", name: "Malad PHC", zone: "North" },
{ id: "PHC-BAN", name: "Bandra PHC", zone: "Central" },
{ id: "PHC-MAT", name: "Matunga PHC", zone: "South" },
];


export default function PHCGroupFilter({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
const toggle = (id: string) => {
if (value.includes(id)) onChange(value.filter((x) => x !== id));
else onChange([...value, id]);
};


return (
<div className="space-y-2">
<label className="text-sm">PHC / Zone</label>
<div className="flex gap-2 flex-wrap">
<button onClick={() => onChange(MUMBAI_PHCS.map((p) => p.id))} className="px-3 py-1 rounded bg-gray-100 text-sm">All Mumbai</button>
<button onClick={() => onChange(MUMBAI_PHCS.filter((p) => p.zone === "North").map((p) => p.id))} className="px-3 py-1 rounded bg-gray-100 text-sm">North Zone</button>
<button onClick={() => onChange([])} className="px-3 py-1 rounded bg-gray-100 text-sm">Clear</button>
</div>
<div className="flex gap-2 flex-wrap">
{MUMBAI_PHCS.map((p) => (
<label key={p.id} className={`px-3 py-1 rounded border ${value.includes(p.id) ? "bg-blue-50 border-blue-400" : "bg-white"}`}>
<input type="checkbox" checked={value.includes(p.id)} onChange={() => toggle(p.id)} className="mr-2" />
{p.name}
</label>
))}
</div>
</div>
);
}