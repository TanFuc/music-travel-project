'use client';

import React, { useCallback, useState } from 'react';
import { Upload, X, Loader2, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';
import { upload } from '@/lib/api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  folder?: string;
  className?: string; // Applied to the outer container
  aspectRatio?: 'square' | 'video' | 'portrait' | 'any';
  label?: string;
  isCompact?: boolean; // Prop to force compact mode/rounded mode if needed
}

export function ImageUpload({
  value,
  onChange,
  folder = 'music-travel',
  className,
  aspectRatio = 'any',
  label,
  isCompact = false,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [mode, setMode] = useState<'upload' | 'url'>('upload');

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

  const handleUrlSubmit = () => {
    if (!urlInput) return;
    onChange(urlInput);
    setUrlInput('');
    setMode('upload'); // Reset mode after submit
  };

  const handleRemove = useCallback(() => {
    onChange('');
    setMode('upload');
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
        'relative border overflow-hidden transition-all bg-neutral-50/50 group',
        // Ensure inner container fills the parent if parent has fixed size
        'w-full h-full',
        // Apply default radius if not seemingly handled by parent class in a specific way
        // Simple heuristic: if className doesn't mention rounded-full, we add rounded-xl
        !className?.includes('rounded-full') && 'rounded-xl',
        value ? 'border-brand-200' : 'border-neutral-200',
        ratioClass
      )}>
        {value ? (
          <div className="relative w-full h-full">
            <img
              src={value}
              alt="Uploaded"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Button
                type="button"
                variant="destructive"
                size="icon"
                onClick={handleRemove}
                className="h-8 w-8 sm:h-10 sm:w-10 rounded-full shadow-lg"
              >
                <X className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="w-full h-full">
            {/* Mode Toggle - Small & Discrete */}
            <div className="absolute top-2 right-2 z-20">
               <button 
                 type="button"
                 onClick={() => setMode(mode === 'upload' ? 'url' : 'upload')}
                 className="p-1.5 rounded-full bg-white/80 hover:bg-white text-neutral-500 hover:text-brand-600 shadow-sm border border-neutral-100 transition-all opacity-0 group-hover:opacity-100"
                 title={mode === 'upload' ? "Dán URL ảnh" : "Tải tệp lên"}
               >
                 {mode === 'upload' ? <LinkIcon className="h-3.5 w-3.5" /> : <Upload className="h-3.5 w-3.5" />}
               </button>
            </div>

            {mode === 'upload' ? (
              <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer hover:bg-neutral-100/50 transition-colors p-3 text-center">
                  <input
                    type="file"
                    className="sr-only"
                    accept="image/*"
                    onChange={handleUpload}
                    disabled={isUploading}
                  />
                  {isUploading ? (
                    <>
                      <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 text-brand-500 animate-spin mb-2" />
                      <p className="text-xs text-neutral-500 font-medium animate-pulse">Đang xử lý...</p>
                    </>
                  ) : (
                    <>
                      <div className={cn(
                        "rounded-full bg-brand-50 flex items-center justify-center text-brand-600 shadow-sm border border-brand-100 mb-2 transition-transform group-hover:scale-110",
                        isCompact ? "w-8 h-8" : "w-10 h-10"
                      )}>
                        <Upload className={cn(isCompact ? "h-4 w-4" : "h-5 w-5")} />
                      </div>
                      
                      {!isCompact && (
                        <div className="space-y-1">
                          <p className="text-xs sm:text-sm text-neutral-700 font-medium line-clamp-1">
                             Tải ảnh lên
                          </p>
                          <p className="hidden sm:block text-[10px] sm:text-xs text-neutral-500">
                             Max 10MB
                          </p>
                        </div>
                      )}
                    </>
                  )}
              </label>
            ) : (
              <div className="flex flex-col items-center justify-center w-full h-full p-4 bg-white/50">
                 <div className="w-full max-w-[200px] space-y-2">
                    <Input
                      placeholder="https://..."
                      className="h-8 text-xs bg-white"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
                      autoFocus
                    />
                    <Button
                      type="button"
                      size="sm"
                      className="w-full h-7 text-xs"
                      disabled={!urlInput}
                      onClick={handleUrlSubmit}
                    >
                      Xác nhận
                    </Button>
                 </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
