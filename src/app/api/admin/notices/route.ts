import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }

  try {
    const notices = await prisma.notice.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(notices);
  } catch (error) {
    return NextResponse.json({ error: "공지사항 로딩 실패" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }

  try {
    const { title, content, target, isActive } = await request.json();

    if (!title || !content) {
      return NextResponse.json({ error: "제목과 내용은 필수입니다." }, { status: 400 });
    }

    const notice = await prisma.notice.create({
      data: {
        title,
        content,
        target: target || "ALL",
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return NextResponse.json(notice, { status: 201 });
  } catch (error) {
    console.error("Notice creation error:", error);
    return NextResponse.json({ error: "공지 생성 중 오류 발생" }, { status: 500 });
  }
}
