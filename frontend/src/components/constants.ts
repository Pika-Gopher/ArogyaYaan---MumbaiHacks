import {
  Bell,
  ClipboardList,
  MapPin,
  BarChart2,
  Settings,
} from "lucide-react";

export const NAV_ITEMS = [
  { key: "dashboard", labelKey: "Dashboard", href: "/dashboard/", icon: BarChart2 },
  { key: "alerts", labelKey: "Alerts", href: "/dashboard/alerts", icon: Bell },
  { key: "approvals", labelKey: "Approvals", href: "/dashboard/approvals", icon: ClipboardList },
  { key: "network", labelKey: "Network", href: "/dashboard/network", icon: MapPin },
  { key: "reports", labelKey: "Reports", href: "/dashboard/reports", icon: BarChart2 },
  { key: "sop", labelKey: "SOP", href: "/dashboard/sop", icon: Settings },
];

export const NAV_ITEMS_PHC = [
  { key: "dashboard", labelKey: "Dashboard", href: "/phc/", icon: BarChart2 },
  { key: "alerts", labelKey: "Alerts", href: "/phc/alerts", icon: Bell },
  { key: "approvals", labelKey: "Approvals", href: "/phc/approvals", icon: ClipboardList },
  { key: "network", labelKey: "Network", href: "/phc/network", icon: MapPin },
  { key: "reports", labelKey: "Reports", href: "/phc/reports", icon: BarChart2 },
];
