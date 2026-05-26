import { prisma } from "@/lib/prisma";
import { Users, Building, Image as ImageIcon, TrendingUp } from "lucide-react";

export default async function AdminDashboard() {
  const userCount = await prisma.user.count({ where: { role: "CUSTOMER" } });
  const partnerCount = await prisma.user.count({ where: { role: "PARTNER" } });
  const bannerCount = await prisma.banner.count();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">대시보드</h1>
        <p className="mt-1 text-sm text-gray-500">이지고 플랫폼 현황을 한 눈에 확인하세요.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric Card 1 */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center shrink-0">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">총 고객 수</p>
            <p className="text-2xl font-bold text-gray-900">{userCount.toLocaleString()}명</p>
          </div>
        </div>

        {/* Metric Card 2 */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0">
            <Building size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">파트너사</p>
            <p className="text-2xl font-bold text-gray-900">{partnerCount.toLocaleString()}곳</p>
          </div>
        </div>

        {/* Metric Card 3 */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center shrink-0">
            <ImageIcon size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">운영 중인 배너</p>
            <p className="text-2xl font-bold text-gray-900">{bannerCount.toLocaleString()}개</p>
          </div>
        </div>

        {/* Metric Card 4 */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center shrink-0">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">오늘의 견적</p>
            <p className="text-2xl font-bold text-gray-900">0건</p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-semibold text-lg mb-4">최근 가입자</h3>
          <div className="space-y-3 shrink-0">
            {userCount === 0 && <p className="text-sm text-gray-500">데이터가 없습니다.</p>}
            {/* We can fetch recent users here in the future */}
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-semibold text-lg mb-4">플랫폼 공지사항</h3>
          <div className="text-sm text-gray-500">
            현재 등록된 공지사항이 없습니다.
          </div>
        </div>
      </div>
    </div>
  );
}
