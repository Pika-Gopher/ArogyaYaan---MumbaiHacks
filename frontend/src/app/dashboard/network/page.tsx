"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import InteractiveMap from "@/src/components/InteractiveMap/InteractiveMap";
import MapControl from "@/src/components/MapControl/MapControl";
import SummaryPanel from "@/src/components/SummaryPanel/SummaryPanel";
import { X, Truck, MapPin, Package } from "lucide-react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export default function NetworkPage() {
  const [activeLayer, setActiveLayer] = useState<"status" | "routes" | "drug">("status");
  const [activeMedicine, setActiveMedicine] = useState<string>("");
  
  const [phcs, setPhcs] = useState<any[]>([]);
  const [transfers, setTransfers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State for Selected Transfer (Popup)
  const [selectedTransfer, setSelectedTransfer] = useState<any>(null);

  // --- Fetch Real Map Data ---
  useEffect(() => {
    const fetchMapData = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_BASE_URL}/api/map/data`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // console.log("Map Data Received:", res.data); 

        if (res.data) {
          setPhcs(res.data.phcs || []);
          setTransfers(res.data.transfers || []);
        }
      } catch (err) {
        console.error("Failed to load map data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMapData();
  }, []);

  return (
    <div className="flex h-[calc(100vh-64px)] relative">

      {/* LEFT SECTION */}
      <div className="flex-1 flex flex-col pr-4">
        <div className="w-full">
          <MapControl
            activeLayer={activeLayer}
            selectedMedicine={activeMedicine}
            onLayerChange={(layer) => setActiveLayer(layer as any)}
            onMedicineChange={(med) => setActiveMedicine(med ?? "")}
          />
        </div>

        <div className="flex-1 rounded-xl overflow-hidden shadow-md relative">
          {loading && (
             <div className="absolute inset-0 z-50 bg-white/80 flex items-center justify-center">
                <span className="text-blue-600 font-medium animate-pulse">Loading Live Network...</span>
             </div>
          )}
          <InteractiveMap phcs={phcs} transfers={transfers} activeLayer={activeLayer} />
        </div>
      </div>

      {/* RIGHT SUMMARY PANEL */}
      <div className="w-[360px] ml-4 border-l bg-white rounded-l-xl shadow-inner overflow-y-auto">
        <SummaryPanel
          onTransferClick={(t) => setSelectedTransfer(t)}
          data={{
            totalPHCs: phcs.length,
            redPHCs: phcs.filter((p) => p.status === "critical").length,
            inventoryValue: phcs.length * 45000 + transfers.length * 5000, 
            transfers: transfers.map((t) => ({
              id: t.id,
              from: t.fromName, 
              to: t.toName,     
              medicine: t.medicine,
              quantity: t.quantity,
              status: t.status, // Can be undefined coming from backend if not set
              timestamp: t.timestamp || new Date().toISOString()
            }))
          }}
        />
      </div>

      {/* --- POPUP MODAL FOR TRANSFER DETAILS --- */}
      {selectedTransfer && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="bg-blue-600 p-4 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Truck size={20} />
                <h3 className="font-semibold">Transfer Details</h3>
              </div>
              <button 
                onClick={() => setSelectedTransfer(null)}
                className="hover:bg-blue-700 p-1 rounded-full transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Transfer ID</p>
                  <p className="font-mono text-sm text-gray-800">#{selectedTransfer.id}</p>
                </div>
                {/* SAFE RENDER: Ensure string conversion before replace */}
                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full uppercase">
                  {String(selectedTransfer.status || "PENDING").replace(/_/g, " ")}
                </span>
              </div>

              {/* Route Visual */}
              <div className="relative flex items-center justify-between px-4 py-4 bg-gray-50 rounded-lg border">
                <div className="text-center">
                  <div className="w-8 h-8 bg-white border rounded-full flex items-center justify-center mx-auto mb-2 shadow-sm text-gray-600">
                    <MapPin size={16} />
                  </div>
                  <p className="text-xs font-semibold text-gray-800 max-w-[100px] truncate">{selectedTransfer.from}</p>
                  <p className="text-[10px] text-gray-500">Sender</p>
                </div>

                <div className="flex-1 h-px bg-gray-300 mx-4 relative">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-1 rounded-full border">
                    <Truck size={12} className="text-blue-500" />
                  </div>
                </div>

                <div className="text-center">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 shadow-sm">
                    <MapPin size={16} />
                  </div>
                  <p className="text-xs font-semibold text-gray-800 max-w-[100px] truncate">{selectedTransfer.to}</p>
                  <p className="text-[10px] text-gray-500">Receiver</p>
                </div>
              </div>

              {/* Cargo Details */}
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-2">Cargo Manifest</p>
                <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                  <Package size={24} className="text-blue-600" />
                  <div>
                    <p className="font-bold text-gray-900">{selectedTransfer.medicine}</p>
                    <p className="text-sm text-gray-600">{selectedTransfer.quantity} Units</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t bg-gray-50 flex justify-end">
              <button 
                onClick={() => setSelectedTransfer(null)}
                className="px-4 py-2 bg-white border shadow-sm rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}