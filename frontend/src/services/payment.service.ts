import { api } from '@/lib/api';
export interface BankQRRequest {
  bankCode: string;
  accountNumber: string;
  accountName: string;
  amount?: number;
  description?: string;
}
export interface BankQRResponse {
  qrBase64: string;
  qrContent: string;
  deeplink: string | null;
  bankCode: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  amount?: number;
  description?: string;
}
export interface QRPaymentRequest {
  amount?: number;
  description?: string;
}
export interface QRPaymentResponse {
  success: boolean;
  qrImageBase64: string;
  qrImageUrl?: string;
  qrContent: string;
  bank: {
    bankCode: string;
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
  amount?: number;
  description?: string;
  deeplink?: string;
}
export interface BankInfo {
  code: string;
  name: string;
  shortName: string;
  logo?: string;
  deeplinkScheme?: string;
}
export interface QRValidationResponse {
  isValid: boolean;
  data?: {
    bankCode: string;
    accountNumber: string;
    accountName: string;
    amount?: number;
    description?: string;
  };
  error?: string;
}
class PaymentService {
  private readonly baseUrl = '/payment';
  async generateBankQR(data: BankQRRequest): Promise<BankQRResponse> {
    const response = await api.post(`${this.baseUrl}/generate-custom-qr`, data);
    return response.data.data;
  }
  async generateQRPayment(data: QRPaymentRequest): Promise<QRPaymentResponse> {
    const response = await api.post(`${this.baseUrl}/generate-qr`, data);
    return response.data;
  }
  async generateQRImage(params: BankQRRequest): Promise<Blob> {
    const queryParams = new URLSearchParams();
    queryParams.append('bankCode', params.bankCode);
    queryParams.append('accountNumber', params.accountNumber);
    queryParams.append('accountName', params.accountName);
    if (params.amount) queryParams.append('amount', params.amount.toString());
    if (params.description) queryParams.append('description', params.description);
    const response = await api.get(`${this.baseUrl}/qr-image?${queryParams.toString()}`);
    const { qrBase64 } = response.data.data;
    const base64Data = qrBase64.split(',')[1];
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: 'image/png' });
  }
  async getSupportedBanks(): Promise<Record<string, BankInfo>> {
    const response = await api.get(`${this.baseUrl}/banks`);
    return response.data.data;
  }
  async validateQR(qrString: string): Promise<QRValidationResponse> {
    const response = await api.post(`${this.baseUrl}/validate-qr`, { qrString });
    return response.data.data;
  }
  async getTestQR(): Promise<BankQRResponse> {
    const response = await api.get(`${this.baseUrl}/test-qr`);
    return response.data.data;
  }
  async healthCheck(): Promise<{
    message: string;
    supportedBanks: number;
  }> {
    const response = await api.get(`${this.baseUrl}/health`);
    return response.data.data;
  }
  downloadQRImage(blob: Blob, filename: string = 'qr-code.png') {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
  async copyToClipboard(text: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textArea);
      return success;
    }
  }
  async shareQR(data: BankQRResponse): Promise<boolean> {
    if (!navigator.share) {
      return false;
    }
    try {
      await navigator.share({
        title: 'Mã QR Thanh Toán',
        text: `Thanh toán cho ${data.bankName} - ${data.accountName}${data.amount ? ` - ${data.amount.toLocaleString('vi-VN')} VND` : ''}`,
        url: data.deeplink || undefined,
      });
      return true;
    } catch {
      return false;
    }
  }
  openBankApp(deeplink: string): void {
    const link = document.createElement('a');
    link.href = deeplink;
    link.click();
    if (this.isMobile()) {
      setTimeout(() => {
        if (!document.hidden) {
          alert('Vui lòng mở ứng dụng ngân hàng thủ công và quét mã QR');
        }
      }, 2000);
    }
  }
  isMobile(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  }
  formatAmount(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  }
}
export const paymentService = new PaymentService();
