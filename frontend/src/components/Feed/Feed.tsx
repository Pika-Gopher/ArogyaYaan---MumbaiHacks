"use client";

import { Activity } from "lucide-react";
import { useI18n } from "@/src/context/I18nContext";

interface FeedItemProps {
  message: string;
  timestamp: string;
}

const FeedItem = ({ message, timestamp }: FeedItemProps) => {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition">
      <div className="p-2 rounded-full bg-blue-500/10">
        <Activity size={18} className="text-blue-600" />
      </div>

      <div className="flex-1">
        <p className="text-sm font-medium text-foreground">{message}</p>
        <p className="text-xs text-muted-foreground mt-1">{timestamp}</p>
      </div>
    </div>
  );
};

export default function RecentActivityFeed() {
  const { t } = useI18n();
  const recentActivities = [
    { message: t("activityMessage1"), timestamp: t("activityTime1") },
    { message: t("activityMessage2"), timestamp: t("activityTime2") },
    { message: t("activityMessage3"), timestamp: t("activityTime3") },
    { message: t("activityMessage4"), timestamp: t("activityTime4") }
  ];

  return (
    <div className="w-full bg-card border border-border rounded-xl p-4 h-72 flex flex-col shadow-sm">
      <h2 className="text-lg font-semibold text-foreground mb-3">
        {t("recentActivity")}
      </h2>

      <div className="overflow-y-auto pr-1 space-y-2">
        {recentActivities.map((item, index) => (
          <FeedItem key={index} message={item.message} timestamp={item.timestamp} />
        ))}
      </div>
    </div>
  );
}