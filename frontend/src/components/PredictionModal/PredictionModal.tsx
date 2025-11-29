"use client";

import React from "react";
import MultiFactorChart from "../MultiFactor";
import ImpactMapMini from "../Impactmap";
import SentimentAnalysisBadge from "../SentimentBadge/SentimentBadge";


type SeriesPoint = { date: string; forecast: number; factorA?: number; factorB?: number };

export default function PredictionDetailModal({ prediction, onClose, onEscalate }: { prediction: any; onClose: () => void; onEscalate: () => void; }) {
return (
<div className="fixed inset-0 z-50 flex items-center justify-center">
<div className="absolute inset-0 bg-black/40" onClick={onClose} />
<div className="relative bg-white rounded-lg max-w-4xl w-full p-6 shadow-lg">
<div className="flex items-start justify-between gap-4">
<div>
<h2 className="text-xl font-semibold">{prediction.title}</h2>
<p className="text-sm text-gray-600">{prediction.problem}</p>
<p className="text-xs text-gray-500 mt-1">PHC: {prediction.phc} • Confidence: {prediction.confidence}%</p>
</div>
<div className="flex flex-col gap-2">
{prediction.sentiment && <SentimentAnalysisBadge text={prediction.sentiment} />}
<div className="flex gap-2">
<button onClick={onClose} className="px-3 py-1 border rounded">Close</button>
<button onClick={onEscalate} className="px-3 py-1 bg-red-600 text-white rounded">Escalate</button>
</div>
</div>
</div>


<div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
<div className="p-3 border rounded">
<h4 className="font-medium mb-2">Forecast & Drivers</h4>
<MultiFactorChart series={prediction.series as SeriesPoint[]} />
</div>


<div className="p-3 border rounded space-y-3">
<h4 className="font-medium">Context & Reasoning</h4>
<p className="text-sm text-gray-700">{prediction.context}</p>
<div>
<h5 className="font-medium mt-2">Suggested actions</h5>
<ul className="list-disc pl-5 text-sm text-gray-700 mt-1">
<li>Check current stock at PHC.</li>
<li>Contact nearest donor PHC to request transfer.</li>
<li>Prepare emergency procurement if necessary.</li>
</ul>
</div>


<div className="mt-3">
<h5 className="font-medium">Impact map</h5>
<ImpactMapMini phc={prediction.phc} />
</div>
</div>
</div>


</div>
</div>
);
}