'use client';
import { useQuery } from '@tanstack/react-query';
import { Phone, MessageCircle, Mail, Send } from 'lucide-react';
import {
  contactChannelService,
  ContactChannel,
  ContactChannelType,
} from '@/services/contact-channels.service';
import { useState } from 'react';
const CHANNEL_ICONS: Record<ContactChannelType, React.ReactNode> = {
  PHONE: <Phone className="h-5 w-5" />,
  ZALO: <MessageCircle className="h-5 w-5" />,
  MESSENGER: <Send className="h-5 w-5" />,
  EMAIL: <Mail className="h-5 w-5" />,
  WHATSAPP: <MessageCircle className="h-5 w-5" />,
  FOOTER_LOGO_URL: <MessageCircle className="h-5 w-5" />,
  FOOTER_LOGO_ALT: <MessageCircle className="h-5 w-5" />,
  FOOTER_BRAND_NAME: <MessageCircle className="h-5 w-5" />,
  FOOTER_BRAND_DESCRIPTION: <MessageCircle className="h-5 w-5" />,
  FOOTER_SECTION_ABOUT_TITLE: <MessageCircle className="h-5 w-5" />,
  FOOTER_SECTION_POLICY_TITLE: <MessageCircle className="h-5 w-5" />,
  FOOTER_SECTION_CONTACT_TITLE: <MessageCircle className="h-5 w-5" />,
  FOOTER_ABOUT_LINK: <MessageCircle className="h-5 w-5" />,
  FOOTER_POLICY_LINK: <MessageCircle className="h-5 w-5" />,
  FOOTER_SOCIAL_LINK: <MessageCircle className="h-5 w-5" />,
  FOOTER_CONTACT_PHONE: <Phone className="h-5 w-5" />,
  FOOTER_CONTACT_EMAIL: <Mail className="h-5 w-5" />,
  FOOTER_CONTACT_ADDRESS: <MessageCircle className="h-5 w-5" />,
  FOOTER_COPYRIGHT_TEXT: <MessageCircle className="h-5 w-5" />,
  FOOTER_CERTIFICATION_TEXT: <MessageCircle className="h-5 w-5" />,
};
const DEFAULT_COLORS: Record<ContactChannelType, string> = {
  PHONE: '#10b981',
  ZALO: '#0068ff',
  MESSENGER: '#0084ff',
  EMAIL: '#ea4335',
  WHATSAPP: '#25d366',
  FOOTER_LOGO_URL: '#10b981',
  FOOTER_LOGO_ALT: '#10b981',
  FOOTER_BRAND_NAME: '#10b981',
  FOOTER_BRAND_DESCRIPTION: '#10b981',
  FOOTER_SECTION_ABOUT_TITLE: '#10b981',
  FOOTER_SECTION_POLICY_TITLE: '#10b981',
  FOOTER_SECTION_CONTACT_TITLE: '#10b981',
  FOOTER_ABOUT_LINK: '#10b981',
  FOOTER_POLICY_LINK: '#10b981',
  FOOTER_SOCIAL_LINK: '#10b981',
  FOOTER_CONTACT_PHONE: '#10b981',
  FOOTER_CONTACT_EMAIL: '#ea4335',
  FOOTER_CONTACT_ADDRESS: '#10b981',
  FOOTER_COPYRIGHT_TEXT: '#10b981',
  FOOTER_CERTIFICATION_TEXT: '#10b981',
};
const FLOATING_CHANNEL_TYPES = new Set<ContactChannelType>([
  ContactChannelType.PHONE,
  ContactChannelType.ZALO,
  ContactChannelType.MESSENGER,
  ContactChannelType.EMAIL,
  ContactChannelType.WHATSAPP,
]);
export default function FloatingContactButtons() {
  const [isExpanded, setIsExpanded] = useState(false);
  const { data: channels = [] } = useQuery({
    queryKey: ['contact-channels-active'],
    queryFn: contactChannelService.getActive,
    staleTime: 5 * 60 * 1000,
  });
  const floatingChannels = channels.filter((channel) => FLOATING_CHANNEL_TYPES.has(channel.type));
  if (!floatingChannels.length) return null;
  const handleChannelClick = (channel: ContactChannel) => {
    let url = '';
    switch (channel.type) {
      case ContactChannelType.PHONE:
        url = `tel:${channel.value}`;
        break;
      case ContactChannelType.ZALO:
        url = `https://zalo.me/${channel.value}`;
        break;
      case ContactChannelType.MESSENGER:
        url = channel.value.startsWith('http') ? channel.value : `https://m.me/${channel.value}`;
        break;
      case ContactChannelType.EMAIL:
        url = `mailto:${channel.value}`;
        break;
      case ContactChannelType.WHATSAPP:
        url = `https://wa.me/${channel.value.replace(/[^0-9]/g, '')}`;
        break;
    }
    if (url) {
      window.open(url, '_blank');
    }
  };
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col-reverse items-end gap-3">
      {isExpanded &&
        floatingChannels.map((channel) => (
          <button
            key={channel.id}
            onClick={() => handleChannelClick(channel)}
            className="group flex items-center gap-3 overflow-hidden rounded-full bg-white shadow-lg transition-all duration-300 hover:shadow-xl"
            style={{
              animation: 'slideInRight 0.3s ease-out',
            }}
          >
            <div
              className="flex h-12 w-12 items-center justify-center rounded-full text-white"
              style={{ backgroundColor: channel.colorCode || DEFAULT_COLORS[channel.type] }}
            >
              {CHANNEL_ICONS[channel.type]}
            </div>

            <span className="whitespace-nowrap pr-4 font-medium text-neutral-700">
              {channel.label}
            </span>
          </button>
        ))}

      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-white shadow-lg transition-all duration-300 hover:bg-brand-700 hover:shadow-xl"
        aria-label={isExpanded ? 'Đóng menu liên hệ' : 'Mở menu liên hệ'}
      >
        {isExpanded ? (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
          <MessageCircle className="h-6 w-6" />
        )}
      </button>

      {!isExpanded && (
        <div className="pointer-events-none absolute bottom-0 right-0 h-14 w-14 animate-ping rounded-full bg-brand-600 opacity-20" />
      )}

      <style jsx>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(100px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}
