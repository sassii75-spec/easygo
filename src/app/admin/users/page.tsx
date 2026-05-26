import { prisma } from "@/lib/prisma";
import CreateUserClient from "./CreateUserClient";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">권한 / 유저 관리</h1>
          <p className="mt-1 text-sm text-gray-500">이지고 회원의 권한과 정보를 관리합니다.</p>
        </div>
        <CreateUserClient />
      </div>

      <div className="bg-white shadow-sm rounded-xl overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="p-4 font-semibold">이름</th>
                <th className="p-4 font-semibold">이메일</th>
                <th className="p-4 font-semibold">권한</th>
                <th className="p-4 font-semibold">가입일</th>
                <th className="p-4 font-semibold">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-4 text-gray-900 font-medium">{user.name || "미등록"}</td>
                  <td className="p-4 text-gray-500">{user.email || "이메일 없음"}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium
                      ${user.role === 'ADMIN' ? 'bg-red-100 text-red-800' : 
                        user.role === 'PARTNER' ? 'bg-blue-100 text-blue-800' : 
                        'bg-green-100 text-green-800'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="p-4 text-gray-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className="p-4">
                    <button className="text-blue-600 hover:text-blue-800 font-medium">수정</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
