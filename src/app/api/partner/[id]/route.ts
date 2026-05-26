import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const partnerId = resolvedParams.id;
    
    // We fetch partner by ID
    const partner = await prisma.partner.findUnique({
      where: { id: partnerId },
      include: {
        reviews: {
          include: {
            user: {
              select: { name: true, email: true }
            }
          },
          orderBy: { createdAt: "desc" }
        }
      }
    });

    if (!partner) {
      return NextResponse.json({ error: "Partner not found" }, { status: 404 });
    }

    // Mask the user names in reviews for privacy
    const maskedReviews = partner.reviews.map(r => {
      const name = r.user?.name || r.user?.email || "고객";
      const maskedName = name.length > 2 
         ? name.substring(0, 1) + "*" + name.substring(2) 
         : name.substring(0, 1) + "*";
         
      return {
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt,
        userName: maskedName
      }
    });

    // Compute average rating
    const reviewCount = partner.reviews.length;
    const rating = reviewCount > 0 
      ? partner.reviews.reduce((acc, r) => acc + r.rating, 0) / reviewCount
      : 0;

    return NextResponse.json({
      id: partner.id,
      companyName: partner.companyName,
      profileImage: partner.profileImage,
      description: partner.description,
      rating: rating.toFixed(1),
      reviewCount,
      reviews: maskedReviews
    }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
