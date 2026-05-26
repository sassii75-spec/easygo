import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  const session = await getServerSession(authOptions);
  
  // 기본적으로 'ALL'(전체 공개) 대상 공지는 모두에게 노출
  const targetTypes = ["ALL"];

  // 사용자가 로그인했고, 권한이 파트너이거나 관리자인 경우 'PARTNER' 대상 공지도 포함
  if (session && session.user) {
    const role = (session.user as any).role;
    if (role === "PARTNER" || role === "ADMIN") {
      targetTypes.push("PARTNER");
    }
  }

  try {
    const notices = await prisma.notice.findMany({
      where: {
        isActive: true,
        target: {
          in: targetTypes
        }
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(notices);
  } catch (error) {
    console.error("Fetch notices error:", error);
    return NextResponse.json({ error: "공지사항 조회 실패" }, { status: 500 });
  }
}
