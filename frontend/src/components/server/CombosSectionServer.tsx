import Image from 'next/image';
import { Link } from '@/components/common/Link';
import { MapPin, Clock, ArrowRight, Zap, Music } from 'lucide-react';
interface Tour {
  id: number;
  title: string;
  slug: string;
  thumbnailUrl?: string;
  duration: string;
  departureLoc: {
    name: string;
  } | null;
  destinationLoc: {
    name: string;
  } | null;
  linkedShow?: {
    id: number;
    title: string;
    slug: string;
    thumbnailUrl?: string;
    stage?: {
      name: string;
      branch?: {
        name: string;
      };
    };
  } | null;
  linkedShowId?: number | null;
  minPrice: number | null;
  nextSchedule?: {
    startDate: string;
    price: number;
    availableSlots: number;
  } | null;
}
interface CombosSectionServerProps {
  combos: Tour[];
  title?: string;
  subtitle?: string;
  icon?: string;
}
function formatPrice(price: number) {
  return new Intl.NumberFormat('vi-VN').format(price);
}
export function CombosSectionServer({
  combos,
  title = 'COMBO TOUR & SHOW',
  subtitle = 'Sự kết hợp hoàn hảo giữa du lịch và âm nhạc. Trọn gói vé show, xe đưa đón và khách sạn.',
  icon = '🎟️',
}: CombosSectionServerProps) {
  if (!combos || combos.length === 0) {
    return null;
  }
  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <div className="animate-bounce-slow mb-4 inline-flex items-center justify-center rounded-2xl bg-brand-100 p-3 text-2xl">
            {icon}
          </div>
          <h2 className="mb-4 font-display text-3xl font-black uppercase tracking-tight text-gray-900 md:text-4xl">
            {title.includes(' ') ? (
              <>
                {title.split(' ').slice(0, -2).join(' ')}{' '}
                <span className="text-brand-600">{title.split(' ').slice(-2).join(' ')}</span>
              </>
            ) : (
              title
            )}
          </h2>
          <p className="mx-auto max-w-2xl text-base leading-relaxed text-gray-600">
            {subtitle}
            <span className="ml-1 font-semibold text-brand-600"> Tiết kiệm hơn khi đặt combo</span>
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {combos.map((combo) => (
            <Link
              key={combo.id}
              href={`/combo/${combo.slug}`}
              className="group flex h-full flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-lg transition-all duration-300 hover:shadow-2xl hover:shadow-brand-500/10"
            >
              <div className="relative aspect-[16/9] overflow-hidden">
                <Image
                  src={
                    combo.thumbnailUrl ||
                    combo.linkedShow?.thumbnailUrl ||
                    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80'
                  }
                  alt={combo.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="absolute left-4 top-4">
                  <span className="flex items-center gap-1 rounded-lg bg-brand-600/90 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg backdrop-blur-md">
                    <Zap className="h-3 w-3 fill-current" />
                    Siêu Combo
                  </span>
                </div>
                {combo.duration && (
                  <div className="absolute bottom-4 right-4">
                    <span className="flex items-center gap-1.5 rounded-lg bg-black/60 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-md">
                      <Clock className="h-3.5 w-3.5 text-brand-400" />
                      {combo.duration}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex flex-1 flex-col p-6 md:p-8">
                <h3 className="mb-3 line-clamp-2 font-display text-xl font-bold text-gray-900 transition-colors group-hover:text-brand-600">
                  {combo.title}
                </h3>

                {combo.linkedShow && (
                  <div className="mb-4 flex items-center gap-2 rounded-xl bg-indigo-50 px-3 py-2 text-sm">
                    <Music className="h-4 w-4 flex-shrink-0 text-indigo-500" />
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-indigo-700">
                        {combo.linkedShow.title}
                      </p>
                      {combo.linkedShow.stage?.name && (
                        <p className="text-xs text-indigo-500">{combo.linkedShow.stage.name}</p>
                      )}
                    </div>
                  </div>
                )}

                <div className="mb-6 flex flex-col gap-2">
                  {combo.departureLoc && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-brand-50">
                        <MapPin className="h-3.5 w-3.5 text-brand-500" />
                      </div>
                      <span className="font-medium">Khởi hành:</span>
                      <span className="text-gray-900">{combo.departureLoc.name}</span>
                    </div>
                  )}
                  {combo.destinationLoc && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-brand-50">
                        <MapPin className="h-3.5 w-3.5 text-brand-600" />
                      </div>
                      <span className="font-medium">Điểm đến:</span>
                      <span className="text-gray-900">{combo.destinationLoc.name}</span>
                    </div>
                  )}
                </div>

                <div className="mt-auto flex items-center justify-between border-t border-dashed border-gray-200 pt-6">
                  <div>
                    <p className="mb-0.5 text-xs font-medium uppercase tracking-wider text-gray-400">
                      Giá combo từ
                    </p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black text-brand-600">
                        {combo.minPrice ? formatPrice(combo.minPrice) : 'Liên hệ'}
                      </span>
                      {combo.minPrice && <span className="text-xs font-bold text-gray-400">₫</span>}
                    </div>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-brand-600 transition-colors duration-300 group-hover:bg-brand-600 group-hover:text-white">
                    <ArrowRight className="h-5 w-5" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/combo"
            className="btn-ghost group inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-medium text-gray-700"
          >
            XEM TẤT CẢ COMBO
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
