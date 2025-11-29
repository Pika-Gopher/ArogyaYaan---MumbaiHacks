"use client";
import React from "react";


export default function ImpactMapMini({ phc }: { phc: string }) {
return (
<div className="w-full h-32 bg-slate-50 rounded border flex items-center justify-center">
<svg width="220" height="120" viewBox="0 0 220 120" className="pointer-events-none">
<rect width="220" height="120" rx="8" fill="#fff" stroke="#e5e7eb" />
<circle cx="60" cy="60" r="6" fill="#60a5fa" />
<text x="72" y="64" fontSize="11" fill="#111">{phc}</text>
<circle cx="120" cy="40" r="5" fill="#9ca3af" />
<text x="132" y="44" fontSize="11" fill="#444">PHC-Donor</text>
<circle cx="170" cy="80" r="5" fill="#9ca3af" />
<text x="182" y="84" fontSize="11" fill="#444">Nearby</text>
</svg>
</div>
);
}