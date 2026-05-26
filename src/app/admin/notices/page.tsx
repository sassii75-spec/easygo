"use client";

import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, Bell, X } from "lucide-react";

type Notice = {
  id: string;
  title: string;
  content: string;
  target: "ALL" | "PARTNER";
  isActive: boolean;
  createdAt: string;
};

export default function AdminNoticesPage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState({ title: "", content: "", target: "ALL", isActive: true });

  const fetchNotices = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/notices");
      if (res.ok) {
        const data = await res.json();
        setNotices(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const openNewModal = () => {
    setForm({ title: "", content: "", target: "ALL", isActive: true });
    setEditingId(null);
    setIsModalOpen(true);
  };

  const openEditModal = (notice: Notice) => {
    setForm({ title: notice.title, content: notice.content, target: notice.target, isActive: notice.isActive });
    setEditingId(notice.id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("정말 이 공지사항을 삭제하시겠습니까? (삭제 시 복구 불가)")) return;
    
    try {
      const res = await fetch(`/api/admin/notices/${id}`, { method: "DELETE" });
      if (res.ok) {
        setNotices(notices.filter(n => n.id !== id));
      }
    } catch (e) {
      alert("삭제에 실패했습니다.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.content) return alert("제목과 내용을 모두 입력해주세요.");

    try {
      const url = editingId ? `/api/admin/notices/${editingId}` : "/api/admin/notices";
      const method = editingId ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchNotices();
      } else {
        alert("처리에 실패했습니다.");
      }
    } catch (e) {
      alert("서버 연결에 실패했습니다.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">공지사항 관리</h1>
          <p className="mt-1 text-sm text-gray-500">플랫폼 전체 및 파트너 공지사항을 관리합니다.</p>
        </div>
        <button onClick={openNewModal} className="flex items-center gap-2 bg-[#025096] text-white px-4 py-2 rounded-lg font-bold hover:bg-[#023b70] transition-colors shadow-sm">
          <Plus size={18} /> 새 공지 작성
        </button>
      </div>

      <div className="bg-white shadow-sm rounded-xl overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="p-4 font-semibold w-16">상태</th>
                <th className="p-4 font-semibold w-24">노출 대상</th>
                <th className="p-4 font-semibold">공지 제목</th>
                <th className="p-4 font-semibold w-32">작성일</th>
                <th className="p-4 font-semibold w-24 text-right">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={5} className="p-8 text-center text-gray-400">불러오는 중...</td></tr>
              ) : notices.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-gray-400">등록된 공지사항이 없습니다.</td></tr>
              ) : (
                notices.map((notice) => (
                  <tr key={notice.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-bold ${notice.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {notice.isActive ? '표시됨' : '숨김'}
                      </span>
                    </td>
                    <td className="p-4">
                      {notice.target === 'ALL' ? (
                        <span className="bg-blue-100 text-[#025096] px-2 py-0.5 rounded text-xs font-bold">전체</span>
                      ) : (
                        <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded text-xs font-bold">파트너 딜러 전용</span>
                      )}
                    </td>
                    <td className="p-4 font-bold text-gray-900 truncate max-w-sm">{notice.title}</td>
                    <td className="p-4 text-gray-500">{new Date(notice.createdAt).toLocaleDateString()}</td>
                    <td className="p-4 text-right space-x-3">
                      <button onClick={() => openEditModal(notice)} className="text-gray-400 hover:text-[#025096] transition-colors"><Edit2 size={18} /></button>
                      <button onClick={() => handleDelete(notice.id)} className="text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
               <h3 className="font-bold text-lg flex items-center gap-2"><Bell className="text-[#025096]" size={20}/> {editingId ? '공지사항 수정' : '새 공지사항 작성'}</h3>
               <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-900"><X size={20}/></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 flex flex-col gap-5">
               <div>
                  <label className="block text-sm font-bold mb-1.5 text-gray-700">대상 지정</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-sm cursor-pointer border p-3 rounded-lg flex-1 group hover:border-[#025096]">
                      <input type="radio" checked={form.target === 'ALL'} onChange={() => setForm({...form, target: 'ALL'})} name="target" className="accent-[#025096] scale-125" />
                      <div>
                        <b className="block text-gray-900 leading-tight">전체 대상 (ALL)</b>
                        <span className="text-xs text-gray-500">고객과 파트너 모두에게 노출됩니다.</span>
                      </div>
                    </label>
                    <label className="flex items-center gap-2 text-sm cursor-pointer border p-3 rounded-lg flex-1 group hover:border-[#025096]">
                      <input type="radio" checked={form.target === 'PARTNER'} onChange={() => setForm({...form, target: 'PARTNER'})} name="target" className="accent-[#025096] scale-125" />
                      <div>
                        <b className="block text-gray-900 leading-tight">파트너 대상 (PARTNER)</b>
                        <span className="text-xs text-gray-500">파트너 대시보드에만 노출됩니다.</span>
                      </div>
                    </label>
                  </div>
               </div>

               <div>
                  <label className="block text-sm font-bold mb-1.5 text-gray-700">공지 제목</label>
                  <input type="text" value={form.title} onChange={e=>setForm({...form, title: e.target.value})} className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-[#025096] font-medium" placeholder="공지사항 제목을 입력하세요" required />
               </div>
               
               <div className="flex-1 flex flex-col">
                  <label className="block text-sm font-bold mb-1.5 text-gray-700">상세 내용 (줄바꿈 지원)</label>
                  <textarea value={form.content} onChange={e=>setForm({...form, content: e.target.value})} className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-[#025096] flex-1 min-h-[200px]" placeholder="공지사항의 상세 내용을 작성해주세요." required />
               </div>

               <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <input type="checkbox" id="isActive" checked={form.isActive} onChange={e=>setForm({...form, isActive: e.target.checked})} className="accent-green-600 w-5 h-5 rounded" />
                  <label htmlFor="isActive" className="text-sm font-bold cursor-pointer select-none">지금 바로 앱 화면에 활성화하여 표시합니다 (숨기려면 체크 해제)</label>
               </div>

               <div className="border-t pt-5 flex justify-end gap-3 mt-2">
                 <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 rounded-lg text-gray-600 font-bold hover:bg-gray-100 transition-colors">취소</button>
                 <button type="submit" className="bg-[#025096] hover:bg-[#023b70] text-white px-8 py-2.5 rounded-lg font-bold transition-colors shadow-md">
                   {editingId ? '수정 내용 저장' : '공지사항 게시'}
                 </button>
               </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
