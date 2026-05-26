"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, Check, Info, ExternalLink, CalendarDays, Rocket } from "lucide-react";
import Link from "next/link";
import { CHECKLIST_DATA, ChecklistItem } from "@/data/checklistData";

const CATEGORIES = ['D-30', 'D-10', 'D-3', 'D-1', '출발지', '도착지'];

export default function ChecklistPage() {
  const [activeTab, setActiveTab] = useState<string>('D-30');
  const [checkedIds, setCheckedIds] = useState<Record<string, boolean>>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('easygo_checklist');
    if (saved) {
      try {
        setCheckedIds(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  const handleCheck = (id: string) => {
    const nextState = { ...checkedIds, [id]: !checkedIds[id] };
    setCheckedIds(nextState);
    localStorage.setItem('easygo_checklist', JSON.stringify(nextState));
  };

  const totalItems = CHECKLIST_DATA.length;
  const completedItems = Object.values(checkedIds).filter(Boolean).length;
  const progressPercent = Math.round((completedItems / totalItems) * 100) || 0;

  const currentItems = CHECKLIST_DATA.filter((item) => item.category === activeTab);

  if (!mounted) return null; // Avoid SSR hydration mismatch for localStorage

  return (
    <div className="bg-[#f4f6fa] min-h-screen pb-safe">
      {/* Header */}
      <header className="bg-white px-5 py-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-3">
          <Link href="/my-auctions" className="text-gray-900 bg-gray-50 border border-gray-100 p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <ChevronLeft size={24} />
          </Link>
          <h1 className="font-black text-[22px] tracking-tight text-gray-900">이사 체크리스트</h1>
        </div>
      </header>

      {/* Global Progress Dashboard */}
      <div className="px-5 pt-6 pb-2">
        <div className="bg-gradient-to-br from-[#025096] to-[#4169e1] rounded-3xl p-6 text-white shadow-xl shadow-blue-900/10 relative overflow-hidden">
          <div className="absolute -right-6 -top-6 text-white/10">
            <Rocket size={140} />
          </div>
          
          <div className="relative z-10 flex items-center gap-5">
             <div className="w-[70px] h-[70px] shrink-0 relative flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                   <path className="text-white/20 stroke-current" strokeWidth="3" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                   <path className="text-[#34d399] stroke-current" strokeWidth="3" strokeDasharray={`${progressPercent}, 100`} strokeLinecap="round" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center font-black text-xl tracking-tighter">
                   {progressPercent}%
                </div>
             </div>
             <div>
                <p className="text-blue-100 text-[13px] font-bold mb-1 flex items-center gap-1"><CalendarDays size={14} /> 전체 진행률</p>
                <h3 className="text-[22px] font-black leading-tight">
                   {progressPercent === 100 ? "완성! 완벽히 준비됐어요🎉" : "이사 준비, 같이 끝내봐요!"}
                </h3>
             </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-[73px] bg-[#f4f6fa]/90 backdrop-blur-md z-20 px-4 py-4">
        <div className="flex gap-2 overflow-x-auto hide-scrollbar snap-x">
           {CATEGORIES.map(cat => {
              const catTotal = CHECKLIST_DATA.filter(c => c.category === cat).length;
              const catChecked = CHECKLIST_DATA.filter(c => c.category === cat && checkedIds[c.id]).length;
              const isAllChecked = catTotal > 0 && catChecked === catTotal;
              const isActive = activeTab === cat;
              
              return (
                 <button 
                  key={cat} 
                  onClick={() => setActiveTab(cat)}
                  className={`snap-start shrink-0 px-5 py-2.5 rounded-full font-bold text-sm transition-all shadow-sm border ${isActive ? 'bg-gray-900 text-white border-gray-900 shadow-md transform scale-105' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}
                 >
                    <span className="flex items-center gap-1.5">
                       {isAllChecked && <Check size={14} className={isActive ? "text-[#34d399]" : "text-[#008653]"} strokeWidth={3} />}
                       {cat}
                    </span>
                 </button>
              )
           })}
        </div>
      </div>

      {/* List */}
      <div className="px-5 pb-10 space-y-3">
         {currentItems.map((item, index) => {
            const isChecked = !!checkedIds[item.id];
            
            return (
               <div key={item.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 group">
                  <div className="flex items-start gap-4">
                     {/* Checkbox Native-like */}
                     <button
                        onClick={() => handleCheck(item.id)}
                        className={`mt-0.5 shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${isChecked ? 'bg-[#008653] border-[#008653]' : 'bg-transparent border-gray-300'}`}
                     >
                        {isChecked && <Check size={14} className="text-white" strokeWidth={3} />}
                     </button>
                     
                     <div className="flex-1">
                        <h4 onClick={() => handleCheck(item.id)} className={`font-bold text-[16px] leading-snug cursor-pointer transition-colors ${isChecked ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                           {item.title}
                        </h4>
                        
                        {item.authority && (
                           <div className={`mt-2 flex items-center gap-1.5 text-[12px] font-bold ${isChecked ? 'text-gray-300' : 'text-[#025096] bg-blue-50 w-max px-2.5 py-1 rounded-md'}`}>
                              <Info size={12} /> {item.authority}
                           </div>
                        )}
                        
                        {item.links && item.links.length > 0 && (
                           <div className="mt-3 flex flex-wrap gap-2">
                              {item.links.map((link, idx) => (
                                 <a 
                                    key={idx} 
                                    href={link.url} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className={`inline-flex items-center gap-1 text-[11px] font-bold px-3 py-1.5 rounded-full border transition-colors ${isChecked ? 'text-gray-400 border-gray-200 bg-gray-50' : 'text-gray-700 border-gray-200 bg-white hover:bg-gray-50 shadow-sm'}`}
                                 >
                                    {link.label} <ExternalLink size={10} className="opacity-50" />
                                 </a>
                              ))}
                           </div>
                        )}
                     </div>
                  </div>
               </div>
            );
         })}
      </div>
      
    </div>
  );
}
