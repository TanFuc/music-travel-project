import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function truncateAll() {
  console.log('🧨 TRUNCATING ALL TABLES...');
  
  // Get all table names from public schema
  const tablenames = await prisma.$queryRaw<
    Array<{ tablename: string }>
  >`SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename != '_prisma_migrations'`;

  const tables = tablenames
    .map(({ tablename }) => `"public"."${tablename}"`)
    .join(', ');

  try {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tables} RESTART IDENTITY CASCADE;`);
    console.log('✅ All tables truncated successfully!');
  } catch (error) {
    console.error('❌ Failed to truncate tables:', error);
  }
}

truncateAll()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
