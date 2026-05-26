import Link from 'next/link';
import { User, Smartphone, Building2, PackageCheck, Headphones, ArrowRight } from 'lucide-react';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import LogoutButton from '@/components/LogoutButton';

export default async function Home() {
  const session = await getServerSession(authOptions);

  return (
    <div className="bg-gray-50 min-h-screen pb-[100px] flex justify-center">
      <div className="w-full max-w-md bg-white min-h-screen relative shadow-2xl overflow-hidden">
        
        {/* Header */}
        <header className="flex justify-between items-center p-5 pt-8 bg-white sticky top-0 z-10 transition-all duration-300">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="EasyGo 로고" className="h-7 object-contain" />
          <nav className="flex gap-4">
             {session?.user ? (
               <div className="flex items-center gap-2">
                 {(session.user as any).role === 'PARTNER' && (
                    <Link href="/partner" className="text-gray-600 font-bold text-sm bg-gray-100 px-3 py-1.5 rounded-lg hover:bg-gray-200 transition-all">
                       ➔ 파트너 대시보드
                    </Link>
                 )}
                 <Link href="/my-auctions" className="text-[#025096] font-bold text-sm bg-blue-50 px-3 py-1.5 rounded-lg active:scale-95 transition-all">
                    내 경매 관리
                 </Link>
                 <LogoutButton />
               </div>
             ) : (
               <Link href="/login" className="text-gray-500 font-semibold text-sm flex items-center hover:text-gray-800 transition-colors">로그인</Link>
             )}
          </nav>
        </header>

        {/* Hero Section */}
        <section className="px-5 py-8 bg-gradient-to-br from-[#008653]/10 to-white relative pb-12">
          <div className="relative z-10">
            <p className="font-bold text-[#008653] mb-2 drop-shadow-sm">스트레스 없는 투명한 이사</p>
            <h2 className="text-[28px] font-black leading-tight text-gray-900 mb-4 word-keep">
              AI로 1분 만에<br/>
              짐량 계산하고<br/>
              <span className="text-[#025096]">투명하게</span> 비교하세요.
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed mb-6 font-medium">
              더 이상 방문 견적으로 시간 낭비하지 마세요.<br/>사진 몇 장이면 정확한 견적이 도착합니다.
            </p>
            
            <div className="inline-flex bg-white/80 backdrop-blur-sm border border-[#008653]/20 px-4 py-2.5 rounded-full items-center gap-2 shadow-sm text-sm font-bold text-gray-800">
               <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#008653] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#008653]"></span>
               </span>
               현재 <span className="text-[#008653]">428명</span>의 파트너가 대기 중!
            </div>
          </div>
          
          {/* Abstract Hero Image Decoration */}
          <div className="absolute right-[-10%] bottom-0 w-48 h-48 bg-[#008653]/10 rounded-full blur-3xl"></div>
          <div className="absolute left-[20%] top-[40%] w-32 h-32 bg-[#025096]/10 rounded-full blur-2xl"></div>
        </section>

        {/* Main Services (Cards) */}
        <section className="px-5 py-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">어떤 이사가 필요하신가요?</h3>
          
          <div className="grid grid-cols-2 gap-3 mb-3">
            {/* Oneroom */}
            <Link href="/estimate" className="bg-white border hover:border-[#008653] hover:shadow-md transition-all border-gray-100 rounded-2xl p-5 flex flex-col justify-between aspect-square group">
               <div>
                  <Smartphone className="text-gray-400 group-hover:text-[#008653] transition-colors mb-4" size={32} strokeWidth={1.5} />
                  <h4 className="font-bold text-gray-900 text-[17px] mb-1">소형 이사</h4>
                  <p className="text-gray-500 text-[12px] leading-tight">원투룸, 기숙사 등<br/>적은 짐 이동</p>
               </div>
            </Link>

            {/* Family */}
            <Link href="/estimate" className="bg-white border hover:border-[#025096] hover:shadow-md transition-all border-gray-100 rounded-2xl p-5 flex flex-col justify-between aspect-square group">
               <div>
                  <Building2 className="text-gray-400 group-hover:text-[#025096] transition-colors mb-4" size={32} strokeWidth={1.5} />
                  <h4 className="font-bold text-gray-900 text-[17px] mb-1">가정 이사</h4>
                  <p className="text-gray-500 text-[12px] leading-tight">투룸 이상 빌라,<br/>아파트 대형 짐</p>
               </div>
            </Link>
            
            {/* Premium */}
            <Link href="/estimate" className="bg-white border hover:border-gray-800 hover:shadow-md transition-all border-gray-100 rounded-2xl p-5 flex flex-col justify-between aspect-square group">
               <div>
                  <PackageCheck className="text-gray-400 group-hover:text-gray-800 transition-colors mb-4" size={32} strokeWidth={1.5} />
                  <h4 className="font-bold text-gray-900 text-[17px] mb-1">프리미엄 안심</h4>
                  <p className="text-gray-500 text-[12px] leading-tight">고가 가전/가구<br/>특수 포장 케어</p>
               </div>
            </Link>

            {/* Support */}
            <Link href="/" className="bg-[#f8fafc] border border-transparent rounded-2xl p-5 flex flex-col justify-between aspect-square">
               <div>
                  <Headphones className="text-gray-400 mb-4" size={32} strokeWidth={1.5} />
                  <h4 className="font-bold text-gray-900 text-[17px] mb-1">맞춤 상담</h4>
                  <p className="text-gray-500 text-[12px] leading-tight">무엇을 선택할지<br/>모르겠다면?</p>
               </div>
            </Link>
          </div>
        </section>

        {/* AI Banner */}
        <section className="px-5 py-6 mb-8">
           <Link href="/estimate" className="block bg-[#025096] rounded-2xl p-6 text-white relative overflow-hidden group">
              <div className="relative z-10 w-2/3">
                 <p className="text-[#93c5fd] text-xs font-bold mb-1">EasyGo AI 테트리스</p>
                 <h3 className="text-lg font-bold mb-2 leading-tight">사진 한 장으로<br/>트럭 사이즈를 맞춰요!</h3>
                 <div className="flex items-center text-sm font-medium opacity-90 group-hover:opacity-100 transition-opacity">
                    무료 체험하기 <ArrowRight size={14} className="ml-1" />
                 </div>
              </div>
              <div className="absolute -right-4 -bottom-4 text-[100px] opacity-10 blur-[2px] rotate-[-15deg] group-hover:rotate-0 group-hover:scale-110 transition-transform duration-500">
                 🤖
              </div>
           </Link>
        </section>

        {/* Fixed CTA Footer */}
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-100 p-4 pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.08)] z-50">
           <Link href="/estimate" className="w-full flex items-center justify-center gap-2 bg-[#008653] text-white py-4 rounded-xl font-bold text-[17px] hover:bg-[#00623e] transition-colors active:scale-[0.98]">
              AI 간편 견적 시작하기 <ArrowRight size={18} />
           </Link>
        </div>
      </div>
    </div>
  );
}
