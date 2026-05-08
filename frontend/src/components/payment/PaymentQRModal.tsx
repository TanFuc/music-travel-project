'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { Loader2, RefreshCw, Download, Timer } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { paymentService, QRPaymentResponse } from '@/services/payment.service';
interface PaymentQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultAmount?: number;
  defaultDescription?: string;
  onSuccess?: () => void;
  expirationSeconds?: number;
}
export default function PaymentQRModal({
  isOpen,
  onClose,
  defaultAmount,
  defaultDescription,
  onSuccess,
  expirationSeconds = 600,
}: PaymentQRModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [qrData, setQrData] = useState<QRPaymentResponse | null>(null);
  const [timeLeft, setTimeLeft] = useState(expirationSeconds);
  const [isExpired, setIsExpired] = useState(false);
  const handleClose = () => {
    setLoading(false);
    setError(null);
    setQrData(null);
    setTimeLeft(expirationSeconds);
    setIsExpired(false);
    onClose();
  };
  const generateQR = useCallback(async () => {
    setLoading(true);
    setError(null);
    setQrData(null);
    setIsExpired(false);
    setTimeLeft(expirationSeconds);
    try {
      const response = await paymentService.generateQRPayment({
        amount: defaultAmount,
        description: defaultDescription,
      });
      setQrData(response);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Không thể tạo mã QR. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, [defaultAmount, defaultDescription, expirationSeconds]);
  const handleRetry = () => {
    generateQR();
  };
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + ' VND';
  };
  const handleDownloadQR = useCallback(async () => {
    if (!qrData) return;
    const filename = `qr-thanh-toan-${Date.now()}.png`;
    try {
      const imageSrc = qrData.qrImageUrl ?? qrData.qrImageBase64;
      if (!imageSrc) return;
      if (imageSrc.startsWith('data:')) {
        const link = document.createElement('a');
        link.href = imageSrc;
        link.download = filename;
        link.click();
        return;
      }
      const res = await fetch(imageSrc);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      setError('Không thể tải ảnh QR. Vui lòng thử lại.');
    }
  }, [qrData]);
  useEffect(() => {
    if (isOpen) {
      if (!qrData && !loading && !error) {
        generateQR();
      }
      setTimeLeft(expirationSeconds);
      setIsExpired(false);
    }
  }, [isOpen, qrData, loading, error, generateQR, expirationSeconds]);
  useEffect(() => {
    if (!isOpen || isExpired || loading || error) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, isExpired, loading, error]);
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Mã QR thanh toán</DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {loading && (
            <div className="flex flex-col items-center justify-center space-y-4 py-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <p className="text-sm text-gray-600">Đang tạo mã QR...</p>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center justify-center space-y-4 py-8">
              <div className="text-center">
                <p className="mb-4 text-sm text-red-600">{error}</p>
                <Button onClick={handleRetry} variant="outline" size="sm">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Thử lại
                </Button>
              </div>
            </div>
          )}

          {isExpired ? (
            <div className="flex flex-col items-center justify-center space-y-4 py-8">
              <div className="rounded-full bg-red-50 p-4">
                <Timer className="h-8 w-8 text-red-500" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900">Mã QR đã hết hạn</h3>
                <p className="mx-auto mb-6 mt-1 max-w-xs text-sm text-gray-500">
                  Vui lòng tạo mã mới để tiếp tục thanh toán. Mã cũ không còn hiệu lực.
                </p>
                <Button onClick={handleRetry} className="bg-brand-600 hover:bg-brand-700">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Tạo mã mới
                </Button>
              </div>
            </div>
          ) : qrData ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 p-3">
                <div className="flex items-center gap-2 text-amber-700">
                  <Timer className="h-4 w-4" />
                  <span className="text-sm font-medium">Hết hạn sau:</span>
                </div>
                <span className="font-mono text-lg font-bold text-amber-600">
                  {formatTime(timeLeft)}
                </span>
              </div>

              <div className="flex justify-center">
                <div className=" rounded-lg bg-white">
                  <img
                    src={qrData.qrImageUrl ?? qrData.qrImageBase64}
                    alt="QR Code"
                    className="h-48 w-48"
                  />
                </div>
              </div>

              <div className="space-y-3 rounded-lg bg-gray-50 p-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Ngân hàng:</span>
                  <span className="text-sm font-medium">{qrData.bank.bankName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">STK:</span>
                  <span className="text-sm font-medium">{qrData.bank.accountNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Tên:</span>
                  <span className="text-sm font-medium">{qrData.bank.accountName}</span>
                </div>
                {qrData.amount && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Số tiền:</span>
                    <span className="text-sm font-medium text-blue-600">
                      {formatAmount(qrData.amount)}
                    </span>
                  </div>
                )}
                {qrData.description && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Nội dung:</span>
                    <span className="text-sm font-medium">{qrData.description}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Button onClick={handleDownloadQR} className="w-full" size="lg" variant="secondary">
                  <Download className="mr-2 h-4 w-4" />
                  Tải ảnh QR
                </Button>
                <Button
                  onClick={() => onSuccess && onSuccess()}
                  className="w-full bg-brand-600 text-white hover:bg-brand-700"
                  size="lg"
                >
                  Xác nhận đã chuyển khoản
                </Button>{' '}
                <Button onClick={handleClose} variant="outline" className="w-full" size="lg">
                  Đóng
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
