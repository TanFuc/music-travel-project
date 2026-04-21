import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BankDeeplinkParams } from '../interfaces/bank.interface';
import { VietnamBankCode } from '../dto/bank-qr.dto';
import { VietQRService } from './vietqr.service';
@Injectable()
export class BankDeeplinkService {
  private readonly logger = new Logger(BankDeeplinkService.name);
  constructor(
    private readonly configService: ConfigService,
    private readonly vietQRService: VietQRService,
  ) {}
  generateDeeplink(params: BankDeeplinkParams): string | null {
    const bank = this.vietQRService.getBankInfo(params.bankCode as VietnamBankCode);
    if (!bank.deeplinkSupported || !bank.appScheme) {
      this.logger.debug(`Deeplink not supported for bank: ${params.bankCode}`);
      return null;
    }
    try {
      switch (params.bankCode) {
        case VietnamBankCode.MB:
          return this.generateMBBankDeeplink(params);
        case VietnamBankCode.VCB:
          return this.generateVietcombankDeeplink(params);
        case VietnamBankCode.TCB:
          return this.generateTechcombankDeeplink(params);
        case VietnamBankCode.BIDV:
          return this.generateBIDVDeeplink(params);
        case VietnamBankCode.ACB:
          return this.generateACBDeeplink(params);
        case VietnamBankCode.VPB:
          return this.generateVPBankDeeplink(params);
        case VietnamBankCode.TPB:
          return this.generateTPBankDeeplink(params);
        default:
          return this.generateGenericDeeplink(params);
      }
    } catch (error) {
      this.logger.error(`Failed to generate deeplink for ${params.bankCode}: ${error.message}`);
      return null;
    }
  }
  private generateMBBankDeeplink(params: BankDeeplinkParams): string {
    const baseUrl = 'mbbank://';
    const queryParams = new URLSearchParams();
    if (params.qrContent) {
      queryParams.append('action', 'qr-payment');
      queryParams.append('data', params.qrContent);
    } else {
      queryParams.append('action', 'transfer');
      queryParams.append('account', params.accountNumber);
      queryParams.append('name', params.accountName);
      if (params.amount) {
        queryParams.append('amount', params.amount.toString());
      }
      if (params.description) {
        queryParams.append('memo', params.description);
      }
    }
    return `${baseUrl}?${queryParams.toString()}`;
  }
  private generateVietcombankDeeplink(params: BankDeeplinkParams): string {
    const baseUrl = 'vcb://';
    if (params.qrContent) {
      return `${baseUrl}qr-payment?qr=${encodeURIComponent(params.qrContent)}`;
    }
    const queryParams = new URLSearchParams({
      action: 'transfer',
      beneficiary_account: params.accountNumber,
      beneficiary_name: params.accountName,
    });
    if (params.amount) {
      queryParams.append('amount', params.amount.toString());
    }
    if (params.description) {
      queryParams.append('description', params.description);
    }
    return `${baseUrl}transfer?${queryParams.toString()}`;
  }
  private generateTechcombankDeeplink(params: BankDeeplinkParams): string {
    const baseUrl = 'tcb://';
    if (params.qrContent) {
      return `${baseUrl}qr?data=${encodeURIComponent(params.qrContent)}`;
    }
    const transferData = {
      type: 'transfer',
      account_number: params.accountNumber,
      account_name: params.accountName,
      amount: params.amount || 0,
      message: params.description || '',
    };
    return `${baseUrl}transfer?data=${encodeURIComponent(JSON.stringify(transferData))}`;
  }
  private generateBIDVDeeplink(params: BankDeeplinkParams): string {
    const baseUrl = 'bidv://';
    if (params.qrContent) {
      return `${baseUrl}qrpay?qr=${encodeURIComponent(params.qrContent)}`;
    }
    const queryParams = new URLSearchParams({
      function: 'transfer',
      account: params.accountNumber,
      name: params.accountName,
    });
    if (params.amount) {
      queryParams.append('amount', params.amount.toString());
    }
    if (params.description) {
      queryParams.append('content', params.description);
    }
    return `${baseUrl}?${queryParams.toString()}`;
  }
  private generateACBDeeplink(params: BankDeeplinkParams): string {
    const baseUrl = 'acb://';
    if (params.qrContent) {
      return `${baseUrl}qr-payment/${encodeURIComponent(params.qrContent)}`;
    }
    const transferParams = {
      screen: 'transfer',
      to_account: params.accountNumber,
      to_name: params.accountName,
      amount: params.amount || '',
      memo: params.description || '',
    };
    const paramString = Object.entries(transferParams)
      .filter(([_, value]) => value !== '')
      .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
      .join('&');
    return `${baseUrl}?${paramString}`;
  }
  private generateVPBankDeeplink(params: BankDeeplinkParams): string {
    const baseUrl = 'vpbank://';
    if (params.qrContent) {
      return `${baseUrl}qr?code=${encodeURIComponent(params.qrContent)}`;
    }
    const queryParams = new URLSearchParams({
      action: 'transfer',
      receiver_account: params.accountNumber,
      receiver_name: params.accountName,
    });
    if (params.amount) {
      queryParams.append('amount', params.amount.toString());
    }
    if (params.description) {
      queryParams.append('note', params.description);
    }
    return `${baseUrl}transfer?${queryParams.toString()}`;
  }
  private generateTPBankDeeplink(params: BankDeeplinkParams): string {
    const baseUrl = 'tpbank://';
    if (params.qrContent) {
      return `${baseUrl}qr-scan?qr_data=${encodeURIComponent(params.qrContent)}`;
    }
    const transferData = {
      action: 'fund_transfer',
      account_number: params.accountNumber,
      account_holder: params.accountName,
      transfer_amount: params.amount || 0,
      transfer_content: params.description || '',
    };
    return `${baseUrl}?${new URLSearchParams(transferData as any).toString()}`;
  }
  private generateGenericDeeplink(params: BankDeeplinkParams): string {
    const bank = this.vietQRService.getBankInfo(params.bankCode as VietnamBankCode);
    const baseUrl = `${bank.appScheme}://`;
    if (params.qrContent) {
      return `${baseUrl}qr?data=${encodeURIComponent(params.qrContent)}`;
    }
    const queryParams = new URLSearchParams({
      action: 'transfer',
      account: params.accountNumber,
      name: params.accountName,
    });
    if (params.amount) {
      queryParams.append('amount', params.amount.toString());
    }
    if (params.description) {
      queryParams.append('memo', params.description);
    }
    return `${baseUrl}?${queryParams.toString()}`;
  }
  isDeeplinkSupported(bankCode: VietnamBankCode): boolean {
    const bank = this.vietQRService.getBankInfo(bankCode);
    return bank.deeplinkSupported && !!bank.appScheme;
  }
  getFallbackUrl(params: BankDeeplinkParams): string {
    const bank = this.vietQRService.getBankInfo(params.bankCode as VietnamBankCode);
    return `https://qr.sepay.vn/img?acc=${params.accountNumber}&bank=${bank.napasCode}&amount=${params.amount || ''}&des=${encodeURIComponent(params.description || '')}`;
  }
  generateUniversalLink(params: BankDeeplinkParams): {
    deeplink: string | null;
    fallbackUrl: string;
    isSupported: boolean;
  } {
    const deeplink = this.generateDeeplink(params);
    const fallbackUrl = this.getFallbackUrl(params);
    const isSupported = this.isDeeplinkSupported(params.bankCode as VietnamBankCode);
    return {
      deeplink,
      fallbackUrl,
      isSupported,
    };
  }
}
