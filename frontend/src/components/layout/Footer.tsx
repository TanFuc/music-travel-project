'use client';
import { Link } from '@/components/common/Link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { Facebook, Instagram, Youtube, Phone, Mail, MapPin, ArrowUp } from 'lucide-react';
import { useState, useEffect } from 'react';
import {
  contactChannelService,
  ContactChannel,
  ContactChannelType,
} from '@/services/contact-channels.service';
import { get } from '@/lib/api';
const SOCIAL_ICON_BY_KEY = {
  facebook: Facebook,
  instagram: Instagram,
  youtube: Youtube,
} as const;
function getChannelsByType(channels: ContactChannel[], type: ContactChannelType) {
  return channels
    .filter((channel) => channel.type === type)
    .sort((a, b) => a.displayOrder - b.displayOrder);
}
function getSingleValue(channels: ContactChannel[], type: ContactChannelType): string {
  return getChannelsByType(channels, type)[0]?.value?.trim() || '';
}
function getSingleLabel(channels: ContactChannel[], type: ContactChannelType): string {
  return getChannelsByType(channels, type)[0]?.label?.trim() || '';
}
function resolveSocialIcon(channel: ContactChannel) {
  const key = String(channel.icon || channel.label || '').toLowerCase();
  return SOCIAL_ICON_BY_KEY[key as keyof typeof SOCIAL_ICON_BY_KEY] || Facebook;
}
function resolveHref(channel: ContactChannel): string {
  const raw = String(channel.value || '').trim();
  if (channel.type === ContactChannelType.FOOTER_CONTACT_PHONE) {
    return `tel:${raw.replace(/\s|\./g, '')}`;
  }
  if (channel.type === ContactChannelType.FOOTER_CONTACT_EMAIL) {
    return `mailto:${raw}`;
  }
  if (raw.startsWith('http://') || raw.startsWith('https://') || raw.startsWith('/')) {
    return raw;
  }
  return '/';
}
export function Footer() {
  const [showBackToTop, setShowBackToTop] = useState(false);
  const { data: channels = [] } = useQuery({
    queryKey: ['contact-channels-active'],
    queryFn: contactChannelService.getActive,
    staleTime: 5 * 60 * 1000,
  });
  const { data: configs } = useQuery({
    queryKey: ['system-configs-public'],
    queryFn: () => get<Record<string, any>>('/system-configs/public'),
    staleTime: 5 * 60 * 1000,
  });
  const safeConfigs =
    configs && typeof configs === 'object' && !Array.isArray(configs) ? configs : {};
  const brandDescription =
    safeConfigs['FOOTER_BRAND_DESCRIPTION'] ||
    getSingleValue(channels, ContactChannelType.FOOTER_BRAND_DESCRIPTION);
  const aboutTitle =
    safeConfigs['FOOTER_SECTION_ABOUT_TITLE'] ||
    getSingleValue(channels, ContactChannelType.FOOTER_SECTION_ABOUT_TITLE) ||
    getSingleLabel(channels, ContactChannelType.FOOTER_SECTION_ABOUT_TITLE);
  const policyTitle =
    safeConfigs['FOOTER_SECTION_POLICY_TITLE'] ||
    getSingleValue(channels, ContactChannelType.FOOTER_SECTION_POLICY_TITLE) ||
    getSingleLabel(channels, ContactChannelType.FOOTER_SECTION_POLICY_TITLE);
  const contactTitle =
    safeConfigs['FOOTER_SECTION_CONTACT_TITLE'] ||
    getSingleValue(channels, ContactChannelType.FOOTER_SECTION_CONTACT_TITLE) ||
    getSingleLabel(channels, ContactChannelType.FOOTER_SECTION_CONTACT_TITLE);
  const aboutLinks =
    safeConfigs['FOOTER_ABOUT_LINKS'] ||
    getChannelsByType(channels, ContactChannelType.FOOTER_ABOUT_LINK);
  const policyLinks =
    safeConfigs['FOOTER_POLICY_LINKS'] ||
    getChannelsByType(channels, ContactChannelType.FOOTER_POLICY_LINK);
  const socialLinks =
    safeConfigs['FOOTER_SOCIAL_LINKS'] ||
    getChannelsByType(channels, ContactChannelType.FOOTER_SOCIAL_LINK);
  const phoneChannels =
    safeConfigs['FOOTER_CONTACT_PHONES'] ||
    getChannelsByType(channels, ContactChannelType.FOOTER_CONTACT_PHONE);
  const emailChannels =
    safeConfigs['FOOTER_CONTACT_EMAILS'] ||
    getChannelsByType(channels, ContactChannelType.FOOTER_CONTACT_EMAIL);
  const addressChannels =
    safeConfigs['FOOTER_CONTACT_ADDRESSES'] ||
    getChannelsByType(channels, ContactChannelType.FOOTER_CONTACT_ADDRESS);
  const copyrightText =
    safeConfigs['FOOTER_COPYRIGHT_TEXT'] ||
    getSingleValue(channels, ContactChannelType.FOOTER_COPYRIGHT_TEXT) ||
    '© 2026 Mãi Cho Hành Tinh Xanh. All rights reserved.';
  const certificationText =
    safeConfigs['FOOTER_CERTIFICATION_TEXT'] ||
    getSingleValue(channels, ContactChannelType.FOOTER_CERTIFICATION_TEXT);
  const displayAboutTitle = aboutTitle || 'VỀ CHÚNG TÔI';
  const displayPolicyTitle = policyTitle || 'CHÍNH SÁCH';
  const displayContactTitle = contactTitle || 'LIÊN HỆ';
  const defaultAboutLinks = [
    { id: 1, label: 'Giới thiệu', value: '/about' },
    { id: 2, label: 'Lịch diễn', value: '/shows' },
    { id: 3, label: 'Tour khám phá', value: '/tours' },
  ];
  const displayAboutLinks = aboutLinks.length > 0 ? aboutLinks : defaultAboutLinks;
  const defaultPolicyLinks = [
    { id: 4, label: 'Điều khoản sử dụng', value: '/terms' },
    { id: 5, label: 'Chính sách bảo mật', value: '/privacy' },
    { id: 6, label: 'Hướng dẫn mua vé', value: '/guide' },
  ];
  const displayPolicyLinks = policyLinks.length > 0 ? policyLinks : defaultPolicyLinks;
  const defaultPhones = [{ id: 7, label: 'Hotline', value: '1900 1234' }];
  const displayPhones = phoneChannels.length > 0 ? phoneChannels : defaultPhones;
  const defaultEmails = [{ id: 8, label: 'Email', value: 'contact@fsell.vn' }];
  const displayEmails = emailChannels.length > 0 ? emailChannels : defaultEmails;
  const defaultAddresses = [{ id: 9, label: 'Địa chỉ', value: '123 Đường Sách, Q1, TP.HCM' }];
  const displayAddresses = addressChannels.length > 0 ? addressChannels : defaultAddresses;
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  return (
    <footer className="border-t border-brand-100 bg-[#FDFDFF] py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Link href="/" className="mb-6 flex items-center gap-3">
              <div className="relative h-12 w-12 overflow-hidden rounded-full border-2 border-brand-500/20 bg-white shadow-md transition-all duration-300 group-hover:scale-105 group-hover:border-brand-500/40">
                <Image
                  src="/logo.png"
                  alt="Mãi Cho Hành Tinh Xanh"
                  fill
                  className="object-cover"
                  sizes="48px"
                />
              </div>
              <span className="font-display text-xl font-black tracking-tight text-gray-900">
                Mãi Cho Hành Tinh Xanh
              </span>
            </Link>
            <p className="mb-6 max-w-sm text-sm leading-relaxed text-gray-500">
              {brandDescription ||
                'Hệ sinh thái kết nối Âm nhạc đỉnh cao, Du lịch trải nghiệm Xanh và hoạt động Cộng đồng bền vững. Cùng Bizmall lan tỏa những giá trị tốt đẹp đến hành tinh.'}
            </p>
            <div className="flex gap-4">
              {socialLinks.map((link: any) => {
                const SocialIcon = resolveSocialIcon(link);
                return (
                  <a
                    key={link.id}
                    href={resolveHref(link)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-brand-600 transition-all hover:bg-brand-600 hover:text-white"
                    aria-label={link.label}
                  >
                    <SocialIcon className="h-5 w-5" />
                  </a>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h3 className="mb-6 text-xs font-black uppercase tracking-widest text-brand-500">
                  {displayAboutTitle}
                </h3>
                <ul className="space-y-4">
                  {displayAboutLinks.map((link: any) => (
                    <li key={link.id}>
                      <Link
                        href={link.value || resolveHref(link as any)}
                        className="text-sm font-medium text-gray-600 transition-colors hover:text-brand-600"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="mb-6 text-xs font-black uppercase tracking-widest text-brand-500">
                  {displayPolicyTitle}
                </h3>
                <ul className="space-y-4">
                  {displayPolicyLinks.map((link: any) => (
                    <li key={link.id}>
                      <Link
                        href={link.value || resolveHref(link as any)}
                        className="text-sm font-medium text-gray-600 transition-colors hover:text-brand-600"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <h3 className="mb-6 text-xs font-black uppercase tracking-widest text-brand-500">
              {displayContactTitle}
            </h3>
            <ul className="space-y-4">
              {displayPhones.map((channel: any) => (
                <li key={channel.id}>
                  <a
                    href={`tel:${(channel as any).value?.replace(/\s/g, '') || ''}`}
                    className="flex items-center gap-3 text-sm font-medium text-gray-700 hover:text-brand-600"
                  >
                    <Phone className="h-4 w-4 text-brand-400" />
                    {channel.label || channel.value}
                  </a>
                </li>
              ))}
              {displayEmails.map((channel: any) => (
                <li key={channel.id}>
                  <a
                    href={`mailto:${channel.value || ''}`}
                    className="flex items-center gap-3 text-sm font-medium text-gray-700 hover:text-brand-600"
                  >
                    <Mail className="h-4 w-4 text-brand-400" />
                    {channel.label || channel.value}
                  </a>
                </li>
              ))}
              {displayAddresses.map((channel: any) => (
                <li
                  key={channel.id}
                  className="flex items-start gap-3 text-sm font-medium text-gray-700"
                >
                  <MapPin className="mt-1 h-4 w-4 flex-shrink-0 text-brand-400" />
                  <span>{channel.label || channel.value}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-6 border-t border-brand-50 pt-8 md:flex-row">
          <p className="text-sm font-medium text-gray-500">{copyrightText}</p>
          <div className="flex items-center gap-6">
            <span className="text-sm font-medium text-gray-400">
              {certificationText || 'Bản quyền thuộc về FSell Technology'}
            </span>
          </div>
        </div>
      </div>

      <button
        onClick={scrollToTop}
        className={`fixed bottom-8 right-8 z-50 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-xl shadow-brand-600/20 transition-all duration-300 hover:bg-brand-700 active:scale-95 ${showBackToTop ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'}`}
        aria-label="Về đầu trang"
      >
        <ArrowUp className="h-5 w-5" />
      </button>
    </footer>
  );
}
