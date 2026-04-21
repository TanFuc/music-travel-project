export interface BankInfo {
  code: string;
  name: string;
  fullName: string;
  napasCode: string;
  citadCode?: string;
  swiftCode?: string;
  appScheme?: string;
  qrSupported: boolean;
  deeplinkSupported: boolean;
}
export interface VietQRPayload {
  version: string;
  initMethod: string;
  merchantAccountInfo: string;
  merchantCategoryCode: string;
  transactionCurrency: string;
  amount?: string;
  countryCode: string;
  merchantName: string;
  merchantCity: string;
  additionalData?: string;
  crc: string;
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
