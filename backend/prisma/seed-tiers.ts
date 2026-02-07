import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Ticket Tiers...');

  const tiers = [
    {
      name: 'Vé Hạt Xanh - Green Solo',
      nameEn: 'Green Solo',
      price: 350000,
      description: 'Mỗi cá nhân là một "hạt mầm" lan tỏa lối sống xanh.',
      targetAudience: 'Khách lẻ, bạn trẻ, người yêu âm nhạc.',
      benefits: 'Đồ uống + ăn nhẹ. Ghế ngồi khu Green Solo.',
      colorCode: '#4CAF50',
      priority: 1,
      groupSize: 1,
      totalQuantity: 100,
      maxPerOrder: 10,
    },
    {
      name: 'Vé Gia Đình Xanh - Happy Green Family',
      nameEn: 'Happy Green Family',
      price: 500000,
      description: 'Gắn kết gia đình - nuôi dưỡng ý thức bảo vệ môi trường cho trẻ nhỏ.',
      targetAudience: 'Gia đình trẻ, phụ huynh (02 người lớn + 1 trẻ em).',
      benefits: 'Đồ uống + ăn nhẹ. Ghế ngồi khu Happy Green Family.',
      colorCode: '#8BC34A',
      priority: 2,
      groupSize: 3, // 2 adults + 1 child
      totalQuantity: 50,
      maxPerOrder: 5,
    },
    {
      name: 'Vé Tuổi Trẻ Xanh - Green Youth',
      nameEn: 'Green Youth',
      price: 1000000,
      description: 'Nhiệt huyết - sáng tạo - hành động vì tương lai xanh.',
      targetAudience: 'CLB sinh viên, nhóm bạn trẻ (05 người).',
      benefits: 'Đồ uống + ăn nhẹ. Ghế ngồi khu Green Youth.',
      colorCode: '#CDDC39',
      priority: 3,
      groupSize: 5, // Group of 5
      totalQuantity: 30,
      maxPerOrder: 3,
    },
    {
      name: 'Vé Doanh Nghiệp Đồng Hành Xanh - Green Partner',
      nameEn: 'Green Partner',
      price: 3000000,
      description: 'Doanh nghiệp chung tay vì cộng đồng & môi trường.',
      targetAudience: 'Công ty, tổ chức (10 người).',
      benefits: 'Đồ uống + ăn nhẹ + rượu vang. Ghế ngồi khu Green Partner. Khu vực ngồi riêng, Check-in & truyền thông riêng.',
      colorCode: '#FF9800',
      priority: 4,
      groupSize: 10, // Group of 10
      totalQuantity: 20,
      maxPerOrder: 2,
    },
    {
      name: 'Vé VIP Doanh Nhân Xanh - Green Business Class',
      nameEn: 'Green Business Class',
      price: 1000000,
      description: 'Đẳng cấp - kết nối - trách nhiệm xã hội.',
      targetAudience: 'Doanh nhân, nhà tài trợ (1 người).',
      benefits: 'Đồ uống + ăn nhẹ + rượu vang + món khô. Ghế ngồi khu VIP - Green Business Class. Khu vực ngồi đẹp/riêng. Ưu tiên giao lưu - kết nối đối tác.',
      colorCode: '#FFD700',
      priority: 5,
      groupSize: 1,
      totalQuantity: 50,
      maxPerOrder: 5,
    },
  ];

  for (const tier of tiers) {
    // Check if exists
    const existing = await prisma.ticketTier.findFirst({ where: { name: tier.name } });
    if (!existing) {
      await prisma.ticketTier.create({
        data: {
          ...tier,
          isActive: true,
        },
      });
      console.log(`Created ${tier.name}`);
    } else {
      // Update existing tier with new fields
      await prisma.ticketTier.update({
        where: { id: existing.id },
        data: {
          nameEn: tier.nameEn,
          targetAudience: tier.targetAudience,
          groupSize: tier.groupSize,
          totalQuantity: tier.totalQuantity,
          maxPerOrder: tier.maxPerOrder,
        },
      });
      console.log(`Updated ${tier.name}`);
    }
  }

  console.log('Ticket Tiers seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
