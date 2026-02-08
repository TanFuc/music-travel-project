'use client';

import React, { useState } from 'react';
import { QrCode, CreditCard, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PaymentQRModal from '@/components/payment/PaymentQRModal';

export default function PaymentDemoPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [demoScenario, setDemoScenario] = useState<{
    amount?: number;
    description?: string;
  }>({});

  const demoScenarios = [
    {
      title: 'Thanh toán vé show',
      amount: 500000,
      description: 'Thanh toan ve xem show Son Tung MTP',
      icon: <CreditCard className="h-5 w-5" />,
    },
    {
      title: 'Thanh toán tour',
      amount: 2500000,
      description: 'Tour Da Lat 3 ngay 2 dem',
      icon: <Smartphone className="h-5 w-5" />,
    },
    {
      title: 'Thanh toán tự do',
      amount: undefined,
      description: '',
      icon: <QrCode className="h-5 w-5" />,
    },
  ];

  const handleOpenModal = (scenario: { amount?: number; description?: string }) => {
    setDemoScenario(scenario);
    setIsModalOpen(true);
  };

  const handlePaymentSuccess = () => {
    alert('Thanh toán thành công! 🎉');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">Demo Thanh Toán QR</h1>
        <p className="text-gray-600">
          Tạo mã QR thanh toán cho các ngân hàng Việt Nam
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {demoScenarios.map((scenario, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {scenario.icon}
                {scenario.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {scenario.amount && (
                  <div>
                    <p className="text-sm text-gray-600">Số tiền:</p>
                    <p className="font-bold text-lg text-blue-600">
                      {scenario.amount.toLocaleString('vi-VN')} VND
                    </p>
                  </div>
                )}
                {scenario.description && (
                  <div>
                    <p className="text-sm text-gray-600">Nội dung:</p>
                    <p className="text-sm">{scenario.description}</p>
                  </div>
                )}
                <Button
                  onClick={() => handleOpenModal(scenario)}
                  className="w-full"
                >
                  Tạo QR
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tính năng hỗ trợ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">🏦 Ngân hàng hỗ trợ</h4>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• Vietcombank (VCB)</li>
                <li>• MBBank (MB)</li>
                <li>• Techcombank (TCB)</li>
                <li>• BIDV, ACB, VPBank...</li>
                <li>• Và 15+ ngân hàng khác</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">📱 Tính năng</h4>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• Tạo mã QR VietQR chuẩn</li>
                <li>• Tải xuống hình ảnh PNG</li>
                <li>• Sao chép mã QR</li>
                <li>• Chia sẻ qua mạng xã hội</li>
                <li>• Mở trực tiếp app ngân hàng</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <PaymentQRModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        defaultAmount={demoScenario.amount}
        defaultDescription={demoScenario.description}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
}