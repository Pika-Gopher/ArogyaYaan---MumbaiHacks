"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import DateRangeSelector from "@/src/components/DateRange/DateRange";
import ReportTypeSelector from "@/src/components/ReportType/ReportType";
import PHCGroupFilter from "@/src/components/PHCFilter/PHCFilter";
// Note: Ensure this ImportButton component exists in your project at this path
import ImportButton from "@/src/components/Import/Import"; 

import TopExpiredDrugsTable from "@/src/components/ExpiredDrugs/ExpiredDrugs";
import SOPViolationLog from "@/src/components/SOPViolation/SOPViolation";

// Assuming these are needed for the full page structure you likely have
import StockoutPreventionChart from "@/src/components/Stockout/Stockout"; // Optional if used
// Add other imports if you are rendering the full dashboard (TransferTrend, etc.)

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export default function ReportsPage() {
  const [range, setRange] = useState<{ from: string; to: string }>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().slice(0, 10),
    to: new Date().toISOString().slice(0, 10),
  });

  const [reportType, setReportType] = useState<string>("Performance (Supply Chain)");
  const [phcs, setPhcs] = useState<string[]>([]);
  
  // --- STATE FOR REAL DATA ---
  const [topExpired, setTopExpired] = useState([]);
  const [sopRows, setSopRows] = useState([]);
  const [stockoutData, setStockoutData] = useState([]); // If you want to connect the chart too
  
  const [loading, setLoading] = useState(true);
  
  // State for your Import Button Preview
  const [importedData, setImportedData] = useState<{ headers: string[]; rows: any[][] } | null>(null);

  // --- FETCH DATA FROM BACKEND ---
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const config = { headers: { Authorization: `Bearer ${token}` } };

        // Fetch parallel requests
        const [expiredRes, sopRes, stockRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/reports/top-expired`, config),
          axios.get(`${API_BASE_URL}/api/reports/sop-violations`, config),
          axios.get(`${API_BASE_URL}/api/reports/stockout-trend`, config),
        ]);

        setTopExpired(expiredRes.data || []);
        setSopRows(sopRes.data || []);
        setStockoutData(stockRes.data || []);

      } catch (err) {
        console.error("Error fetching report data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // Reload if range changes, add [range] to dependency if backend supports filtering

  return (
    <div className="p-6 space-y-10">

      {/* ---------------------- FILTER BAR ---------------------- */}
      <section className="bg-white p-5 rounded-xl border shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Report Filters</h2>

        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-4">
            <DateRangeSelector value={range} onChange={setRange} />
            <ReportTypeSelector value={reportType} onChange={setReportType} />
            {/* If you have PHC filter logic, pass props here */}
          </div>

          <div className="flex flex-col items-end">
            <ImportButton onDataImported={setImportedData} />
            
            {/* Render Imported Data Preview */}
            {importedData && (
              <div className="mt-4 max-w-lg overflow-x-auto bg-gray-50 p-2 rounded border">
                <table className="border-collapse border border-gray-400 text-xs">
                  <thead>
                    <tr>
                      {importedData.headers.map((h, i) => (
                        <th key={i} className="border px-2 py-1 bg-gray-200">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {importedData.rows.slice(0, 5).map((row, rIndex) => (
                      <tr key={rIndex}>
                        {row.map((cell, cIndex) => (
                          <td key={cIndex} className="border px-2 py-1">{String(cell)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="text-xs text-gray-500 mt-1 italic">Previewing first 5 rows...</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {loading ? (
         <div className="text-center py-20 text-gray-500 animate-pulse">Loading Report Data...</div>
      ) : (
        <>
          {/* ---------------------- FINANCIAL SECTION ---------------------- */}
          <section>
            <h2 className="text-xl font-bold mb-3">Financial & Waste Management</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* You can add charts here like ValueSavedChart if needed */}
            </div>

            <div className="mt-6 bg-white p-5 rounded-lg shadow border">
              {/* Connected Top Expired Table */}
              <TopExpiredDrugsTable rows={topExpired} />
            </div>
          </section>

          {/* ---------------------- COMPLIANCE SECTION ---------------------- */}
          <section>
            <h2 className="text-xl font-bold mb-3">Compliance & SOP Audits</h2>

            <div className="bg-white p-5 rounded-lg shadow border">
              {/* Connected SOP Violation Log */}
              <SOPViolationLog rows={sopRows} />
            </div>
          </section>
        </>
      )}
    </div>
  );
}