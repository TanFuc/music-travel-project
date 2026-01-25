'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/common/LoadingSkeleton';
import { get, post, patch } from '@/lib/api';
import { toast } from 'sonner';
import { Download, ExternalLink, Printer, Plus, ListMusic } from 'lucide-react';
import { Link } from '@/components/common/Link';

interface Show {
  id: number;
  title: string;
  stageId: number;
  stage: { id: number; name: string; location: { name: string } };
}

interface QRCode {
  id: number;
  code: string;
  isActive: boolean;
  maxRegistrations: number | null;
  registrationDeadline: string | null;
  scanCount: number;
  registrationCount: number;
}

export default function ShowQRCodesPage({ params }: { params: { id: string } }) {
  const showId = parseInt(params.id);
  const queryClient = useQueryClient();
  const [showUrl, setShowUrl] = useState('');

  // Fetch Show Details
  const { data: show, isLoading: isLoadingShow } = useQuery({
    queryKey: ['admin-show', showId],
    queryFn: () => get<Show>(`/admin/shows/${showId}`),
  });

  // Fetch QR Codes
  const { data: qrCodes, isLoading: isLoadingQR } = useQuery({
    queryKey: ['admin-show-qr', showId],
    queryFn: () => get<QRCode[]>(`/admin/performance/shows/${showId}/qr-codes`),
  });

  // Create QR Code Mutation
  const createMutation = useMutation({
    mutationFn: () => post(`/admin/performance/shows/${showId}/qr-codes`, {
      stageId: show?.stageId,
      maxRegistrations: 50, // Default
    }),
    onSuccess: () => {
      toast.success('Tạo mã QR thành công');
      queryClient.invalidateQueries({ queryKey: ['admin-show-qr', showId] });
    },
    onError: (error: any) => {
        toast.error(error?.response?.data?.message || 'Có lỗi khi tạo mã QR');
    }
  });

  const qrCode = qrCodes?.[0]; // Assuming 1 QR for now as per simple flow
  const registrationLink = qrCode ? `${typeof window !== 'undefined' ? window.location.origin : ''}/register-performance?code=${qrCode.code}` : '';

  const handleDownload = () => {
    const svg = document.getElementById('qr-code-svg');
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        const pngFile = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.download = `QR-${show?.title}.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
      };
      img.src = "data:image/svg+xml;base64," + btoa(svgData);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoadingShow || isLoadingQR) {
    return <div className="space-y-4"><Skeleton className="h-10 w-1/3" /><Skeleton className="h-64 w-full" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h1 className="text-2xl font-bold">Mã QR Đăng Ký Biểu Diễn</h1>
            <p className="text-neutral-600">Sự kiện: {show?.title}</p>
        </div>
        <Link href={`/admin/shows/${showId}/registrations`}>
            <Button variant="outline" className="gap-2">
                <ListMusic className="h-4 w-4" />
                Danh sách đăng ký
            </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>QR Code</CardTitle>
          <CardDescription>
            Quét mã này để đăng ký tiết mục biểu diễn tại {show?.stage.name}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-6">
          {!qrCode ? (
            <div className="text-center py-8">
              <p className="mb-4 text-neutral-500">Chưa có mã QR cho sự kiện này</p>
              <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending}>
                <Plus className="mr-2 h-4 w-4" />
                Tạo mã QR ngay
              </Button>
            </div>
          ) : (
            <>
              <div className="bg-white p-4 rounded-xl border-2 border-dashed border-neutral-200 shadow-sm print:border-none">
                <QRCodeSVG
                  id="qr-code-svg"
                  value={registrationLink}
                  size={256}
                  level="H"
                  includeMargin={true}
                />
              </div>

              <div className="flex flex-col items-center gap-2 max-w-md w-full text-center print:hidden">
                <p className="text-sm font-medium text-neutral-700">Link đăng ký:</p>
                <div className="flex w-full items-center space-x-2">
                  <Input readOnly value={registrationLink} />
                  <Button size="icon" variant="outline" onClick={() => {
                    navigator.clipboard.writeText(registrationLink);
                    toast.success('Đã sao chép link');
                  }}>
                    <span className="sr-only">Copy</span>
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 15 15"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                    >
                      <path
                        d="M1 9.50006C1 10.3285 1.67157 11.0001 2.5 11.0001H4L4 10.0001H2.5C2.22386 10.0001 2 9.7762 2 9.50006V2.50006C2 2.22392 2.22386 2.00006 2.5 2.00006L9.5 2.00006C9.77614 2.00006 10 2.22392 10 2.50006V4.00006H11V2.50006C11 1.67163 10.3284 1.00006 9.5 1.00006L2.5 1.00006C1.67157 1.00006 1 1.67163 1 2.50006V9.50006ZM5 5.50006C5 4.67163 5.67157 4.00006 6.5 4.00006H13.5C14.3284 4.00006 15 4.67163 15 5.50006V12.5001C15 13.3285 14.3284 14.0001 13.5 14.0001H6.5C5.67157 14.0001 5 13.3285 5 12.5001V5.50006ZM6.5 5.00006H13.5C13.7761 5.00006 14 5.22392 14 5.50006V12.5001C14 12.7762 13.7761 13.0001 13.5 13.0001H6.5C6.22386 13.0001 6 12.7762 6 12.5001V5.50006C6 5.22392 6.22386 5.00006 6.5 5.00006Z"
                        fill="currentColor"
                        fillRule="evenodd"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                  </Button>
                </div>
              </div>

              <div className="flex gap-4 print:hidden">
                <Button variant="outline" onClick={handleDownload}>
                  <Download className="mr-2 h-4 w-4" />
                  Tải xuống PNG
                </Button>
                <Button variant="outline" onClick={handlePrint}>
                  <Printer className="mr-2 h-4 w-4" />
                  In mã QR
                </Button>
                <a href={registrationLink} target="_blank" rel="noopener noreferrer">
                    <Button>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Mở trang đăng ký
                    </Button>
                </a>
              </div>

              <div className="grid grid-cols-2 gap-4 w-full max-w-lg mt-6 pt-6 border-t print:hidden">
                  <div className="bg-neutral-50 p-4 rounded-lg text-center">
                      <p className="text-xs text-neutral-500 uppercase font-semibold">Lượt quét</p>
                      <p className="text-2xl font-bold">{qrCode.scanCount}</p>
                  </div>
                  <div className="bg-neutral-50 p-4 rounded-lg text-center">
                      <p className="text-xs text-neutral-500 uppercase font-semibold">Đăng ký thành công</p>
                      <p className="text-2xl font-bold text-green-600">{qrCode.registrationCount}</p>
                  </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
      
      {/* CSS for Print */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #qr-code-svg, #qr-code-svg * {
            visibility: visible;
          }
          #qr-code-svg {
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            width: 500px !important;
            height: 500px !important;
          }
        }
      `}</style>
    </div>
  );
}
