
import { PrismaClient, TicketStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding Ticket Tiers...');

    const tiers = [
        {
            name: 'Vé Hạt Xanh - Green Solo',
            price: 350000,
            description: 'Mỗi cá nhân là một "hạt mầm" lan tỏa lối sống xanh. Dành cho: Khách lẻ, bạn trẻ, người yêu âm nhạc.',
            benefits: 'Đồ uống + ăn nhẹ. Ghế ngồi khu Green Solo.',
            colorCode: '#4CAF50',
            priority: 1,
        },
        {
            name: 'Vé Gia Đình Xanh - Happy Green Family',
            price: 500000,
            description: 'Gắn kết gia đình - nuôi dưỡng ý thức bảo vệ môi trường cho trẻ nhỏ. Dành cho: Gia đình trẻ, phụ huynh (02 người lớn + 1 trẻ em).',
            benefits: 'Đồ uống + ăn nhẹ. Ghế ngồi khu Happy Green Family.',
            colorCode: '#8BC34A',
            priority: 2,
        },
        {
            name: 'Vé Tuổi Trẻ Xanh - Green Youth',
            price: 1000000,
            description: 'Nhiệt huyết - sáng tạo - hành động vì tương lai xanh. Dành cho: CLB sinh viên, nhóm bạn trẻ (05 người).',
            benefits: 'Đồ uống + ăn nhẹ. Ghế ngồi khu Green Youth.',
            colorCode: '#CDDC39',
            priority: 3,
        },
        {
            name: 'Vé Doanh Nghiệp Đồng Hành Xanh - Green Partner',
            price: 3000000,
            description: 'Doanh nghiệp chung tay vì cộng đồng & môi trường. Dành cho: Công ty, tổ chức (10 người).',
            benefits: 'Đồ uống + ăn nhẹ + rượu vang. Ghế ngồi khu Green Partner. Khu vực ngồi riêng, Check-in & truyền thông riêng.',
            colorCode: '#FF9800',
            priority: 4,
        },
        {
            name: 'Vé VIP Doanh Nhân Xanh - Green Business Class',
            price: 1000000,
            description: 'Đẳng cấp - kết nối - trách nhiệm xã hội. Dành cho: Doanh nhân, nhà tài trợ (1 người).',
            benefits: 'Đồ uống + ăn nhẹ + rượu vang + món khô. Ghế ngồi khu VIP - Green Business Class. Khu vực ngồi đẹp/riêng. Ưu tiên giao lưu - kết nối đối tác.',
            colorCode: '#FFD700',
            priority: 5,
        },
    ];

    for (const tier of tiers) {
        // Check if exists
        const existing = await prisma.ticketTier.findFirst({ where: { name: tier.name } });
        if (!existing) {
            await prisma.ticketTier.create({
                data: {
                    ...tier,
                    userMaxQuantity: 10,
                    isActive: true
                }
            });
            console.log(`Created ${tier.name}`);
        } else {
            console.log(`Skipped ${tier.name} (exists)`);
        }
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
