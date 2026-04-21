'use client';
import { motion } from 'framer-motion';
import { Logo } from '@/components/common/Logo';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
export function GlobalLoading({
  className,
  fullScreen = true,
}: {
  className?: string;
  fullScreen?: boolean;
}) {
  const [dots, setDots] = useState('.');
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '.' : prev + '.'));
    }, 500);
    return () => clearInterval(interval);
  }, []);
  return (
    <div
      className={cn(
        'z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm',
        fullScreen ? 'fixed inset-0 h-screen w-screen' : 'h-full min-h-[400px] w-full',
        className
      )}
    >
      <div className="relative">
        <motion.div
          className="absolute inset-0 rounded-full bg-brand-500/20 blur-xl"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        <motion.div
          className="absolute inset-[-10px] rounded-full border-r-2 border-t-2 border-brand-500"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        />

        <motion.div
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Logo size="lg" showText={false} className="pointer-events-none relative z-10" />
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-6 flex flex-col items-center gap-2"
      >
        <h3 className="font-display text-xl font-bold text-brand-700">Music & Travel</h3>
        <p className="text-sm font-medium text-brand-500/80">Đang tải trải nghiệm{dots}</p>
      </motion.div>
    </div>
  );
}
