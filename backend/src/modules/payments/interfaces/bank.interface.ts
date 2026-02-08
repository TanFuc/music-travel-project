export interface BankInfo {
  code: string;
  name: string;
  fullName: string;
  napasCode: string; // NAPAS bank identification code
  citadCode?: string; // Citad bank code (for VietQR)
  swiftCode?: string;
  appScheme?: string; // Mobile app deeplink scheme
  qrSupported: boolean;
  deeplinkSupported: boolean;
}

export interface VietQRPayload {
  version: string; // "01"
  initMethod: string; // "01" for static, "11" for dynamic
  merchantAccountInfo: string;
  merchantCategoryCode: string; // "0000" for person-to-person
  transactionCurrency: string; // "704" for VND
  amount?: string;
  countryCode: string; // "VN"
  merchantName: string;
  merchantCity: string;
  additionalData?: string;
  crc: string; // CRC-16 checksum
}

export interface EMVCoField {
  tag: string;
  length: string;
  value: string;
}

export interface BankDeeplinkParams {
  bankCode: string;
  accountNumber: string;
  accountName: string;
  amount?: number;
  description?: string;
  qrContent?: string;
}

export interface QRGenerationOptions {
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  type?: 'image/png' | 'image/jpeg';
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
  width?: number;
}