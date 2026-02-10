'use client';

import { useQuery } from '@tanstack/react-query';
import { Phone, MessageCircle, Mail, Send } from 'lucide-react';
import { contactChannelService, ContactChannel, ContactChannelType } from '@/services/contact-channels.service';
import { useState } from 'react';

const CHANNEL_ICONS: Record<ContactChannelType, React.ReactNode> = {
    PHONE: <Phone className="h-5 w-5" />,
    ZALO: <MessageCircle className="h-5 w-5" />,
    MESSENGER: <Send className="h-5 w-5" />,
    EMAIL: <Mail className="h-5 w-5" />,
    WHATSAPP: <MessageCircle className="h-5 w-5" />,
};

const DEFAULT_COLORS: Record<ContactChannelType, string> = {
    PHONE: '#10b981',
    ZALO: '#0068ff',
    MESSENGER: '#0084ff',
    EMAIL: '#ea4335',
    WHATSAPP: '#25d366',
};

export default function FloatingContactButtons() {
    const [isExpanded, setIsExpanded] = useState(false);

    const { data: channels = [] } = useQuery({
        queryKey: ['contact-channels-active'],
        queryFn: contactChannelService.getActive,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    if (!channels.length) return null;

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
                url = channel.value.startsWith('http')
                    ? channel.value
                    : `https://m.me/${channel.value}`;
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
            {/* Individual Channel Buttons */}
            {isExpanded && channels.map((channel) => (
                <button
                    key={channel.id}
                    onClick={() => handleChannelClick(channel)}
                    className="group flex items-center gap-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
                    style={{
                        animation: 'slideInRight 0.3s ease-out',
                    }}
                >
                    {/* Icon */}
                    <div
                        className="flex items-center justify-center w-12 h-12 rounded-full text-white"
                        style={{ backgroundColor: channel.colorCode || DEFAULT_COLORS[channel.type] }}
                    >
                        {CHANNEL_ICONS[channel.type]}
                    </div>

                    {/* Label */}
                    <span className="pr-4 font-medium text-neutral-700 whitespace-nowrap">
                        {channel.label}
                    </span>
                </button>
            ))}

            {/* Main Toggle Button */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center justify-center w-14 h-14 bg-brand-600 hover:bg-brand-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                aria-label={isExpanded ? 'Đóng menu liên hệ' : 'Mở menu liên hệ'}
            >
                {isExpanded ? (
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                ) : (
                    <MessageCircle className="h-6 w-6" />
                )}
            </button>

            {/* Pulse Animation */}
            {!isExpanded && (
                <div className="absolute bottom-0 right-0 w-14 h-14 bg-brand-600 rounded-full animate-ping opacity-20 pointer-events-none" />
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
