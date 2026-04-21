'use client';
import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Download,
  Copy,
  Share2,
  Smartphone,
  CreditCard,
  Clock,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/useToast';
import { paymentService, BankQRRequest, BankQRResponse } from '@/services/payment.service';
import BankQRSuccess from './BankQRSuccess';
interface BankQRPaymentProps {
  paymentData: BankQRRequest;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  className?: string;
}
export default function BankQRPayment({
  paymentData,
  onSuccess,
  onError,
  className = '',
}: BankQRPaymentProps) {
  const [qrData, setQrData] = useState<BankQRResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingImage, setDownloadingImage] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'failed'>('pending');
  const { toast } = useToast();
  useEffect(() => {
    generateQR();
  }, [paymentData]);
  const generateQR = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await paymentService.generateBankQR(paymentData);
      setQrData(response);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Không thể tạo mã QR';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  const handleDownloadImage = async () => {
    if (!qrData) return;
    try {
      setDownloadingImage(true);
      const blob = await paymentService.generateQRImage(paymentData);
      const filename = `qr-${qrData.bankCode}-${Date.now()}.png`;
      paymentService.downloadQRImage(blob, filename);
      toast.success('Đã tải xuống mã QR');
    } catch (err) {
      toast.error('Không thể tải xuống hình ảnh');
    } finally {
      setDownloadingImage(false);
    }
  };
  const handleCopyQR = async () => {
    if (!qrData) return;
    const success = await paymentService.copyToClipboard(qrData.qrContent);
    if (success) {
      toast.success('Đã sao chép mã QR');
    } else {
      toast.error('Không thể sao chép');
    }
  };
  const handleShare = async () => {
    if (!qrData) return;
    const success = await paymentService.shareQR(qrData);
    if (!success) {
      toast.info('Trình duyệt không hỗ trợ chia sẻ');
    }
  };
  const handleOpenBankApp = () => {
    if (!qrData?.deeplink) return;
    paymentService.openBankApp(qrData.deeplink);
    toast.info('Chuyển hướng đến ứng dụng ngân hàng...');
  };
  const simulatePaymentSuccess = () => {
    setPaymentStatus('success');
    setTimeout(() => {
      onSuccess?.();
    }, 1000);
  };
  if (loading) {
    return (
      <Card className={`mx-auto w-full max-w-md ${className}`}>
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin" />
            <p>Đang tạo mã QR...</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  if (error) {
    return (
      <Card className={`mx-auto w-full max-w-md ${className}`}>
        <CardContent className="p-6">
          <div className="text-center">
            <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
            <h3 className="mb-2 text-lg font-semibold">Có lỗi xảy ra</h3>
            <p className="mb-4 text-gray-600">{error}</p>
            <Button onClick={generateQR} variant="outline">
              Thử lại
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  if (!qrData) return null;
  if (paymentStatus === 'success') {
    return (
      <BankQRSuccess
        transactionId={`QR${Date.now()}`}
        amount={qrData.amount}
        bankName={qrData.bankName}
        onDownloadReceipt={() => {
          toast.info('Tính năng tải biên lai đang được phát triển');
        }}
        onShare={() => {
          paymentService.shareQR(qrData);
        }}
        onContinue={onSuccess}
        className={className}
      />
    );
  }
  return (
    <div className={`mx-auto w-full max-w-md space-y-4 ${className}`}>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Thanh toán QR</CardTitle>
            <Badge variant="secondary">
              {paymentStatus === 'pending' && (
                <>
                  <Clock className="mr-1 h-3 w-3" />
                  Chờ thanh toán
                </>
              )}
              {paymentStatus === 'failed' && (
                <>
                  <AlertCircle className="mr-1 h-3 w-3" />
                  Thất bại
                </>
              )}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="mb-4 inline-block rounded-lg bg-white p-4 shadow-sm">
              <QRCodeSVG
                value={qrData.qrContent}
                size={200}
                level="M"
                includeMargin={true}
                className="mx-auto"
              />
            </div>

            <div className="mb-4 space-y-2">
              <div className="flex items-center justify-center gap-2">
                <CreditCard className="h-4 w-4" />
                <span className="font-medium">{qrData.bankName}</span>
              </div>
              <p className="text-sm text-gray-600">
                {qrData.accountName} • {qrData.accountNumber}
              </p>
              {qrData.amount && (
                <p className="text-lg font-bold text-blue-600">
                  {paymentService.formatAmount(qrData.amount)}
                </p>
              )}
              {qrData.description && <p className="text-sm text-gray-500">{qrData.description}</p>}
            </div>

            <div className="mb-4 grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadImage}
                disabled={downloadingImage}
              >
                {downloadingImage ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                <span className="ml-1">Tải xuống</span>
              </Button>

              <Button variant="outline" size="sm" onClick={handleCopyQR}>
                <Copy className="h-4 w-4" />
                <span className="ml-1">Sao chép</span>
              </Button>

              <Button variant="outline" size="sm" onClick={handleShare} className="col-span-1">
                <Share2 className="h-4 w-4" />
                <span className="ml-1">Chia sẻ</span>
              </Button>

              {qrData.deeplink && paymentService.isMobile() && (
                <Button
                  size="sm"
                  onClick={handleOpenBankApp}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Smartphone className="h-4 w-4" />
                  <span className="ml-1">Mở app</span>
                </Button>
              )}
            </div>

            <div className="space-y-1 text-xs text-gray-500">
              <p>• Mở ứng dụng ngân hàng và quét mã QR</p>
              <p>• Hoặc chụp ảnh mã QR để thanh toán sau</p>
              {paymentService.isMobile() && qrData.deeplink && (
                <p>• Nhấn "Mở app" để chuyển trực tiếp</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {process.env.NODE_ENV === 'development' && paymentStatus === 'pending' && (
        <Button onClick={simulatePaymentSuccess} variant="outline" size="sm" className="w-full">
          [Demo] Giả lập thanh toán thành công
        </Button>
      )}
    </div>
  );
}
