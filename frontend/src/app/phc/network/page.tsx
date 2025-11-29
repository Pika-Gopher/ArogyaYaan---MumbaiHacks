"use client";

import { useState } from "react";
import LiveVehicleTracking from "@/src/components/SupplyMap/SupplyMap";
import MapControl from "@/src/components/MapControl/MapControl";
import SummaryPanel from "@/src/components/SummaryPanel/SummaryPanel";

// Mumbai PHC sample dataset
const phcs = [
  { id: "PHC1", name: "Wadala PHC", coords: [19.0169, 72.8561], status: "green" },
  { id: "PHC2", name: "Dadar PHC", coords: [19.0195, 72.8429], status: "yellow" },
  { id: "PHC3", name: "Mahim PHC", coords: [19.0436, 72.8406], status: "red" },
  { id: "PHC4", name: "Sion PHC", coords: [19.0450, 72.8625], status: "green" }
];

const transfers = [
  {
    id: "T1",
    from: "Wadala PHC",
    to: "Sion PHC",
    fromCoords: [19.0169, 72.8561],
    toCoords: [19.0450, 72.8625],
    medicine: "Paracetamol",
    quantity: 120,
    status: "completed",
    timestamp: "2025-11-18T10:30:00Z"
  },
  {
    id: "T2",
    from: "Mahim PHC",
    to: "Dadar PHC",
    fromCoords: [19.0436, 72.8406],
    toCoords: [19.0195, 72.8429],
    medicine: "ORS",
    quantity: 45,
    status: "pending",
    timestamp: "2025-11-20T14:10:00Z"
  }
];

export default function NetworkPage() {
  const [activeLayer, setActiveLayer] = useState<"status" | "routes" | "drug">(
    "status"
  );
  const [activeMedicine, setActiveMedicine] = useState<string>("");

  return (
    <div className="flex h-[calc(100vh-64px)]">

      {/* LEFT SECTION */}
      <div className="flex-1 flex flex-col pr-4">

        {/* Map */}
        <div className="flex-1 rounded-xl shadow-md">
          <LiveVehicleTracking />
        </div>

      </div>

      {/* RIGHT SUMMARY PANEL */}
      <div className="w-[360px] ml-4 border-l bg-white rounded-l-xl shadow-inner overflow-y-auto">

        <SummaryPanel
          data={{
            totalPHCs: phcs.length,
            redPHCs: phcs.filter((p) => p.status === "red").length,
            inventoryValue: 1850000,
            transfers: transfers.map((t) => ({
              id: t.id,
              from: t.from,
              to: t.to,
              medicine: t.medicine,
              quantity: t.quantity,
              status:
                (t.status === "completed" ? "completed" : "pending") as
                  | "completed"
                  | "pending",
              timestamp: t.timestamp
            }))
          }}
        />

      </div>
    </div>
  );
}