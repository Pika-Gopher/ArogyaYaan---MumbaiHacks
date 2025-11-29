"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Activity, CheckCircle, Truck, AlertTriangle } from "lucide-react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// Define the shape of an Approval item for the UI
type ApprovalItem = {
  id: string;
  facility: string;
  request: string;
  reason: string;
  solution: string;
  logistics: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
};

export default function Approvals() {
  const [approvals, setApprovals] = useState<ApprovalItem[]>([]);
  const [loading, setLoading] = useState(true);

  // --- Fetch Queue ---
  const fetchQueue = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE_URL}/api/approvals/queue`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Transform DB Data -> UI Shape
      // The backend returns an array of cards (or a single card if DHO focus mode)
      // Let's assume it returns an ARRAY now for the list view
      const rawData = Array.isArray(res.data) ? res.data : (res.data ? [res.data] : []);

      const mappedData: ApprovalItem[] = rawData.map((card: any) => {
        const p = card.payload || {};
        
        // Determine Priority Label
        let priority: "HIGH" | "MEDIUM" | "LOW" = "LOW";
        if (card.priority_score >= 9) priority = "HIGH";
        else if (card.priority_score >= 5) priority = "MEDIUM";

        // Logic to extract meaningful text
        const item = p.item_name || (p.request_details ? p.request_details.item_requested : "Unknown Item");
        const qty = p.quantity || (p.request_details ? p.request_details.quantity_needed : 0);
        const from = p.source_facility_name || (p.recommendation ? p.recommendation.from_phc : "Warehouse");
        const to = p.destination_facility_name || (p.recommendation ? p.recommendation.to_phc : "Clinic");

        return {
          id: card.id,
          facility: to, // The destination is usually the one "Requesting"
          request: `${qty} units of ${item}`,
          reason: card.ai_rationale_summary || "Stockout predicted by AI",
          solution: `Transfer from ${from}`,
          logistics: `${p.transport_mode || "Van"} • AI Optimized Route`,
          priority: priority,
        };
      });

      setApprovals(mappedData);
    } catch (err) {
      console.error("Failed to fetch approvals", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  // --- Actions ---
  const handleAction = async (id: string, action: "approve" | "reject") => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_BASE_URL}/api/approvals/${id}/action`,
        { action },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Remove the item from the list locally (Optimistic update)
      setApprovals((prev) => prev.filter((a) => a.id !== id));
      
      // Optional: Add toast notification
      // alert(action === "approve" ? "Transfer Initiated!" : "Request Rejected.");
    } catch (err) {
      console.error("Action failed", err);
      alert("Failed to process request. Check console.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 px-6 pt-20">
      <h1 className="text-3xl font-bold text-slate-800 mb-6 flex items-center gap-3">
        Pending Approvals 
        <span className="text-lg bg-blue-100 text-blue-800 px-3 py-1 rounded-full">{approvals.length}</span>
      </h1>

      {loading ? (
        <div className="text-center py-20 text-gray-500 animate-pulse">Checking for critical requests...</div>
      ) : approvals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl shadow-sm border border-dashed border-gray-300">
            <CheckCircle size={48} className="text-green-500 mb-4" />
            <h3 className="text-xl font-medium text-gray-700">All Clear!</h3>
            <p className="text-gray-500">No pending actions required.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {approvals.map((app) => (
            <div
              key={app.id}
              className="bg-white p-6 rounded-xl shadow-md border border-slate-200 animate-in fade-in slide-in-from-bottom-2"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold text-slate-900">{app.facility}</h2>
                {app.priority === "HIGH" && (
                  <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                    <AlertTriangle size={12} /> HIGH URGENCY
                  </span>
                )}
              </div>

              {/* Request Text */}
              <p className="text-lg text-slate-700 font-medium mb-4">{app.request}</p>

              {/* Metadata Box */}
              <div className="bg-slate-50 p-4 rounded-lg mb-4 space-y-2">
                <div className="flex items-center space-x-2">
                  <Activity size={16} className="text-slate-500" />
                  <p className="text-sm text-slate-600">
                    <strong>Reason:</strong> {app.reason}
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <CheckCircle size={16} className="text-emerald-600" />
                  <p className="text-sm text-slate-600">
                    <strong>AI Solution:</strong> {app.solution}
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <Truck size={16} className="text-blue-600" />
                  <p className="text-sm text-slate-600">{app.logistics}</p>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => handleAction(app.id, "reject")}
                  className="flex-1 border border-slate-300 bg-slate-100 text-slate-600 font-semibold py-2 rounded-lg hover:bg-slate-200 transition"
                >
                  Reject
                </button>

                <button
                  onClick={() => handleAction(app.id, "approve")}
                  className="flex-1 bg-emerald-600 text-white font-bold py-2 rounded-lg shadow-md hover:bg-emerald-700 transition"
                >
                  Approve Transfer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="h-10" />
    </div>
  );
}