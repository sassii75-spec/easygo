"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setStatus("error");
      setMessage("유효하지 않은 링크입니다. 다시 메일을 요청해 주세요.");
      return;
    }
    if (password !== confirmPassword) {
      setStatus("error");
      setMessage("비밀번호가 일치하지 않습니다.");
      return;
    }
    if (password.length < 6) {
       setStatus("error");
       setMessage("비밀번호는 최소 6자리 이상이어야 합니다.");
       return;
    }

    setStatus("loading");
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();

      if (res.ok) {
        setStatus("success");
      } else {
        setStatus("error");
        setMessage(data.error || "비밀번호 재설정에 실패했습니다.");
      }
    } catch (err) {
      setStatus("error");
      setMessage("서버와 통신할 수 없습니다.");
    }
  };

  if(!token) {
     return <div className="p-8 text-center text-red-500 font-bold">잘못된 접근입니다. (토큰 없음)</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-black text-gray-900 mb-2">새 비밀번호 설정</h1>
      <p className="text-sm text-gray-500 mb-8 font-medium">안전한 로그인을 위해 새로운 비밀번호를 설정해주세요.</p>

      {status === "success" ? (
         <div className="text-center">
            <div className="bg-green-50 text-[#008653] p-4 rounded-xl font-bold mb-6">
              비밀번호가 성공적으로 변경되었습니다!
            </div>
            <button onClick={() => router.push("/login")} className="w-full bg-gray-900 text-white font-bold py-3.5 rounded-xl hover:bg-black transition-all">
               로그인하러 가기
            </button>
         </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">새 비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-[#025096] text-sm"
              placeholder="새로운 비밀번호 입력"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">새 비밀번호 확인</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-[#025096] text-sm"
              placeholder="위와 동일하게 입력"
              required
            />
          </div>
          
          {status === "error" && (
            <p className="text-red-500 text-sm font-semibold">{message}</p>
          )}

          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full bg-[#025096] text-white font-bold py-3.5 rounded-xl hover:bg-[#023b70] disabled:bg-gray-400 active:scale-[0.98] transition-all mt-6"
          >
            {status === "loading" ? "변경 처리중..." : "비밀번호 변경하기"}
          </button>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="bg-gray-50 min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
        <Suspense fallback={<div className="p-8 text-center text-gray-500">인증 정보를 확인하는 중...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
