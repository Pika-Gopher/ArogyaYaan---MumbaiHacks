"use client";

import React from "react";
import { Layers, Pill, Info } from "lucide-react";

export interface MapControlsPanelProps {
  activeLayer: string;
  onLayerChange: (layer: string) => void;

  selectedMedicine: string | null;
  onMedicineChange: (medicine: string | null) => void;
}

const MEDICINE_LIST = [
  "Paracetamol",
  "ORS",
  "Amoxicillin",
  "Doxycycline",
  "Metformin",
  "Atorvastatin",
];

const MapControlsPanel: React.FC<MapControlsPanelProps> = ({
  activeLayer,
  onLayerChange,
  selectedMedicine,
  onMedicineChange,
}) => {
  return (
    <div className="w-full mb-4 px-4">
      <div
        className="
          w-full 
          bg-white
          shadow 
          rounded-xl 
          px-6 py-4 
          flex items-center justify-between
          gap-8
        "
      >
        {/* --- LEFT SECTION: LAYER DROPDOWN --- */}
        <div className="flex items-center gap-3">
          <Layers size={20} className="text-blue-600" />
          <div className="flex flex-col">
            <label className="text-xs text-gray-500">
              Display Layer
            </label>

            <select
              value={activeLayer}
              onChange={(e) => onLayerChange(e.target.value)}
              className="
                border rounded-md p-2 mt-1 text-sm 
                bg-gray-50
              "
            >
              <option value="default">Default Health Status</option>
              <option value="transfers">Active Transfers</option>
              <option value="lowStock">Low Stock Facilities</option>
            </select>
          </div>
        </div>

        {/* --- MIDDLE SECTION: MEDICINE FILTER --- */}
        <div className="flex items-center gap-3">
          <Pill size={20} className="text-purple-600" />
          <div className="flex flex-col">
            <label className="text-xs text-gray-500">
              Filter by Medicine
            </label>

            <select
              className="
                border rounded-md p-2 mt-1 text-sm 
                bg-gray-50
              "
              value={selectedMedicine ?? ""}
              onChange={(e) =>
                onMedicineChange(e.target.value || null)
              }
            >
              <option value="">All Medicines</option>
              {MEDICINE_LIST.map((med) => (
                <option key={med} value={med}>
                  {med}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* --- RIGHT SECTION: LEGEND --- */}
        <div className="flex items-center gap-3">
          <Info size={20} className="text-gray-700" />

          <div className="flex gap-6 text-sm">
            <LegendDot color="#16a34a" label=">30d" />
            <LegendDot color="#ca8a04" label="7–30d" />
            <LegendDot color="#dc2626" label="<7d" />
          </div>
        </div>
      </div>
    </div>
  );
};

// Small Legend Dot Component
const LegendDot = ({ color, label }: { color: string; label: string }) => (
  <div className="flex items-center gap-2">
    <div
      className="w-3 h-3 rounded-sm"
      style={{ backgroundColor: color }}
    ></div>
    <span className="text-sm">{label}</span>
  </div>
);

export default MapControlsPanel;