"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setMessage("이메일로 비밀번호 재설정 링크가 전송되었습니다.");
      } else {
        setStatus("error");
        setMessage(data.error || "메일 전송에 실패했습니다.");
      }
    } catch (err) {
      setStatus("error");
      setMessage("서버와 통신할 수 없습니다.");
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
        <div className="p-8">
          <Link href="/login" className="inline-block mb-6 text-gray-400 hover:text-gray-900 transition-colors">
            <ArrowLeft size={24} />
          </Link>
          
          <h1 className="text-2xl font-black text-gray-900 mb-2">비밀번호 찾기</h1>
          <p className="text-sm text-gray-500 mb-8 font-medium">
            가입시 사용한 이메일을 입력해주시면, 비밀번호를 재설정할 수 있는 링크를 보내드립니다.
          </p>

          {status === "success" ? (
            <div className="bg-blue-50 text-[#025096] p-4 rounded-xl text-center font-bold">
              {message}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">이메일 주소</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-[#025096] focus:ring-1 focus:ring-[#025096] transition-all"
                  placeholder="예) user@easygo.com"
                  required
                />
              </div>
              
              {status === "error" && (
                <p className="text-red-500 text-sm font-semibold">{message}</p>
              )}

              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full bg-[#025096] text-white font-bold py-3.5 rounded-xl hover:bg-[#023b70] disabled:bg-gray-400 active:scale-[0.98] transition-all mt-4"
              >
                {status === "loading" ? "전송 중..." : "재설정 메일 받기"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
