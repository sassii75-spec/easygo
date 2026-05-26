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
    const { auctionId, partnerId, rating, comment } = body;

    // 옥션 상태를 COMPLETED로 변경하며 리뷰 등록, 파트너 평점 갱신 (트랜잭션)
    const review = await prisma.$transaction(async (tx) => {
       // 1. 리뷰 생성
       const newReview = await tx.review.create({
          data: {
             auctionId,
             userId,
             partnerId,
             rating: Number(rating),
             comment
          }
       });

       // 2. 옥션 완료 상태로 변경
       await tx.auction.update({
          where: { id: auctionId },
          data: { status: "COMPLETED" }
       });

       // 3. 파트너 별점 평균 업데이트 로직 (간소화)
       const partnerInfo = await tx.partner.findUnique({ where: { id: partnerId } });
       if (partnerInfo) {
          const currentTotal = partnerInfo.rating * partnerInfo.reviewCount;
          const newCount = partnerInfo.reviewCount + 1;
          const newAvgRating = (currentTotal + Number(rating)) / newCount;

          await tx.partner.update({
             where: { id: partnerId },
             data: {
                rating: newAvgRating,
                reviewCount: newCount
             }
          });
       }

       return newReview;
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
