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
    const { fromLocation, toLocation, movingDate, truckTons, details, aiReport } = body;

    const auction = await prisma.auction.create({
      data: {
        userId,
        fromLocation,
        toLocation,
        movingDate,
        truckTons,
        details,
        aiReport,
        status: "OPEN",
      },
    });

    return NextResponse.json(auction, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id;
  const url = new URL(request.url);
  const type = url.searchParams.get("type");

  try {
    if (type === "partner") {
      // 파트너는 오픈된 모든 경매 목록을 볼 수 있음
      const auctions = await prisma.auction.findMany({
        where: { status: "OPEN" },
        include: {
          bids: {
             include: { partner: true }
          }
        },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json(auctions, { status: 200 });
    } else {
      // 고객은 자신이 등록한 경매(오픈, 종료, 완료 모두)를 볼 수 있음
      const auctions = await prisma.auction.findMany({
        where: { userId },
        include: {
          bids: {
            include: { partner: true }
          },
          review: true
        },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json(auctions, { status: 200 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
