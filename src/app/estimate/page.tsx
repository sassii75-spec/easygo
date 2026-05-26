'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Script from 'next/script';
import { calculateMoveMetric, HouseParams, standardFurnitures, Furniture } from '../../lib/moveMetricEngine';
import { calculateMockDistance, calculateDistanceCost } from '@/lib/distance';
import { ChevronLeft, Camera, Check, ChevronRight, Download, X, Coins, Settings, CheckCircle2, RotateCcw, Box, ArrowRight, MapPin } from 'lucide-react';

const ROOM_TYPES = ['거실', '방1', '방2', '주방', '화장실', '테라스'];

export default function EstimatePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [step, setStep] = useState(1);
  const [params, setParams] = useState<HouseParams>({ area: 24, people: 2, durationYears: 3 });
  
  const [roomPhotos, setRoomPhotos] = useState<Record<string, boolean>>({});
  const [roomPhotosData, setRoomPhotosData] = useState<Record<string, string>>({});
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzed, setIsAnalyzed] = useState(false);
  const [isCreatingAuction, setIsCreatingAuction] = useState(false);
  const [detected, setDetected] = useState<Furniture[]>([]);
  const [result, setResult] = useState<any>(null);
  
  const [savingsMessage, setSavingsMessage] = useState("");
  const [itemActions, setItemActions] = useState<Record<number, { type: 'sell' | 'discard', earned?: number }>>({});
  const [sellingIdx, setSellingIdx] = useState<number | null>(null);
  
  const [confirmSellIdx, setConfirmSellIdx] = useState<number | null>(null);
  const [confirmDiscardIdx, setConfirmDiscardIdx] = useState<number | null>(null);

  const [formModalOpen, setFormModalOpen] = useState(false);
  const [auctionForm, setAuctionForm] = useState({
     movingDate: '',
     fromAddress: '',
     fromType: '아파트',
     toAddress: '',
     toType: '아파트',
  });

  const [realDistanceKm, setRealDistanceKm] = useState<number | null>(null);

  const geocodeAndCalculateDistance = (fromAddr: string, toAddr: string) => {
    if (!fromAddr || !toAddr) {
      setRealDistanceKm(null);
      return;
    }
    const kakao = (window as any).kakao;
    if (typeof window !== 'undefined' && kakao && kakao.maps && kakao.maps.services) {
      const geocoder = new kakao.maps.services.Geocoder();
      
      geocoder.addressSearch(fromAddr, (fromResult: any, fromStatus: any) => {
        if (fromStatus === kakao.maps.services.Status.OK) {
          const fromLat = parseFloat(fromResult[0].y);
          const fromLng = parseFloat(fromResult[0].x);
          
          geocoder.addressSearch(toAddr, (toResult: any, toStatus: any) => {
            if (toStatus === kakao.maps.services.Status.OK) {
              const toLat = parseFloat(toResult[0].y);
              const toLng = parseFloat(toResult[0].x);
              
              // Haversine formula
              const R = 6371; // Earth radius in km
              const dLat = (toLat - fromLat) * Math.PI / 180;
              const dLng = (toLng - fromLng) * Math.PI / 180;
              const a = 
                Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(fromLat * Math.PI / 180) * Math.cos(toLat * Math.PI / 180) * 
                Math.sin(dLng/2) * Math.sin(dLng/2);
              const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
              const distance = Math.round((R * c) * 10) / 10; // Round to 1 decimal place
              
              setRealDistanceKm(distance);
            }
          });
        }
      });
    }
  };

  useEffect(() => {
    geocodeAndCalculateDistance(auctionForm.fromAddress, auctionForm.toAddress);
  }, [auctionForm.fromAddress, auctionForm.toAddress]);

  const openPostcode = (type: 'from' | 'to') => {
    const daum = (window as any).daum;
    if (typeof window !== 'undefined' && daum && daum.Postcode) {
      new daum.Postcode({
        oncomplete: (data: any) => {
          let fullAddress = data.address;
          let extraAddress = '';

          if (data.addressType === 'R') {
            if (data.bname !== '') {
              extraAddress += data.bname;
            }
            if (data.buildingName !== '') {
              extraAddress += extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName;
            }
            fullAddress += extraAddress !== '' ? ` (${extraAddress})` : '';
          }

          if (type === 'from') {
            setAuctionForm((prev) => ({ ...prev, fromAddress: fullAddress }));
          } else {
            setAuctionForm((prev) => ({ ...prev, toAddress: fullAddress }));
          }
        },
      }).open();
    } else {
      alert("주소 검색 서비스를 불러오는 중입니다. 잠시 후 다시 시도해 주세요.");
    }
  };

  const [movingMethod, setMovingMethod] = useState<'none' | 'ladder6' | 'ladder20' | 'elevator'>('none');
  const [addons, setAddons] = useState({ ac: false, tv: false });

  const getMethodCost = () => {
    switch(movingMethod) {
      case 'ladder6': return 32;
      case 'ladder20': return 56;
      case 'elevator': return 35; 
      default: return 0;
    }
  }

  const totalAddonCost = getMethodCost() + (addons.ac ? 20 : 0) + (addons.tv ? 5 : 0);

  const totalEarned = Object.values(itemActions)
    .filter((a) => a.type === 'sell' && a.earned)
    .reduce((sum, a) => sum + (a.earned || 0), 0);

  const distanceKm = realDistanceKm !== null ? realDistanceKm : calculateMockDistance(auctionForm.fromAddress, auctionForm.toAddress);
  const distanceExtraCost = calculateDistanceCost(distanceKm);

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');

  const recalculateMetrics = (actions: Record<number, any>, currentDetected: Furniture[]) => {
    const activeItems = currentDetected.filter((_, idx) => !actions[idx]);
    const res = calculateMoveMetric(params, activeItems);
    setResult(res);
    return res;
  };

  const handleParamChange = (e: any) => {
    setParams({ ...params, [e.target.name]: Number(e.target.value) });
  };

  const setQuickArea = (area: number) => setParams({ ...params, area });
  const setQuickPeople = (people: number) => setParams({ ...params, people });

  const handleNextToUpload = () => setStep(2);

  const handleRoomFileUpload = (e: any, room: string) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setRoomPhotosData((prev) => ({ ...prev, [room]: reader.result as string }));
        setRoomPhotos((prev) => ({ ...prev, [room]: true }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStartAnalysis = async () => {
    const uploadedCount = Object.keys(roomPhotosData).length;
    if (uploadedCount === 0) {
      alert("공간 사진을 최소 1장 이상 추가 등록해주세요.");
      return;
    }

    setIsUploading(true);
    try {
      const payloads = Object.values(roomPhotosData).filter(Boolean);
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images: payloads })
      });
      
      if(!res.ok) throw new Error(await res.text());
      const parsedDetected = await res.json();

      setIsUploading(false);
      setIsAnalyzed(true);
      
      setDetected(parsedDetected);
      setItemActions({});
      recalculateMetrics({}, parsedDetected);
      
      setTimeout(() => setStep(3), 1500);
    } catch (e: any) {
      alert(`분석 오류:\n${e.message}`);
      setIsUploading(false);
    }
  };

  const handleExcludeItem = (idxToRemove: number) => {
    const item = detected[idxToRemove];
    const newActions = { ...itemActions, [idxToRemove]: { type: 'discard' } as const };
    setItemActions(newActions);
    const newResult = recalculateMetrics(newActions, detected);
    
    if (result.truckTons > newResult.truckTons) {
      setSavingsMessage(`🗑️ 트럭 다운사이징 성공! (${result.truckTons}톤➔${newResult.truckTons}톤)`);
    } else {
      setSavingsMessage(`🗑️ 항목이 제외되어 잔여 공간이 확보되었습니다.`);
    }
    setTimeout(() => setSavingsMessage(""), 5000);
  };

  const handleSellItem = (idxToSell: number) => {
    setSellingIdx(idxToSell);
    setTimeout(() => {
       const randomEarned = Math.floor(Math.random() * 10 + 5);
       const newActions = { ...itemActions, [idxToSell]: { type: 'sell', earned: randomEarned } as const };
       setItemActions(newActions);
       const newResult = recalculateMetrics(newActions, detected);
       
       if (result.truckTons > newResult.truckTons) {
         setSavingsMessage(`💰 당근 매각 완료(+${randomEarned}만) / 트럭 축소 이중 절약!`);
       } else {
         setSavingsMessage(`💰 당근마켓 예상 판매가 약 ${randomEarned}만 원!`);
       }
       setSellingIdx(null);
       setTimeout(() => setSavingsMessage(""), 6000);
    }, 1500);
  };

  const handlePreCreateAuction = () => {
    if (status === "unauthenticated") {
       alert("경매 등록을 위해서는 로그인이 필요합니다.");
       router.push("/login?callbackUrl=/estimate");
       return;
    }
    setFormModalOpen(true);
  };

  const handleCreateAuction = async () => {
     if (!auctionForm.movingDate || !auctionForm.fromAddress || !auctionForm.toAddress) {
        return alert("필수 정보를 모두 입력해 주세요.");
     }

     setIsCreatingAuction(true);
     try {
        const res = await fetch('/api/auctions', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({
              fromLocation: `${auctionForm.fromAddress} (${auctionForm.fromType})`,
              toLocation: `${auctionForm.toAddress} (${auctionForm.toType})`,
              movingDate: auctionForm.movingDate,
              truckTons: result.truckTons,
              details: params.area + '평대 ' + params.people + '인 가구 이사',
              aiReport: JSON.stringify({
                 detected,
                 itemActions,
                 result,
                 addons,
                 movingMethod,
                 totalAddonCost,
                 totalEarned,
                 roomPhotos: roomPhotosData,
                 distance: distanceKm,
                 distanceExtraCost
              })
           })
        });

        if (!res.ok) {
           if (res.status === 401) {
              alert("로그인이 필요합니다.");
              router.push("/login");
              return;
           }
           throw new Error(await res.text());
        }
        
        router.push("/my-auctions");
     } catch (e: any) {
        alert("경매 등록 실패: " + e.message);
        setIsCreatingAuction(false);
     }
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-[100px] flex justify-center">
      <div className="w-full max-w-md bg-white min-h-screen relative shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header - Zimssa Style Progress */}
        <header className="bg-white px-5 pt-12 pb-4 sticky top-0 z-10 border-b border-gray-100">
           <div className="flex items-center mb-6">
              <Link href="/" className="mr-4 text-gray-800"><ChevronLeft size={24} /></Link>
              <h1 className="font-bold text-lg flex-1 text-center pr-8">
                 {step === 1 && "기본 정보 입력"}
                 {step === 2 && "공간 사진 촬영"}
                 {step === 3 && "최종 견적 확인"}
              </h1>
           </div>
           
           <div className="flex gap-2">
              <div className={`h-1.5 flex-1 rounded-full ${step >= 1 ? 'bg-[#008653]' : 'bg-gray-100'}`}></div>
              <div className={`h-1.5 flex-1 rounded-full ${step >= 2 ? 'bg-[#008653]' : 'bg-gray-100'}`}></div>
              <div className={`h-1.5 flex-1 rounded-full ${step >= 3 ? 'bg-[#008653]' : 'bg-gray-100'}`}></div>
           </div>
        </header>

        {/* Content area */}
        <main className="flex-1 overflow-y-auto px-5 py-6">

          {/* STEP 1: Basic Info */}
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-[22px] font-bold text-gray-900 mb-8 leading-tight">
                고객님의 현재 거주 환경을<br/>선택해 주세요.
              </h2>
              
              <div className="space-y-8">
                 <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                    <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-1.5"><MapPin size={16} className="text-[#025096]"/> 이사 기본 정보</h3>
                    <div className="space-y-4">
                       <div>
                          <label className="text-xs font-bold text-gray-700 mb-1 block">이사 예정일자</label>
                          <input type="date" value={auctionForm.movingDate} onChange={e=>setAuctionForm({...auctionForm, movingDate: e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 bg-white font-medium focus:border-[#025096] outline-none text-sm" />
                       </div>
                       <div>
                          <label className="text-xs font-bold text-gray-700 mb-1 block">출발지 주소</label>
                          <div className="flex gap-2">
                             <div className="flex-[2] relative">
                                <input 
                                   type="text" 
                                   value={auctionForm.fromAddress} 
                                   readOnly 
                                   onClick={() => openPostcode('from')}
                                   placeholder="주소 검색" 
                                   className="w-full border border-gray-200 rounded-lg pl-3 pr-14 py-2.5 bg-gray-50 cursor-pointer text-sm font-medium focus:border-[#025096] outline-none" 
                                />
                                <button 
                                   type="button" 
                                   onClick={() => openPostcode('from')}
                                   className="absolute right-1.5 top-1.5 bg-[#025096] hover:bg-[#013b6f] text-white text-[11px] font-bold px-2.5 py-1.5 rounded-md transition-colors"
                                >
                                   검색
                                </button>
                             </div>
                             <select value={auctionForm.fromType} onChange={e=>setAuctionForm({...auctionForm, fromType: e.target.value})} className="border border-gray-200 rounded-lg px-2 py-2.5 bg-white text-sm font-bold focus:border-[#025096] outline-none flex-1">
                                <option value="아파트">아파트</option>
                                <option value="빌라/다세대">빌라/다세대</option>
                                <option value="단독주택">단독주택</option>
                                <option value="오피스텔">오피스텔</option>
                             </select>
                          </div>
                       </div>
                       <div>
                          <label className="text-xs font-bold text-gray-700 mb-1 block">도착지 주소</label>
                          <div className="flex gap-2">
                             <div className="flex-[2] relative">
                                <input 
                                   type="text" 
                                   value={auctionForm.toAddress} 
                                   readOnly 
                                   onClick={() => openPostcode('to')}
                                   placeholder="주소 검색" 
                                   className="w-full border border-gray-200 rounded-lg pl-3 pr-14 py-2.5 bg-gray-50 cursor-pointer text-sm font-medium focus:border-[#025096] outline-none" 
                                />
                                <button 
                                   type="button" 
                                   onClick={() => openPostcode('to')}
                                   className="absolute right-1.5 top-1.5 bg-[#025096] hover:bg-[#013b6f] text-white text-[11px] font-bold px-2.5 py-1.5 rounded-md transition-colors"
                                >
                                   검색
                                </button>
                             </div>
                             <select value={auctionForm.toType} onChange={e=>setAuctionForm({...auctionForm, toType: e.target.value})} className="border border-gray-200 rounded-lg px-2 py-2.5 bg-white text-sm font-bold focus:border-[#025096] outline-none flex-1">
                                <option value="아파트">아파트</option>
                                <option value="빌라/다세대">빌라/다세대</option>
                                <option value="단독주택">단독주택</option>
                                <option value="오피스텔">오피스텔</option>
                             </select>
                          </div>
                       </div>
                    </div>
                 </div>

                 <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">평수 (주거 면적)</label>
                    <div className="grid grid-cols-3 gap-2 mb-3">
                       {[15, 24, 32].map(a => (
                          <button key={a} onClick={() => setQuickArea(a)} className={`py-3 rounded-xl border font-semibold text-sm transition-colors ${params.area === a ? 'border-[#008653] bg-[#008653]/5 text-[#008653]' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                             {a}평대
                          </button>
                       ))}
                    </div>
                    <input type="number" name="area" value={params.area} onChange={handleParamChange} className="w-full border-b-2 border-gray-200 focus:border-[#008653] outline-none py-2 text-lg font-bold" placeholder="직접 입력 (예: 32)" />
                 </div>

                 <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">거주 인원</label>
                    <div className="flex gap-2 mb-3 overflow-x-auto pb-1 hide-scrollbar">
                       {[1, 2, 3, 4].map(p => (
                          <button key={p} onClick={() => setQuickPeople(p)} className={`px-6 py-3 shrink-0 rounded-full border font-semibold text-sm transition-colors ${params.people === p ? 'border-[#025096] bg-[#025096] text-white' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                             {p}인 가구
                          </button>
                       ))}
                    </div>
                 </div>

                 <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">현재 집 거주 기간 (년)</label>
                    <input type="number" name="durationYears" value={params.durationYears} onChange={handleParamChange} className="w-full border-b-2 border-gray-200 focus:border-[#008653] outline-none py-2 text-lg font-bold" placeholder="예: 3" />
                 </div>
              </div>

              <div className="mt-12">
                 <button onClick={() => {
                   if (!auctionForm.movingDate || !auctionForm.fromAddress || !auctionForm.toAddress) {
                     return alert("이사 일정 및 출/도착지 주소를 상세히 입력해주세요.");
                   }
                   handleNextToUpload();
                 }} className="w-full bg-[#008653] text-white py-4 rounded-xl font-bold text-[17px] hover:bg-[#00623e] transition-colors flex items-center justify-center gap-2">
                    다음 단계로 <ArrowRight size={18} />
                 </button>
              </div>
            </div>
          )}

          {/* STEP 2: Photos */}
          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <h2 className="text-[22px] font-bold text-gray-900 mb-2 leading-tight">
                각 방의 사진을<br/>촬영해 주세요.
              </h2>
              <p className="text-gray-500 text-sm mb-8">AI가 사진을 분석하여 숨겨진 잔짐까지 파악합니다.</p>
              
              {isUploading ? (
                <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <div className="w-16 h-16 border-4 border-[#008653]/30 border-t-[#008653] rounded-full animate-spin mb-6"></div>
                  <h3 className="font-bold text-lg text-gray-900">AI가 공간을 분석 중입니다</h3>
                  <p className="text-gray-500 text-sm mt-2 text-center">짐량 계산을 위해 잠시만 기다려주세요.<br/>(최대 10초 소요)</p>
                </div>
              ) : isAnalyzed ? (
                 <div className="flex flex-col items-center justify-center py-20 bg-[#008653]/5 rounded-2xl border border-[#008653]/20">
                  <div className="w-16 h-16 bg-[#008653] text-white rounded-full flex items-center justify-center mb-6">
                     <Check size={32} />
                  </div>
                  <h3 className="font-bold text-lg text-[#008653]">분석이 완료되었습니다!</h3>
                  <p className="text-[#008653]/70 text-sm mt-2">최적의 견적을 산출하고 있습니다.</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3 mb-8">
                    {ROOM_TYPES.map(room => (
                      <div key={room} className={`relative flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all ${roomPhotos[room] ? 'border-[#008653] bg-[#008653]/5' : 'border-gray-100 bg-white shadow-sm'}`}>
                         {roomPhotos[room] ? (
                            <>
                               <div className="absolute top-2 right-2 bg-[#008653] text-white rounded-full p-1"><Check size={12} /></div>
                               <Camera size={28} className="text-[#008653] mb-2 opacity-70" />
                               <span className="font-bold text-gray-900 mb-2">{room}</span>
                               <label htmlFor={`reupload-${room}`} className="text-xs text-[#008653] font-semibold underline cursor-pointer">다시 찍기</label>
                               <input type="file" id={`reupload-${room}`} className="hidden" onChange={(e) => handleRoomFileUpload(e, room)} accept="image/*" />
                            </>
                         ) : (
                            <>
                               <Camera size={28} className="text-gray-300 mb-2" />
                               <span className="font-semibold text-gray-600 mb-2">{room}</span>
                               <label htmlFor={`upload-${room}`} className="bg-gray-900 text-white text-xs px-3 py-1.5 rounded-full cursor-pointer font-medium hover:bg-gray-800">사진 추가</label>
                               <input type="file" id={`upload-${room}`} className="hidden" onChange={(e) => handleRoomFileUpload(e, room)} accept="image/*" />
                            </>
                         )}
                      </div>
                    ))}
                  </div>
                  <button onClick={handleStartAnalysis} className="w-full bg-[#025096] text-white py-4 rounded-xl font-bold text-[17px] hover:bg-[#013b6f] transition-colors shadow-lg shadow-[#025096]/20">
                    분석 시작하기
                  </button>
                </>
              )}
            </div>
          )}

          {/* STEP 3: Report */}
          {step === 3 && result && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500 pb-10">
              
              {savingsMessage && (
                 <div className="bg-[#008653] text-white px-4 py-3 rounded-xl text-sm font-bold mb-6 flex items-start gap-3 shadow-lg shadow-[#008653]/20 animate-in slide-in-from-top-2">
                    <CheckCircle2 size={20} className="shrink-0 mt-0.5" />
                    <p className="leading-tight">{savingsMessage}</p>
                 </div>
              )}

              {/* Receipt Style Box */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-6">
                 {/* Heading */}
                 <div className="bg-gray-900 p-6 text-white text-center">
                    <p className="text-gray-400 text-xs font-bold tracking-widest mb-2 uppercase">AI Estimation Report</p>
                    <h3 className="text-3xl font-black mb-1 text-yellow-400">{result.truckTons}톤 트럭</h3>
                    <p className="text-gray-400 text-sm">표준 박스 약 {Math.round(result.totalVolume * 10)}개 분량</p>
                 </div>
                 
                 {/* Details */}
                 <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                       <div>
                          <p className="text-xs text-gray-500 font-medium">포장이사 추천가균</p>
                          <p className="text-xl font-black text-[#008653]">{(result.fullPack.minPrice + totalAddonCost + distanceExtraCost - totalEarned).toLocaleString()}만 ~ {(result.fullPack.maxPrice + totalAddonCost + distanceExtraCost - totalEarned).toLocaleString()}만</p>
                       </div>
                        <div className="text-right flex flex-col items-end">
                           <p className="text-xs text-gray-500 font-medium mb-1 mt-0.5">매각예상 <span className="font-bold text-[#d97706] bg-[#fef3c7] px-1 py-0.5 rounded ml-1">-{totalEarned}만</span></p>
                           <p className="text-xs text-gray-500 font-medium">작업인원 <span className="font-bold text-gray-700 ml-1">{result.fullPack.workers}</span></p>
                        </div>

                    </div>

                    <div className="h-px w-full bg-dashed bg-gray-200 mb-6 border-b border-dashed border-gray-200"></div>

                    <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100 mb-6 flex items-start gap-3">
                       <MapPin className="text-[#025096] shrink-0 mt-0.5" size={18} />
                       <div>
                          <p className="text-[13px] font-black text-[#025096] mb-1">총 예상 이동 거리: 약 {distanceKm}km</p>
                          <p className="text-[12px] font-medium text-gray-600 leading-snug">
                             기본 15km는 무료로 제공되며, 이후 10km당 3만원의 요금이 발생합니다.<br/>
                             {distanceExtraCost > 0 ? (
                               <span className="text-[#008653] font-bold block mt-1">✓ 거리에 따른 추가 요금: +{distanceExtraCost}만 원 (상단 총액 반영됨)</span>
                             ) : (
                               <span className="text-[#008653] font-bold block mt-1">✓ 기본 제공 거리 내 이사 (추가금 0원)</span>
                             )}
                          </p>
                       </div>
                    </div>

                    <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                       <Box size={16} className="text-[#025096]" /> 식별된 대형가구 관리
                    </h4>

                    <div className="space-y-3">
                       {detected.map((d, index) => {
                          const action = itemActions[index];
                          const isRemoved = !!action;
                          const isSelling = sellingIdx === index;
                          return (
                             <div key={index} className={`flex items-center justify-between p-3 rounded-xl border ${isRemoved ? 'bg-gray-50 border-gray-100 opacity-60' : 'bg-white border-gray-100 shadow-sm'}`}>
                                <div className="flex-1 overflow-hidden pr-2">
                                   <p className={`font-bold text-[14px] truncate ${isRemoved ? 'line-through text-gray-500' : 'text-gray-900'}`}>{d.name}</p>
                                   <p className="text-[11px] text-gray-400 mt-0.5">박스 약 {Math.round(d.volumeCBM * 10)}개</p>
                                </div>
                                <div className="shrink-0 flex items-center gap-1.5">
                                   {isSelling ? (
                                      <span className="text-[11px] font-bold text-[#d97706] bg-[#fef3c7] px-2 py-1 rounded">분석중...</span>
                                    ) : isRemoved ? (
                                       <div className="flex items-center gap-2">
                                          {action.type === 'sell' && action.earned && (
                                             <span className="text-[11px] font-bold text-[#d97706] bg-[#fef3c7] px-2 py-1 rounded">+{action.earned}만</span>
                                          )}
                                          <button onClick={() => {
                                             const newActions = {...itemActions};
                                             delete newActions[index];
                                             setItemActions(newActions);
                                             recalculateMetrics(newActions, detected);
                                          }} className="flex items-center justify-center p-2 rounded-full hover:bg-gray-200 text-gray-600 transition-colors">
                                             <RotateCcw size={14} />
                                          </button>
                                       </div>
                                    ) : (

                                      <>
                                         <button onClick={() => handleSellItem(index)} className="bg-[#fffbeb] text-[#d97706] border border-[#fde68a] text-[11px] font-bold px-2.5 py-1.5 rounded-lg active:scale-95 transition-transform">처분</button>
                                         <button onClick={() => handleExcludeItem(index)} className="bg-[#fef2f2] text-[#ef4444] border border-[#fecaca] text-[11px] font-bold px-2.5 py-1.5 rounded-lg active:scale-95 transition-transform">버림</button>
                                      </>
                                   )}
                                </div>
                             </div>
                          )
                       })}
                    </div>
                 </div>
              </div>

              {/* Options */}
              <div className="mb-8">
                 <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Settings size={16} className="text-gray-500" /> 현장 작업 옵션
                 </h4>
                 
                 <div className="grid grid-cols-2 gap-2 mb-2">
                    <button onClick={() => setMovingMethod(movingMethod === 'ladder6' ? 'none' : 'ladder6')} className={`p-3 rounded-xl border text-sm font-bold text-left transition-colors ${movingMethod === 'ladder6' ? 'bg-[#025096] text-white border-[#025096]' : 'bg-white text-gray-600 border-gray-200'}`}>
                       사다리 (저층)<br/><span className="text-xs font-medium opacity-80">+32만</span>
                    </button>
                    <button onClick={() => setMovingMethod(movingMethod === 'elevator' ? 'none' : 'elevator')} className={`p-3 rounded-xl border text-sm font-bold text-left transition-colors ${movingMethod === 'elevator' ? 'bg-[#025096] text-white border-[#025096]' : 'bg-white text-gray-600 border-gray-200'}`}>
                       엘리베이터<br/><span className="text-xs font-medium opacity-80">+35만</span>
                    </button>
                 </div>
                 <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => setAddons({ ...addons, ac: !addons.ac })} className={`p-3 rounded-xl border text-sm font-bold text-left transition-colors flex items-center justify-between ${addons.ac ? 'bg-[#008653]/10 text-[#008653] border-[#008653]/30' : 'bg-white text-gray-600 border-gray-200'}`}>
                       에어컨 해체 <div className={`w-4 h-4 rounded-full border ${addons.ac ? 'bg-[#008653] border-[#008653]' : 'border-gray-300'}`}></div>
                    </button>
                    <button onClick={() => setAddons({ ...addons, tv: !addons.tv })} className={`p-3 rounded-xl border text-sm font-bold text-left transition-colors flex items-center justify-between ${addons.tv ? 'bg-[#008653]/10 text-[#008653] border-[#008653]/30' : 'bg-white text-gray-600 border-gray-200'}`}>
                       벽걸이TV 해체 <div className={`w-4 h-4 rounded-full border ${addons.tv ? 'bg-[#008653] border-[#008653]' : 'border-gray-300'}`}></div>
                    </button>
                 </div>
              </div>

            </div>
          )}

        </main>

        {/* Footer CTA for Step 3 */}
        {step === 3 && (
           <div className="bg-white border-t border-gray-100 p-4 pb-safe shadow-[0_-10px_20px_rgba(0,0,0,0.05)] w-full max-w-md sticky bottom-0 z-50">
              <button 
                onClick={handlePreCreateAuction}
                className="w-full bg-[#008653] text-white py-4 rounded-xl font-bold text-[17px] hover:bg-[#00623e] transition-colors mb-2"
              >
                 48시간 자동 경매 부치기
              </button>
              <button className="w-full bg-white text-gray-500 py-3 font-semibold text-sm hover:text-gray-800 transition-colors">
                 저장하고 나중에 하기
              </button>
           </div>
        )}

        {/* Pre-Auction Form Modal */}
        {formModalOpen && (
           <div className="fixed inset-0 bg-black/60 z-[110] flex items-end justify-center sm:items-center p-0 sm:p-5">
              <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-2xl p-6 sm:p-8 pb-safe shadow-2xl animate-in slide-in-from-bottom-10 flex flex-col max-h-[90vh]">
                 <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6 sm:hidden"></div>
                 <h3 className="text-xl font-black text-gray-900 mb-2">경매 등록 필수 정보</h3>
                 <p className="text-sm text-gray-500 font-medium mb-6">파트너가 정확한 견적을 낼 수 있도록 도와주세요.</p>

                 <div className="space-y-4 overflow-y-auto pr-2 pb-4 flex-1">
                    <p className="text-sm font-bold text-gray-700 bg-gray-50 p-4 rounded-xl border border-gray-100 mb-2">
                       상단에 입력하신 이사 기본 정보 (일정, 출/도착지)를 바탕으로 파트너 딜러들에게 경매가 시작됩니다.
                    </p>
                 </div>

                 <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                    <button onClick={() => setFormModalOpen(false)} className="flex-1 py-3.5 font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">취소</button>
                    <button onClick={handleCreateAuction} disabled={isCreatingAuction} className="flex-[2] py-3.5 font-bold text-white bg-[#008653] hover:bg-[#00623e] rounded-xl transition-colors disabled:bg-gray-300">
                       {isCreatingAuction ? '등록 중...' : '최종 등록 완료'}
                    </button>
                 </div>
              </div>
           </div>
        )}

        {/* Daum Postcode Search API Script */}
        <Script 
          src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js" 
          strategy="lazyOnload" 
        />
        {/* Kakao Maps API Script (optional geocoder service) */}
        {process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY && (
          <Script 
            src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY}&libraries=services&autoload=false`}
            strategy="lazyOnload"
            onLoad={() => {
              const kakao = (window as any).kakao;
              if (kakao && kakao.maps) {
                kakao.maps.load(() => {
                  console.log("Kakao Maps SDK loaded successfully with services library!");
                  geocodeAndCalculateDistance(auctionForm.fromAddress, auctionForm.toAddress);
                });
              }
            }}
          />
        )}

      </div>
    </div>
  );
}
