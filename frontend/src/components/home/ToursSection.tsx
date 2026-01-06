'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Calendar, Users, Clock, ArrowRight, Loader2 } from 'lucide-react';

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

export function ToursSection() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTours = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/tours?limit=3`
        );
        const data = await res.json();

        if (data.data && Array.isArray(data.data)) {
          setTours(data.data);
        } else if (Array.isArray(data)) {
          setTours(data);
        }
      } catch (error) {
        console.error('Failed to fetch tours:', error);
        setTours([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTours();
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
          <p className="mt-2 text-gray-600 max-w-2xl mx-auto">
            Đến Đà Lạt - Xem show - Trải nghiệm trọn vẹn. Combo tour + vé show tiết kiệm đến 30%
          </p>
        </div>

        {/* Tours List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
          </div>
        ) : tours.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Chưa có tour nào</p>
          </div>
        ) : (
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
                      <h3 className="font-display font-bold text-xl lg:text-2xl text-gray-900 group-hover:text-brand-600 transition-colors mb-4">
                        {tour.title}
                      </h3>

                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin className="w-4 h-4 text-brand-400" />
                          <span>Từ: {tour.departureLoc.name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin className="w-4 h-4 text-accent-500" />
                          <span>Đến: {tour.destinationLoc.name}</span>
                        </div>
                        {tour.nextSchedule && (
                          <>
                            <div className="flex items-center gap-2 text-gray-600">
                              <Calendar className="w-4 h-4 text-brand-400" />
                              <span>{formatDate(tour.nextSchedule.startDate)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <Users className="w-4 h-4 text-brand-400" />
                              <span>Còn {tour.nextSchedule.availableSlots} slot</span>
                            </div>
                          </>
                        )}
                      </div>

                      <div className="mt-3 flex items-center gap-2 text-gray-600 text-sm">
                        <Clock className="w-4 h-4 text-brand-400" />
                        <span>{tour.duration}</span>
                      </div>
                    </div>

                    <div className="mt-6 flex items-center justify-between">
                      <div>
                        <span className="text-gray-500 text-sm">Giá từ</span>
                        <div className="font-accent font-bold text-2xl text-brand-600">
                          {tour.minPrice ? `${formatPrice(tour.minPrice)}đ` : 'Liên hệ'}
                          <span className="text-gray-500 text-sm font-normal">/người</span>
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
        )}

        {/* View All Button */}
        <div className="mt-10 text-center">
          <Link
            href="/tours"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl btn-ghost text-gray-700 font-medium group"
          >
            XEM TẤT CẢ TOUR
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
