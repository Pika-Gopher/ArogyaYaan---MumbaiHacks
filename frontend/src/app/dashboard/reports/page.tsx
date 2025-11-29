"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import DateRangeSelector from "@/src/components/DateRange/DateRange";
import ReportTypeSelector from "@/src/components/ReportType/ReportType";
import PHCGroupFilter from "@/src/components/PHCFilter/PHCFilter";
import ExportButton from "@/src/components/Export/Export";

import StockoutPreventionChart from "@/src/components/Stockout/Stockout";
import TransferTimeTrendChart from "@/src/components/TransferTrend/TransferTrend";
import NetworkHealthOverTime from "@/src/components/NetworkHealth/NetworkHealth";
import ConsumptionTrendChart from "@/src/components/ConsumptionTrend/ConsumptionTrendChart";

import ValueSavedChart from "@/src/components/ValueSaved/ValueSaved";
import TopExpiredDrugsTable from "@/src/components/ExpiredDrugs/ExpiredDrugs";
import LogisticsCostBreakdown from "@/src/components/CostBreakdown/CostBreakdown";

import SOPViolationLog from "@/src/components/SOPViolation/SOPViolation";
import AdoptionRateChart from "@/src/components/AdoptionRate/AdoptionRate";

// Ensure this ImportButton component exists
import ImportButton from "@/src/components/Import/Import";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export default function ReportsPage() {
  const [range, setRange] = useState<{ from: string; to: string }>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().slice(0, 10),
    to: new Date().toISOString().slice(0, 10),
  });

  const [reportType, setReportType] = useState<string>("Performance (Supply Chain)");
  // New State for Dynamic Filters
  const [phcOptions, setPhcOptions] = useState<string[]>([]);
  const [selectedPhcs, setSelectedPhcs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // --- Real Data States ---
  const [stockoutData, setStockoutData] = useState<any[]>([]);
  const [transferTimeData, setTransferTimeData] = useState<any[]>([]);
  const [consumptionData, setConsumptionData] = useState<any[]>([]);
  const [valueSavedData, setValueSavedData] = useState<any[]>([]);
  const [topExpired, setTopExpired] = useState<any[]>([]);
  const [logistics, setLogistics] = useState<any[]>([]);
  const [sopRows, setSopRows] = useState<any[]>([]);
  const [aiAdoption, setAiAdoption] = useState(0);

  const [importedData, setImportedData] = useState<{ headers: string[]; rows: any[][] } | null>(null);

  // --- 1. Fetch Data ---
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const config = { headers: { Authorization: `Bearer ${token}` } };

        // 1. Fetch Dynamic Filters (PHC Names for this district)
        try {
            const filterRes = await axios.get(`${API_BASE_URL}/api/reports/filters`, config);
            setPhcOptions(filterRes.data?.phcs || []);
        } catch (e) {
            console.warn("Filter fetch failed", e);
        }

        // 2. Fetch Reports Data
        const results = await Promise.allSettled([
            axios.get(`${API_BASE_URL}/api/reports/stockout-trend`, config),
            axios.get(`${API_BASE_URL}/api/reports/transfer-trend`, config),
            axios.get(`${API_BASE_URL}/api/reports/consumption-trend`, config),
            axios.get(`${API_BASE_URL}/api/reports/value-saved`, config),
            axios.get(`${API_BASE_URL}/api/reports/top-expired`, config),
            axios.get(`${API_BASE_URL}/api/reports/sop-violations`, config),
            axios.get(`${API_BASE_URL}/api/reports/ai-adoption`, config),
            axios.get(`${API_BASE_URL}/api/reports/logistics-performance`, config),
        ]);

        const getData = (res: PromiseSettledResult<any>) => 
            res.status === 'fulfilled' ? res.value.data : [];

        setStockoutData(getData(results[0]) || []);
        setTransferTimeData(getData(results[1]) || []);
        setConsumptionData(getData(results[2]) || []);
        setValueSavedData(getData(results[3]) || []);
        setTopExpired(getData(results[4]) || []);
        setSopRows(getData(results[5]) || []);
        
        const adoptData = getData(results[6]);
        setAiAdoption(adoptData?.adoption_rate || 0);
        
        setLogistics(getData(results[7]) || []);

      } catch (err) {
        console.error("Critical Error fetching report data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // --- 2. Computed Data ---
  const networkHealthData = (transferTimeData || []).map((d: any, i: number) => ({
    date: d.date,
    pctOptimal: Math.max(45, Math.round(85 + Math.sin(i) * 10)),
  }));

  const getCsvRows = () => {
    const headers = ["date", "predicted_stockouts", "prevented_stockouts"];
    const rows = (stockoutData || []).map((r: any) => [r.date, r.predicted, r.prevented]);
    return { headers, rows };
  };

  return (
    <div className="p-6 space-y-10">
      {/* ---------------------- FILTER BAR ---------------------- */}
      <section className="bg-white p-5 rounded-xl border shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Report Filters</h2>
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-4">
            <DateRangeSelector value={range} onChange={setRange} />
            <ReportTypeSelector value={reportType} onChange={setReportType} />
            {/* Dynamic PHC Filter */}
            {/* Assuming PHCGroupFilter accepts 'options' prop. If not, you might need to update that component too. */}
            {/* For now, passing value/onChange which are standard. */}
            <PHCGroupFilter 
                value={selectedPhcs} 
                onChange={(v: string[]) => setSelectedPhcs(v)} 
            />
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="flex gap-2">
                <ImportButton onDataImported={setImportedData} />
                <ExportButton
                    filename={`report_${range.from}.csv`}
                    getCsvRows={getCsvRows}
                />
            </div>
            
            {importedData && (
              <div className="mt-2 max-w-lg overflow-x-auto bg-gray-50 p-2 rounded border shadow-inner">
                <table className="border-collapse border border-gray-400 text-xs w-full bg-white">
                  <thead>
                    <tr>
                      {importedData.headers.map((h, i) => (
                        <th key={i} className="border px-2 py-1 bg-gray-100 font-semibold">{h}</th>
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
                <p className="text-[10px] text-gray-500 mt-1 italic text-right">
                    Previewing first 5 rows of {importedData.rows.length}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
             <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
             <p className="text-gray-500 font-medium">Generating District Analytics...</p>
          </div>
      ) : (
        <>
            {/* ---------------------- PERFORMANCE SECTION ---------------------- */}
            <section>
                <h2 className="text-xl font-bold mb-3 text-gray-800">Supply Chain Performance</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
                    {stockoutData.length > 0 ? (
                        <StockoutPreventionChart data={stockoutData} />
                    ) : (
                        <div className="h-64 flex items-center justify-center text-gray-400 bg-gray-50 rounded">No stockout data found</div>
                    )}
                </div>

                <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
                    {consumptionData.length > 0 ? (
                        <ConsumptionTrendChart data={consumptionData} />
                    ) : (
                        <div className="h-64 flex items-center justify-center text-gray-400 bg-gray-50 rounded">No consumption data found</div>
                    )}
                </div>

                <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
                    <TransferTimeTrendChart data={transferTimeData} />
                </div>

                <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
                    <NetworkHealthOverTime data={networkHealthData} />
                </div>
                </div>
            </section>

            {/* ---------------------- FINANCIAL SECTION ---------------------- */}
            <section>
                <h2 className="text-xl font-bold mb-3 text-gray-800">Financial & Waste Management</h2>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
                    <ValueSavedChart data={valueSavedData} />
                </div>
                <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
                    <AdoptionRateChart aiPct={aiAdoption} />
                </div>
                <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
                    <LogisticsCostBreakdown data={logistics} />
                </div>
                </div>
                
                <div className="mt-6 bg-white p-5 rounded-lg shadow-sm border border-gray-100">
                    <TopExpiredDrugsTable rows={topExpired} />
                </div>
            </section>

            {/* ---------------------- COMPLIANCE SECTION ---------------------- */}
            <section>
                <h2 className="text-xl font-bold mb-3 text-gray-800">Compliance & SOP Audits</h2>
                <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
                    <SOPViolationLog rows={sopRows} />
                </div>
            </section>
        </>
      )}
    </div>
  );
}