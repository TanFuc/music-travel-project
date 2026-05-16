import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDuplicates() {
  const tables = ['Show', 'Tour', 'Location', 'Artist', 'Banner', 'Voucher', 'Category'];
  
  for (const table of tables) {
    try {
      const items = await (prisma as any)[table.toLowerCase()].findMany({
        select: { title: true, name: true, slug: true }
      });
      
      const identifiers = items.map((i: any) => i.title || i.name || i.slug);
      const uniqueIdentifiers = new Set(identifiers);
      
      console.log(`Table ${table}: Total ${items.length}, Unique ${uniqueIdentifiers.size}`);
      
      if (items.length !== uniqueIdentifiers.size) {
        const counts: Record<string, number> = {};
        identifiers.forEach((id: string) => { if(id) counts[id] = (counts[id] || 0) + 1; });
        const duplicates = Object.entries(counts).filter(([_, count]) => count > 1);
        console.log(`Duplicates in ${table}:`, duplicates);
      }
    } catch (e) {}
  }
}

checkDuplicates()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
