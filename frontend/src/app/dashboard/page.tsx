"use client";
import dynamic from "next/dynamic";
import MetricCard from "@/src/components/MetricCard/MetricCard";
import { PHCMarker } from "@/src/components/LiveMap/LiveMap";
import RecentActivityFeed from "@/src/components/Feed/Feed";
import { useI18n } from "@/src/context/I18nContext";

const LiveMap = dynamic(() => import("@/src/components/LiveMap/LiveMap"), {
  ssr: false,
});

export default function DashboardPage() {
  const { t, formatNumber, formatCurrency } = useI18n();

  const metrics = {
    criticalAlerts: 12,
    activeTransfers: 5,
    networkHealth: "92%",
    valueSaved: "₹4.2 Lakh",
  };

  const phcList = [
    {
      id: "1",
      name: "PHC Andheri",
      latitude: 19.1197,
      longitude: 72.8468,
      criticalItem: "ORS",
      daysOfStockLeft: 5,
      status: "critical" as const,
    },
    {
      id: "2",
      name: "PHC Bandra",
      latitude: 19.0596,
      longitude: 72.8295,
      criticalItem: "Paracetamol",
      daysOfStockLeft: 11,
      status: "warning" as const,
    },
    {
      id: "3",
      name: "PHC Borivali",
      latitude: 19.231,
      longitude: 72.8567,
      criticalItem: "Metformin",
      daysOfStockLeft: 22,
      status: "healthy" as const,
    },
  ] satisfies PHCMarker[];

  return (
    <div className="space-y-8 bg-background min-h-screen p-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label={t("dashboard.metrics.criticalAlerts")}
          value={formatNumber(metrics.criticalAlerts)}
          variant="critical"
          imageSrc="/images/critical-alerts.png"
        />

        <MetricCard
          label={t("dashboard.metrics.activeTransfers")}
          value={formatNumber(metrics.activeTransfers)}
          variant="info"
          imageSrc="/images/active-transfers.png"
        />

        <MetricCard
          label={t("dashboard.metrics.networkHealth")}
          value={metrics.networkHealth}
          variant="success"
          imageSrc="/images/network-health.png"
        />

        <MetricCard
          label={t("dashboard.metrics.valueSaved")}
          value={metrics.valueSaved}
          variant="neutral"
          imageSrc="/images/value-saved.png"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <LiveMap phcList={phcList} />
        </div>

        <div className="h-full">
          <RecentActivityFeed />
        </div>
      </div>
    </div>
  );
}