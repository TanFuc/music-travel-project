import { get, post, patch, del } from '@/lib/api';

export enum PaymentMethod {
    MOMO = 'MOMO',
    VNPAY = 'VNPAY',
    BANKING = 'BANKING',
    WALLET = 'WALLET',
    CASH = 'CASH',
    PAYOS = 'PAYOS',
}

export interface PaymentMethodConfig {
    id: number;
    method: PaymentMethod;
    name: string;
    discountPercentage: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreatePaymentMethodConfigDto {
    method: PaymentMethod;
    name: string;
    discountPercentage: number;
    isActive?: boolean;
}

export interface UpdatePaymentMethodConfigDto extends Partial<CreatePaymentMethodConfigDto> { }

export const paymentMethodConfigService = {
    // Public endpoints
    getAllActive: async (): Promise<PaymentMethodConfig[]> => {
        return get('/payment-method-configs/active');
    },

    // Admin endpoints
    getAll: async (): Promise<PaymentMethodConfig[]> => {
        return get('/payment-method-configs');
    },

    getById: async (id: number): Promise<PaymentMethodConfig> => {
        return get(`/payment-method-configs/${id}`);
    },

    create: async (data: CreatePaymentMethodConfigDto): Promise<PaymentMethodConfig> => {
        return post('/payment-method-configs', data);
    },

    update: async (id: number, data: UpdatePaymentMethodConfigDto): Promise<PaymentMethodConfig> => {
        return patch(`/payment-method-configs/${id}`, data);
    },

    delete: async (id: number): Promise<void> => {
        return del(`/payment-method-configs/${id}`);
    },
};
