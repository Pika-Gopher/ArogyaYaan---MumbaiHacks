"use client";

import Link from "next/link";

export default function NavItem({ href, Icon, label, collapsed }: any) {
  return (
    <Link
      href={href}
      className={`
        flex items-center gap-3 p-2 rounded-md 
        text-[#133263]                     /* Light mode normal */
        hover:text-white                   /* Light mode hover → white */
        hover:bg-[#1868DB]                 /* Light mode hover background */

        transition-colors
        ${collapsed ? "justify-center" : ""}
      `}
    >
      <Icon size={18} />
      {!collapsed && <span className="truncate">{label}</span>}
    </Link>
  );
}
