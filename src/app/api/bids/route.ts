import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = (session.user as any).role;
  const partnerIdStr = (session.user as any).partnerId;

  if (role !== "PARTNER") {
     return NextResponse.json({ error: "Only partners can place bids." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { auctionId, amount, message } = body;

    // 파트너 객체 찾기
    const partner = await prisma.partner.findFirst({
       where: { userId: (session.user as any).id }
    });

    if (!partner) {
       return NextResponse.json({ error: "Partner info not found." }, { status: 404 });
    }

    // 중복 입찰 방지 (UPSERT로 처리하여 수정도 가능하게 함)
    const bid = await prisma.bid.upsert({
      where: {
        auctionId_partnerId: {
           auctionId,
           partnerId: partner.id
        }
      },
      update: {
        amount: Number(amount),
        message
      },
      create: {
        auctionId,
        partnerId: partner.id,
        amount: Number(amount),
        message
      }
    });

    return NextResponse.json(bid, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
