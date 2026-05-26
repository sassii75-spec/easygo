"use client";
import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

interface LogoutButtonProps {
  className?: string;
  iconOnly?: boolean;
}

export default function LogoutButton({ className, iconOnly }: LogoutButtonProps) {
  return (
    <button 
      onClick={() => signOut({ callbackUrl: "/" })}
      className={className || "text-gray-500 font-bold text-sm bg-gray-100 flex items-center px-2 py-1 rounded text-gray-600 hover:bg-gray-200 transition-colors"}
    >
      <LogOut size={16} className={iconOnly ? "" : "mr-1"} />
      {!iconOnly && "로그아웃"}
    </button>
  );
}
