import { get, post, patch, del } from '@/lib/api';

export enum ContactChannelType {
    PHONE = 'PHONE',
    ZALO = 'ZALO',
    MESSENGER = 'MESSENGER',
    EMAIL = 'EMAIL',
    WHATSAPP = 'WHATSAPP',
}

export interface ContactChannel {
    id: number;
    type: ContactChannelType;
    label: string;
    value: string;
    icon?: string;
    colorCode?: string;
    displayOrder: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateContactChannelDto {
    type: ContactChannelType;
    label: string;
    value: string;
    icon?: string;
    colorCode?: string;
    displayOrder?: number;
    isActive?: boolean;
}

export interface UpdateContactChannelDto extends Partial<CreateContactChannelDto> { }

export const contactChannelService = {
    // Public endpoints
    getAll: async (): Promise<ContactChannel[]> => {
        return get('/contact-channels');
    },

    getActive: async (): Promise<ContactChannel[]> => {
        return get('/contact-channels/active');
    },

    // Admin endpoints
    getById: async (id: number): Promise<ContactChannel> => {
        return get(`/contact-channels/${id}`);
    },

    create: async (data: CreateContactChannelDto): Promise<ContactChannel> => {
        return post('/contact-channels', data);
    },

    update: async (id: number, data: UpdateContactChannelDto): Promise<ContactChannel> => {
        return patch(`/contact-channels/${id}`, data);
    },

    delete: async (id: number): Promise<void> => {
        return del(`/contact-channels/${id}`);
    },
};
