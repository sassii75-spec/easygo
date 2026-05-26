import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Users, Image as ImageIcon, LogOut, Briefcase, Bell } from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any).role !== "ADMIN") {
    redirect("/login?callbackUrl=/admin");
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar for Desktop */}
      <aside className="w-64 bg-[#025096] text-white flex-col hidden md:flex">
        <div className="p-6">
          <div className="bg-white px-5 py-3 rounded-xl inline-block shadow-sm border border-gray-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="EasyGo 로고" className="h-6 mb-1 object-contain" />
            <span className="text-[10px] font-black text-[#025096] uppercase tracking-widest block text-center border-t border-gray-100 mt-1 pt-1">Admin</span>
          </div>
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <Link href="/admin" className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 transition-colors">
            <LayoutDashboard size={20} />
            <span>대시보드</span>
          </Link>
          <Link href="/admin/users" className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 transition-colors">
            <Users size={20} />
            <span>권한 / 유저 관리</span>
          </Link>
          <Link href="/admin/banners" className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 transition-colors">
            <ImageIcon size={20} />
            <span>배너 관리</span>
          </Link>
          <Link href="/admin/notices" className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 transition-colors">
            <Bell size={20} />
            <span>공지사항 관리</span>
          </Link>
        </nav>
        <div className="p-4 border-t border-white/20">
          <Link href="/api/auth/signout" className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 transition-colors">
            <LogOut size={20} />
            <span>로그아웃</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden bg-white text-gray-900 p-4 flex justify-between items-center shadow-sm border-b border-gray-100">
          <div className="flex items-end gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="EasyGo 로고" className="h-6" />
            <span className="text-[10px] font-black text-[#025096] bg-blue-50 px-1.5 py-0.5 rounded">ADMIN</span>
          </div>
          <Link href="/api/auth/signout" className="p-2 rounded hover:bg-gray-100 text-gray-500">
            <LogOut size={20} />
          </Link>
        </header>
        
        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </div>
        
        {/* Mobile Bottom Nav */}
        <nav className="md:hidden bg-white border-t border-gray-200 flex justify-around p-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <Link href="/admin" className="flex flex-col items-center text-gray-500 hover:text-[#025096]">
            <LayoutDashboard size={24} />
            <span className="text-[10px] mt-1">대시보드</span>
          </Link>
          <Link href="/admin/users" className="flex flex-col items-center text-gray-500 hover:text-[#025096]">
            <Users size={24} />
            <span className="text-[10px] mt-1">권한 관리</span>
          </Link>
          <Link href="/admin/banners" className="flex flex-col items-center text-gray-500 hover:text-[#025096]">
            <ImageIcon size={24} />
            <span className="text-[10px] mt-1">배너</span>
          </Link>
          <Link href="/admin/notices" className="flex flex-col items-center text-gray-500 hover:text-[#025096]">
            <Bell size={24} />
            <span className="text-[10px] mt-1">공지사항</span>
          </Link>
        </nav>
      </main>
    </div>
  );
}
