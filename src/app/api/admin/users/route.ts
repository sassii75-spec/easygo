import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  
  // 관리자(ADMIN) 권한 체크
  if (!session || !session.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }

  try {
    const { name, email, password, role } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "이메일과 비밀번호는 필수입니다." }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: "이미 존재하는 이메일입니다." }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || "CUSTOMER",
      },
    });

    // 만약 파트너라면 Partner 정보도 함께 초기화 해줄 수 있음 (옵션)
    if (role === "PARTNER") {
       await prisma.partner.create({
          data: {
             userId: user.id,
             companyName: name || "미설정 파트너",
          }
       });
    }

    return NextResponse.json({ 
       message: "성공적으로 계정을 생성했습니다.", 
       user: { id: user.id, email: user.email, name: user.name, role: user.role } 
    }, { status: 201 });

  } catch (error) {
    console.error("User creation error:", error);
    return NextResponse.json({ error: "계정 생성 중 오류 발생" }, { status: 500 });
  }
}
