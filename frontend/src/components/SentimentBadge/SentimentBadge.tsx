"use client";
import React from "react";


export default function SentimentAnalysisBadge({ text }: { text: string }) {
return (
<div className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">{text}</div>
);
}