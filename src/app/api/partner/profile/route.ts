import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user || (session.user as any).role !== "PARTNER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id;

  try {
    const partner = await prisma.partner.findUnique({
      where: { userId },
      include: {
        reviews: {
          include: {
            user: {
              select: { name: true }
            }
          },
          orderBy: { createdAt: "desc" }
        }
      }
    });

    if (!partner) {
      return NextResponse.json({ error: "Partner profile not found" }, { status: 404 });
    }

    // Calculating dynamic rating based on reviews just to be accurate
    const reviewCount = partner.reviews.length;
    const rating = reviewCount > 0 
      ? partner.reviews.reduce((acc, r) => acc + r.rating, 0) / reviewCount
      : 0;

    return NextResponse.json({ ...partner, rating, reviewCount }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user || (session.user as any).role !== "PARTNER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id;

  try {
    const body = await request.json();
    const { companyName, phone, profileImage, description } = body;

    const partner = await prisma.partner.update({
      where: { userId },
      data: {
        companyName,
        phone,
        profileImage,
        description
      }
    });

    return NextResponse.json(partner, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
