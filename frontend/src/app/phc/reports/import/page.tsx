"use client";

import { useState } from "react";
import axios from "axios";
import { UploadCloud, FileText, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

// Matches your backend route setup
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export default function ImportPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "inventory" | "admissions") => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset UI
    setMessage(null);
    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const token = localStorage.getItem("token");
      
      // Determine the correct endpoint
      const endpoint = type === "inventory" ? "/api/import/inventory" : "/api/import/admissions";

      await axios.post(`${API_BASE_URL}${endpoint}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setMessage({ 
        type: "success", 
        text: `${type === 'inventory' ? 'Inventory' : 'Admissions'} logs imported successfully!` 
      });

    } catch (err: any) {
      console.error("Upload failed", err);
      const errorMsg = err.response?.data?.error || "Failed to upload. Please check the CSV format.";
      setMessage({ type: "error", text: errorMsg });
    } finally {
      setLoading(false);
      // Clear the input so the same file can be selected again if needed
      e.target.value = ""; 
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-2 text-gray-800">Data Import Center</h1>
      <p className="text-gray-500 mb-8">
        Bulk upload daily logs to sync with the central District Dashboard.
      </p>

      {/* Notification Banner */}
      {message && (
        <div className={`p-4 mb-6 rounded-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${
          message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"
        }`}>
          {message.type === "success" ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span className="font-medium">{message.text}</span>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        
        {/* --- Card 1: Inventory Logs --- */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
              <FileText size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Inventory Logs</h3>
              <p className="text-xs text-gray-500">Update stock levels & consumption</p>
            </div>
          </div>
          
          <div className="group border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50 hover:bg-white hover:border-blue-400 transition-all relative cursor-pointer">
            <input 
              type="file" 
              accept=".csv"
              onChange={(e) => handleFileUpload(e, "inventory")}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
              disabled={loading}
            />
            
            {loading ? (
               <Loader2 size={32} className="mx-auto text-blue-500 animate-spin mb-2" />
            ) : (
               <UploadCloud size={32} className="mx-auto text-gray-400 group-hover:text-blue-500 mb-2 transition-colors" />
            )}
            
            <p className="text-sm font-medium text-gray-600 group-hover:text-blue-600">
              {loading ? "Processing..." : "Click to Upload CSV"}
            </p>
            <p className="text-[10px] text-gray-400 mt-2 font-mono bg-gray-100 py-1 px-2 rounded inline-block">
              item_id, qty, type, facility_id
            </p>
          </div>
        </div>

        {/* --- Card 2: Admission Logs --- */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
              <FileText size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Patient Admissions</h3>
              <p className="text-xs text-gray-500">Log daily disease cases</p>
            </div>
          </div>
          
          <div className="group border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50 hover:bg-white hover:border-purple-400 transition-all relative cursor-pointer">
            <input 
              type="file" 
              accept=".csv"
              onChange={(e) => handleFileUpload(e, "admissions")}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
              disabled={loading}
            />
            
            {loading ? (
               <Loader2 size={32} className="mx-auto text-purple-500 animate-spin mb-2" />
            ) : (
               <UploadCloud size={32} className="mx-auto text-gray-400 group-hover:text-purple-500 mb-2 transition-colors" />
            )}

            <p className="text-sm font-medium text-gray-600 group-hover:text-purple-600">
              {loading ? "Processing..." : "Click to Upload CSV"}
            </p>
            <p className="text-[10px] text-gray-400 mt-2 font-mono bg-gray-100 py-1 px-2 rounded inline-block">
              facility_id, condition, date
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}