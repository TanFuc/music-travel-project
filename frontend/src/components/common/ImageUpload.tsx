'use client';

import React, { useCallback, useState } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { upload } from '@/lib/api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Link as LinkIcon } from 'lucide-react';

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
  const [urlInput, setUrlInput] = useState('');
  const [activeTab, setActiveTab] = useState<string>('upload');

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
  };

  const handleRemove = useCallback(() => {
    onChange('');
  }, [onChange]);

  const ratioClass = {
    square: 'aspect-square',
    video: 'aspect-video',
    portrait: 'aspect-[3/4]',
    any: 'min-h-[220px]',
  }[aspectRatio];

  return (
    <div className={cn('space-y-2', className)}>
      {label && <label className="text-sm font-medium text-neutral-700">{label}</label>}

      <div className={cn(
        'relative border rounded-xl overflow-hidden transition-all bg-neutral-50/50',
        value ? 'border-brand-200' : 'border-neutral-200',
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
                className="h-10 w-10 rounded-full shadow-lg"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full flex flex-col">
            <div className="px-4 pt-3">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upload" className="text-xs">Tải lên</TabsTrigger>
                <TabsTrigger value="url" className="text-xs">Dán URL</TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 relative">
              <TabsContent value="upload" className="absolute inset-0 m-0">
                <label className="absolute inset-0 cursor-pointer flex flex-col items-center justify-center gap-3 p-4 hover:bg-neutral-100/50 transition-colors">
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
                      <div className="w-12 h-12 rounded-full bg-brand-50 flex items-center justify-center text-brand-600 shadow-sm border border-brand-100">
                        <Upload className="h-6 w-6" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-neutral-700 font-medium">Nhấn để tải ảnh lên</p>
                        <p className="text-xs text-neutral-500 mt-1">PNG, JPG tối đa 10MB</p>
                      </div>
                    </>
                  )}
                </label>
              </TabsContent>

              <TabsContent value="url" className="absolute inset-0 m-0 flex flex-col items-center justify-center p-6 gap-3">
                <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 mb-1">
                  <LinkIcon className="h-6 w-6" />
                </div>
                <div className="w-full space-y-2">
                  <Input
                    placeholder="https://example.com/image.jpg"
                    className="bg-white"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
                  />
                  <Button
                    type="button"
                    className="w-full"
                    size="sm"
                    disabled={!urlInput}
                    onClick={handleUrlSubmit}
                  >
                    Xác nhận URL
                  </Button>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        )}
      </div>
    </div>
  );
}
