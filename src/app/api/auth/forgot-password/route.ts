import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import nodemailer from "nodemailer";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "이메일을 입력해주세요." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // 보안상 "존재하지 않는 이메일"이라고 명시하지 않고, 성공 처리처럼 보이게 합니다 (타이밍 공격 등 방지)
      return NextResponse.json({ message: "If registered, reset link sent" }, { status: 200 });
    }

    // 기존 토큰이 있다면 삭제 (또는 덮어쓰기)
    await prisma.passwordResetToken.deleteMany({ where: { email } });

    // 보안 토큰 생성 (uuid or crypto)
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 1000 * 60 * 60); // 1시간 후 만료

    await prisma.passwordResetToken.create({
      data: {
        email,
        token,
        expires,
      },
    });

    // 이메일 전송 로직 (Nodemailer 설정)
    // 실제 발송을 위해 .env에 SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS 를 설정해야 합니다.
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: Number(process.env.SMTP_PORT) || 587,
      auth: {
        user: process.env.SMTP_USER || "your-email@gmail.com",
        pass: process.env.SMTP_PASS || "your-app-password",
      },
    });

    const resetUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/reset-password?token=${token}`;

    const mailOptions = {
      from: process.env.SMTP_USER || "your-email@gmail.com",
      to: email,
      subject: "[EasyGo] 비밀번호 재설정 링크 안내",
      html: `
        <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto;">
          <h2>비밀번호 재설정 요청</h2>
          <p>고객님의 계정에 대한 비밀번호 재설정 요청이 접수되었습니다. 아래 버튼을 클릭하여 새로운 비밀번호를 설정해주세요.</p>
          <p>해당 링크는 1시간 동안만 유효합니다.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #025096; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">비밀번호 재설정하기</a>
          </div>
          <p style="color: #666; font-size: 12px;">본인이 요청하지 않은 경우 이 메일을 무시하셔도 됩니다.</p>
        </div>
      `,
    };

    if (process.env.SMTP_USER) {
       await transporter.sendMail(mailOptions);
    } else {
       // 개발 모드 시 콘솔에 URL 출력하여 테스트 가능하게 함
       console.log("===============================");
       console.log("Mock Email Sent!");
       console.log("Reset URL:", resetUrl);
       console.log("===============================");
    }

    return NextResponse.json({ message: "메일 발송 성공" }, { status: 200 });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "처리 중 오류 발생" }, { status: 500 });
  }
}
