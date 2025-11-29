"use client";
import React from "react";


export default function ExportButton({ filename = "report.csv", getCsvRows }: { filename?: string; getCsvRows: () => { headers: string[]; rows: any[][] } }) {
const download = () => {
const { headers, rows } = getCsvRows();
const csv = [headers.join(","), ...rows.map((r) => r.map((c) => JSON.stringify(c)).join(","))].join("\n");
const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
const url = URL.createObjectURL(blob);
const a = document.createElement("a");
a.href = url;
a.download = filename;
a.click();
URL.revokeObjectURL(url);
};


return (
<button onClick={download} className="px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700">Export CSV</button>
);
}