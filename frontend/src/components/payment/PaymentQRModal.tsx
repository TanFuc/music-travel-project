'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Loader2, RefreshCw, Download } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { paymentService, QRPaymentResponse } from '@/services/payment.service';

interface PaymentQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultAmount?: number;
  defaultDescription?: string;
  onSuccess?: () => void;
}

export default function PaymentQRModal({
  isOpen,
  onClose,
  defaultAmount,
  defaultDescription,
  onSuccess
}: PaymentQRModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [qrData, setQrData] = useState<QRPaymentResponse | null>(null);

  console.log('qrData', qrData);

  const handleClose = () => {
    setLoading(false);
    setError(null);
    setQrData(null);
    onClose();
  };

  const generateQR = async () => {
    setLoading(true);
    setError(null);
    setQrData(null);

    try {
      const response = await paymentService.generateQRPayment({
        amount: defaultAmount,
        description: defaultDescription,
      });
      setQrData(response);
    } catch (err: any) {
      console.error('Failed to generate QR:', err);
      setError(err?.response?.data?.message || 'Không thể tạo mã QR. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    generateQR();
  };

  const handleOpenBankApp = () => {
    if (qrData?.deeplink) {
      paymentService.openBankApp(qrData.deeplink);
    }
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
    } catch (err) {
      console.error('Download QR failed:', err);
      setError('Không thể tải ảnh QR. Vui lòng thử lại.');
    }
  }, [qrData]);

  // Auto-generate QR when modal opens
  useEffect(() => {
    if (isOpen && !qrData && !loading && !error) {
      generateQR();
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Mã QR thanh toán</DialogTitle>
            {/* <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="p-1 h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button> */}
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {loading && (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <p className="text-sm text-gray-600">Đang tạo mã QR...</p>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <div className="text-center">
                <p className="text-sm text-red-600 mb-4">{error}</p>
                <Button onClick={handleRetry} variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Thử lại
                </Button>
              </div>
            </div>
          )}

          {qrData && (
            <div className="space-y-6">
              {/* QR Code Image - prefer VietQR.io URL (accepted by all bank apps) */}
              <div className="flex justify-center">
                <div className=" bg-white rounded-lg">
                  <img
                    src={qrData.qrImageUrl ?? qrData.qrImageBase64}
                    alt="QR Code"
                    className="w-48 h-48"
                  />
                </div>
              </div>

              {/* Bank Information */}
              <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
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

              {/* Action Buttons */}
              <div className="space-y-2">
                {/* {qrData.deeplink && (
                  <Button
                    onClick={handleOpenBankApp}
                    className="w-full"
                    size="lg"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Mở app ngân hàng
                  </Button>
                )} */}
                <Button
                  onClick={handleDownloadQR}
                  className="w-full"
                  size="lg"
                  variant="secondary"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Tải ảnh QR
                </Button>
                <Button
                  onClick={handleClose}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  Đóng
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}