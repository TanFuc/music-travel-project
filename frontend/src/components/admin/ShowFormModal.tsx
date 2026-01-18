'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Plus, Trash2, Music, Users, Ticket, Settings, Search, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { get, post } from '@/lib/api';
import { toast } from 'sonner';
import { stageService } from '@/services/stage.service';

// Types
interface Stage {
  id: number;
  name: string;
  location: { id: number; name: string };
  seatMapConfig: unknown;
}

interface Artist {
  id: number;
  name: string;
  bio?: string;
}

// Validation schema
const showFormSchema = z.object({
  title: z.string().min(3, 'Tiêu đề phải có ít nhất 3 ký tự'),
  description: z.string().optional(),
  stageId: z.number({ required_error: 'Vui lòng chọn sân khấu' }),
  performTime: z.string().min(1, 'Vui lòng chọn thời gian biểu diễn'),
  checkInTime: z.string().optional(),
  seatSelectionEnabled: z.boolean().default(true),
  artists: z.array(z.object({
    artistId: z.number().optional(),
    name: z.string().optional(),
    isHeadline: z.boolean().default(false),
  })).optional(),
  ticketClasses: z.array(z.object({
    name: z.string().min(1, 'Tên hạng vé không được để trống'),
    price: z.number().min(0, 'Giá không được âm'),
    colorCode: z.string().optional(),
    quantity: z.number().min(1, 'Số lượng phải lớn hơn 0'),
  })).min(1, 'Cần ít nhất một hạng vé'),
  properties: z.object({
    dresscode: z.string().optional(),
    hashtag: z.string().optional(),
  }).optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
});

type ShowFormData = z.infer<typeof showFormSchema>;

interface ShowFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const DEFAULT_COLORS = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899'];

