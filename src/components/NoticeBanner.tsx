"use client";

import { useEffect, useState } from "react";
import { Megaphone, X, ChevronRight, Calendar } from "lucide-react";

type Notice = {
  id: string;
  title: string;
  content: string;
  target: "ALL" | "PARTNER";
  createdAt: string;
};

export default function NoticeBanner() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);

  useEffect(() => {
    async function fetchNotices() {
      try {
        const res = await fetch("/api/notices");
        if (res.ok) {
          const data = await res.json();
          setNotices(data);
        }
      } catch (err) {
        console.error("Failed to load notices", err);
      }
    }
    fetchNotices();
  }, []);

  if (notices.length === 0) return null;

  // 가장 최신 공지사항 하나를 배너에 표시 (또는 여러 개 롤링 가능하지만 일단 최신 1개)
  const latestNotice = notices[0];

  return (
    <>
      <div 
        onClick={() => setSelectedNotice(latestNotice)}
        className="bg-white mx-4 sm:mx-6 mt-4 mb-2 rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center justify-between cursor-pointer hover:border-[#025096] hover:shadow-md transition-all group"
      >
        <div className="flex items-center gap-3 overflow-hidden flex-1">
          <div className="bg-blue-50 text-[#025096] p-2 rounded-xl shrink-0 group-hover:bg-[#025096] group-hover:text-white transition-colors">
            <Megaphone size={20} />
          </div>
          <div className="truncate">
            <div className="flex items-center gap-2 mb-0.5">
               <span className="text-[10px] font-black bg-red-50 text-red-600 px-1.5 py-0.5 rounded tracking-wide">공지사항</span>
               {latestNotice.target === 'PARTNER' && <span className="text-[10px] font-bold bg-[#008653]/10 text-[#008653] px-1.5 py-0.5 rounded tracking-wide">파트너 전용</span>}
            </div>
            <p className="font-bold text-gray-900 text-[15px] truncate">{latestNotice.title}</p>
          </div>
        </div>
        <ChevronRight size={20} className="text-gray-400 group-hover:text-[#025096] group-hover:translate-x-1 transition-all shrink-0 ml-2" />
      </div>

      {/* 공지사항 상세 모달 */}
      {selectedNotice && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-[28px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-2 text-[#025096]">
                <Megaphone size={22} className="fill-[#025096]/10" />
                <h3 className="font-black text-lg">알려드립니다</h3>
              </div>
              <button 
                onClick={() => setSelectedNotice(null)} 
                className="bg-white text-gray-400 hover:text-gray-900 hover:bg-gray-100 p-2 rounded-full transition-colors shadow-sm border border-gray-100"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-6">
              <div className="mb-6">
                 {selectedNotice.target === 'PARTNER' && <span className="inline-block text-[11px] font-black bg-[#008653]/10 text-[#008653] px-2 py-1 rounded-md mb-2">🤝 파트너 전용 공지</span>}
                 <h2 className="text-[22px] font-bold text-gray-900 leading-snug mb-3">
                   {selectedNotice.title}
                 </h2>
                 <div className="flex items-center gap-1.5 text-sm text-gray-400 font-medium font-mono">
                   <Calendar size={14} />
                   {new Date(selectedNotice.createdAt).toLocaleDateString()}
                 </div>
              </div>
              
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 max-h-[50vh] overflow-y-auto w-full notice-content">
                 <p className="text-[15px] leading-relaxed text-gray-700 whitespace-pre-wrap font-medium">
                   {selectedNotice.content}
                 </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-gray-100 bg-gray-50">
              <button 
                onClick={() => setSelectedNotice(null)}
                className="w-full bg-gray-900 text-white font-bold text-[16px] py-4 rounded-xl hover:bg-black active:scale-[0.98] transition-all shadow-md"
              >
                확인했습니다
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
