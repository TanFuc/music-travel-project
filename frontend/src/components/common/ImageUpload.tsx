'use client';

import React, { useCallback, useState } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { upload } from '@/lib/api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  folder?: string;
  className?: string;
  aspectRatio?: 'square' | 'video' | 'portrait' | 'any';
  label?: string;
}

export function ImageUpload({
  value,
  onChange,
  folder = 'music-travel',
  className,
  aspectRatio = 'any',
  label,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn tệp hình ảnh');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Kích thước ảnh tối đa là 10MB');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    try {
      setIsUploading(true);
      const res = await upload<{ url: string }>('/media/upload', formData);
      onChange(res.url);
      toast.success('Tải ảnh lên thành công');
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.message || 'Không thể tải ảnh lên');
    } finally {
      setIsUploading(false);
    }
  }, [folder, onChange]);

  const handleRemove = useCallback(() => {
    onChange('');
  }, [onChange]);

  const ratioClass = {
    square: 'aspect-square',
    video: 'aspect-video',
    portrait: 'aspect-[3/4]',
    any: 'min-h-[200px]',
  }[aspectRatio];

  return (
    <div className={cn('space-y-2', className)}>
      {label && <label className="text-sm font-medium text-neutral-700">{label}</label>}
      
      <div className={cn(
        'relative border-2 border-dashed rounded-xl overflow-hidden transition-colors',
        value ? 'border-brand-200 bg-neutral-50' : 'border-neutral-300 hover:border-brand-400 bg-neutral-50/50',
        ratioClass
      )}>
        {value ? (
          <>
            <img 
              src={value} 
              alt="Uploaded" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Button
                type="button"
                variant="destructive"
                size="icon"
                onClick={handleRemove}
                className="h-9 w-9 rounded-full"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </>
        ) : (
          <label className="absolute inset-0 cursor-pointer flex flex-col items-center justify-center gap-3 p-4">
            <input
              type="file"
              className="sr-only"
              accept="image/*"
              onChange={handleUpload}
              disabled={isUploading}
            />
            {isUploading ? (
              <>
                <Loader2 className="h-10 w-10 text-brand-500 animate-spin" />
                <p className="text-sm text-neutral-500 font-medium">Đang tải lên...</p>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-brand-50 flex items-center justify-center text-brand-600">
                  <Upload className="h-6 w-6" />
                </div>
                <div className="text-center">
                  <p className="text-sm text-neutral-700 font-medium">Nhấn để tải ảnh lên</p>
                  <p className="text-xs text-neutral-500 mt-1">PNG, JPG, WEBP tối đa 10MB</p>
                </div>
              </>
            )}
          </label>
        )}
      </div>
    </div>
  );
}