export function ShowFormModal({ isOpen, onClose, onSuccess }: ShowFormModalProps) {
  const [activeTab, setActiveTab] = useState('basic');
  const [artistSearch, setArtistSearch] = useState('');
  const [selectedArtists, setSelectedArtists] = useState<Array<Artist & { isHeadline: boolean }>>([]);
  const queryClient = useQueryClient();

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ShowFormData>({
    resolver: zodResolver(showFormSchema),
    defaultValues: {
      seatSelectionEnabled: false, // Default to General Admission
      ticketClasses: [{ name: 'Standard', price: 100000, colorCode: '#3B82F6', quantity: 100 }],
      properties: {},
    },
  });

  const { fields: ticketFields, append: appendTicket, remove: removeTicket } = useFieldArray({
    control,
    name: 'ticketClasses',
  });

  // Fetch stages
  const { data: stages } = useQuery({
    queryKey: ['stages'],
    queryFn: () => stageService.getStages(),
    staleTime: 10 * 60 * 1000,
  });

  // Fetch artists
  const { data: artistsData } = useQuery({
    queryKey: ['admin-artists', artistSearch],
    queryFn: () => get<{ items: Artist[] }>(`/admin/artists?search=${artistSearch}&limit=20`),
    staleTime: 5 * 60 * 1000,
    enabled: isOpen,
  });

  // Create show mutation
  const createMutation = useMutation({
    mutationFn: (data: ShowFormData) => {
      const payload = {
        ...data,
        artists: selectedArtists.map(a => ({
          artistId: a.id,
          isHeadline: a.isHeadline,
        })),
      };
      return post('/admin/shows/full', payload);
    },
    onSuccess: () => {
      toast.success('Tạo sự kiện thành công!');
      queryClient.invalidateQueries({ queryKey: ['admin-shows'] });
      onSuccess?.();
      handleClose();
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Có lỗi xảy ra khi tạo sự kiện');
    },
  });

  const handleClose = () => {
    reset();
    setSelectedArtists([]);
    setArtistSearch('');
    setActiveTab('basic');
    onClose();
  };

  const onFormSubmit = async (data: ShowFormData) => {
    await createMutation.mutateAsync(data);
  };

  const addArtist = (artist: Artist) => {
    if (!selectedArtists.find(a => a.id === artist.id)) {
      setSelectedArtists([...selectedArtists, { ...artist, isHeadline: false }]);
    }
  };

  const removeArtist = (artistId: number) => {
    setSelectedArtists(selectedArtists.filter(a => a.id !== artistId));
  };

  const toggleHeadline = (artistId: number) => {
    setSelectedArtists(selectedArtists.map(a =>
      a.id === artistId ? { ...a, isHeadline: !a.isHeadline } : a
    ));
  };

  const seatSelectionEnabled = watch('seatSelectionEnabled');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between flex-shrink-0">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Music className="h-5 w-5" />
              Tạo sự kiện mới
            </CardTitle>
            <CardDescription>Điền thông tin để tạo sự kiện biểu diễn</CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={handleClose} disabled={isSubmitting}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="flex flex-col flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
            <div className="px-6 flex-shrink-0">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">Cơ bản</TabsTrigger>
                <TabsTrigger value="artists">Nghệ sĩ</TabsTrigger>
                <TabsTrigger value="tickets">Vé</TabsTrigger>
                <TabsTrigger value="settings">Cài đặt</TabsTrigger>
              </TabsList>
            </div>

            <CardContent className="flex-1 overflow-y-auto pt-4">
              {/* Basic Info Tab */}
              <TabsContent value="basic" className="space-y-4 mt-0">
                <div>
                  <Label htmlFor="title">Tên sự kiện *</Label>
                  <Input
                    id="title"
                    {...register('title')}
                    placeholder="Nhập tên sự kiện"
                    disabled={isSubmitting}
                  />
                  {errors.title && (
                    <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="description">Mô tả</Label>
                  <Textarea
                    id="description"
                    {...register('description')}
                    placeholder="Mô tả chi tiết về sự kiện"
                    rows={3}
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <Label htmlFor="stageId">Sân khấu *</Label>
                  <Controller
                    name="stageId"
                    control={control}
                    render={({ field }) => (
                      <select
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                        disabled={isSubmitting}
                      >
                        <option value="">Chọn sân khấu</option>
                        {stages?.map((stage) => (
                          <option key={stage.id} value={stage.id}>
                            {stage.name} - {stage.location?.name}
                          </option>
                        ))}
                      </select>
                    )}
                  />
                  {errors.stageId && (
                    <p className="text-sm text-red-500 mt-1">{errors.stageId.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="performTime">Thời gian biểu diễn *</Label>
                    <Input
                      id="performTime"
                      type="datetime-local"
                      {...register('performTime')}
                      disabled={isSubmitting}
                    />
                    {errors.performTime && (
                      <p className="text-sm text-red-500 mt-1">{errors.performTime.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="checkInTime">Thời gian check-in</Label>
                    <Input
                      id="checkInTime"
                      type="datetime-local"
                      {...register('checkInTime')}
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                {/* Seat Selection Toggle */}
                <div className="border rounded-lg p-4 bg-neutral-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-medium">Chế độ chọn ghế</Label>
                      <p className="text-sm text-neutral-500 mt-1">
                        {seatSelectionEnabled
                          ? 'Khách hàng sẽ chọn ghế cụ thể khi mua vé'
                          : 'Vé tự do (General Admission) - Khách tự chọn chỗ khi vào sự kiện'}
                      </p>
                    </div>
                    <Controller
                      name="seatSelectionEnabled"
                      control={control}
                      render={({ field }) => (
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={field.onChange}
                            className="sr-only peer"
                            disabled={isSubmitting}
                          />
                          <div className="w-11 h-6 bg-neutral-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
                        </label>
                      )}
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Artists Tab */}
              <TabsContent value="artists" className="space-y-4 mt-0">
                <div>
                  <Label>Tìm kiếm nghệ sĩ</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                    <Input
                      placeholder="Tìm theo tên nghệ sĩ..."
                      value={artistSearch}
                      onChange={(e) => setArtistSearch(e.target.value)}
                      className="pl-10"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                {/* Artist Search Results */}
                {artistSearch && artistsData?.items && artistsData.items.length > 0 && (
                  <div className="border rounded-lg max-h-40 overflow-y-auto">
                    {artistsData.items
                      .filter(a => !selectedArtists.find(sa => sa.id === a.id))
                      .map((artist) => (
                        <div
                          key={artist.id}
                          className="px-4 py-2 hover:bg-neutral-100 cursor-pointer flex items-center justify-between"
                          onClick={() => addArtist(artist)}
                        >
                          <span>{artist.name}</span>
                          <Plus className="h-4 w-4 text-neutral-400" />
                        </div>
                      ))}
                  </div>
                )}

                {/* Selected Artists */}
                <div>
                  <Label>Nghệ sĩ đã chọn ({selectedArtists.length})</Label>
                  {selectedArtists.length === 0 ? (
                    <p className="text-sm text-neutral-500 mt-2">Chưa chọn nghệ sĩ nào</p>
                  ) : (
                    <div className="space-y-2 mt-2">
                      {selectedArtists.map((artist) => (
                        <div
                          key={artist.id}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{artist.name}</span>
                            {artist.isHeadline && (
                              <Badge variant="default" className="bg-yellow-500">
                                <Star className="h-3 w-3 mr-1" />
                                Headline
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => toggleHeadline(artist.id)}
                            >
                              {artist.isHeadline ? 'Bỏ Headline' : 'Đặt Headline'}
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeArtist(artist.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Tickets Tab */}
              <TabsContent value="tickets" className="space-y-4 mt-0">
                <div className="flex items-center justify-between">
                  <Label>Hạng vé ({ticketFields.length})</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => appendTicket({
                      name: '',
                      price: 0,
                      colorCode: DEFAULT_COLORS[ticketFields.length % DEFAULT_COLORS.length],
                      quantity: 50,
                    })}
                    disabled={isSubmitting}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Thêm hạng vé
                  </Button>
                </div>

                {errors.ticketClasses?.message && (
                  <p className="text-sm text-red-500">{errors.ticketClasses.message}</p>
                )}

                <div className="space-y-3">
                  {ticketFields.map((field, index) => (
                    <div key={field.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: watch(`ticketClasses.${index}.colorCode`) || '#3B82F6' }}
                          />
                          <span className="font-medium">Hạng vé #{index + 1}</span>
                        </div>
                        {ticketFields.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeTicket(index)}
                            disabled={isSubmitting}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>Tên hạng vé *</Label>
                          <Input
                            {...register(`ticketClasses.${index}.name`)}
                            placeholder="VIP, Standard, ..."
                            disabled={isSubmitting}
                          />
                          {errors.ticketClasses?.[index]?.name && (
                            <p className="text-sm text-red-500 mt-1">
                              {errors.ticketClasses[index]?.name?.message}
                            </p>
                          )}
                        </div>
                        <div>
                          <Label>Giá (VNĐ) *</Label>
                          <Controller
                            name={`ticketClasses.${index}.price`}
                            control={control}
                            render={({ field }) => (
                              <Input
                                type="number"
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                                placeholder="100000"
                                disabled={isSubmitting}
                              />
                            )}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>Số lượng *</Label>
                          <Controller
                            name={`ticketClasses.${index}.quantity`}
                            control={control}
                            render={({ field }) => (
                              <Input
                                type="number"
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                                placeholder="100"
                                disabled={isSubmitting}
                              />
                            )}
                          />
                        </div>
                        <div>
                          <Label>Màu hiển thị</Label>
                          <div className="flex gap-2">
                            <Controller
                              name={`ticketClasses.${index}.colorCode`}
                              control={control}
                              render={({ field }) => (
                                <>
                                  <Input
                                    type="color"
                                    {...field}
                                    className="w-12 h-10 p-1 cursor-pointer"
                                    disabled={isSubmitting}
                                  />
                                  <Input
                                    {...field}
                                    placeholder="#3B82F6"
                                    className="flex-1"
                                    disabled={isSubmitting}
                                  />
                                </>
                              )}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" className="space-y-4 mt-0">
                <div className="border-b pb-4">
                  <h4 className="font-medium mb-3">Thông tin bổ sung</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="dresscode">Dress code</Label>
                      <Input
                        id="dresscode"
                        {...register('properties.dresscode')}
                        placeholder="Trang phục trắng, ..."
                        disabled={isSubmitting}
                      />
                    </div>
                    <div>
                      <Label htmlFor="hashtag">Hashtag</Label>
                      <Input
                        id="hashtag"
                        {...register('properties.hashtag')}
                        placeholder="#ConcertABC2024"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">SEO</h4>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="metaTitle">Meta Title</Label>
                      <Input
                        id="metaTitle"
                        {...register('metaTitle')}
                        placeholder="Tiêu đề hiển thị trên Google"
                        disabled={isSubmitting}
                      />
                    </div>
                    <div>
                      <Label htmlFor="metaDescription">Meta Description</Label>
                      <Textarea
                        id="metaDescription"
                        {...register('metaDescription')}
                        placeholder="Mô tả hiển thị trên kết quả tìm kiếm"
                        rows={2}
                        disabled={isSubmitting}
                      />
                    </div>
                    <div>
                      <Label htmlFor="metaKeywords">Meta Keywords</Label>
                      <Input
                        id="metaKeywords"
                        {...register('metaKeywords')}
                        placeholder="từ khóa 1, từ khóa 2, ..."
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>
            </CardContent>
          </Tabs>

          {/* Actions */}
          <div className="flex gap-2 p-6 border-t flex-shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              Hủy
            </Button>
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? 'Đang tạo...' : 'Tạo sự kiện'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
