"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import AlertsFilterBar from "@/src/components/AlertsBar/AlertsBar";
import PredictionSummaryCard from "@/src/components/PredictionCard/PredictionCard";
import PredictionDetailModal from "@/src/components/PredictionModal/PredictionModal";
import SystemHealthMetrics from "@/src/components/SystemHealth/SystemHealth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// Types matching the transformed backend response
type Prediction = {
  id: string;
  title: string;
  problem: string;
  context: string;
  urgency: "Critical" | "High" | "Medium";
  horizonDays: number;
  medicine: string;
  confidence: number;
  phc: string;
  createdAt: string;
  sentiment?: string;
  series?: Array<{ date: string; forecast: number; factorA?: number; factorB?: number }>;
};

export default function AlertsPage() {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [filters, setFilters] = useState({ urgency: "All", medicine: "All", horizon: "All" });
  const [selected, setSelected] = useState<Prediction | null>(null);
  const [loading, setLoading] = useState(true);

  // --- 1. Fetch Feed on Mount ---
  useEffect(() => {
    const fetchFeed = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_BASE_URL}/api/alerts/feed`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPredictions(res.data || []);
      } catch (err) {
        console.error("Failed to load alerts feed", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeed();
  }, []);

  // --- 2. New Handler: Fetch Single Detail on Click ---
  const handleReviewClick = async (summaryPred: Prediction) => {
    // A. Optimistic UI: Show what we have immediately
    setSelected(summaryPred);

    // B. Fetch fresh details in background (e.g. to get latest status or extra logs)
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE_URL}/api/alerts/${summaryPred.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Update selected with fresh data (merging ensures we don't lose UI state)
      setSelected(prev => prev?.id === summaryPred.id ? { ...prev, ...res.data } : prev);
    } catch (err) {
      console.error("Failed to fetch fresh details", err);
      // No alert needed, user still sees the summary data
    }
  };

  const visible = predictions.filter((p) => {
    if (filters.urgency !== "All" && p.urgency !== filters.urgency) return false;
    if (filters.medicine !== "All" && p.medicine !== filters.medicine) return false;
    if (filters.horizon !== "All") {
      if (filters.horizon === "<7" && p.horizonDays >= 7) return false;
      if (filters.horizon === "7-14" && (p.horizonDays < 7 || p.horizonDays > 14)) return false;
    }
    return true;
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between gap-6">
        <div className="flex-1">
          <h1 className="text-2xl font-semibold">Alerts & Predictions</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Feed of proactive warnings from the Agentic AI engine.
          </p>
        </div>
        <SystemHealthMetrics
          total={predictions.length}
          avgConfidence={
            predictions.length > 0
              ? Math.round(predictions.reduce((a, b) => a + b.confidence, 0) / predictions.length)
              : 0
          }
        />
      </div>

      <AlertsFilterBar
        urgencies={[...new Set(predictions.map((p) => p.urgency))]}
        medicines={[...new Set(predictions.map((p) => p.medicine))]}
        onChange={(v) => setFilters(v)}
      />

      {loading ? (
        <div className="text-center py-20 text-gray-500 animate-pulse">
           Connecting to Agentic AI Engine...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="col-span-2 space-y-3">
            {visible.map((pred) => (
              <PredictionSummaryCard
                key={pred.id}
                prediction={pred}
                onOpen={() => handleReviewClick(pred)} // <--- CONNECTED HERE
                onEscalate={() => alert(`Escalated ${pred.id} to Approvals Queue`)}
              />
            ))}
            {visible.length === 0 && (
              <div className="p-4 text-center text-sm text-gray-600">
                No predictions match the current filters.
              </div>
            )}
          </div>

          <aside className="space-y-4">
            <div className="p-4 bg-white rounded-lg shadow-sm">
              <h3 className="font-medium">Quick stats</h3>
              <ul className="mt-2 text-sm text-gray-700 space-y-1">
                <li>Total visible: <strong>{visible.length}</strong></li>
                <li>
                  Critical:{" "}
                  <strong>{predictions.filter((p) => p.urgency === "Critical").length}</strong>
                </li>
                <li>
                  Avg Confidence:{" "}
                  <strong>
                    {predictions.length > 0
                      ? Math.round(predictions.reduce((a, b) => a + b.confidence, 0) / predictions.length)
                      : 0}
                    %
                  </strong>
                </li>
              </ul>
            </div>

            <div className="p-4 bg-white rounded-lg shadow-sm">
              <h3 className="font-medium">Triage Map</h3>
              <p className="text-sm text-gray-600 mt-2">
                Mini map shows PHC locations related to selected prediction (click a card to open).
              </p>
              <div className="h-32 bg-gray-100 mt-2 rounded flex items-center justify-center text-xs text-gray-400">
                 [Interactive Map Visual]
              </div>
            </div>
          </aside>
        </div>
      )}

      {selected && (
        <PredictionDetailModal
          prediction={selected}
          onClose={() => setSelected(null)}
          onEscalate={() => alert(`Escalated ${selected.id} from modal`)}
        />
      )}
    </div>
  );
}