'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Instagram, Youtube, Phone, Mail, MapPin, ArrowUp } from 'lucide-react';
import { useState, useEffect } from 'react';

const footerLinks = {
  about: [
    { label: 'Giới thiệu', href: '/about' },
    { label: 'Các sân khấu', href: '/stages' },
    { label: 'Tin tức', href: '/news' },
    { label: 'Tuyển dụng', href: '/careers' },
  ],
  policies: [
    { label: 'Điều khoản sử dụng', href: '/terms' },
    { label: 'Chính sách đặt chỗ', href: '/booking-policy' },
    { label: 'Chính sách hủy', href: '/cancellation-policy' },
    { label: 'Chính sách bảo mật', href: '/privacy' },
  ],
  social: [
    { label: 'Facebook', href: 'https://facebook.com', icon: Facebook },
    { label: 'Instagram', href: 'https://instagram.com', icon: Instagram },
    { label: 'Youtube', href: 'https://youtube.com', icon: Youtube },
  ],
};

export function Footer() {
  const [showBackToTop, setShowBackToTop] = useState(false);

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
    <footer className="bg-dark-deeper border-t border-white/10">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="relative w-10 h-10 overflow-hidden rounded-lg transition-transform group-hover:scale-105">
                <Image
                  src="/logo.jpg"
                  alt="Logo"
                  fill
                  className="object-cover"
                />
              </div>
              <span className="font-display font-bold text-lg text-white">
                Music Travel
              </span>
            </Link>
            <p className="text-sm text-white/60 leading-relaxed">
              Sân khấu âm nhạc nơi giai điệu sống được cất lên. Đặt vé show nhạc và tour du lịch hàng đầu Việt Nam.
            </p>

            {/* Social Links */}
            <div className="flex gap-3 pt-2">
              {footerLinks.social.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-lg bg-white/5 text-white/60 hover:text-brand-400 hover:bg-white/10 transition-all"
                  aria-label={link.label}
                >
                  <link.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* About Links */}
          <div>
            <h3 className="font-display font-semibold text-white mb-4">VỀ CHÚNG TÔI</h3>
            <ul className="space-y-3">
              {footerLinks.about.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/60 hover:text-brand-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Policy Links */}
          <div>
            <h3 className="font-display font-semibold text-white mb-4">CHÍNH SÁCH</h3>
            <ul className="space-y-3">
              {footerLinks.policies.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/60 hover:text-brand-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-display font-semibold text-white mb-4">LIÊN HỆ</h3>
            <ul className="space-y-4">
              <li>
                <a
                  href="tel:0912946549"
                  className="flex items-center gap-3 text-sm text-white/60 hover:text-brand-400 transition-colors"
                >
                  <div className="p-2 rounded-lg bg-brand-500/10">
                    <Phone className="h-4 w-4 text-brand-400" />
                  </div>
                  <span>0912.946.549</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:info@musictravel.vn"
                  className="flex items-center gap-3 text-sm text-white/60 hover:text-brand-400 transition-colors"
                >
                  <div className="p-2 rounded-lg bg-brand-500/10">
                    <Mail className="h-4 w-4 text-brand-400" />
                  </div>
                  <span>info@musictravel.vn</span>
                </a>
              </li>
              <li className="flex items-start gap-3 text-sm text-white/60">
                <div className="p-2 rounded-lg bg-brand-500/10 mt-0.5">
                  <MapPin className="h-4 w-4 text-brand-400" />
                </div>
                <span>Đà Lạt, Lâm Đồng, Việt Nam</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-white/10 mt-10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-white/40 text-center md:text-left">
            © {new Date().getFullYear()} Music Travel. All Rights Reserved.
          </p>
          <div className="flex items-center gap-4">
            {/* Placeholder for certification badges */}
            <div className="text-xs text-white/30">
              Đã đăng ký Bộ Công Thương
            </div>
          </div>
        </div>
      </div>

      {/* Back to Top Button */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-6 right-6 p-3 rounded-full bg-brand-500 text-white shadow-neon transition-all duration-300 z-50 ${
          showBackToTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
        aria-label="Về đầu trang"
      >
        <ArrowUp className="h-5 w-5" />
      </button>
    </footer>
  );
}
