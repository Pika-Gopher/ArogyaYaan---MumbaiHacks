"use client";

import React from "react";
import { ArrowRight, Truck } from "lucide-react";

interface Transfer {
  id: string;
  from: string;
  to: string;
  medicine: string;
  quantity: number;
  status: string; 
  timestamp: string;
}

interface SummaryData {
  totalPHCs: number;
  redPHCs: number;
  inventoryValue: number;
  transfers: Transfer[];
}

interface SummaryPanelProps {
  data: SummaryData;
  onTransferClick?: (transfer: Transfer) => void;
}

const SummaryPanel: React.FC<SummaryPanelProps> = ({ data, onTransferClick }) => {
  // Ensure data.transfers exists
  const transfers = data?.transfers || [];

  return (
    <div className="h-full flex flex-col">
      {/* HEADER */}
      <div className="p-5 border-b bg-gray-50">
        <h2 className="font-semibold text-lg text-gray-800">Network Overview</h2>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="bg-white p-3 rounded border shadow-sm">
            <div className="text-xs text-gray-500 uppercase font-bold">Total PHCs</div>
            <div className="text-2xl font-bold text-gray-800">{data?.totalPHCs || 0}</div>
          </div>
          <div className="bg-white p-3 rounded border shadow-sm">
            <div className="text-xs text-red-500 uppercase font-bold">Critical</div>
            <div className="text-2xl font-bold text-red-600">{data?.redPHCs || 0}</div>
          </div>
        </div>
      </div>

      {/* RECENT ACTIVITY LIST */}
      <div className="flex-1 overflow-y-auto p-0">
        <div className="p-4 sticky top-0 bg-white border-b z-10">
          <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Truck size={16} /> Active Transfers
          </h3>
        </div>

        <div className="divide-y">
          {transfers.length === 0 ? (
            <div className="p-8 text-center text-gray-500 text-sm">
              No active transfers moving right now.
            </div>
          ) : (
            transfers.map((t) => {
              // --- ABSOLUTE SAFETY CHECK ---
              if (!t) return null; // Skip if transfer object is null
              
              // Force string conversion. Even if null/undefined, String() makes it "undefined" string, which won't crash.
              // But we want a clean default.
              let statusStr = "PENDING";
              if (t.status) {
                  statusStr = String(t.status);
              }
              
              const displayStatus = statusStr.replace(/_/g, " ");
              
              return (
                <div
                  key={t.id || Math.random()} // Fallback key
                  onClick={() => onTransferClick && onTransferClick(t)}
                  className="p-4 hover:bg-blue-50 cursor-pointer transition-colors group"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-mono text-gray-400">#{ (t.id || "").slice(0, 6) }</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold ${
                        displayStatus === "DELIVERED" || displayStatus === "completed"
                          ? "bg-green-100 text-green-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {displayStatus}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm font-medium text-gray-800 mb-2">
                    <span className="truncate max-w-[100px]" title={t.from}>{t.from || "Unknown"}</span>
                    <ArrowRight size={14} className="text-gray-400 shrink-0" />
                    <span className="truncate max-w-[100px]" title={t.to}>{t.to || "Unknown"}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="font-medium text-gray-700">
                      {t.quantity || 0} x {t.medicine || "Item"}
                    </span>
                    <span className="group-hover:text-blue-600 group-hover:underline">
                      View Details
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default SummaryPanel;