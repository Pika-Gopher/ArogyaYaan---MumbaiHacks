"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import FilterBar from "@/src/components/FilterBar/FilterBar";
import SolutionCard from "@/src/components/SolutionCard/Solutioncard";
import CardProblem from "@/src/components/CardProblem/CardProblem";
import PredictionChart from "@/src/components/PredictionChart/PredictionChart";
import CardAction from "@/src/components/CardAction/CardAction";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export default function ApprovalsPage() {
  const [filters, setFilters] = useState({
    severity: null as string | null,
    medicineType: null as string | null,
    phc: "",
  });

  const [loading, setLoading] = useState(true);
  const [transferData, setTransferData] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0); // Trigger re-fetch

  // --- Fetch Data ---
  useEffect(() => {
    const fetchQueue = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_BASE_URL}/api/approvals/queue`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const card = res.data;

        if (!card) {
          setTransferData(null); // Queue empty
        } else {
          // --- Transform DB Data to UI Shape ---
          const payload = card.payload || {};
          
          setTransferData({
            id: card.id,
            medicine: payload.item_name || "Unknown Item",
            predictionSummary: card.ai_rationale_summary || "Predicted stockout risk",
            context: `PHC ${payload.source_facility_name || "Unknown"} has excess stock while ${payload.destination_facility_name || "Destination"} is critical.`,
            
            // Generate Mock Chart for Visuals
            chartData: [
              { day: "Mon", stock: 180 },
              { day: "Tue", stock: 160 },
              { day: "Wed", stock: 140 },
              { day: "Thu", stock: 110 },
              { day: "Fri", stock: 90 },
              { day: "Sat", stock: 60 },
            ],

            aiSolution: {
              id: card.id,
              title: "AI Recommended Transfer",
              urgency: card.priority_score > 8 ? "critical" : "high",
              summary: `${payload.source_facility_name} can transfer ${payload.quantity} units safely.`,
              recommendation: `Transfer ${payload.quantity} units via ${payload.transport_mode || "Van"}.`,
              automation: "Auto-assigns nearest driver & updates inventory logs.",
            },
            
            // Mock Feed
            feed: [
              { id: 1, text: "AI detected critical shortage", time: "Just now" },
              { id: 2, text: "Analyzed nearest available stock", time: "2 mins ago" },
            ],
          });
        }
      } catch (err) {
        console.error("Error fetching approvals:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchQueue();
  }, [refreshKey]);

  // --- Handle Action (Approve/Reject) ---
  const handleAction = async (action: "approve" | "reject") => {
    if (!transferData) return;
    
    try {
        const token = localStorage.getItem("token");
        await axios.post(
            `${API_BASE_URL}/api/approvals/${transferData.id}/action`, 
            { action }, 
            { headers: { Authorization: `Bearer ${token}` } }
        );
        
        // Refresh to get next card
        setRefreshKey((prev) => prev + 1);
    } catch (err) {
        console.error("Action failed", err);
        alert("Failed to process action. Try again.");
    }
  };

  return (
    <div className="space-y-8 p-6">
      <h1 className="text-3xl font-semibold">Transfer Approvals</h1>

      <FilterBar onChange={(updatedFilters) => setFilters(updatedFilters)} />

      {loading ? (
        <div className="text-center py-20 animate-pulse text-gray-500">Loading AI Recommendations...</div>
      ) : !transferData ? (
        <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-dashed border-gray-300">
            <h3 className="text-xl font-medium text-gray-700">All caught up! 🎉</h3>
            <p className="text-gray-500 mt-2">No pending AI recommendations to review.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <CardProblem
              medicine={transferData.medicine}
              predictionSummary={transferData.predictionSummary}
              context={transferData.context}
              chartData={transferData.chartData}
            />

            <PredictionChart data={transferData.chartData} />

            <SolutionCard
              id={transferData.aiSolution.id}
              title={transferData.aiSolution.title}
              urgency={transferData.aiSolution.urgency}
              summary={transferData.aiSolution.summary}
              recommendation={transferData.aiSolution.recommendation}
              automation={transferData.aiSolution.automation}
            />

            <CardAction
              transferId={transferData.id}
              // Map the component's generic 'complete' event to our specific approve logic
              // Note: You might need to update CardAction to accept specific onApprove/onReject props
              // or just pass a generic callback that we assume is 'approve' for now.
              onActionComplete={() => handleAction("approve")} 
            />
          </div>

          <div>
             {/* Feed or Metadata Sidebar could go here */}
          </div>
        </div>
      )}
    </div>
  );
}