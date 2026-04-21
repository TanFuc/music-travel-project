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
import { get, post } from '@/lib/api';
import { useAuthStore } from '@/stores/auth.store';
import { formatDateTime } from '@/lib/utils';
import { toast } from 'sonner';
import { CheckCircle, AlertCircle, Clock, MapPin, Music, User, Mic2 } from 'lucide-react';
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
      duration: 180,
      songTitle: '',
      artistName: '',
      description: '',
      guestName: '',
      guestEmail: '',
      guestPhone: '',
    },
  });
  const {
    data: qrCodeInfo,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['performance-qr-code', code],
    queryFn: async () => {
      const response = await get<QRCodeInfo>(
        `/performance/qr-codes/scan?code=${encodeURIComponent(code!)}`
      );
      return response;
    },
    enabled: !!code,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
  useEffect(() => {
    if (qrCodeInfo) {
      if (!qrCodeInfo.isActive) {
        setErrorMessage('This QR code is no longer active.');
        setStep('error');
        return;
      }
      if (
        qrCodeInfo.registrationDeadline &&
        new Date(qrCodeInfo.registrationDeadline) < new Date()
      ) {
        setErrorMessage('Registration deadline has passed.');
        setStep('error');
        return;
      }
      if (
        qrCodeInfo.maxRegistrations &&
        qrCodeInfo.registrationCount >= qrCodeInfo.maxRegistrations
      ) {
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
    if (!isAuthenticated && (!data.guestName || !data.guestPhone)) {
      toast.error('Please provide your name and phone number');
      return;
    }
    registerMutation.mutate(data);
  };
  if (!code) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-50 to-brand-100 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="mx-auto mb-4 h-16 w-16 text-red-500" />
            <h2 className="mb-2 text-xl font-bold text-red-600">Invalid QR Code</h2>
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
  if (isLoading || step === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-50 to-brand-100">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-brand-500" />
          <p className="mt-4 text-neutral-600">Loading registration info...</p>
        </div>
      </div>
    );
  }
  if (error || step === 'error') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-50 to-brand-100 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="mx-auto mb-4 h-16 w-16 text-red-500" />
            <h2 className="mb-2 text-xl font-bold text-red-600">Registration Unavailable</h2>
            <p className="text-neutral-600">
              {errorMessage || 'This QR code is invalid or expired.'}
            </p>
            <Button onClick={() => router.push('/')} className="mt-6">
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  if (step === 'success') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 to-green-100 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-500">
              <CheckCircle className="h-12 w-12 text-white" />
            </div>
            <h2 className="mb-3 text-2xl font-bold text-green-600">Registration Successful!</h2>
            <p className="mb-6 text-neutral-600">
              Your performance registration has been submitted. The organizers will review and
              contact you soon.
            </p>

            {qrCodeInfo && (
              <div className="mb-6 space-y-2 rounded-lg bg-neutral-50 p-4 text-left">
                <p className="text-sm">
                  <span className="font-semibold">Show:</span> {qrCodeInfo.show.title}
                </p>
                <p className="text-sm">
                  <span className="font-semibold">Stage:</span> {qrCodeInfo.stage.name}
                </p>
                <p className="text-sm">
                  <span className="font-semibold">Time:</span>{' '}
                  {formatDateTime(qrCodeInfo.show.performTime)}
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
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-brand-100 px-4 py-8">
      <div className="mx-auto max-w-2xl space-y-6">
        {qrCodeInfo && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-xl bg-brand-500">
                  <Mic2 className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold">{qrCodeInfo.show.title}</h1>
                  <div className="mt-2 flex flex-wrap gap-4 text-neutral-600">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {formatDateTime(qrCodeInfo.show.performTime)}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
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

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Music className="h-5 w-5" />
              Performance Registration
            </CardTitle>
            <CardDescription>Fill in the details about your performance</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {!isAuthenticated && (
                <div className="space-y-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
                  <p className="flex items-center gap-2 text-sm font-semibold text-amber-800">
                    <User className="h-4 w-4" />
                    Contact Information
                  </p>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <Label>
                        Full Name <span className="text-red-500">*</span>
                      </Label>
                      <Input {...register('guestName')} placeholder="John Doe" className="mt-1" />
                      {errors.guestName && (
                        <p className="mt-1 text-sm text-red-500">{errors.guestName.message}</p>
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
                        <p className="mt-1 text-sm text-red-500">{errors.guestPhone.message}</p>
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
                        <p className="mt-1 text-sm text-red-500">{errors.guestEmail.message}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {isAuthenticated && user && (
                <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                  <p className="text-sm text-green-800">
                    Registering as: <strong>{user.fullName}</strong> ({user.phoneNumber})
                  </p>
                </div>
              )}

              <div>
                <Label className="mb-3 block">
                  Performance Type <span className="text-red-500">*</span>
                </Label>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                  {performanceTypes.map((type) => (
                    <label
                      key={type.value}
                      className={`
                        flex cursor-pointer items-center gap-2 rounded-lg border-2 p-3 transition-all
                        ${
                          watch('performanceType') === type.value
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
                  <p className="mt-1 text-sm text-red-500">{errors.songTitle.message}</p>
                )}
              </div>

              <div>
                <Label>Original Artist (if cover)</Label>
                <Input
                  {...register('artistName')}
                  placeholder="e.g., The Beatles"
                  className="mt-1"
                />
              </div>

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
                <p className="mt-1 text-xs text-neutral-500">
                  Minimum 30 seconds, maximum 10 minutes (600 seconds)
                </p>
                {errors.duration && (
                  <p className="mt-1 text-sm text-red-500">{errors.duration.message}</p>
                )}
              </div>

              <div>
                <Label>Additional Notes (optional)</Label>
                <Textarea
                  {...register('description')}
                  placeholder="Describe your performance, props needed, special requirements..."
                  rows={4}
                  className="mt-1"
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white" />
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
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-50 to-brand-100">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-brand-500" />
            <p className="mt-4 text-neutral-600">Loading...</p>
          </div>
        </div>
      }
    >
      <RegisterPerformanceContent />
    </Suspense>
  );
}
