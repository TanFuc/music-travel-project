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
  const socialLinks =
    safeConfigs['FOOTER_SOCIAL_LINKS'] ||
    getChannelsByType(channels, ContactChannelType.FOOTER_SOCIAL_LINK);
  const copyrightText =
    safeConfigs['FOOTER_COPYRIGHT_TEXT'] ||
    getSingleValue(channels, ContactChannelType.FOOTER_COPYRIGHT_TEXT) ||
    '© 2026 Mãi Cho Hành Tinh Xanh. All rights reserved.';
  const certificationText =
    safeConfigs['FOOTER_CERTIFICATION_TEXT'] ||
    getSingleValue(channels, ContactChannelType.FOOTER_CERTIFICATION_TEXT);
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
                  ĐIỀU KHOẢN VÀ CHÍNH SÁCH
                </h3>
                <ul className="space-y-4">
                  {[
                    { label: 'Điều khoản giao dịch', value: '/p/dieu-khoan-giao-dich' },
                    { label: 'Chính sách thanh toán', value: '/p/chinh-sach-thanh-toan' },
                    { label: 'Chính sách bảo mật', value: '/p/chinh-sach-bao-mat' },
                    { label: 'Chính sách đổi trả', value: '/p/chinh-sach-doi-tra' },
                  ].map((link, idx) => (
                    <li key={idx}>
                      <Link
                        href={link.value}
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
                  HỖ TRỢ KHÁCH HÀNG
                </h3>
                <ul className="space-y-4">
                  {[
                    { label: 'Câu hỏi thường gặp', value: '/p/faq' },
                    { label: 'Hướng dẫn đặt vé', value: '/p/huong-dan-dat-ve' },
                    { label: 'Liên hệ với chúng tôi', value: '/p/lien-he' },
                    { label: 'Đăng ký biểu diễn', value: '/p/dang-ky-bieu-dien' },
                  ].map((link, idx) => (
                    <li key={idx}>
                      <Link
                        href={link.value}
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
              CÔNG TY CỔ PHẦN BIZ MALL VIỆT NAM
            </h3>
            <ul className="space-y-4">
              <li className="text-sm font-medium text-gray-700">
                <span className="text-gray-400">MST:</span> 0111282511
              </li>
              <li className="text-sm font-medium text-gray-700">
                <span className="text-gray-400">Đại diện:</span> Lê Ngọc Hiền
              </li>
              <li className="flex items-start gap-3 text-sm font-medium text-gray-700">
                <MapPin className="mt-1 h-4 w-4 flex-shrink-0 text-brand-400" />
                <span>Tòa nhà IC, Số 82 phố Duy Tân, phường Cầu Giấy, TP. Hà Nội</span>
              </li>
              <li>
                <a
                  href="tel:0902348452"
                  className="flex items-center gap-3 text-sm font-medium text-gray-700 hover:text-brand-600"
                >
                  <Phone className="h-4 w-4 text-brand-400" />
                  0902 348 452
                </a>
              </li>
              <li>
                <a
                  href="mailto:Vietnam.bizmall@gmail.com"
                  className="flex items-center gap-3 text-sm font-medium text-gray-700 hover:text-brand-600"
                >
                  <Mail className="h-4 w-4 text-brand-400" />
                  Vietnam.bizmall@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-6 border-t border-brand-50 pt-8 md:flex-row">
          <p className="text-sm font-medium text-gray-500">{copyrightText}</p>
          <div className="flex items-center gap-6">
            <span className="text-sm font-medium text-gray-400">
              {certificationText || 'Bản quyền thuộc về CÔNG TY CỔ PHẦN BIZ MALL VIỆT NAM'}
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
