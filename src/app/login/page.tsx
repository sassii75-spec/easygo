"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (res?.error) {
      setError("이메일 또는 비밀번호가 일치하지 않습니다.");
    } else {
      // 로그인 성공 시 세션을 가져와 역할에 따라 라우팅 분기
      const { getSession } = await import("next-auth/react");
      const session = await getSession();
      const role = (session?.user as any)?.role;
      
      if (role === "ADMIN") {
        router.push("/admin");
      } else if (role === "PARTNER") {
        router.push("/partner");
      } else {
        router.push("/");
      }
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="EasyGo 로고" className="h-10 mx-auto mb-3 object-contain" />
          <p className="text-gray-500">투명하고 스마트한 이사 플랫폼</p>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:border-[#008653] focus:ring-1 focus:ring-[#008653] outline-none transition-all"
              placeholder="admin@easygo.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:border-[#008653] focus:ring-1 focus:ring-[#008653] outline-none transition-all"
              placeholder="••••••••"
              required
            />
          </div>
          <div className="flex justify-end">
             <Link href="/forgot-password" className="text-sm font-bold text-[#025096] hover:underline">비밀번호를 잊으셨나요?</Link>
          </div>
          <button
            type="submit"
            className="w-full bg-[#008653] text-white py-3 rounded-lg font-bold text-lg hover:bg-[#00623e] transition-colors mt-6"
          >
            로그인
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100">
          <p className="text-center text-sm text-gray-500 mb-4">또는 소셜 계정으로 로그인</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => signIn("kakao")}
              className="flex justify-center items-center py-2.5 px-4 bg-[#FEE500] hover:bg-[#E5CD00] text-black rounded-lg transition-colors font-medium text-sm"
            >
              카카오 로그인
            </button>
            <button
              onClick={() => signIn("google")}
              className="flex justify-center items-center py-2.5 px-4 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 rounded-lg transition-colors font-medium text-sm gap-2"
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              구글 로그인
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
