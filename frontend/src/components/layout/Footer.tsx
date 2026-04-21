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
  const logoUrl =
    safeConfigs['FOOTER_LOGO_URL'] || getSingleValue(channels, ContactChannelType.FOOTER_LOGO_URL);
  const logoAlt =
    safeConfigs['FOOTER_LOGO_ALT'] ||
    getSingleValue(channels, ContactChannelType.FOOTER_LOGO_ALT) ||
    getSingleValue(channels, ContactChannelType.FOOTER_BRAND_NAME);
  const brandName =
    safeConfigs['FOOTER_BRAND_NAME'] ||
    getSingleValue(channels, ContactChannelType.FOOTER_BRAND_NAME);
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
    <footer className="border-t border-gray-200 bg-brand-50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4 lg:gap-12">
          <div className="space-y-4">
            <Link href="/" className="group flex items-center gap-2">
              {logoUrl && (
                <div className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-brand-500/20 bg-white shadow-lg transition-all duration-300 group-hover:scale-105 group-hover:border-brand-500/40">
                  <Image
                    src={logoUrl}
                    alt={logoAlt || brandName}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </div>
              )}
              {brandName ? (
                <span className="font-display text-base font-bold text-gray-900">{brandName}</span>
              ) : (
                !logoUrl && (
                  <span className="font-display text-2xl font-black tracking-tight text-brand-600">
                    FSell
                  </span>
                )
              )}
            </Link>
            {brandDescription ? (
              <p className="text-xs leading-relaxed text-gray-600">{brandDescription}</p>
            ) : null}

            <div className="flex gap-3 pt-2">
              {socialLinks.map((link) => {
                const SocialIcon = resolveSocialIcon(link);
                return (
                  <a
                    key={link.id}
                    href={resolveHref(link)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg bg-brand-100 p-2 text-gray-600 transition-all hover:bg-brand-200 hover:text-brand-600"
                    aria-label={link.label}
                  >
                    <SocialIcon className="h-5 w-5" />
                  </a>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="mb-3 font-display text-sm font-bold text-gray-900">
              {displayAboutTitle}
            </h3>
            <ul className="space-y-3">
              {displayAboutLinks.map((link) => (
                <li key={link.id}>
                  <Link
                    href={link.value || resolveHref(link as any)}
                    className="text-xs text-gray-600 transition-colors hover:text-brand-600"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-3 font-display text-sm font-bold text-gray-900">
              {displayPolicyTitle}
            </h3>
            <ul className="space-y-3">
              {displayPolicyLinks.map((link) => (
                <li key={link.id}>
                  <Link
                    href={link.value || resolveHref(link as any)}
                    className="text-xs text-gray-600 transition-colors hover:text-brand-600"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-3 font-display text-sm font-bold text-gray-900">
              {displayContactTitle}
            </h3>
            <ul className="space-y-3">
              {displayPhones.map((channel) => (
                <li key={channel.id}>
                  <a
                    href={
                      (channel as any).value
                        ? `tel:${(channel as any).value.replace(/\s/g, '')}`
                        : resolveHref(channel as any)
                    }
                    className="group grid grid-cols-[40px_1fr] items-center gap-3 rounded-xl px-2 py-1.5 text-xs text-gray-700 transition-all hover:bg-white/60 hover:text-brand-700"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 ring-1 ring-brand-200/70 transition-colors group-hover:bg-brand-200">
                      <Phone className="h-4 w-4 text-brand-600" />
                    </div>
                    <span className="leading-tight">{channel.label || channel.value}</span>
                  </a>
                </li>
              ))}
              {displayEmails.map((channel) => (
                <li key={channel.id}>
                  <a
                    href={
                      (channel as any).value
                        ? `mailto:${(channel as any).value}`
                        : resolveHref(channel as any)
                    }
                    className="group grid grid-cols-[40px_1fr] items-center gap-3 rounded-xl px-2 py-1.5 text-xs text-gray-700 transition-all hover:bg-white/60 hover:text-brand-700"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 ring-1 ring-brand-200/70 transition-colors group-hover:bg-brand-200">
                      <Mail className="h-4 w-4 text-brand-600" />
                    </div>
                    <span className="break-all leading-tight">
                      {channel.label || channel.value}
                    </span>
                  </a>
                </li>
              ))}
              {displayAddresses.map((channel) => (
                <li
                  key={channel.id}
                  className="group grid grid-cols-[40px_1fr] items-center gap-3 rounded-xl px-2 py-1.5 text-xs text-gray-700 transition-all hover:bg-white/60"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 ring-1 ring-brand-200/70 transition-colors group-hover:bg-brand-200">
                    <MapPin className="h-4 w-4 text-brand-600" />
                  </div>
                  <span className="leading-tight">{channel.label || channel.value}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-gray-200 pt-8 md:flex-row">
          {copyrightText ? (
            <p className="text-center text-xs text-gray-500 md:text-left">{copyrightText}</p>
          ) : null}
          <div className="flex items-center gap-4">
            {certificationText ? (
              <div className="text-xs text-gray-400">{certificationText}</div>
            ) : null}
          </div>
        </div>
      </div>

      <button
        onClick={scrollToTop}
        className={`fixed bottom-6 right-6 z-50 rounded-full bg-brand-500 p-3 text-white shadow-neon transition-all duration-300 ${showBackToTop ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'}`}
        aria-label="Về đầu trang"
      >
        <ArrowUp className="h-5 w-5" />
      </button>
    </footer>
  );
}
