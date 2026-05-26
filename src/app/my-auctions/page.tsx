"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import NoticeBanner from "@/components/NoticeBanner";
import { calculateMockDistance } from "@/lib/distance";
import { Clock, CheckCircle2, ChevronRight, Star, MessageSquare, MapPin } from "lucide-react";
import LogoutButton from "@/components/LogoutButton";
import Link from "next/link";
import ChecklistWidget from "@/components/ChecklistWidget";

export default function MyAuctionsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [auctions, setAuctions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewModal, setReviewModal] = useState<{isOpen: boolean, auctionId?: string, partnerId?: string}>({isOpen: false});
  const [partnerProfileModal, setPartnerProfileModal] = useState<{isOpen: boolean, data?: any}>({isOpen: false});
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const fetchAndOpenPartnerModal = async (partnerId: string) => {
     try {
        const res = await fetch(`/api/partner/${partnerId}`);
        if(res.ok) {
           const data = await res.json();
           setPartnerProfileModal({isOpen: true, data});
        }
     } catch(e) {
        alert("업체 정보를 불러오지 못했습니다.");
     }
  };

  const fetchAuctions = async () => {
    try {
      const res = await fetch("/api/auctions?type=customer");
      if(res.ok) setAuctions(await res.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated") fetchAuctions();
  }, [status]);

  const handleAcceptBid = async (bidId: string, auctionId: string) => {
    if(!confirm("해당 업체의 조건으로 '예약요청'을 확정하시겠습니까? 예약은 취소가 어려울 수 있습니다.")) return;
    try {
      await fetch("/api/bids/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bidId, auctionId })
      });
      fetchAuctions();
    } catch(e) {
      alert("낙찰 처리 중 오류가 발생했습니다.");
    }
  };

  const handleReviewSubmit = async () => {
    try {
      await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
           auctionId: reviewModal.auctionId,
           partnerId: reviewModal.partnerId,
           rating,
           comment
        })
      });
      setReviewModal({isOpen: false});
      fetchAuctions();
    } catch(e) {
      alert("리뷰 등록 실패");
    }
  };

  if(loading) return <div className="text-center p-10 font-bold text-[#4169e1]">불러오는 중...</div>;

  return (
    <div className="bg-gray-50 min-h-screen pb-[100px] flex justify-center font-sans tracking-tight">
      <div className="w-full max-w-md bg-gray-50 min-h-screen relative overflow-hidden flex flex-col">
        {/* Header */}
        <header className="p-4 pt-6 flex justify-between items-center bg-gray-50 sticky top-0 z-10 border-b border-gray-100">
          <Link href="/" className="hover:bg-gray-200 px-3 py-2 rounded-xl transition-colors font-bold text-sm text-gray-700 bg-gray-100">
             홈으로 가기
          </Link>
          <div className="flex items-center gap-2">
            <LogoutButton iconOnly={true} className="text-gray-400 hover:text-red-500 transition-colors p-1" />
          </div>
        </header>

        <NoticeBanner />

        <div className="flex flex-col flex-1 pb-10">
          <div className="px-5 mt-4">
             <ChecklistWidget movingDate={auctions.length > 0 ? auctions[0].movingDate : undefined} />
          </div>
          
        {auctions.length === 0 ? (
           <div className="text-center py-20 px-6">
              <span className="text-5xl opacity-40 block mb-4">🏠</span>
              <p className="text-gray-500 font-medium">현재 진행중이거나 완료된 이사건이 없습니다.</p>
           </div>
        ) : (
          auctions.map((auction) => {
            const isClosed = auction.status === "CLOSED" || auction.status === "COMPLETED";
            // 48시간 기준 잔여 시간 계산
            const END_TIME = new Date(new Date(auction.createdAt).getTime() + 48 * 60 * 60 * 1000);
            const timeRemaining = isClosed ? "입찰 종료됨" : formatDistanceToNow(END_TIME, { locale: ko, addSuffix: true });
            
            // Randomly generated consistent view count to simulate "조회수" (Reference imitation)
            const viewCount = auction.bids.length > 0 ? (auction.bids.length * 3) + 14 : 11;

            let reportData: any = null;
            try {
               if (auction.aiReport) reportData = JSON.parse(auction.aiReport);
            } catch(e) {}
            const distanceKm = reportData?.distance || calculateMockDistance(auction.fromLocation, auction.toLocation);

            return (
              <div key={auction.id} className="block w-full mb-10 relative bg-[#4169e1] rounded-[32px] pt-6 pb-8 px-5 shadow-lg">
                 {/* Hero Header (The Blue Point Area) */}
                 <div className="text-white mb-6 border-b border-white/20 pb-5">
                    <div className="bg-white/10 rounded-xl p-3 box-border border border-white/10 mb-5 text-[13px] font-bold shadow-sm">
                       <div className="flex items-center gap-1.5 opacity-90 mb-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#34d399]"></div>
                          <span className="truncate">{auction.fromLocation}</span>
                       </div>
                       <div className="pl-[3px] border-l border-white/20 ml-[2.5px] h-3 my-0.5"></div>
                       <div className="flex items-center gap-1.5 mb-2">
                          <div className="w-1.5 h-1.5 rounded-full border border-white"></div>
                          <span className="truncate">{auction.toLocation}</span>
                       </div>
                       <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-white/80">
                          <span className="bg-black/20 px-2 py-0.5 rounded text-white font-black block">총 이사 거리 약 {distanceKm}km</span>
                          <span className="opacity-70">{auction.truckTons}톤 대여</span>
                       </div>
                    </div>

                    <h2 className="text-[25px] sm:text-[27px] font-bold leading-snug mb-3 tracking-tight">
                       지금까지 파트너 <span className="font-black text-yellow-300">{viewCount}명</span>이 조회했고,<br/>
                       <span className="font-black text-yellow-300">{auction.bids.length}명</span>이 입찰했습니다.
                    </h2>
                    
                    <div className="flex items-center text-white/90 text-[13px] font-bold bg-black/20 inline-flex px-3 py-1.5 rounded-full mt-1">
                       <Clock size={16} className="mr-1.5" /> 
                       {auction.status === 'OPEN' ? `${timeRemaining} 마감` : timeRemaining}
                    </div>
                 </div>

                 {/* Bids List Container - Embedded inside the blue card */}
                 <div className="space-y-4">
                    {auction.bids.length === 0 ? (
                       <div className="bg-white/10 rounded-2xl p-8 text-center border border-white/20">
                          <p className="text-white/80 font-medium">아직 파트너의 입찰이 도착하지 않았습니다.</p>
                       </div>
                    ) : (
                       auction.bids.map((bid: any) => (
                          <div key={bid.id} className="bg-white rounded-[16px] shadow-lg text-gray-900 overflow-hidden transform transition-all hover:scale-[1.01] hover:shadow-xl">
                             
                             {/* Top Half: Price & CTA */}
                             <div className="p-5 flex justify-between items-center relative">
                                <h3 className="text-[22px] font-black tracking-tight">{bid.amount.toLocaleString()} 원</h3>
                                {auction.status === 'OPEN' ? (
                                   <button onClick={() => handleAcceptBid(bid.id, auction.id)} className="text-[#4169e1] font-bold text-[14px] bg-blue-50/50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors border border-transparent shadow-[inset_0_0_0_1px_rgba(65,105,225,0.2)]">
                                      예약요청
                                   </button>
                                ) : bid.isAccepted ? (
                                   <span className="text-[#008653] font-black text-[14px] flex items-center gap-1 bg-green-50 px-3 py-1.5 rounded-full ring-1 ring-inset ring-[#008653]/30">
                                      <CheckCircle2 size={16} /> 낙찰됨
                                   </span>
                                ) : (
                                   <span className="text-gray-400 font-bold text-xs bg-gray-50 px-3 py-1.5 rounded-full">미선택</span>
                                )}
                             </div>
                             
                             <div className="h-px bg-gray-100 mx-5 w-[calc(100%-40px)]"></div>
                             
                             {/* Bottom Half: Partner Profile */}
                             <div className="p-5 flex items-center justify-between cursor-pointer hover:bg-gray-50 group transition-colors" onClick={() => fetchAndOpenPartnerModal(bid.partnerId)}>
                                <div className="flex items-center gap-4">
                                   <div className="w-[48px] h-[48px] bg-gray-100 rounded-full border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center shadow-inner text-xl">
                                      {bid.partner.profileImage ? (
                                         <img src={bid.partner.profileImage} className="w-full h-full object-cover" />
                                      ) : (
                                         '🏢'
                                      )}
                                   </div>
                                   <div>
                                      <h4 className="font-bold text-[16px] text-gray-900 leading-none mb-1.5 group-hover:text-[#4169e1] transition-colors">{bid.partner.companyName} 딜러</h4>
                                      <div className="text-[#4169e1] font-bold text-[12px] flex items-center gap-[3px]">
                                         <Star size={12} className="fill-current text-[#4169e1]"/> 
                                         <span className="mt-[1px]">{bid.partner.rating ? bid.partner.rating.toFixed(1) : "0.0"}</span> 
                                         <span className="text-gray-400 font-semibold ml-0.5">({bid.partner.reviewCount || 0} 후기)</span>
                                      </div>
                                   </div>
                                </div>
                                <ChevronRight size={20} className="text-gray-300 group-hover:translate-x-1 transition-transform" />
                             </div>

                             {/* Message block if provided */}
                             {bid.message && (
                                <div className="px-5 pb-5 pt-0">
                                   <div className="bg-[#f8faff] border border-blue-100/60 rounded-xl p-3.5 flex items-start gap-2">
                                      <MessageSquare size={14} className="text-[#4169e1] mt-[3px] shrink-0" />
                                      <p className="text-[13px] text-gray-600 font-medium leading-relaxed">
                                         {bid.message}
                                      </p>
                                   </div>
                                </div>
                             )}
                          </div>
                       ))
                    )}
                 </div>

                 {/* Review Buttons Section */}
                 {auction.status === 'CLOSED' && (
                    <div className="pt-2">
                       <button onClick={() => setReviewModal({isOpen: true, auctionId: auction.id, partnerId: auction.bids.find((b:any)=>b.isAccepted)?.partnerId})} className="w-full mt-4 bg-white/20 hover:bg-white/30 border border-white/30 text-white text-[15px] font-bold py-4 rounded-2xl transition-colors shadow-lg active:scale-95">
                          이사 서비스에 솔직한 리뷰 남기기
                       </button>
                    </div>
                 )}
                 {auction.review && (
                    <div className="mt-6 bg-white/10 p-5 rounded-2xl border border-white/20 text-white shadow-sm">
                       <p className="font-bold flex items-center gap-1 text-[15px]"><Star size={16} className="text-yellow-300 fill-current" /> {auction.review.rating}점 평가 완료</p>
                       <p className="text-white/90 text-[13px] mt-2 font-medium bg-black/20 p-3 rounded-xl border border-transparent">{auction.review.comment}</p>
                    </div>
                 )}
              </div>
            );
          })
        )}
        </div>
      </div>

      {/* Review Modal */}
      {reviewModal.isOpen && (
         <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-5">
            <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden text-gray-900 shadow-2xl p-6 relative">
               <h3 className="text-lg font-black mb-4">어떻게 평가하시나요?</h3>
               <div className="flex justify-center gap-3 mb-6">
                  {[1,2,3,4,5].map(r => (
                     <button key={r} onClick={() => setRating(r)} className={r <= rating ? "text-yellow-400": "text-gray-200"}>
                        <Star size={36} className="fill-current" />
                     </button>
                  ))}
               </div>
               <textarea value={comment} onChange={e=>setComment(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:border-gray-900 outline-none mb-4 h-24" placeholder="만족스러웠던 점을 적어주세요."></textarea>
               <div className="flex gap-2">
                  <button onClick={() => setReviewModal({isOpen: false})} className="flex-1 py-3 font-semibold text-gray-500 bg-gray-100 rounded-xl">취소</button>
                  <button onClick={handleReviewSubmit} className="flex-[2] py-3 font-bold text-white bg-gray-900 rounded-xl hover:bg-gray-800 transition-colors">리뷰 등록하기</button>
               </div>
            </div>
         </div>
      )}

      {/* Partner Profile Modal */}
      {partnerProfileModal.isOpen && partnerProfileModal.data && (
         <div className="fixed inset-0 bg-black/60 z-[110] flex items-end justify-center sm:items-center">
            <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full max-w-sm max-h-[85vh] overflow-hidden text-gray-900 shadow-2xl flex flex-col relative animate-in slide-in-from-bottom-10">
               <button onClick={() => setPartnerProfileModal({isOpen: false, data: null})} className="absolute top-4 right-4 text-gray-400 p-2 hover:bg-gray-100 rounded-full z-10 font-bold">닫기</button>
               
               <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mt-4 mb-2 sm:hidden shrink-0"></div>
               
               <div className="flex-1 overflow-y-auto px-6 pb-8 pt-4">
                  <div className="flex flex-col items-center mb-6">
                     <div className="w-24 h-24 bg-gray-100 rounded-full border-4 border-white shadow-md overflow-hidden mb-4 shrink-0">
                        {partnerProfileModal.data.profileImage ? (
                           <img src={partnerProfileModal.data.profileImage} className="w-full h-full object-cover" />
                        ) : (
                           <div className="flex items-center justify-center w-full h-full text-3xl">🏢</div>
                        )}
                     </div>
                     <h3 className="text-xl font-black mb-1">{partnerProfileModal.data.companyName}</h3>
                     <div className="flex items-center gap-1 bg-[#fffbeb] text-[#d97706] border border-[#fde68a] px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                        <Star size={14} className="fill-current"/> 
                        {partnerProfileModal.data.rating} / 5.0 
                        <span className="text-[#92400e] opacity-60 ml-1">({partnerProfileModal.data.reviewCount}개의 후기)</span>
                     </div>
                  </div>

                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6 shadow-inner">
                     <h4 className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wide">About us</h4>
                     <p className="text-sm font-medium text-gray-800 leading-relaxed whitespace-pre-wrap">
                        {partnerProfileModal.data.description || "등록된 업체 소개글이 없습니다."}
                     </p>
                  </div>

                  <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><MessageSquare size={16} className="text-[#025096]"/> 고객 피드백</h4>
                  
                  {partnerProfileModal.data.reviews && partnerProfileModal.data.reviews.length > 0 ? (
                     <div className="space-y-3">
                        {partnerProfileModal.data.reviews.map((r: any) => (
                           <div key={r.id} className="border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                              <div className="flex justify-between items-start mb-1.5">
                                 <div className="flex text-[#f59e0b]">
                                    {[...Array(5)].map((_, i) => <Star key={i} size={10} className={i < r.rating ? "fill-[#f59e0b]" : "text-gray-300"}/>)}
                                 </div>
                                 <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-medium">{r.userName}</span>
                              </div>
                              <p className="text-[13px] text-gray-700 font-medium leading-snug">"{r.comment}"</p>
                           </div>
                        ))}
                     </div>
                  ) : (
                     <div className="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        <p className="text-xs text-gray-400 font-medium tracking-tight">아직 후기가 없지만 친절히 모시겠습니다.</p>
                     </div>
                  )}
               </div>
            </div>
         </div>
      )}
    </div>
  );
}
