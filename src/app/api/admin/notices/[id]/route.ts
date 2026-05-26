import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }

  try {
    const { title, content, target, isActive } = await request.json();

    const notice = await prisma.notice.update({
      where: { id: resolvedParams.id },
      data: {
        ...(title && { title }),
        ...(content && { content }),
        ...(target && { target }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json(notice);
  } catch (error) {
    return NextResponse.json({ error: "공지사항 수정 실패" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }

  try {
    await prisma.notice.delete({
      where: { id: resolvedParams.id },
    });
    return NextResponse.json({ message: "삭제 완료" });
  } catch (error) {
    return NextResponse.json({ error: "공지사항 삭제 실패" }, { status: 500 });
  }
}
