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
import { get, post, patch } from '@/lib/api'; // Add patch

import { toast } from 'sonner';
import { stageService } from '@/services/stage.service';
import { branchService } from '@/services/branch.service';
import { ImageUpload } from '@/components/common/ImageUpload';

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
  description: z.string().optional().nullable(),
  stageId: z.number({ required_error: 'Vui lòng chọn sân khấu' }),
  branchId: z.number().optional().nullable(),
  performTime: z.string().min(1, 'Vui lòng chọn thời gian biểu diễn'),
  checkInTime: z.string().optional().nullable(),
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
  })).optional(),
  properties: z.any().optional().nullable(),
  metaTitle: z.string().optional().nullable(),
  metaDescription: z.string().optional().nullable(),
  metaKeywords: z.string().optional().nullable(),
});

type ShowFormData = z.infer<typeof showFormSchema>;

interface ShowFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialData?: any; // Add initialData
}

const DEFAULT_COLORS = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899'];

export function ShowFormModal({ isOpen, onClose, onSuccess, initialData }: ShowFormModalProps) {
  const [activeTab, setActiveTab] = useState('basic');
  const [artistSearch, setArtistSearch] = useState('');
  const [selectedArtists, setSelectedArtists] = useState<Array<Artist & { isHeadline: boolean }>>([]);
  const queryClient = useQueryClient();
  const isEdit = !!initialData;

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
      seatSelectionEnabled: false,
      ticketClasses: [{ name: 'Standard', price: 100000, colorCode: '#3B82F6', quantity: 100 }],
      properties: {},
    },
  });

  // Populate form data when initialData changes
  useEffect(() => {
    if (initialData && isOpen) {
      reset({
        title: initialData.title,
        description: initialData.description,
        stageId: initialData.stage?.id,
        branchId: initialData.branch?.id,
        performTime: initialData.performTime ? new Date(initialData.performTime).toISOString().slice(0, 16) : '',
        checkInTime: initialData.checkInTime ? new Date(initialData.checkInTime).toISOString().slice(0, 16) : '',
        seatSelectionEnabled: initialData.seatSelectionEnabled,
        properties: initialData.properties || {},
        metaTitle: initialData.metaTitle,
        metaDescription: initialData.metaDescription,
        metaKeywords: initialData.metaKeywords,
        ticketClasses: (initialData.ticketClasses && initialData.ticketClasses.length > 0)
          ? initialData.ticketClasses.map((tc: any) => ({
            name: tc.name || '',
            price: tc.price ? Number(tc.price) : 0,
            colorCode: tc.colorCode || '#3B82F6',
            quantity: tc.totalQuantity || tc.quantity || 1,
          }))
          : [{ name: 'Standard', price: 100000, colorCode: '#3B82F6', quantity: 100 }],
      });

      // Populate Artists if structure matches or if we can map it
      if (initialData.artists) {
        setSelectedArtists(initialData.artists.map((a: any) => ({
          id: a.artist.id,
          name: a.artist.name,
          isHeadline: a.isHeadline,
          bio: a.artist.bio
        })));
      }
    } else if (!initialData && isOpen) {
      reset({
        seatSelectionEnabled: false,
        ticketClasses: [{ name: 'Standard', price: 100000, colorCode: '#3B82F6', quantity: 100 }],
        properties: {},
      });
      setSelectedArtists([]);
    }
  }, [initialData, isOpen, reset]);

  // Sync artists state to form data
  useEffect(() => {
    setValue('artists', selectedArtists.map(a => ({
      artistId: a.id,
      name: a.name,
      isHeadline: a.isHeadline
    })));
  }, [selectedArtists, setValue]);


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

  // Fetch branches
  const { data: branches } = useQuery({
    queryKey: ['branches'],
    queryFn: () => branchService.getBranches(),
    staleTime: 10 * 60 * 1000,
    enabled: isOpen,
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
      toast.success('Tạo show diễn thành công!');
      queryClient.invalidateQueries({ queryKey: ['admin-shows'] });
      onSuccess?.();
      handleClose();
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Có lỗi xảy ra khi tạo sự kiện');
    },
  });

  // Update show mutation
  const updateMutation = useMutation({
    mutationFn: (data: ShowFormData) => {
      const payload = {
        title: data.title,
        description: data.description,
        stageId: data.stageId,
        branchId: data.branchId || null,
        performTime: data.performTime ? new Date(data.performTime).toISOString() : undefined,
        checkInTime: data.checkInTime ? new Date(data.checkInTime).toISOString() : null,
        properties: data.properties,
        seatSelectionEnabled: data.seatSelectionEnabled,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        metaKeywords: data.metaKeywords,
      };
      return patch(`/admin/shows/${initialData.id}`, payload);
    },
    onSuccess: () => {
      toast.success('Cập nhật show diễn thành công!');
      queryClient.invalidateQueries({ queryKey: ['admin-shows'] });
      queryClient.invalidateQueries({ queryKey: ['admin-show', initialData.id] });
      onSuccess?.();
      handleClose();
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Có lỗi xảy ra khi cập nhật show diễn');
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
    console.log('Form data being submitted:', data);
    try {
      if (isEdit) {
        await updateMutation.mutateAsync(data);
      } else {
        await createMutation.mutateAsync(data);
      }
    } catch (error) {
      console.error('Submission error:', error);
    }
  };

  const onFormError = (err: any) => {
    console.log('Form Validation Errors:', err);
    // Detail error message for user
    const errorFields = Object.keys(err).join(', ');
    toast.error(`Vui lòng kiểm tra lại: ${errorFields}`);
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
              {isEdit ? 'Chỉnh sửa show diễn' : 'Tạo show diễn mới'}
            </CardTitle>
            <CardDescription>Điền thông tin để {isEdit ? 'cập nhật' : 'tạo'} nội dung show diễn</CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={handleClose} disabled={isSubmitting}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <form onSubmit={handleSubmit(onFormSubmit, onFormError)} className="flex flex-col flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
            <div className="px-6 flex-shrink-0">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Cơ bản</TabsTrigger>
                <TabsTrigger value="artists">Nghệ sĩ</TabsTrigger>
                <TabsTrigger value="settings">Cài đặt</TabsTrigger>
              </TabsList>
            </div>

            <CardContent className="flex-1 overflow-y-auto pt-4">
              {/* Basic Info Tab */}
              <TabsContent value="basic" className="space-y-4 mt-0">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-1">
                    <Label>Ảnh show diễn</Label>
                    <Controller
                      name="properties.thumbnailUrl"
                      control={control}
                      render={({ field }) => (
                        <ImageUpload
                          value={field.value}
                          onChange={field.onChange}
                          folder="shows"
                          aspectRatio="portrait"
                          className="mt-2"
                        />
                      )}
                    />
                  </div>
                  <div className="md:col-span-2 space-y-4">
                    <div>
                      <Label htmlFor="title">Tên show diễn *</Label>
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
                        placeholder="Mô tả chi tiết về show diễn"
                        rows={5}
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
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

                <div>
                  <Label htmlFor="branchId">Chi nhánh</Label>
                  <Controller
                    name="branchId"
                    control={control}
                    render={({ field }) => (
                      <select
                        {...field}
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                        disabled={isSubmitting}
                      >
                        <option value="">Chọn chi nhánh (không bắt buộc)</option>
                        {branches?.map((branch) => (
                          <option key={branch.id} value={branch.id}>
                            {branch.name}
                          </option>
                        ))}
                      </select>
                    )}
                  />
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
                          : 'Vé tự do (General Admission) - Khách tự chọn chỗ khi vào show diễn'}
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
              {/* Tickets Tab Removed */}

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
              {isSubmitting
                ? (isEdit ? 'Đang cập nhật...' : 'Đang tạo...')
                : (isEdit ? 'Cập nhật show diễn' : 'Tạo show diễn')}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
