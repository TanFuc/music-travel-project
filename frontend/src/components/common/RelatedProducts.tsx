'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Link } from '@/components/common/Link';
import { Calendar, MapPin, Clock, ArrowRight, Sparkles } from 'lucide-react';
import { formatPrice, formatDateTime } from '@/lib/utils';
import { get } from '@/lib/api';
import { motion } from 'framer-motion';
interface RelatedProduct {
  id: number;
  title: string;
  slug: string;
  thumbnailUrl: string | null;
  minPrice: number | null;
  performTime?: string;
  duration?: string;
  stage?: {
    name: string;
    location: {
      name: string;
    };
  };
  destinationLoc?: {
    name: string;
  };
}
interface RelatedProductsProps {
  currentId: number;
  type: 'show' | 'tour' | 'combo';
  title?: string;
}
export function RelatedProducts({ currentId, type, title }: RelatedProductsProps) {
  const [products, setProducts] = useState<RelatedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  useEffect(() => {
    const fetchRelated = async () => {
      setLoading(true);
      setError(false);
      try {
        const endpoint =
          type === 'show'
            ? `/shows/${currentId}/related`
            : type === 'tour'
              ? `/tours/${currentId}/related`
              : `/combos/${currentId}/related`;
        const data = await get<RelatedProduct[]>(endpoint);
        if (Array.isArray(data)) {
          setProducts(data);
        }
      } catch (error) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchRelated();
  }, [currentId, type]);
  if (loading) {
    return (
      <section className="mt-24 py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 h-20 w-64 animate-pulse rounded-2xl bg-neutral-100" />
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-[4/5] animate-pulse rounded-[2.5rem] bg-neutral-100" />
            ))}
          </div>
        </div>
      </section>
    );
  }
  if (products.length === 0) {
    return null;
  }
  const getHref = (product: RelatedProduct) => {
    if (type === 'show') return `/shows/${product.slug}`;
    if (type === 'tour') return `/tours/${product.slug}`;
    return `/combo/${product.slug}`;
  };
  return (
    <section className="relative mt-24 py-20" id="related-products-section">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-brand-50/10 to-brand-100/5" />
      <div className="absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-brand-200/50 to-transparent" />

      <div className="container mx-auto px-4">
        <div className="mb-12 flex flex-col items-end justify-between gap-6 px-2 md:flex-row">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="mb-3 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-brand-500" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-600">
                Gợi ý dành cho bạn
              </span>
            </div>
            <h2 className="font-display text-3xl font-black tracking-tight text-gray-900 sm:text-5xl">
              {title ||
                (type === 'show'
                  ? 'Show tương tự'
                  : type === 'tour'
                    ? 'Tour gợi ý'
                    : 'Combo hấp dẫn khác')}
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Link
              href={type === 'show' ? '/shows' : type === 'tour' ? '/tours' : '/combo'}
              className="group flex items-center gap-3 rounded-2xl bg-white px-8 py-4 text-sm font-bold text-brand-600 shadow-xl shadow-brand-900/5 ring-1 ring-brand-100 transition-all hover:bg-brand-600 hover:text-white"
            >
              Xem tất cả
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                href={getHref(product)}
                className="group flex h-full flex-col overflow-hidden rounded-[2.5rem] border border-white bg-white shadow-xl shadow-brand-900/5 transition-all duration-500 hover:-translate-y-3 hover:border-brand-200 hover:shadow-2xl hover:shadow-brand-500/20"
              >
                <div className="relative aspect-[4/5] w-full overflow-hidden">
                  {product.thumbnailUrl ? (
                    <Image
                      src={product.thumbnailUrl}
                      alt={product.title}
                      fill
                      className="object-cover transition-transform duration-1000 group-hover:scale-110"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-brand-50 text-brand-200">
                      <span className="text-4xl">📸</span>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-80" />

                  <div className="absolute bottom-6 left-6 right-6">
                    {product.minPrice && (
                      <div className="translate-y-2 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/70">
                          Giá từ
                        </p>
                        <p className="text-2xl font-black text-brand-400">
                          {formatPrice(product.minPrice)}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="absolute right-4 top-4 rounded-2xl bg-white/10 p-2 text-white backdrop-blur-md transition-all group-hover:bg-brand-600">
                    <ArrowRight className="h-5 w-5" />
                  </div>
                </div>

                <div className="flex flex-grow flex-col p-8">
                  <h3 className="mb-4 line-clamp-2 min-h-[3.5rem] font-display text-xl font-black leading-tight text-gray-900 group-hover:text-brand-600">
                    {product.title}
                  </h3>

                  <div className="mt-auto space-y-3">
                    {type === 'show' && product.performTime && (
                      <div className="flex items-center gap-3 text-sm font-bold text-neutral-500">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                          <Calendar className="h-4 w-4" />
                        </div>
                        <span>{formatDateTime(product.performTime)}</span>
                      </div>
                    )}
                    {type !== 'show' && product.duration && (
                      <div className="flex items-center gap-3 text-sm font-bold text-neutral-500">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                          <Clock className="h-4 w-4" />
                        </div>
                        <span>{product.duration}</span>
                      </div>
                    )}
                    {(product.stage || product.destinationLoc) && (
                      <div className="flex items-center gap-3 text-sm font-bold text-neutral-500">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                          <MapPin className="h-4 w-4" />
                        </div>
                        <span className="truncate">
                          {product.stage?.location.name || product.destinationLoc?.name}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
