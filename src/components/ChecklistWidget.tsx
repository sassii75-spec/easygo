"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, ClipboardCheck } from "lucide-react";
import { CHECKLIST_DATA } from "@/data/checklistData";

interface ChecklistWidgetProps {
  movingDate?: string | Date; 
}

export default function ChecklistWidget({ movingDate }: ChecklistWidgetProps) {
  const [mounted, setMounted] = useState(false);
  const [checkedIds, setCheckedIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('easygo_checklist');
    if (saved) {
      try {
        setCheckedIds(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  if (!mounted) return null;

  const totalItems = CHECKLIST_DATA.length;
  const completedItems = Object.values(checkedIds).filter(Boolean).length;
  const progressPercent = Math.round((completedItems / totalItems) * 100) || 0;

  // D-Day 계산 기반으로 추천 카테고리 추출 (로직 단순화: 완료 안된 것 중 가장 급한 카테고리 하나 노출, 혹은 단순히 요약 뷰)
  let activeCategory = 'D-30';
  if (movingDate) {
     const today = new Date();
     const mDate = new Date(movingDate);
     const diffTime = mDate.getTime() - today.getTime();
     const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
     
     if (diffDays <= 0) activeCategory = '출발지';
     else if (diffDays <= 1) activeCategory = 'D-1';
     else if (diffDays <= 3) activeCategory = 'D-3';
     else if (diffDays <= 10) activeCategory = 'D-10';
     else activeCategory = 'D-30';
  }

  return (
    <Link href="/checklist" className="block w-full bg-white rounded-3xl p-5 mb-5 shadow-sm border border-gray-100 relative overflow-hidden group">
      {/* Background Decor */}
      <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-[#025096]/5 rounded-full scale-0 group-hover:scale-100 transition-transform duration-500 origin-bottom-right"></div>
      
      <div className="flex justify-between items-start mb-4 relative z-10">
         <div>
            <div className="flex items-center gap-1.5 px-2 py-1 bg-red-50 text-red-600 rounded-md w-max mb-2">
               <ClipboardCheck size={12} strokeWidth={3} />
               <span className="text-[10px] font-black tracking-tight">{activeCategory} 추천 체크리스트</span>
            </div>
            <h3 className="font-black text-gray-900 text-lg leading-tight">
               이사 준비, 놓친 항목이 없는지<br/>지금 바로 확인해보세요!
            </h3>
         </div>
         <div className="bg-gray-50 p-2 rounded-full group-hover:bg-[#025096] group-hover:text-white transition-colors text-gray-400">
            <ChevronRight size={20} />
         </div>
      </div>

      <div className="relative z-10 bg-gray-50 rounded-xl p-3 flex items-center justify-between border border-gray-100/80">
         <div className="text-[12px] font-bold text-gray-600">완료율</div>
         <div className="flex-1 mx-3">
            <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
               <div className="h-full bg-[#008653] transition-all duration-1000" style={{width: `${progressPercent}%`}}></div>
            </div>
         </div>
         <div className="text-[13px] font-black text-[#008653]">{progressPercent}%</div>
      </div>
    </Link>
  );
}
