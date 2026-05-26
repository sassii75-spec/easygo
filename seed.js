const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = 'user@test.com';
  const existing = await prisma.user.findUnique({ where: { email }});
  
  if (!existing) {
     const hash = await bcrypt.hash('1234', 10);
     await prisma.user.create({
       data: {
         email,
         password: hash,
         name: '김고객',
         role: 'CUSTOMER'
       }
     });
     console.log('Created customer: user@test.com / 1234');
  } else {
     console.log('Customer already exists: user@test.com / 1234');
  }
}
main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
