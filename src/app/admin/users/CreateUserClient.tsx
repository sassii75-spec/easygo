"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, X } from "lucide-react";

export default function CreateUserClient() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "CUSTOMER" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!form.email || !form.password) return alert("이메일과 비밀번호는 필수입니다.");
    
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      
      if(res.ok) {
         alert("계정이 성공적으로 생성되었습니다.");
         setIsOpen(false);
         setForm({ name: "", email: "", password: "", role: "CUSTOMER" });
         router.refresh(); // Refresh server component
      } else {
         alert(data.error || "생성 실패");
      }
    } catch(err) {
      alert("서버 연결 오류");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-[#025096] text-white px-4 py-2 rounded-lg font-bold hover:bg-[#023b70] transition-colors"
      >
        <UserPlus size={18} /> 새 계정 발급
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden relative">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
               <h3 className="font-bold text-lg">새로운 계정 직접 등록</h3>
               <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-900"><X size={20}/></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
               <div>
                  <label className="block text-sm font-bold mb-1.5">이름(표시명)</label>
                  <input type="text" value={form.name} onChange={e=>setForm({...form, name: e.target.value})} className="w-full border rounded-lg p-2.5 outline-none focus:border-[#025096] text-sm" placeholder="예) 이지고 이사홍길동" />
               </div>
               <div>
                  <label className="block text-sm font-bold mb-1.5">이메일(아이디)</label>
                  <input type="email" value={form.email} onChange={e=>setForm({...form, email: e.target.value})} className="w-full border rounded-lg p-2.5 outline-none focus:border-[#025096] text-sm" placeholder="user@easygo.com" required />
               </div>
               <div>
                  <label className="block text-sm font-bold mb-1.5">초기 비밀번호</label>
                  <input type="text" value={form.password} onChange={e=>setForm({...form, password: e.target.value})} className="w-full border rounded-lg p-2.5 outline-none focus:border-[#025096] text-sm font-mono tracking-wider" placeholder="임시 비밀번호 입력" required />
               </div>
               <div>
                  <label className="block text-sm font-bold mb-1.5">권한 (Role)</label>
                  <select value={form.role} onChange={e=>setForm({...form, role: e.target.value})} className="w-full border rounded-lg p-2.5 outline-none focus:border-[#025096] text-sm">
                     <option value="CUSTOMER">일반 고객 (CUSTOMER)</option>
                     <option value="PARTNER">파트너사 (PARTNER)</option>
                     <option value="ADMIN">관리자 (ADMIN)</option>
                  </select>
               </div>
               <button disabled={loading} type="submit" className="w-full mt-4 bg-[#025096] hover:bg-[#023b70] disabled:bg-gray-400 text-white font-bold py-3 rounded-lg transition-colors">
                  {loading ? '생성 중...' : '계정 등록 완료'}
               </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
