import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const shows = await prisma.show.findMany({
    select: {
      id: true,
      title: true,
      properties: true,
    },
    take: 5
  });
  console.log('--- SHOWS ---');
  console.log(JSON.stringify(shows, null, 2));

  const banners = await prisma.banner.findMany({
    select: {
      id: true,
      title: true,
      imageUrl: true,
      isActive: true,
    }
  });
  console.log('--- BANNERS ---');
  console.log(JSON.stringify(banners, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());

