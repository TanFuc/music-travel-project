'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Calendar, Users, Clock, ArrowRight } from 'lucide-react';

interface Tour {
  id: number;
  title: string;
  slug: string;
  thumbnailUrl?: string;
  duration: string;
  departureLoc: { name: string };
  destinationLoc: { name: string };
  minPrice: number | null;
  nextSchedule?: {
    startDate: string;
    price: number;
    availableSlots: number;
  };
}

// Mock data
const mockTours: Tour[] = [
  {
    id: 1,
    title: 'Tour Đà Lạt 3N2Đ - Combo Vé Show Mây Lang Thang',
    slug: 'tour-da-lat-3n2d-combo-may-lang-thang',
    thumbnailUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=500&fit=crop',
    duration: '3 ngày 2 đêm',
    departureLoc: { name: 'Sài Gòn' },
    destinationLoc: { name: 'Đà Lạt' },
    minPrice: 2990000,
    nextSchedule: {
      startDate: '2025-01-28',
      price: 2990000,
      availableSlots: 12,
    },
  },
  {
    id: 2,
    title: 'Tour Hà Nội - Ninh Bình 2N1Đ + Show Acoustic',
    slug: 'tour-ha-noi-ninh-binh-2n1d',
    thumbnailUrl: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=800&h=500&fit=crop',
    duration: '2 ngày 1 đêm',
    departureLoc: { name: 'Hà Nội' },
    destinationLoc: { name: 'Ninh Bình' },
    minPrice: 1890000,
    nextSchedule: {
      startDate: '2025-02-05',
      price: 1890000,
      availableSlots: 8,
    },
  },
  {
    id: 3,
    title: 'Tour Phú Quốc 4N3Đ - Sunset Concert',
    slug: 'tour-phu-quoc-4n3d-sunset-concert',
    thumbnailUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=500&fit=crop',
    duration: '4 ngày 3 đêm',
    departureLoc: { name: 'Sài Gòn' },
    destinationLoc: { name: 'Phú Quốc' },
    minPrice: 4590000,
    nextSchedule: {
      startDate: '2025-02-10',
      price: 4590000,
      availableSlots: 20,
    },
  },
];

export function ToursSection() {
  const [tours, setTours] = useState<Tour[]>(mockTours);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/tours?limit=3`)
      .then((res) => res.json())
      .then((data) => {
        if (data.data && Array.isArray(data.data) && data.data.length > 0) {
          setTours(data.data);
        }
      })
      .catch(() => {
        // Use mock data
      });
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-10 text-center">
          <h2 className="section-title flex items-center justify-center gap-3">
            <span className="text-3xl">🌄</span>
            TOUR DU LỊCH KẾT HỢP SHOW
          </h2>
          <p className="mt-2 text-white/60 max-w-2xl mx-auto">
            Đến Đà Lạt - Xem show - Trải nghiệm trọn vẹn. Combo tour + vé show tiết kiệm đến 30%
          </p>
        </div>

        {/* Tours List */}
        <div className="space-y-6">
          {tours.map((tour, index) => (
            <Link
              key={tour.id}
              href={`/tours/${tour.slug}`}
              className="group block glass-card card-hover overflow-hidden animate-fadeIn opacity-0"
              style={{ animationDelay: `${index * 0.15}s`, animationFillMode: 'forwards' }}
            >
              <div className="flex flex-col lg:flex-row">
                {/* Image */}
                <div className="relative lg:w-1/3 aspect-video lg:aspect-auto overflow-hidden">
                  <Image
                    src={tour.thumbnailUrl || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=500&fit=crop'}
                    alt={tour.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                {/* Content */}
                <div className="flex-1 p-6 lg:p-8 flex flex-col justify-between">
                  <div>
                    <h3 className="font-display font-bold text-xl lg:text-2xl text-white group-hover:text-brand-400 transition-colors mb-4">
                      {tour.title}
                    </h3>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2 text-white/70">
                        <MapPin className="w-4 h-4 text-brand-400" />
                        <span>Từ: {tour.departureLoc.name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-white/70">
                        <MapPin className="w-4 h-4 text-accent-500" />
                        <span>Đến: {tour.destinationLoc.name}</span>
                      </div>
                      {tour.nextSchedule && (
                        <>
                          <div className="flex items-center gap-2 text-white/70">
                            <Calendar className="w-4 h-4 text-brand-400" />
                            <span>{formatDate(tour.nextSchedule.startDate)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-white/70">
                            <Users className="w-4 h-4 text-brand-400" />
                            <span>Còn {tour.nextSchedule.availableSlots} slot</span>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="mt-3 flex items-center gap-2 text-white/70 text-sm">
                      <Clock className="w-4 h-4 text-brand-400" />
                      <span>{tour.duration}</span>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-between">
                    <div>
                      <span className="text-white/50 text-sm">Giá từ</span>
                      <div className="font-accent font-bold text-2xl text-brand-400">
                        {tour.minPrice ? `${formatPrice(tour.minPrice)}đ` : 'Liên hệ'}
                        <span className="text-white/50 text-sm font-normal">/người</span>
                      </div>
                    </div>

                    <span className="px-6 py-3 rounded-xl btn-primary inline-flex items-center gap-2 font-semibold">
                      ĐẶT TOUR
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* View All Button */}
        <div className="mt-10 text-center">
          <Link
            href="/tours"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl btn-ghost text-white font-medium group"
          >
            XEM TẤT CẢ TOUR
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
