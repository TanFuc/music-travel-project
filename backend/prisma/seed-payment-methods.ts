import { PrismaClient, PaymentMethod } from '@prisma/client';

export async function seedPaymentMethods(prisma: PrismaClient) {
    console.log('💳 Seeding payment methods...');

    const methods = [
        {
            method: PaymentMethod.MOMO,
            name: 'Ví điện tử MoMo',
            discountPercentage: 0,
            isActive: true,
        },
        {
            method: PaymentMethod.VNPAY,
            name: 'Ví VNPAY / VNPAY-QR',
            discountPercentage: 0,
            isActive: true,
        },
        {
            method: PaymentMethod.BANKING,
            name: 'Chuyển khoản Ngân hàng',
            discountPercentage: 0,
            isActive: true,
        },
        {
            method: PaymentMethod.PAYOS,
            name: 'Thanh toán qua PayOS',
            discountPercentage: 0,
            isActive: true,
        },
        {
            method: PaymentMethod.WALLET,
            name: 'Ví cá nhân',
            discountPercentage: 0,
            isActive: true,
        }
    ];

    for (const m of methods) {
        // Check if method is valid in current enum to avoid errors if some don't exist
        if (Object.values(PaymentMethod).includes(m.method)) {
            await prisma.paymentMethodConfig.upsert({
                where: { method: m.method },
                update: {}, // Keep existing config if any
                create: {
                    method: m.method,
                    name: m.name,
                    discountPercentage: m.discountPercentage,
                    isActive: m.isActive
                },
            });
        }
    }
}
