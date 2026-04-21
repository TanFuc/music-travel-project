'use client';
import React from 'react';
import { CheckCircle, Download, Share2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
interface BankQRSuccessProps {
  transactionId?: string;
  amount?: number;
  bankName?: string;
  onDownloadReceipt?: () => void;
  onShare?: () => void;
  onContinue?: () => void;
  className?: string;
}
export default function BankQRSuccess({
  transactionId,
  amount,
  bankName,
  onDownloadReceipt,
  onShare,
  onContinue,
  className = '',
}: BankQRSuccessProps) {
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };
  return (
    <Card className={`mx-auto w-full max-w-md ${className}`}>
      <CardContent className="p-6">
        <div className="space-y-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>

          <div>
            <h3 className="mb-2 text-xl font-bold text-green-600">Thanh toán thành công!</h3>
            <p className="text-gray-600">Giao dịch của bạn đã được xử lý thành công</p>
          </div>

          <div className="space-y-3 rounded-lg bg-gray-50 p-4">
            {transactionId && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Mã giao dịch:</span>
                <Badge variant="outline" className="font-mono">
                  {transactionId}
                </Badge>
              </div>
            )}

            {amount && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Số tiền:</span>
                <span className="font-bold text-green-600">{formatAmount(amount)}</span>
              </div>
            )}

            {bankName && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Ngân hàng:</span>
                <span className="font-medium">{bankName}</span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Thời gian:</span>
              <span className="text-sm">{new Date().toLocaleString('vi-VN')}</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              {onDownloadReceipt && (
                <Button variant="outline" size="sm" onClick={onDownloadReceipt}>
                  <Download className="mr-1 h-4 w-4" />
                  Tải biên lai
                </Button>
              )}

              {onShare && (
                <Button variant="outline" size="sm" onClick={onShare}>
                  <Share2 className="mr-1 h-4 w-4" />
                  Chia sẻ
                </Button>
              )}
            </div>

            {onContinue && (
              <Button onClick={onContinue} className="w-full">
                Tiếp tục
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            )}
          </div>

          <p className="text-xs text-gray-500">Biên lai giao dịch đã được gửi về email của bạn</p>
        </div>
      </CardContent>
    </Card>
  );
}
