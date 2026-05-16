import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function countData() {
  const models = [
    'show', 'tour', 'location', 'artist', 'banner', 'voucher', 'staticPage'
  ];
  
  console.log('📊 Current Database counts:');
  for (const model of models) {
    try {
      const count = await (prisma as any)[model].count();
      console.log(` - ${model}: ${count}`);
    } catch (e) {
      // console.log(` - ${model}: Table not found or error`);
    }
  }
}

countData()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
