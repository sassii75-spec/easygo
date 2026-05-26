import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id;

  try {
    const body = await request.json();
    const { bidId, auctionId } = body;

    // 해당 옥션 검증
    const auction = await prisma.auction.findUnique({
       where: { id: auctionId }
    });

    if(!auction || auction.userId !== userId) {
       return NextResponse.json({ error: "Invalid auction" }, { status: 403 });
    }

    // 트랜잭션으로 상태 업데이트
    const updated = await prisma.$transaction([
       // 선택된 Bid 업데이트
       prisma.bid.update({
          where: { id: bidId },
          data: { isAccepted: true }
       }),
       // 옥션 상태 변경
       prisma.auction.update({
          where: { id: auctionId },
          data: { status: "CLOSED" }
       })
    ]);

    return NextResponse.json(updated[1], { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
