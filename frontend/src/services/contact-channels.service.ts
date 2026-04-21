import { get, post, patch, del } from '@/lib/api';
export enum ContactChannelType {
  PHONE = 'PHONE',
  ZALO = 'ZALO',
  MESSENGER = 'MESSENGER',
  EMAIL = 'EMAIL',
  WHATSAPP = 'WHATSAPP',
  FOOTER_LOGO_URL = 'FOOTER_LOGO_URL',
  FOOTER_LOGO_ALT = 'FOOTER_LOGO_ALT',
  FOOTER_BRAND_NAME = 'FOOTER_BRAND_NAME',
  FOOTER_BRAND_DESCRIPTION = 'FOOTER_BRAND_DESCRIPTION',
  FOOTER_SECTION_ABOUT_TITLE = 'FOOTER_SECTION_ABOUT_TITLE',
  FOOTER_SECTION_POLICY_TITLE = 'FOOTER_SECTION_POLICY_TITLE',
  FOOTER_SECTION_CONTACT_TITLE = 'FOOTER_SECTION_CONTACT_TITLE',
  FOOTER_ABOUT_LINK = 'FOOTER_ABOUT_LINK',
  FOOTER_POLICY_LINK = 'FOOTER_POLICY_LINK',
  FOOTER_SOCIAL_LINK = 'FOOTER_SOCIAL_LINK',
  FOOTER_CONTACT_PHONE = 'FOOTER_CONTACT_PHONE',
  FOOTER_CONTACT_EMAIL = 'FOOTER_CONTACT_EMAIL',
  FOOTER_CONTACT_ADDRESS = 'FOOTER_CONTACT_ADDRESS',
  FOOTER_COPYRIGHT_TEXT = 'FOOTER_COPYRIGHT_TEXT',
  FOOTER_CERTIFICATION_TEXT = 'FOOTER_CERTIFICATION_TEXT',
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
export interface UpdateContactChannelDto extends Partial<CreateContactChannelDto> {}
export const contactChannelService = {
  getAll: async (): Promise<ContactChannel[]> => {
    return get('/contact-channels');
  },
  getActive: async (): Promise<ContactChannel[]> => {
    return get('/contact-channels/active');
  },
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
