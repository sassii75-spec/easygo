import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'admin@easygo.com';
  const adminPassword = 'adminpassword123!';

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail }
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        name: '최고 관리자',
        password: hashedPassword,
        role: 'ADMIN',
      }
    });
    console.log(`Created admin user: ${admin.email}`);
  } else {
    console.log('Admin user already exists');
  }

  // Create test partner
  const partnerEmail = 'partner@easygo.com';
  const existingPartner = await prisma.user.findUnique({
    where: { email: partnerEmail }
  });

  if (!existingPartner) {
    const hashedPassword = await bcrypt.hash('partnerpassword123!', 10);
    const partnerUser = await prisma.user.create({
      data: {
        email: partnerEmail,
        name: '베스트 이사',
        password: hashedPassword,
        role: 'PARTNER',
        partnerInfo: {
          create: {
            companyName: '베스트 이사 종합물류',
            phone: '010-1234-5678',
            rating: 4.8,
            isApproved: true,
          }
        }
      }
    });
    console.log(`Created partner user: ${partnerUser.email}`);
  } else {
    console.log('Partner user already exists');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
