import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GenerateBankQRDto, BankQRResponse, VietnamBankCode } from '../dto/bank-qr.dto';
import { VietQRService } from './vietqr.service';
import { BankDeeplinkService } from './bank-deeplink.service';
import { QRGenerationOptions } from '../interfaces/bank.interface';
@Injectable()
export class BankQRService {
  private readonly logger = new Logger(BankQRService.name);
  private readonly testMode: boolean;
  constructor(
    private readonly configService: ConfigService,
    private readonly vietQRService: VietQRService,
    private readonly bankDeeplinkService: BankDeeplinkService,
  ) {
    this.testMode = this.configService.get<string>('NODE_ENV') !== 'production';
  }
  async generateBankQR(dto: GenerateBankQRDto): Promise<BankQRResponse> {
    this.logger.log(`Generating QR for bank: ${dto.bankCode}, account: ${dto.accountNumber}`);
    try {
      const bankInfo = this.vietQRService.getBankInfo(dto.bankCode);
      if (!bankInfo) {
        throw new BadRequestException(`Unsupported bank code: ${dto.bankCode}`);
      }
      const qrContent = this.vietQRService.generateVietQRString({
        bankCode: dto.bankCode,
        accountNumber: dto.accountNumber,
        accountName: dto.accountName,
        amount: dto.amount,
        description: dto.description,
      });
      const qrOptions: QRGenerationOptions = {
        errorCorrectionLevel: 'M',
        type: 'image/png',
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      };
      const qrBase64 = await this.vietQRService.generateQRImage(qrContent, qrOptions);
      const deeplink = this.bankDeeplinkService.generateDeeplink({
        bankCode: dto.bankCode,
        accountNumber: dto.accountNumber,
        accountName: dto.accountName,
        amount: dto.amount,
        description: dto.description,
        qrContent,
      });
      const response: BankQRResponse = {
        qrBase64,
        qrContent,
        deeplink: deeplink || undefined,
        bankCode: dto.bankCode,
        accountNumber: dto.accountNumber,
        accountName: dto.accountName,
        amount: dto.amount,
        description: dto.description,
        bankName: `${bankInfo.name} (${bankInfo.fullName})`,
        deeplinkSupported: bankInfo.deeplinkSupported,
      };
      this.logger.log(`Successfully generated QR for ${dto.bankCode} - ${dto.accountNumber}`);
      return response;
    } catch (error) {
      this.logger.error(`Failed to generate QR: ${error.message}`, error.stack);
      throw error;
    }
  }
  async generateQRImage(dto: GenerateBankQRDto): Promise<Buffer> {
    const qrContent = this.vietQRService.generateVietQRString({
      bankCode: dto.bankCode,
      accountNumber: dto.accountNumber,
      accountName: dto.accountName,
      amount: dto.amount,
      description: dto.description,
    });
    const QRCode = require('qrcode');
    const qrBuffer = await QRCode.toBuffer(qrContent, {
      errorCorrectionLevel: 'M',
      type: 'png',
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });
    return qrBuffer;
  }
  validateBankAccount(bankCode: VietnamBankCode, accountNumber: string): boolean {
    const bankInfo = this.vietQRService.getBankInfo(bankCode);
    if (!bankInfo) {
      return false;
    }
    if (!/^[0-9]{6,20}$/.test(accountNumber)) {
      return false;
    }
    switch (bankCode) {
      case VietnamBankCode.MB:
        return /^[0-9]{10,15}$/.test(accountNumber);
      case VietnamBankCode.VCB:
        return /^[0-9]{10,19}$/.test(accountNumber);
      case VietnamBankCode.TCB:
        return /^[0-9]{10,19}$/.test(accountNumber);
      case VietnamBankCode.BIDV:
        return /^[0-9]{10,14}$/.test(accountNumber);
      default:
        return /^[0-9]{6,20}$/.test(accountNumber);
    }
  }
  getSupportedBanks() {
    const banks = this.vietQRService.getAllBanks();
    return banks.map((bank) => ({
      code: bank.code,
      name: bank.name,
      fullName: bank.fullName,
      qrSupported: bank.qrSupported,
      deeplinkSupported: bank.deeplinkSupported,
    }));
  }
  async generateTestQR(): Promise<BankQRResponse> {
    if (!this.testMode) {
      throw new BadRequestException('Test mode is only available in development environment');
    }
    const testDto: GenerateBankQRDto = {
      bankCode: VietnamBankCode.MB,
      accountNumber: '0123456789',
      accountName: 'NGUYEN VAN TEST',
      amount: 100000,
      description: 'Test payment from API',
    };
    return this.generateBankQR(testDto);
  }
  validateVietQRString(qrString: string): boolean {
    try {
      if (!qrString || qrString.length < 50) {
        return false;
      }
      if (!qrString.startsWith('000201')) {
        return false;
      }
      const crcPattern = /6304[0-9A-F]{4}$/;
      if (!crcPattern.test(qrString)) {
        return false;
      }
      return true;
    } catch (error) {
      this.logger.error(`QR validation error: ${error.message}`);
      return false;
    }
  }
  parseVietQRString(qrString: string): {
    bankCode?: string;
    accountNumber?: string;
    amount?: number;
    description?: string;
  } | null {
    try {
      if (!this.validateVietQRString(qrString)) {
        return null;
      }
      const result: any = {};
      let index = 0;
      while (index < qrString.length - 4) {
        const tag = qrString.substr(index, 2);
        const length = parseInt(qrString.substr(index + 2, 2));
        const value = qrString.substr(index + 4, length);
        switch (tag) {
          case '38':
            const merchantInfo = this.parseMerchantAccountInfo(value);
            if (merchantInfo) {
              result.bankCode = merchantInfo.bankCode;
              result.accountNumber = merchantInfo.accountNumber;
            }
            break;
          case '54':
            result.amount = parseInt(value);
            break;
          case '62':
            const additionalData = this.parseAdditionalDataField(value);
            if (additionalData?.description) {
              result.description = additionalData.description;
            }
            break;
        }
        index += 4 + length;
      }
      return result;
    } catch (error) {
      this.logger.error(`QR parsing error: ${error.message}`);
      return null;
    }
  }
  private parseMerchantAccountInfo(value: string): {
    bankCode?: string;
    accountNumber?: string;
  } | null {
    try {
      let index = 0;
      let napasCode = '';
      let accountNumber = '';
      while (index < value.length) {
        const tag = value.substr(index, 2);
        const length = parseInt(value.substr(index + 2, 2));
        const fieldValue = value.substr(index + 4, length);
        if (tag === '01') {
          napasCode = fieldValue.substr(0, 6);
          let subIndex = 6;
          while (subIndex < fieldValue.length) {
            const subTag = fieldValue.substr(subIndex, 2);
            const subLength = parseInt(fieldValue.substr(subIndex + 2, 2));
            const subValue = fieldValue.substr(subIndex + 4, subLength);
            if (subTag === '01') {
              accountNumber = subValue;
              break;
            }
            subIndex += 4 + subLength;
          }
          break;
        }
        index += 4 + length;
      }
      const banks = this.vietQRService.getAllBanks();
      const bank = banks.find((b) => b.napasCode === napasCode);
      return {
        bankCode: bank?.code,
        accountNumber,
      };
    } catch (error) {
      return null;
    }
  }
  private parseAdditionalDataField(value: string): {
    description?: string;
  } | null {
    try {
      let index = 0;
      while (index < value.length) {
        const tag = value.substr(index, 2);
        const length = parseInt(value.substr(index + 2, 2));
        const fieldValue = value.substr(index + 4, length);
        if (tag === '08') {
          return { description: fieldValue };
        }
        index += 4 + length;
      }
      return null;
    } catch (error) {
      return null;
    }
  }
}
