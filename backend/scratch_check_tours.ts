import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const tours = await prisma.tour.findMany({
    select: {
      id: true,
      title: true,
      isCombo: true,
      schedules: {
        where: {
          status: 'OPEN',
          startDate: { gte: new Date() },
          deletedAt: null,
        }
      }
    }
  });
  console.log(JSON.stringify(tours, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
