"use client";
import React from "react";


export default function SystemHealthMetrics({ total, avgConfidence }: { total: number; avgConfidence: number }) {
return (
<div className="bg-white p-3 rounded-lg shadow-sm text-sm w-56">
<div className="flex items-center justify-between">
<div>
<div className="text-xs text-gray-500">Active predictions</div>
<div className="text-xl font-semibold">{total}</div>
</div>
<div className="text-right">
<div className="text-xs text-gray-500">AI Confidence</div>
<div className="text-xl font-semibold">{avgConfidence}%</div>
</div>
</div>
<div className="mt-3 text-xs text-gray-600">Last refresh: just now</div>
</div>
);
}