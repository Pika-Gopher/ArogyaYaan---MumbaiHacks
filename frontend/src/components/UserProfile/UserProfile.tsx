"use client";

import Image from "next/image";

type UserProfileProps = {
  user: { name: string; role: string };
  collapsed?: boolean;
};

export default function UserProfile({ user, collapsed = false }: UserProfileProps) {
  return (
    <div className="flex items-center gap-3">
      {/* Profile icon */}
      <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
        {user.name.charAt(0)}
      </div>

      {/* Hide text when collapsed */}
      {!collapsed && (
        <div>
          <div className="font-medium">{user.name}</div>
          <div className="text-xs text-gray-500">{user.role}</div>
        </div>
      )}
    </div>
  );
}