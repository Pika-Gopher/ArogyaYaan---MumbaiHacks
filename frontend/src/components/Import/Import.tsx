"use client";
import React from "react";

interface ImportProps {
  onDataImported: (data: { headers: string[]; rows: any[][] }) => void;
}

export default function ImportButton({ onDataImported }: ImportProps) {
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split("\n").map((l) => l.trim()).filter(l => l.length > 0);

      if (lines.length === 0) return;

      const headers = lines[0].split(",").map((h) => h.trim());
      const rows = lines.slice(1).map((line) =>
        line.split(",").map((cell) => {
          try {
            return JSON.parse(cell);
          } catch {
            return cell;
          }
        })
      );

      onDataImported({ headers, rows });
    };

    reader.readAsText(file);
  };

  return (
    <>
      <label className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 cursor-pointer">
        Import CSV
        <input
          type="file"
          accept=".csv"
          onChange={handleImport}
          className="hidden"
        />
      </label>
    </>
  );
}