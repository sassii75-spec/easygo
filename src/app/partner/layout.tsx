import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Home, List, Bell, User as UserIcon } from "lucide-react";
import LogoutButton from "@/components/LogoutButton";

export default async function PartnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any).role !== "PARTNER") {
    redirect("/login?callbackUrl=/partner");
  }

  return (
    <div className="flex justify-center bg-gray-100 min-h-screen">
      {/* Mobile container - Partner app is highly mobile focused */}
      <div className="w-full max-w-md bg-white min-h-screen flex flex-col shadow-2xl relative">
        {/* Header */}
        <header className="bg-white text-gray-900 p-4 sticky top-0 z-10 flex justify-between items-center shadow-[0_2px_10px_rgba(0,0,0,0.05)] border-b border-gray-100">
          <div className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="EasyGo 로고" className="h-6 object-contain" />
            <span className="bg-[#008653] text-white rounded px-2 py-0.5 text-[10px] font-bold uppercase relative -top-0.5">Partner</span>
          </div>
          <div className="flex items-center gap-3 text-gray-500 hover:text-gray-900 transition-colors">
            <LogoutButton iconOnly={true} className="text-gray-400 hover:text-red-500 transition-colors p-1" />
            <Link href="/" className="text-[11px] font-bold bg-gray-100 flex items-center px-2 py-1 rounded text-gray-600 hover:bg-gray-200 transition-colors">➔ 고객 모드로 전환</Link>
            <div className="relative cursor-pointer">
              <Bell size={24} />
              <span className="absolute -top-1 -right-1 bg-red-500 rounded-full w-4 h-4 text-[10px] flex items-center justify-center font-bold text-white shadow-sm ring-2 ring-white">3</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 pb-20">
          {children}
        </main>

        {/* Bottom Navigation */}
        <nav className="bg-white border-t border-gray-200 flex justify-around p-3 pb-safe shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.05)] fixed bottom-0 w-full max-w-md z-20">
          <Link href="/partner" className="flex flex-col items-center text-[#008653] font-medium">
            <Home size={24} />
            <span className="text-[10px] mt-1">홈</span>
          </Link>
          <Link href="/partner" className="flex flex-col items-center text-gray-400 hover:text-[#008653]">
            <List size={24} />
            <span className="text-[10px] mt-1">배차현황</span>
          </Link>
          <Link href="/partner?tab=profile" className="flex flex-col items-center text-gray-400 hover:text-[#008653]">
            <UserIcon size={24} />
            <span className="text-[10px] mt-1">내 정보</span>
          </Link>
        </nav>
      </div>
    </div>
  );
}
