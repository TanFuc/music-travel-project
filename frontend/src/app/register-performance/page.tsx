'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/common/LoadingSkeleton';
import { get, post } from '@/lib/api'; // post still needed for registerMutation
import { useAuthStore } from '@/stores/auth.store';
import { formatDateTime } from '@/lib/utils';
import { toast } from 'sonner';
import { CheckCircle, AlertCircle, Clock, MapPin, Music, User, Phone, Mail, Mic2 } from 'lucide-react';

// Schema for form validation
const performanceSchema = z.object({
  performanceType: z.enum(['SINGING', 'DANCING', 'INSTRUMENT', 'MAGIC', 'COMEDY', 'OTHER']),
  songTitle: z.string().min(1, 'Please enter song/act title'),
  artistName: z.string().optional(),
  duration: z.number().min(30, 'Minimum 30 seconds').max(600, 'Maximum 10 minutes'),
  description: z.string().optional(),
  guestName: z.string().optional(),
  guestEmail: z.string().email('Invalid email format').optional().or(z.literal('')),
  guestPhone: z.string().optional(),
});

type PerformanceFormData = z.infer<typeof performanceSchema>;

interface QRCodeInfo {
  id: number;
  code: string;
  showId: number;
  stageId: number;
  isActive: boolean;
  maxRegistrations: number | null;
  registrationDeadline: string | null;
  scanCount: number;
  registrationCount: number;
  show: {
    id: number;
    title: string;
    performTime: string;
  };
  stage: {
    id: number;
    name: string;
    location: {
      name: string;
    };
  };
}

const performanceTypes = [
  { value: 'SINGING', label: 'Singing', icon: '🎤' },
  { value: 'DANCING', label: 'Dancing', icon: '💃' },
  { value: 'INSTRUMENT', label: 'Instrument', icon: '🎸' },
  { value: 'MAGIC', label: 'Magic', icon: '🪄' },
  { value: 'COMEDY', label: 'Comedy', icon: '😂' },
  { value: 'OTHER', label: 'Other', icon: '✨' },
];

function RegisterPerformanceContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const code = searchParams.get('code');
  const { isAuthenticated, user } = useAuthStore();

  const [step, setStep] = useState<'loading' | 'form' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<PerformanceFormData>({
    resolver: zodResolver(performanceSchema),
    defaultValues: {
      performanceType: 'SINGING',
      duration: 180, // 3 minutes default
      songTitle: '',
      artistName: '',
      description: '',
      guestName: '',
      guestEmail: '',
      guestPhone: '',
    },
  });

  // Load QR code info - using GET instead of POST for read operations
  const { data: qrCodeInfo, isLoading, error } = useQuery({
    queryKey: ['performance-qr-code', code],
    queryFn: async () => {
      // Use GET with query parameter instead of POST for scanning QR codes
      const response = await get<QRCodeInfo>(`/performance/qr-codes/scan?code=${encodeURIComponent(code!)}`);
      return response;
    },
    enabled: !!code,
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    retry: false, // Don't retry on error
  });

  // Handle side effects when data or error changes (React Query v5 pattern)
  useEffect(() => {
    if (qrCodeInfo) {
      // Check if registration is still valid
      if (!qrCodeInfo.isActive) {
        setErrorMessage('This QR code is no longer active.');
        setStep('error');
        return;
      }
      if (qrCodeInfo.registrationDeadline && new Date(qrCodeInfo.registrationDeadline) < new Date()) {
        setErrorMessage('Registration deadline has passed.');
        setStep('error');
        return;
      }
      if (qrCodeInfo.maxRegistrations && qrCodeInfo.registrationCount >= qrCodeInfo.maxRegistrations) {
        setErrorMessage('Maximum registrations reached.');
        setStep('error');
        return;
      }
      setStep('form');
    }
  }, [qrCodeInfo]);

  useEffect(() => {
    if (error) {
      setErrorMessage('QR code not found or invalid.');
      setStep('error');
    }
  }, [error]);

  // Submit registration
  const registerMutation = useMutation({
    mutationFn: (data: PerformanceFormData) =>
      post('/performance/registrations', {
        qrCodeId: qrCodeInfo?.id,
        showId: qrCodeInfo?.showId,
        stageId: qrCodeInfo?.stageId,
        ...data,
      }),
    onSuccess: () => {
      setStep('success');
      toast.success('Registration submitted successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to submit registration');
    },
  });

  const onSubmit = (data: PerformanceFormData) => {
    // Validate guest info if not authenticated
    if (!isAuthenticated && (!data.guestName || !data.guestPhone)) {
      toast.error('Please provide your name and phone number');
      return;
    }
    registerMutation.mutate(data);
  };

  // No code provided
  if (!code) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 to-brand-100 p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-red-600 mb-2">Invalid QR Code</h2>
            <p className="text-neutral-600">
              Please scan a valid QR code to register for performance.
            </p>
            <Button onClick={() => router.push('/')} className="mt-6">
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Loading state
  if (isLoading || step === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 to-brand-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto" />
          <p className="mt-4 text-neutral-600">Loading registration info...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || step === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 to-brand-100 p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-red-600 mb-2">Registration Unavailable</h2>
            <p className="text-neutral-600">{errorMessage || 'This QR code is invalid or expired.'}</p>
            <Button onClick={() => router.push('/')} className="mt-6">
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success state
  if (step === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-green-600 mb-3">Registration Successful!</h2>
            <p className="text-neutral-600 mb-6">
              Your performance registration has been submitted. The organizers will review and contact you soon.
            </p>

            {qrCodeInfo && (
              <div className="bg-neutral-50 rounded-lg p-4 text-left space-y-2 mb-6">
                <p className="text-sm">
                  <span className="font-semibold">Show:</span> {qrCodeInfo.show.title}
                </p>
                <p className="text-sm">
                  <span className="font-semibold">Stage:</span> {qrCodeInfo.stage.name}
                </p>
                <p className="text-sm">
                  <span className="font-semibold">Time:</span> {formatDateTime(qrCodeInfo.show.performTime)}
                </p>
              </div>
            )}

            <Button onClick={() => router.push('/')} className="w-full">
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Registration form
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-brand-100 py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Show Info Card */}
        {qrCodeInfo && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-brand-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Mic2 className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold">{qrCodeInfo.show.title}</h1>
                  <div className="flex flex-wrap gap-4 mt-2 text-neutral-600">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {formatDateTime(qrCodeInfo.show.performTime)}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {qrCodeInfo.stage.name} - {qrCodeInfo.stage.location.name}
                    </span>
                  </div>
                  {qrCodeInfo.maxRegistrations && (
                    <Badge variant="secondary" className="mt-2">
                      {qrCodeInfo.registrationCount} / {qrCodeInfo.maxRegistrations} spots filled
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Registration Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Music className="w-5 h-5" />
              Performance Registration
            </CardTitle>
            <CardDescription>
              Fill in the details about your performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Guest Info (if not logged in) */}
              {!isAuthenticated && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-4">
                  <p className="text-sm text-amber-800 font-semibold flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Contact Information
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>
                        Full Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        {...register('guestName')}
                        placeholder="John Doe"
                        className="mt-1"
                      />
                      {errors.guestName && (
                        <p className="text-sm text-red-500 mt-1">{errors.guestName.message}</p>
                      )}
                    </div>
                    <div>
                      <Label>
                        Phone <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        {...register('guestPhone')}
                        placeholder="0901234567"
                        className="mt-1"
                      />
                      {errors.guestPhone && (
                        <p className="text-sm text-red-500 mt-1">{errors.guestPhone.message}</p>
                      )}
                    </div>
                    <div className="md:col-span-2">
                      <Label>Email (optional)</Label>
                      <Input
                        type="email"
                        {...register('guestEmail')}
                        placeholder="email@example.com"
                        className="mt-1"
                      />
                      {errors.guestEmail && (
                        <p className="text-sm text-red-500 mt-1">{errors.guestEmail.message}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {isAuthenticated && user && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-800">
                    Registering as: <strong>{user.fullName}</strong> ({user.phoneNumber})
                  </p>
                </div>
              )}

              {/* Performance Type */}
              <div>
                <Label className="mb-3 block">
                  Performance Type <span className="text-red-500">*</span>
                </Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {performanceTypes.map((type) => (
                    <label
                      key={type.value}
                      className={`
                        flex items-center gap-2 p-3 border-2 rounded-lg cursor-pointer transition-all
                        ${watch('performanceType') === type.value
                          ? 'border-brand-500 bg-brand-50'
                          : 'border-neutral-200 hover:border-brand-300'
                        }
                      `}
                    >
                      <input
                        type="radio"
                        {...register('performanceType')}
                        value={type.value}
                        className="sr-only"
                      />
                      <span className="text-2xl">{type.icon}</span>
                      <span className="font-medium">{type.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Song/Act Title */}
              <div>
                <Label>
                  Song / Act Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  {...register('songTitle')}
                  placeholder="e.g., Yesterday by The Beatles"
                  className="mt-1"
                />
                {errors.songTitle && (
                  <p className="text-sm text-red-500 mt-1">{errors.songTitle.message}</p>
                )}
              </div>

              {/* Original Artist */}
              <div>
                <Label>Original Artist (if cover)</Label>
                <Input
                  {...register('artistName')}
                  placeholder="e.g., The Beatles"
                  className="mt-1"
                />
              </div>

              {/* Duration */}
              <div>
                <Label>
                  Duration (seconds) <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="number"
                  {...register('duration', { valueAsNumber: true })}
                  min={30}
                  max={600}
                  placeholder="180"
                  className="mt-1"
                />
                <p className="text-xs text-neutral-500 mt-1">
                  Minimum 30 seconds, maximum 10 minutes (600 seconds)
                </p>
                {errors.duration && (
                  <p className="text-sm text-red-500 mt-1">{errors.duration.message}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <Label>Additional Notes (optional)</Label>
                <Textarea
                  {...register('description')}
                  placeholder="Describe your performance, props needed, special requirements..."
                  rows={4}
                  className="mt-1"
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Submitting...
                  </>
                ) : (
                  'Submit Registration'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function RegisterPerformancePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 to-brand-100">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto" />
            <p className="mt-4 text-neutral-600">Loading...</p>
          </div>
        </div>
      }
    >
      <RegisterPerformanceContent />
    </Suspense>
  );
}
