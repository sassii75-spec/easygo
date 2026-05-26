"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Clock, ChevronRight, ChevronDown, ChevronUp, MessageSquare, FileText, CheckCircle2, Box, Camera, User, Star, Activity } from "lucide-react";
import NoticeBanner from "@/components/NoticeBanner";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { calculateMockDistance } from "@/lib/distance";

export default function PartnerDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [auctions, setAuctions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedAuctions, setExpandedAuctions] = useState<string[]>([]);
  
  const toggleAuctionExp = (id: string) => {
     setExpandedAuctions(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };
  
  const [bidModal, setBidModal] = useState<{isOpen: boolean, auctionId?: string, currentBidAmount?: number, currentBidMessage?: string}>({isOpen: false});
  const [bidAmount, setBidAmount] = useState("");
  const [bidMessage, setBidMessage] = useState("");
  
  const [detailModal, setDetailModal] = useState<{isOpen: boolean, report?: any}>({isOpen: false});
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'auctions'|'profile'>(searchParams.get('tab') === 'profile' ? 'profile' : 'auctions');
  const [listModal, setListModal] = useState<{isOpen: boolean, title: string, type: 'auction'|'review', items: any[]}>({isOpen: false, title: "", type: 'auction', items: []});

  // 감지해서 탭 업데이트
  useEffect(() => {
    if (searchParams.get('tab') === 'profile') {
       setActiveTab('profile');
    } else {
       setActiveTab('auctions');
    }
  }, [searchParams]);
  const [profile, setProfile] = useState<any>(null);
  const [profileForm, setProfileForm] = useState({ companyName: "", phone: "", description: "", profileImage: "" });
  const [savingProfile, setSavingProfile] = useState(false);

  const openDetailModal = (reportStr?: string) => {
     if (!reportStr) return alert("해당 매물의 AI 상세 리포트가 존재하지 않습니다.");
     try {
        setDetailModal({isOpen: true, report: JSON.parse(reportStr)});
     } catch(e) {
        alert("리포트 형식이 잘못되었습니다.");
     }
  };

  const fetchAuctions = async () => {
    try {
      const res = await fetch("/api/auctions?type=partner");
      if(res.ok) setAuctions(await res.json());
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/partner/profile");
      if(res.ok) {
         const data = await res.json();
         setProfile(data);
         setProfileForm({
            companyName: data.companyName || "",
            phone: data.phone || "",
            description: data.description || "",
            profileImage: data.profileImage || ""
         });
      }
    } catch(e) {}
  };

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated") {
       fetchAuctions();
       fetchProfile();
    }
  }, [status]);

  const handleBidSubmit = async () => {
    if(!bidAmount || isNaN(Number(bidAmount))) return alert("올바른 금액을 입력하세요.");
    try {
      const res = await fetch("/api/bids", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
           auctionId: bidModal.auctionId,
           amount: Number(bidAmount),
           message: bidMessage
        })
      });
      if(res.ok) {
         setBidModal({isOpen: false});
         fetchAuctions();
      } else {
         const errorInfo = await res.json();
         alert("입찰 실패: " + errorInfo.error);
      }
    } catch(e) {
      alert("입찰 처리 중 오류가 발생했습니다.");
    }
  };

  const openBidModal = (auctionId: string, currentBid?: any, aiReportStr?: string) => {
     let defaultAmount = "";
     if (currentBid) {
        defaultAmount = currentBid.amount.toString();
     } else if (aiReportStr) {
        try {
           const report = JSON.parse(aiReportStr);
           const maxPrice = report.result.fullPack.maxPrice + (report.totalAddonCost || 0) + (report.distanceExtraCost || 0) - (report.totalEarned || 0);
           defaultAmount = (maxPrice * 10000).toString();
        } catch(e) {}
     }
     setBidAmount(defaultAmount);
     setBidMessage(currentBid ? currentBid.message || "" : "");
     setBidModal({isOpen: true, auctionId});
  };

  const handleProfileImageUpload = (e: any) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => setProfileForm({...profileForm, profileImage: reader.result as string});
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
     setSavingProfile(true);
     try {
        const res = await fetch("/api/partner/profile", {
           method: "PUT",
           headers: {"Content-Type": "application/json"},
           body: JSON.stringify(profileForm)
        });
        if(res.ok) {
           alert("내 정보가 성공적으로 저장되었습니다.");
           fetchProfile();
        } else {
           alert("저장 실패");
        }
     } finally {
        setSavingProfile(false);
     }
  };

  if(loading) return <div className="text-center p-10 font-bold text-gray-500">데이터 불러오는 중...</div>;

  return (
    <div className="bg-gray-100 min-h-[calc(100vh-60px)] pb-12 pt-4 px-4 w-full max-w-md mx-auto">
      {/* 탭 메뉴 */}
      <div className="flex bg-gray-200 p-1 rounded-xl mb-4">
         <button onClick={() => setActiveTab('auctions')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${activeTab === 'auctions' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>입찰 데스크</button>
         <button onClick={() => setActiveTab('profile')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${activeTab === 'profile' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>내 프로필 관리</button>
      </div>

      {activeTab === 'auctions' ? (
         <div className="space-y-3">
            <div className="-mx-4 sm:-mx-6 mb-2">
               <NoticeBanner />
            </div>

            {/* Status Info Box */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-4">
               <div className="flex items-center gap-1.5 mb-3 px-1">
                  <Activity size={16} className="text-[#025096]" />
                  <span className="font-bold text-gray-800 text-sm">나의 활동 현황</span>
               </div>
               <div className="grid grid-cols-4 gap-2 text-center divide-x divide-gray-100 cursor-pointer rounded-xl py-2">
                  <div className="hover:bg-gray-50 transition-colors py-1" onClick={() => setListModal({isOpen: true, title: "제안한 건", type: 'auction', items: profile ? auctions.filter(a => a.bids?.some((b:any) => b.partnerId === profile.id)) : []})}>
                     <p className="text-[10px] sm:text-[11px] font-bold text-gray-400 mb-1">제안 건수</p>
                     <p className="text-lg sm:text-xl font-black text-gray-900">{profile ? auctions.filter(a => a.bids?.some((b:any) => b.partnerId === profile.id)).length : 0}</p>
                  </div>
                  <div className="hover:bg-gray-50 transition-colors py-1" onClick={() => setListModal({isOpen: true, title: "매칭된 건", type: 'auction', items: profile ? auctions.filter(a => a.status === 'CLOSED' && a.bids?.some((b:any) => b.partnerId === profile.id && b.status === 'ACCEPTED')) : []})}>
                     <p className="text-[10px] sm:text-[11px] font-bold text-gray-400 mb-1">매칭 완료</p>
                     <p className="text-lg sm:text-xl font-black text-[#008653]">{profile ? auctions.filter(a => a.status === 'CLOSED' && a.bids?.some((b:any) => b.partnerId === profile.id && b.status === 'ACCEPTED')).length : 0}</p>
                  </div>
                  <div className="hover:bg-gray-50 transition-colors py-1" onClick={() => setListModal({isOpen: true, title: "이사 완료 건", type: 'auction', items: profile ? auctions.filter(a => a.status === 'COMPLETED' && a.bids?.some((b:any) => b.partnerId === profile.id)) : []})}>
                     <p className="text-[10px] sm:text-[11px] font-bold text-gray-400 mb-1">이사 완료</p>
                     <p className="text-lg sm:text-xl font-black text-[#025096]">{profile ? auctions.filter(a => a.status === 'COMPLETED' && a.bids?.some((b:any) => b.partnerId === profile.id)).length : 0}</p>
                  </div>
                  <div className="hover:bg-gray-50 transition-colors py-1" onClick={() => setListModal({isOpen: true, title: "고객 피드백", type: 'review', items: profile?.reviews || []})}>
                     <p className="text-[10px] sm:text-[11px] font-bold text-gray-400 mb-1">고객 리뷰</p>
                     <p className="text-lg sm:text-xl font-black text-[#f59e0b]">{profile?.reviews?.length || 0}</p>
                  </div>
               </div>
            </div>
            
            {auctions.length === 0 ? (
               <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100 mt-2">
                  <div className="text-4xl mb-4 opacity-50">😴</div>
                  <p className="text-gray-500 font-medium">현재 주변에 열려있는 신규 이사 건(경매)이 없습니다.</p>
               </div>
            ) : (
              auctions.map((req) => {
                const END_TIME = new Date(new Date(req.createdAt).getTime() + 48 * 60 * 60 * 1000);
                const timeRemaining = formatDistanceToNow(END_TIME, { locale: ko, addSuffix: true });
                
                // 파트너 본인이 작성한 입찰인지 확인
                const myPartnerId = profile?.id;
          const myBid = req.bids.find((b:any) => b.partnerId === myPartnerId);
          
          let reportData: any = null;
          try {
             if (req.aiReport) reportData = JSON.parse(req.aiReport);
          } catch(e) {}
          
          const distanceKm = reportData?.distance || calculateMockDistance(req.fromLocation, req.toLocation);

          const isExpanded = expandedAuctions.includes(req.id);

          return (
            <div key={req.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden text-gray-900 transition-all duration-300">
              
              {/* Compact / Header View (Always Visible) */}
              <div 
                className={`p-4 cursor-pointer hover:bg-gray-50 flex items-center justify-between ${isExpanded ? 'border-b border-gray-100 bg-gray-50/50' : ''}`}
                onClick={() => toggleAuctionExp(req.id)}
              >
                 <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-50 text-red-600 border border-red-100">신규등록</span>
                      <span className="text-[11px] font-bold bg-gray-100 text-gray-600 px-2 py-0.5 rounded border border-gray-200">{req.truckTons}톤</span>
                      <span className="text-[11px] font-bold text-[#ef4444] bg-[#fef2f2] px-2 py-0.5 rounded flex items-center gap-0.5"><Clock size={10}/> 마감 {timeRemaining}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm font-bold truncate">
                       <span className="truncate max-w-[40%]">{req.fromLocation.split(' ').slice(0,2).join(' ')}</span>
                       <ChevronRight size={14} className="text-gray-300 shrink-0" />
                       <span className="truncate max-w-[40%]">{req.toLocation.split(' ').slice(0,2).join(' ')}</span>
                    </div>
                 </div>
                 <div className="p-2 border border-gray-200 rounded-full text-gray-400 bg-white shadow-sm shrink-0">
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                 </div>
              </div>

              {/* Expanded Detail View */}
              <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="p-5 pt-4">
                  <div className="relative pl-6 mb-5 border-l-2 border-dashed border-gray-200 ml-2 space-y-5 py-1">
                     <div className="absolute w-3 h-3 bg-[#008653] rounded-full -left-[7px] top-1"></div>
                     <div>
                        <p className="text-xs text-gray-400 mb-0.5">출발</p>
                        <p className="text-base font-bold text-gray-900">{req.fromLocation}</p>
                     </div>
                     
                     <div className="absolute top-[40%] -left-[18px] bg-white border border-gray-200 px-2 py-0.5 rounded-full text-[11px] font-black text-gray-600 z-10 whitespace-nowrap shadow-sm shadow-gray-200/50">
                        약 {distanceKm}km 이동
                     </div>

                     <div className="absolute w-3 h-3 border-2 border-[#025096] bg-white rounded-full -left-[7px] bottom-1"></div>
                     <div>
                        <p className="text-xs text-gray-400 mb-0.5">도착</p>
                        <div className="flex items-center justify-between">
                           <p className="text-base font-bold text-gray-900">{req.toLocation}</p>
                        </div>
                     </div>
                  </div>
                  
                  <div className="bg-gray-50 border border-gray-100 p-3 rounded-lg text-sm text-gray-600 mb-4 font-medium">
                    {req.details}
                  </div>
                  
                  <button onClick={() => openDetailModal(req.aiReport)} className="w-full mb-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm rounded-lg flex items-center justify-center gap-1.5 transition-colors">
                    <FileText size={16} /> 매물 상세 AI 리포트 보기
                  </button>

                  {!myBid ? (
                    <button onClick={() => openBidModal(req.id, null, req.aiReport)} className="w-full bg-[#008653] text-white py-3.5 rounded-xl font-bold text-[15px] hover:bg-[#00623e] flex justify-center items-center shadow-lg shadow-[#008653]/20 active:scale-[0.98] transition-transform">
                      금액 제안하기 (입찰 참여)
                    </button>
                  ) : (
                    <div className="bg-[#025096]/5 border border-[#025096]/20 p-4 rounded-xl">
                       <div className="flex justify-between items-center mb-2">
                           <span className="text-[12px] font-bold text-[#025096] bg-white px-2 py-0.5 rounded shadow-sm">내 제시액</span>
                           <span className="text-lg font-black text-[#025096]">{myBid.amount.toLocaleString()}원</span>
                       </div>
                       {myBid.message && (
                           <p className="text-xs text-gray-500 bg-white p-2 rounded mb-3 border border-gray-100 flex items-start gap-1"><MessageSquare size={12} className="shrink-0 mt-0.5"/> {myBid.message}</p>
                       )}
                       <button onClick={() => openBidModal(req.id, myBid)} className="w-full bg-white border border-[#025096] text-[#025096] py-2 rounded-lg font-bold text-sm hover:bg-[#025096]/5 flex justify-center items-center transition-colors">
                         제안 수정하기
                       </button>
                    </div>
                  )}
                </div>
              </div>
             </div>
           );
         })
       )}
       </div>
      ) : (
         /* 프로필 관리 탭 */
         <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mt-2 space-y-5">
            <h3 className="font-black text-lg text-gray-900 mb-2">파트너 프로필 설정</h3>
            <p className="text-xs text-gray-500 font-medium mb-6">프로필 사진과 소개글이 신뢰도를 높여 낙찰 확률을 올립니다!</p>
            
            {/* 대표 사진 */}
            <div>
               <label className="block text-xs font-bold text-gray-700 mb-2">대표 사진 (업체 로고 또는 차량 사진)</label>
               <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-gray-100 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden shrink-0 relative">
                     {profileForm.profileImage ? (
                        <img src={profileForm.profileImage} className="w-full h-full object-cover" alt="프로필" />
                     ) : (
                        <User size={30} className="text-gray-400" />
                     )}
                  </div>
                  <div>
                     <label htmlFor="pf-upload" className="bg-gray-900 hover:bg-gray-800 text-white px-3 py-2 text-xs font-bold rounded-lg cursor-pointer transition-colors block text-center">
                        사진 변경하기
                     </label>
                     <input id="pf-upload" type="file" className="hidden" accept="image/*" onChange={handleProfileImageUpload}/>
                     <p className="text-[10px] text-gray-400 mt-2">정방형(1:1) 이미지를 권장합니다.</p>
                  </div>
               </div>
            </div>

            {/* 기본 정보 */}
            <div>
               <label className="block text-xs font-bold text-gray-700 mb-1.5">업체명</label>
               <input type="text" value={profileForm.companyName} onChange={e=>setProfileForm({...profileForm, companyName: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold focus:border-[#008653] outline-none" />
            </div>
            <div>
               <label className="block text-xs font-bold text-gray-700 mb-1.5">대표 연락처</label>
               <input type="tel" value={profileForm.phone} onChange={e=>setProfileForm({...profileForm, phone: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:border-[#008653] outline-none" placeholder="010-0000-0000" />
            </div>
            <div>
               <label className="block text-xs font-bold text-gray-700 mb-1.5">회사 소개 및 강점</label>
               <textarea value={profileForm.description} onChange={e=>setProfileForm({...profileForm, description: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm font-medium focus:border-[#008653] outline-none h-28" placeholder="고객에게 어필할 수 있는 우리 회사의 장점을 자세히 적어주세요!"></textarea>
            </div>

            <button onClick={handleSaveProfile} disabled={savingProfile} className="w-full bg-[#008653] text-white font-bold py-3.5 rounded-xl hover:bg-[#00623e] transition-colors shadow-lg shadow-[#008653]/20">
               {savingProfile ? "저장 중..." : "프로필 저장하기"}
            </button>

            {/* 평점 및 리뷰 섹션 */}
            <div className="pt-8 mt-8 border-t border-dashed border-gray-200">
               <h4 className="font-black text-gray-900 mb-4 flex items-center gap-2"><Star size={18} className="text-[#f59e0b] fill-[#f59e0b]"/> 전체 평점 & 피드백</h4>
               
               <div className="bg-gray-50 rounded-xl p-5 mb-5 flex items-center justify-between border border-gray-100">
                  <div className="text-gray-600 font-bold text-sm">고객 만족도</div>
                  <div className="flex items-end gap-1">
                     <span className="text-4xl font-black text-gray-900 leading-none">{profile?.rating ? Number(profile.rating).toFixed(1) : "0.0"}</span>
                     <span className="text-gray-400 font-bold mb-1">/ 5.0</span>
                  </div>
               </div>

               {profile?.reviews && profile.reviews.length > 0 ? (
                  <div className="space-y-3">
                     {profile.reviews.map((r: any) => (
                        <div key={r.id} className="bg-white border border-gray-100 p-4 rounded-xl shadow-sm">
                           <div className="flex justify-between items-start mb-2">
                              <div className="flex gap-1 text-[#f59e0b]">
                                 {[...Array(5)].map((_, i) => <Star key={i} size={12} className={i < r.rating ? "fill-[#f59e0b]" : "text-gray-300"}/>)}
                              </div>
                              <span className="text-[10px] text-gray-400">{new Date(r.createdAt).toLocaleDateString()}</span>
                           </div>
                           <p className="text-sm text-gray-800 font-medium leading-normal">"{r.comment}"</p>
                           <p className="text-[11px] text-gray-500 mt-2 font-bold">- {r.user?.name || "고객"}님</p>
                        </div>
                     ))}
                  </div>
               ) : (
                  <div className="text-center p-6 bg-gray-50 rounded-xl border border-gray-200 border-dashed">
                     <p className="text-gray-500 text-sm font-medium">아직 등록된 고객 피드백이 없습니다.</p>
                  </div>
               )}
            </div>
         </div>
      )}

      {/* Bid Modal */}
      {bidModal.isOpen && (
         <div className="fixed inset-0 bg-black/60 z-[100] flex items-end justify-center sm:items-center">
            <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full max-w-sm overflow-hidden text-gray-900 p-6 pb-safe animate-in slide-in-from-bottom-10">
               <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6 sm:hidden"></div>
               <h3 className="text-xl font-black mb-1">견적 제안하기</h3>
               <p className="text-sm text-gray-500 mb-6 font-medium">투명한 이사 요금을 남겨주세요.</p>
               
               <div className="space-y-4 mb-6">
                  <div>
                     <label className="text-xs font-bold text-gray-500 mb-1 block">이용료 총액 (원)</label>
                     <div className="relative">
                        <input type="number" value={bidAmount} onChange={e=>setBidAmount(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-lg font-bold focus:border-[#008653] outline-none transition-colors" placeholder="예: 450000" />
                        <span className="absolute right-4 top-3.5 font-bold text-gray-400">원</span>
                     </div>
                  </div>
                  <div>
                     <label className="text-xs font-bold text-gray-500 mb-1 block">고객님께 남길 말 (선택)</label>
                     <textarea value={bidMessage} onChange={e=>setBidMessage(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:border-[#008653] outline-none h-20" placeholder="깔끔하고 정성스럽게 도와드릴게요!"></textarea>
                  </div>
               </div>

               <div className="flex gap-2">
                  <button onClick={() => setBidModal({isOpen: false})} className="flex-1 py-3.5 font-bold text-gray-500 bg-gray-100 rounded-xl hover:bg-gray-200">취소</button>
                  <button onClick={handleBidSubmit} className="flex-[2] py-3.5 font-bold text-white bg-[#008653] rounded-xl hover:bg-[#00623e] shadow-lg shadow-[#008653]/30">확인결정</button>
               </div>
            </div>
         </div>
      )}

      {/* Detail Modal */}
      {detailModal.isOpen && detailModal.report && (
         <div className="fixed inset-0 bg-gray-100 z-[110] overflow-y-auto">
            <div className="bg-white px-5 pt-12 pb-4 sticky top-0 z-10 border-b border-gray-100 flex items-center justify-between">
               <h3 className="font-black text-lg">AI Estimation Report</h3>
               <button onClick={() => setDetailModal({isOpen: false})} className="text-gray-500 font-bold bg-gray-100 px-3 py-1.5 rounded-lg text-sm">닫기</button>
            </div>
            
            <div className="p-5 pb-safe">
               {/* Receipt Box */}
               <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-6">
                  <div className="bg-gray-900 p-6 text-white text-center">
                     <p className="text-gray-400 text-xs font-bold tracking-widest mb-2 uppercase">고객이 본 AI 견적표</p>
                     <h3 className="text-2xl font-black text-yellow-400 mb-1">{detailModal.report.result.truckTons}톤 트럭</h3>
                     <p className="text-gray-400 text-sm">표준 박스 약 {Math.round(detailModal.report.result.totalVolume * 10)}개 분량</p>
                  </div>
                  <div className="p-6">
                     <div className="flex justify-between items-center mb-6">
                        <div>
                           <p className="text-xs text-gray-500 font-medium">포장이사 추천가균</p>
                           <p className="text-xl font-black text-[#008653]">{(detailModal.report.result.fullPack.minPrice + detailModal.report.totalAddonCost - detailModal.report.totalEarned).toLocaleString()}만 ~ {(detailModal.report.result.fullPack.maxPrice + detailModal.report.totalAddonCost - detailModal.report.totalEarned).toLocaleString()}만</p>
                        </div>
                        <div className="text-right">
                           <p className="text-xs text-gray-500 font-medium">작업인원</p>
                           <p className="text-sm font-bold text-gray-700">{detailModal.report.result.fullPack.workers}</p>
                        </div>
                     </div>
                     
                     
                     {/* Show Photos if they exist */}
                     {detailModal.report.roomPhotos && Object.keys(detailModal.report.roomPhotos).length > 0 && (
                        <>
                           <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2 mt-6">
                              <Camera size={16} className="text-[#025096]" /> 고객이 직접 등록한 현장 사진
                           </h4>
                           <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                              {Object.entries(detailModal.report.roomPhotos).map(([roomName, base64]: any) => (
                                 <div key={roomName} className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
                                    <img src={base64} alt={`${roomName} 사진`} className="w-full h-full object-cover" />
                                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                                       <span className="text-white text-xs font-bold">{roomName}</span>
                                    </div>
                                 </div>
                              ))}
                           </div>
                           <div className="h-px w-full bg-dashed bg-gray-200 mb-6 border-b border-dashed border-gray-200"></div>
                        </>
                     )}

                     <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Box size={16} className="text-[#025096]" /> 식별된 가구 목록 및 고객 처리 현황
                     </h4>
                     <div className="space-y-3">
                        {detailModal.report.detected.map((d: any, index: number) => {
                           const action = detailModal.report.itemActions[index];
                           const isRemoved = !!action;
                           return (
                              <div key={index} className={`flex items-center justify-between p-3 rounded-xl border ${isRemoved ? 'bg-gray-50 border-gray-100 opacity-60' : 'bg-white border-gray-100 shadow-sm'}`}>
                                 <div className="flex-1 overflow-hidden pr-2">
                                    <p className={`font-bold text-[14px] truncate ${isRemoved ? 'line-through text-gray-500' : 'text-gray-900'}`}>{d.name}</p>
                                    <p className="text-[11px] text-gray-400 mt-0.5">박스 약 {Math.round(d.volumeCBM * 10)}개</p>
                                 </div>
                                 <div className="shrink-0">
                                    {isRemoved ? (
                                       <span className={`text-[11px] font-bold px-2.5 py-1.5 rounded-lg ${action.type==='sell' ? 'bg-[#fffbeb] text-[#d97706] border border-[#fde68a]' : 'bg-[#fef2f2] text-[#ef4444] border border-[#fecaca]'}`}>
                                          {action.type === 'sell' ? '고객매각(제외)' : '버림(제외)'}
                                       </span>
                                    ) : (
                                       <span className="text-[11px] font-bold bg-[#e0f2fe] text-[#0369a1] px-2.5 py-1.5 rounded-lg border border-[#bae6fd]">이동 예정</span>
                                    )}
                                 </div>
                              </div>
                           )
                        })}
                     </div>
                  </div>
               </div>

               {/* Addons summary */}
               <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
                  <h4 className="text-sm font-bold text-gray-900 mb-3">고객이 선택한 현장 작업 옵션</h4>
                  <p className="text-sm text-gray-700 font-medium mb-1 flex justify-between">
                     <span>특수 이동 방식: </span>
                     <span className="font-bold">{detailModal.report.movingMethod === 'ladder6' ? '사다리 (저층)' : detailModal.report.movingMethod === 'ladder20' ? '사다리 (고층)' : detailModal.report.movingMethod === 'elevator' ? '엘리베이터' : '계단/없음'}</span>
                  </p>
                  <p className="text-sm text-gray-700 font-medium mb-1 flex justify-between">
                     <span>에어컨 해체 여부: </span>
                     <span className="font-bold">{detailModal.report.addons.ac ? '포함' : '미포함'}</span>
                  </p>
                  <p className="text-sm text-gray-700 font-medium flex justify-between">
                     <span>벽걸이TV 해체 여부: </span>
                     <span className="font-bold">{detailModal.report.addons.tv ? '포함' : '미포함'}</span>
                  </p>
               </div>
            </div>
         </div>
      )}

      {/* List Modal */}
      {listModal.isOpen && (
         <div className="fixed inset-0 bg-gray-100 z-[110] overflow-hidden flex flex-col">
            <div className="bg-white px-5 pt-12 pb-4 sticky top-0 z-10 border-b border-gray-100 flex items-center justify-between">
               <h3 className="font-black text-lg">{listModal.title} <span className="text-[#025096]">{listModal.items.length}건</span></h3>
               <button onClick={() => setListModal({isOpen: false, title: "", type: "auction", items: []})} className="text-gray-500 font-bold bg-gray-100 px-3 py-1.5 rounded-lg text-sm">닫기</button>
            </div>
            
            <div className="p-4 overflow-y-auto pb-safe flex-1 space-y-3">
               {listModal.items.length === 0 && (
                  <div className="text-center py-20 text-gray-400 font-bold">내역이 없습니다.</div>
               )}
               {listModal.type === 'auction' && listModal.items.map(req => (
                  <div key={req.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                     <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                           {req.movingDate ? new Date(req.movingDate).toLocaleDateString() : '날짜 미정'} 이사
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${req.status === 'OPEN' ? 'bg-red-50 text-red-600' : 'bg-[#008653]/10 text-[#008653]'}`}>
                           {req.status === 'OPEN' ? '진행중' : '마감/완료'}
                        </span>
                     </div>
                     <div className="flex items-center gap-2 text-sm font-bold mt-1">
                        <span className="truncate max-w-[40%] text-gray-900">{req.fromLocation.split(' ').slice(0,2).join(' ')}</span>
                        <ChevronRight size={14} className="text-gray-300 shrink-0" />
                        <span className="truncate max-w-[40%] text-gray-900">{req.toLocation.split(' ').slice(0,2).join(' ')}</span>
                     </div>
                  </div>
               ))}
               {listModal.type === 'review' && listModal.items.map(r => (
                  <div key={r.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                     <div className="flex justify-between items-start mb-2">
                        <div className="flex gap-1 text-[#f59e0b]">
                           {[...Array(5)].map((_, i) => <Star key={i} size={12} className={i < r.rating ? "fill-[#f59e0b]" : "text-gray-300"}/>)}
                        </div>
                        <span className="text-[10px] text-gray-400">{new Date(r.createdAt).toLocaleDateString()}</span>
                     </div>
                     <p className="text-sm text-gray-800 font-medium leading-normal">"{r.comment}"</p>
                  </div>
               ))}
            </div>
         </div>
      )}
    </div>
  );
}
