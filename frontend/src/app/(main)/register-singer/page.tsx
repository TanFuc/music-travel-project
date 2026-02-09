'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { post } from '@/lib/api';
import {
  SingerPackage,
  SingingExperience,
  getPackageLabel,
  getPackagePrice,
  getSingingExperienceLabel,
  singerRegistrationSchema,
  type SingerRegistrationFormData
} from '@/lib/validations/singer-registration.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { CheckCircle, Heart, Loader2, Mic, Music, Star, Upload, Users, Video, Crown } from 'lucide-react';
import { singerPackageService } from '@/services/singer-packages.service';
import { useCallback, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

export default function RegisterSingerPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [voiceFile, setVoiceFile] = useState<File | null>(null);
  const [uploadingVoice, setUploadingVoice] = useState(false);

  // Fetch active packages
  const { data: packages, isLoading: packagesLoading, error: packagesError } = useQuery({
    queryKey: ['singer-packages-active'],
    queryFn: singerPackageService.getActivePackages,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const form = useForm<SingerRegistrationFormData>({
    resolver: zodResolver(singerRegistrationSchema),
    defaultValues: {
      fullName: '',
      phoneNumber: '',
      email: '',
      age: 18,
      gender: 'Nam',
      address: '',
      singingExperience: SingingExperience.NONE,
      favoriteGenre: '',
      packageTemplateId: '',
      introduction: '',
      // voiceSampleUrl: '',
      agreeToTerms: false
    }
  });

  const submitMutation = useMutation({
    mutationFn: async (data: Omit<SingerRegistrationFormData, 'agreeToTerms'>) => {
      // Remove the package field if packageTemplateId is provided
      const submitData = { ...data };
      if (submitData.packageTemplateId) {
        delete submitData.package;
      }
      return post('/singers/register', submitData);
    },
    onSuccess: () => {
      toast.success('Đăng ký thành công! Chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất.');
      form.reset();
      setVoiceFile(null);
      setShowForm(false);
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi đăng ký');
    }
  });

  const uploadVoiceSample = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/v1/singers/upload-voice-sample', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const result = await response.json();
    return result.url;
  };

  const handleVoiceFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/m4a'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Chỉ chấp nhận file âm thanh (MP3, WAV, M4A)');
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File không được vượt quá 10MB');
      return;
    }

    setVoiceFile(file);
    setUploadingVoice(true);

    try {
      const url = await uploadVoiceSample(file);
      // form.setValue('voiceSampleUrl', url);
      toast.success('Tải file âm thanh thành công');
    } catch (error) {
      toast.error('Lỗi khi tải file âm thanh');
      setVoiceFile(null);
    } finally {
      setUploadingVoice(false);
    }
  };

  const onSubmit = async (data: SingerRegistrationFormData) => {
    setIsSubmitting(true);
    try {
      const { agreeToTerms, ...submitData } = data;
      await submitMutation.mutateAsync(submitData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const scrollToForm = useCallback(() => {
    setShowForm(true);
    setTimeout(() => {
      const formElement = document.getElementById('registration-form');
      formElement?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, []);

  // Memoize expensive operations
  const packageOptions = useMemo(() => {
    if (!packages) return [];
    return packages.map(pkg => ({
      key: pkg.id,
      value: pkg.id,
      label: pkg.name,
      price: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(pkg.price),
      isAvailable: !pkg.maxRegistrations || !pkg._count || (pkg._count.registrations < pkg.maxRegistrations)
    }));
  }, [packages]);

  const experienceOptions = useMemo(() =>
    Object.entries(SingingExperience).map(([key, value]) => ({
      key,
      value,
      label: getSingingExperienceLabel(key as keyof typeof SingingExperience)
    })), []
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Hero Section with Program Content */}
      <section className="relative py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12 md:mb-16">
            <div className="flex items-center justify-center gap-2 md:gap-3 mb-4 md:mb-6">
              <Music className="w-6 h-6 md:w-8 md:h-8 text-green-600" />
              <Mic className="w-8 h-8 md:w-10 md:h-10 text-green-600" />
              <Heart className="w-6 h-6 md:w-8 md:h-8 text-green-600" />
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-6xl font-bold text-gray-900 mb-3 md:mb-4 leading-tight px-4">
              ĐĂNG KÝ LÀM CA SĨ
            </h1>
            <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold text-green-600 mb-2 px-4">
              TRỞ THÀNH CA SĨ BIỂU DIỄN
            </h2>
            <h3 className="text-lg md:text-xl lg:text-2xl font-medium text-gray-700 px-4">
              TRONG CHUỖI ĐÊM NHẠC MÃI CHO HÀNH TINH XANH
            </h3>
          </div>

          {/* Program Introduction */}
          <Card className="mb-8 md:mb-12 border-green-200 shadow-xl">
            <CardContent className="p-4 md:p-8">
              <div className="prose prose-lg max-w-none">
                <p className="text-gray-700 leading-relaxed mb-6">
                  Bạn yêu ca hát? Bạn từng ước một lần đứng trên sân khấu thật, hát cùng ban nhạc thật?
                  Bạn muốn lưu giữ dấu ấn cá nhân bằng âm nhạc – hình ảnh – cảm xúc?
                </p>
                <p className="text-gray-700 leading-relaxed mb-6">
                  <strong>"Mãi cho Hành Tinh Xanh"</strong> mở ra chương trình đăng ký làm "Ca sĩ biểu diễn",
                  nơi bạn không cần là ca sĩ chuyên nghiệp, chỉ cần đam mê và mong muốn trải nghiệm nghiêm túc.
                </p>
                <p className="text-gray-700 leading-relaxed mb-8">
                  Đây là hành trình đào tạo – đồng hành – biểu diễn thật trong không gian âm nhạc xanh, nhân văn,
                  gắn với cộng đồng doanh nhân – chủ cửa hàng – người yêu nghệ thuật.
                </p>

                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                    <span>Đào tạo thanh nhạc bài bản (từ cơ bản đến nâng cao)</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                    <span>Tập luyện, phối nhạc, ghép ban nhạc live</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                    <span>Biểu diễn trực tiếp trên sân khấu Đêm nhạc</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                    <span>Ghi hình – hậu kỳ – dựng TVC cá nhân</span>
                  </div>
                  <div className="flex items-start gap-3 md:col-span-2">
                    <CheckCircle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                    <span>Kết nối cộng đồng cùng giá trị sống xanh – kinh doanh tử tế</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Package Information */}
          {packagesLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-8 md:mb-12">
              {[1, 2].map((i) => (
                <Card key={i} className="border-gray-200 shadow-lg">
                  <CardHeader className="bg-gray-50 rounded-t-lg">
                    <div className="h-6 bg-gray-300 rounded animate-pulse mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                  </CardHeader>
                  <CardContent className="p-4 md:p-6">
                    <div className="space-y-3">
                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                      <div className="space-y-2 mt-4">
                        {[1, 2, 3, 4].map((j) => (
                          <div key={j} className="h-3 bg-gray-100 rounded animate-pulse"></div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : packagesError ? (
            <div className="text-center py-8 mb-8">
              <p className="text-red-600">Không thể tải thông tin gói đăng ký. Vui lòng thử lại sau.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8 mb-8 md:mb-12">
              {packages?.map((pkg, index) => {
                const getIconByIndex = (idx: number) => {
                  const icons = [Star, Users, Crown];
                  return icons[idx % icons.length];
                };
                const getColorByIndex = (idx: number) => {
                  const colors = [
                    { border: 'border-blue-200', bg: 'bg-blue-50', text: 'text-blue-800', badge: 'bg-blue-100 text-blue-800' },
                    { border: 'border-purple-200', bg: 'bg-purple-50', text: 'text-purple-800', badge: 'bg-purple-100 text-purple-800' },
                    { border: 'border-amber-200', bg: 'bg-amber-50', text: 'text-amber-800', badge: 'bg-amber-100 text-amber-800' }
                  ];
                  return colors[idx % colors.length];
                };
                
                const Icon = getIconByIndex(index);
                const colors = getColorByIndex(index);
                
                return (
                  <Card key={pkg.id} className={`${colors.border} shadow-lg hover:shadow-xl transition-shadow`}>
                    <CardHeader className={`${colors.bg} rounded-t-lg`}>
                      <CardTitle className={`flex items-center gap-2 ${colors.text}`}>
                        <Icon className="w-6 h-6" />
                        {pkg.name}
                      </CardTitle>
                      <Badge variant="secondary" className={`w-fit ${colors.badge}`}>
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(pkg.price)}
                      </Badge>
                      {pkg.maxRegistrations && pkg._count && (
                        <div className="text-xs text-gray-600">
                          Còn lại: {pkg.maxRegistrations - pkg._count.registrations}/{pkg.maxRegistrations} chỗ
                        </div>
                      )}
                    </CardHeader>
                    <CardContent className="p-4 md:p-6">
                      {pkg.description && (
                        <p className="text-gray-600 mb-4 text-sm md:text-base">
                          {pkg.description}
                        </p>
                      )}
                      {pkg.benefits && pkg.benefits.length > 0 && (
                        <>
                          <h4 className="font-semibold mb-3">Bạn nhận được gì?</h4>
                          <ul className="space-y-2 text-xs md:text-sm">
                            {pkg.benefits.map((benefit, benefitIndex) => (
                              <li key={benefitIndex} className="flex items-start gap-2">
                                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                {benefit}
                              </li>
                            ))}
                          </ul>
                        </>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Unique Features */}
          <Card className="mb-12 border-green-200 bg-gradient-to-r from-green-50 to-blue-50">
            <CardHeader>
              <CardTitle className="text-center text-green-800">
                ĐIỂM KHÁC BIỆT CHỈ CÓ TẠI "MÃI CHO HÀNH TINH XANH"
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <Video className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                  <span>Sân khấu thật – ban nhạc live – khán giả thật</span>
                </div>
                <div className="flex items-start gap-3">
                  <Heart className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                  <span>TVC cá nhân mang dấu ấn nhân văn – xanh – tử tế</span>
                </div>
                <div className="flex items-start gap-3">
                  <Music className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                  <span>Gắn âm nhạc với thông điệp sống xanh – phát triển bền vững</span>
                </div>
                <div className="flex items-start gap-3">
                  <Users className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                  <span>Kết nối doanh nhân, chủ cửa hàng, điểm bán trong cộng đồng</span>
                </div>
                <div className="flex items-start gap-3 md:col-span-2 justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                  <span className="font-medium">Không phô trương – không áp lực – không hình thức</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Call to Action */}
          <div className="text-center mb-12 md:mb-16 px-4">
            <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
              MỘT LẦN ĐỨNG TRÊN SÂN KHẤU – MỘT DẤU ẤN ĐỂ NHỚ
            </h3>
            <p className="text-base md:text-lg text-gray-700 mb-6 md:mb-8 max-w-3xl mx-auto">
              "Mãi cho Hành Tinh Xanh" không chỉ cho bạn cơ hội hát mà cho bạn trải nghiệm
              được lắng nghe – được ghi nhận – được sống trọn với đam mê.
            </p>
            <p className="text-sm text-gray-600 mb-6 md:mb-8">
              Số lượng học viên & suất biểu diễn có giới hạn cho mỗi đêm nhạc.
            </p>

            {!showForm && (
              <Button
                onClick={scrollToForm}
                size="lg"
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-8 md:px-12 py-3 md:py-4 text-lg md:text-xl font-bold rounded-full shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all w-full sm:w-auto"
              >
                ĐĂNG KÝ NGAY
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Registration Form */}
      {showForm && (
        <section id="registration-form" className="py-20 px-4 bg-white">
          <div className="container mx-auto max-w-2xl">
            <Card className="shadow-2xl border-green-200">
              <CardHeader className="bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-t-lg">
                <CardTitle className="text-center text-2xl">
                  ĐĂNG KỲ THAM GIA CHƯƠNG TRÌNH
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Personal Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                      Thông tin cá nhân
                    </h3>

                    <div>
                      <Label htmlFor="fullName">Họ và tên *</Label>
                      <Input
                        id="fullName"
                        {...form.register('fullName')}
                        placeholder="Nhập họ và tên đầy đủ"
                        className={form.formState.errors.fullName ? 'border-red-500' : ''}
                        aria-describedby={form.formState.errors.fullName ? 'fullName-error' : undefined}
                        aria-invalid={!!form.formState.errors.fullName}
                      />
                      {form.formState.errors.fullName && (
                        <p id="fullName-error" className="text-red-500 text-sm mt-1" role="alert">
                          {form.formState.errors.fullName.message}
                        </p>
                      )}
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="phoneNumber">Số điện thoại *</Label>
                        <Input
                          id="phoneNumber"
                          {...form.register('phoneNumber')}
                          placeholder="Nhập số điện thoại"
                          className={form.formState.errors.phoneNumber ? 'border-red-500' : ''}
                        />
                        {form.formState.errors.phoneNumber && (
                          <p className="text-red-500 text-sm mt-1">{form.formState.errors.phoneNumber.message}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          {...form.register('email')}
                          placeholder="Nhập địa chỉ email"
                          className={form.formState.errors.email ? 'border-red-500' : ''}
                        />
                        {form.formState.errors.email && (
                          <p className="text-red-500 text-sm mt-1">{form.formState.errors.email.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="age">Tuổi *</Label>
                        <Input
                          id="age"
                          type="number"
                          {...form.register('age', { valueAsNumber: true })}
                          min="16"
                          max="80"
                          className={form.formState.errors.age ? 'border-red-500' : ''}
                        />
                        {form.formState.errors.age && (
                          <p className="text-red-500 text-sm mt-1">{form.formState.errors.age.message}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="gender">Giới tính *</Label>
                        <Select
                          value={form.watch('gender')}
                          onValueChange={(value) => form.setValue('gender', value as any)}
                        >
                          <SelectTrigger className={form.formState.errors.gender ? 'border-red-500' : ''}>
                            <SelectValue placeholder="Chọn giới tính" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Nam">Nam</SelectItem>
                            <SelectItem value="Nữ">Nữ</SelectItem>
                            <SelectItem value="Khác">Khác</SelectItem>
                          </SelectContent>
                        </Select>
                        {form.formState.errors.gender && (
                          <p className="text-red-500 text-sm mt-1">{form.formState.errors.gender.message}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="address">Địa chỉ *</Label>
                      <Textarea
                        id="address"
                        {...form.register('address')}
                        placeholder="Nhập địa chỉ hiện tại"
                        rows={3}
                        className={form.formState.errors.address ? 'border-red-500' : ''}
                      />
                      {form.formState.errors.address && (
                        <p className="text-red-500 text-sm mt-1">{form.formState.errors.address.message}</p>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* Musical Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                      Thông tin âm nhạc
                    </h3>

                    <div>
                      <Label htmlFor="singingExperience">Kinh nghiệm ca hát *</Label>
                      <Select
                        value={form.watch('singingExperience')}
                        onValueChange={(value) => form.setValue('singingExperience', value as any)}
                      >
                        <SelectTrigger className={form.formState.errors.singingExperience ? 'border-red-500' : ''}>
                          <SelectValue placeholder="Chọn mức độ kinh nghiệm" />
                        </SelectTrigger>
                        <SelectContent>
                          {experienceOptions.map(({ key, value, label }) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {form.formState.errors.singingExperience && (
                        <p className="text-red-500 text-sm mt-1">{form.formState.errors.singingExperience.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="favoriteGenre">Thể loại nhạc yêu thích *</Label>
                      <Input
                        id="favoriteGenre"
                        {...form.register('favoriteGenre')}
                        placeholder="Ví dụ: Ballad, Pop, Rock, Dân ca..."
                        className={form.formState.errors.favoriteGenre ? 'border-red-500' : ''}
                      />
                      {form.formState.errors.favoriteGenre && (
                        <p className="text-red-500 text-sm mt-1">{form.formState.errors.favoriteGenre.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="packageTemplateId">Chọn gói đăng ký *</Label>
                      <Select
                        value={form.watch('packageTemplateId') || ''}
                        onValueChange={(value) => form.setValue('packageTemplateId', value)}
                      >
                        <SelectTrigger className={form.formState.errors.packageTemplateId ? 'border-red-500' : ''}>
                          <SelectValue placeholder="Chọn gói phù hợp" />
                        </SelectTrigger>
                        <SelectContent>
                          {packageOptions.map(({ key, value, label, price, isAvailable }) => (
                            <SelectItem 
                              key={value} 
                              value={value}
                              disabled={!isAvailable}
                            >
                              <div className="flex items-center justify-between w-full">
                                <span>{label}</span>
                                <span className="text-sm text-gray-500 ml-2">{price}</span>
                                {!isAvailable && <span className="text-xs text-red-500 ml-2">(Hết chỗ)</span>}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {form.formState.errors.packageTemplateId && (
                        <p className="text-red-500 text-sm mt-1">{form.formState.errors.packageTemplateId.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="introduction">Giới thiệu bản thân (tùy chọn)</Label>
                      <Textarea
                        id="introduction"
                        {...form.register('introduction')}
                        placeholder="Hãy chia sẻ về bản thân, đam mê âm nhạc và mong muốn của bạn..."
                        rows={4}
                        className={form.formState.errors.introduction ? 'border-red-500' : ''}
                      />
                      {form.formState.errors.introduction && (
                        <p className="text-red-500 text-sm mt-1">{form.formState.errors.introduction.message}</p>
                      )}
                    </div>

                    {/* <div>
                      <Label htmlFor="voiceSample">File mẫu giọng hát (tùy chọn)</Label>
                      <div className="mt-2">
                        <input
                          type="file"
                          id="voiceSample"
                          accept="audio/*"
                          onChange={handleVoiceFileChange}
                          className="hidden"
                          aria-describedby="voiceSample-help"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById('voiceSample')?.click()}
                          disabled={uploadingVoice}
                          className="w-full"
                        >
                          {uploadingVoice ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Đang tải lên...
                            </>
                          ) : (
                            <>
                              <Upload className="w-4 h-4 mr-2" />
                              {voiceFile ? voiceFile.name : 'Chọn file âm thanh (MP3, WAV, M4A)'}
                            </>
                          )}
                        </Button>
                        <p id="voiceSample-help" className="text-sm text-gray-500 mt-1">
                          File không quá 10MB. Giúp chúng tôi hiểu rõ hơn về giọng hát của bạn.
                        </p>
                      </div>
                    </div> */}
                  </div>

                  <Separator />

                  {/* Terms and Submit */}
                  <div className="space-y-4">
                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="agreeToTerms"
                        checked={form.watch('agreeToTerms')}
                        onCheckedChange={(checked) => form.setValue('agreeToTerms', checked as boolean)}
                        aria-describedby={form.formState.errors.agreeToTerms ? 'agreeToTerms-error' : undefined}
                        aria-invalid={!!form.formState.errors.agreeToTerms}
                      />
                      <Label htmlFor="agreeToTerms" className="text-sm leading-relaxed cursor-pointer">
                        Tôi đồng ý với các điều khoản và điều kiện của chương trình. Tôi hiểu rằng
                        thông tin đã cung cấp sẽ được sử dụng để đánh giá và liên hệ về việc tham gia chương trình.
                      </Label>
                    </div>
                    {form.formState.errors.agreeToTerms && (
                      <p id="agreeToTerms-error" className="text-red-500 text-sm" role="alert">
                        {form.formState.errors.agreeToTerms.message}
                      </p>
                    )}

                    <Button
                      type="submit"
                      disabled={isSubmitting || !form.watch('agreeToTerms')}
                      className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white py-6 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Đang gửi đăng ký...
                        </>
                      ) : (
                        'GỬI ĐĂNG KÝ THAM GIA'
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </section>
      )}
    </div>
  );
}