import { prisma } from "@/lib/prisma";
import { Plus } from "lucide-react";

export default async function AdminBannersPage() {
  const banners = await prisma.banner.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">배너 관리</h1>
          <p className="mt-1 text-sm text-gray-500">배너를 등록하고 상태를 변경하여 수익을 극대화하세요.</p>
        </div>
        <button className="bg-[#008653] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#00623e] transition-colors flex items-center gap-2">
          <Plus size={20} />
          배너 등록
        </button>
      </div>

      {banners.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus size={32} />
          </div>
          <h3 className="text-lg font-medium text-gray-900">등록된 배너가 없습니다</h3>
          <p className="mt-2 text-gray-500">우측 상단의 "배너 등록" 버튼을 눌러 첫 번째 배너를 생성하세요.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {banners.map((banner) => (
            <div key={banner.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
              <div className="h-40 bg-gray-200 relative overflow-hidden flex items-center justify-center group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={banner.imageUrl} alt={banner.title} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300" />
                {!banner.isActive && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="bg-white/90 text-gray-900 font-bold px-3 py-1 rounded text-sm shrink-0">비활성화됨</span>
                  </div>
                )}
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="font-bold text-gray-900 mb-1">{banner.title}</h3>
                <p className="text-xs text-blue-600 mb-4 truncate" title={banner.linkUrl || ""}>{banner.linkUrl}</p>
                <div className="mt-auto flex justify-between items-center text-sm font-medium">
                  <div className="text-gray-500">
                    <span className="mr-3">👁 {banner.viewCount}</span>
                    <span>👆 {banner.clickCount}</span>
                  </div>
                  <button className="text-[#025096] hover:underline">수정</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
