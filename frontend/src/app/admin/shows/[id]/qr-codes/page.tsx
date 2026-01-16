'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { QRCodeSVG } from 'qrcode.react';
import { Download, RefreshCw, Copy, ArrowLeft, QrCode } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/common/LoadingSkeleton';
import { get, post } from '@/lib/api';
import { formatDateTime } from '@/lib/utils';
import { toast } from 'sonner';

interface QRCodeData {
  id: number;
  code: string;
  showId: number;
  stageId: number;
  isActive: boolean;
  maxRegistrations: number | null;
  registrationDeadline: string | null;
  scanCount: number;
  registrationCount: number;
  stage: {
    id: number;
    name: string;
    location: { name: string };
  };
}

interface ShowData {
  id: number;
  title: string;
  performTime: string;
  stage: {
    id: number;
    name: string;
    location: { name: string };
  };
}

export default function ShowQRCodesPage() {
  const params = useParams();
  const queryClient = useQueryClient();
  const showId = parseInt(params.id as string);

  // Load show details
  const { data: show, isLoading: showLoading } = useQuery({
    queryKey: ['admin-show', showId],
    queryFn: () => get<ShowData>(`/admin/shows/${showId}`),
    enabled: !!showId,
  });

  // Load existing QR codes
  const { data: qrCodes = [], isLoading: qrLoading } = useQuery({
    queryKey: ['performance-qr-codes', showId],
    queryFn: () => get<QRCodeData[]>(`/admin/performance/shows/${showId}/qr-codes`),
    enabled: !!showId,
  });

  // Generate QR code mutation
  const generateQRMutation = useMutation({
    mutationFn: (stageId: number) =>
      post(`/admin/performance/shows/${showId}/qr-codes`, {
        stageId,
        maxRegistrations: 50,
        registrationDeadline: show?.performTime,
      }),
    onSuccess: () => {
      toast.success('QR code created successfully!');
      queryClient.invalidateQueries({ queryKey: ['performance-qr-codes', showId] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create QR code');
    },
  });

  const handleGenerateQR = (stageId: number) => {
    generateQRMutation.mutate(stageId);
  };

  const handleDownloadQR = (code: string) => {
    const svg = document.getElementById(`qr-${code}`);
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);

      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `QR-${code}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const handleCopyLink = (code: string) => {
    const url = `${window.location.origin}/register-performance?code=${code}`;
    navigator.clipboard.writeText(url);
    toast.success('Registration link copied!');
  };

  const isLoading = showLoading || qrLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const existingQRCode = qrCodes.find((qr) => qr.stageId === show?.stage.id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/admin/shows/${showId}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <QrCode className="h-6 w-6" />
              Performance Registration QR Codes
            </h1>
            <p className="text-neutral-600">
              Create QR codes for audience performance registration
            </p>
          </div>
        </div>
      </div>

      {/* Show Info */}
      {show && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-brand-100 rounded-lg flex items-center justify-center">
                <span className="text-3xl">🎤</span>
              </div>
              <div>
                <h2 className="text-xl font-bold">{show.title}</h2>
                <p className="text-neutral-600">{formatDateTime(show.performTime)}</p>
                <p className="text-sm text-neutral-500">
                  Stage: {show.stage.name} - {show.stage.location.name}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* QR Code Card */}
      {show?.stage && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{show.stage.name}</span>
              {!existingQRCode && (
                <Button
                  size="sm"
                  onClick={() => handleGenerateQR(show.stage.id)}
                  disabled={generateQRMutation.isPending}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${generateQRMutation.isPending ? 'animate-spin' : ''}`} />
                  Generate QR Code
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!existingQRCode ? (
              <div className="text-center py-12 text-neutral-500">
                <QrCode className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>No QR code yet</p>
                <p className="text-sm mt-2">
                  Click &quot;Generate QR Code&quot; to create registration code
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* QR Code Display */}
                <div className="flex justify-center p-6 bg-white border-2 border-dashed rounded-lg">
                  <QRCodeSVG
                    id={`qr-${existingQRCode.code}`}
                    value={`${typeof window !== 'undefined' ? window.location.origin : ''}/register-performance?code=${existingQRCode.code}`}
                    size={200}
                    level="H"
                    includeMargin
                  />
                </div>

                {/* QR Code Info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-neutral-50 rounded-lg">
                    <p className="text-sm text-neutral-600">QR Code</p>
                    <p className="font-mono font-semibold text-sm">{existingQRCode.code}</p>
                  </div>
                  <div className="p-4 bg-neutral-50 rounded-lg">
                    <p className="text-sm text-neutral-600">Scans</p>
                    <p className="text-2xl font-bold">{existingQRCode.scanCount}</p>
                  </div>
                  <div className="p-4 bg-neutral-50 rounded-lg">
                    <p className="text-sm text-neutral-600">Registrations</p>
                    <p className="text-2xl font-bold text-brand-600">
                      {existingQRCode.registrationCount}
                      {existingQRCode.maxRegistrations && ` / ${existingQRCode.maxRegistrations}`}
                    </p>
                  </div>
                  <div className="p-4 bg-neutral-50 rounded-lg">
                    <p className="text-sm text-neutral-600">Status</p>
                    <Badge variant={existingQRCode.isActive ? 'success' : 'secondary'}>
                      {existingQRCode.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>

                {existingQRCode.registrationDeadline && (
                  <p className="text-sm text-neutral-500 text-center">
                    Registration deadline: {formatDateTime(existingQRCode.registrationDeadline)}
                  </p>
                )}

                {/* Actions */}
                <div className="flex gap-3 justify-center">
                  <Button variant="outline" onClick={() => handleDownloadQR(existingQRCode.code)}>
                    <Download className="w-4 h-4 mr-2" />
                    Download PNG
                  </Button>
                  <Button variant="outline" onClick={() => handleCopyLink(existingQRCode.code)}>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Link
                  </Button>
                  <Link href={`/admin/shows/${showId}/registrations`}>
                    <Button>
                      View Registrations ({existingQRCode.registrationCount})
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
