"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Menu, LogOut } from "lucide-react";
import NavItem from "../NavItem/NavItem";
import UserProfile from "../UserProfile/UserProfile";
import LanguageToggle from "../LanguageToggle/LanguageToggle";
import { NAV_ITEMS } from "../constants";

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const router = useRouter();
  const user = { name: "Dr. Aruna", role: "DHO" };

  const handleLogout = () => {
    router.push("/"); // opens main page.tsx
  };

  return (
    <aside
      className={`hidden md:flex flex-col bg-white border-r border-gray-200 transition-all duration-300
      ${collapsed ? "w-20" : "w-60"}`}
    >
      {/* Branding */}
      <div className="flex items-center px-4 py-4 relative">
        {/* Logo */}
        <div className="min-w-10 w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shrink-0">
          AY
        </div>

        {/* Title */}
        {!collapsed && (
          <div className="ml-3">
            <div className="text-lg font-semibold leading-tight">ArogyaYaan</div>
            <div className="text-xs text-slate-500 leading-tight">
              District Health Office Worli
            </div>
          </div>
        )}

        {/* Collapse Button */}
        <button
          className="ml-auto p-2 rounded hover:bg-gray-100 transition-all"
          onClick={() => setCollapsed(!collapsed)}
        >
          <Menu size={16} />
        </button>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 px-2 py-3 space-y-1">
        {NAV_ITEMS.map((item) => (
          <NavItem
            key={item.key}
            href={item.href}
            Icon={item.icon}
            collapsed={collapsed}
            label={item.labelKey}
          />
        ))}
      </nav>
      <div 
      className={`flex items-center border-t border-gray-100 px-4 py-4 
        ${collapsed ? "flex-col gap-4" : "justify-between"}`}
      >
      <LanguageToggle collapsed={collapsed} />
      </div>

      {/* Footer Section */}
      <div
        className={`flex items-center border-t border-gray-100 px-4 py-4 
        ${collapsed ? "flex-col gap-4" : "justify-between"}`}
      >
        <UserProfile user={user} collapsed={collapsed} />
        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className={`flex items-center text-red-600 hover:text-red-700 transition-all 
          ${collapsed ? "flex-col" : "gap-2"}`}
        >
          <LogOut size={18} />
          {!collapsed && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>
    </aside>
  );
}