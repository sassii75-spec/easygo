import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
    }

    if (password.length < 6) {
       return NextResponse.json({ error: "비밀번호는 최소 6자리 이상이어야 합니다." }, { status: 400 });
    }

    // 1. 유효한 토큰 확인
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetToken) {
      return NextResponse.json({ error: "무효하거나 만료된 인증 링크입니다." }, { status: 400 });
    }

    // 2. 만료 시간 검증
    if (resetToken.expires < new Date()) {
      await prisma.passwordResetToken.delete({ where: { id: resetToken.id } });
      return NextResponse.json({ error: "인증 시간이 만료된 링크입니다. 초기화를 다시 요청해주세요." }, { status: 400 });
    }

    // 3. User 존재 확인
    const user = await prisma.user.findUnique({
      where: { email: resetToken.email },
    });

    if (!user) {
      return NextResponse.json({ error: "해당 이메일을 가진 사용자를 찾을 수 없습니다." }, { status: 404 });
    }

    // 4. 새로운 패스워드 해싱 및 업데이트
    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    // 5. 사용 완료된 토큰 삭제 (안전하게 재사용 방지)
    await prisma.passwordResetToken.delete({
       where: { id: resetToken.id }
    });

    return NextResponse.json({ message: "비밀번호가 성공적으로 변경되었습니다." }, { status: 200 });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json({ error: "비밀번호 변경 처리 중 서버 오류가 발생했습니다." }, { status: 500 });
  }
}
