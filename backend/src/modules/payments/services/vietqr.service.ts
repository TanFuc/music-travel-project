import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as QRCode from 'qrcode';
import { BankInfo, EMVCoField, QRGenerationOptions } from '../interfaces/bank.interface';
import { VietnamBankCode } from '../dto/bank-qr.dto';
@Injectable()
export class VietQRService {
  private readonly logger = new Logger(VietQRService.name);
  private readonly bankInfo: Record<VietnamBankCode, BankInfo> = {
    [VietnamBankCode.MB]: {
      code: 'MB',
      name: 'MB Bank',
      fullName: 'Military Commercial Joint Stock Bank',
      napasCode: '970422',
      citadCode: '970422',
      swiftCode: 'MSCBVNVX',
      appScheme: 'mbbank',
      qrSupported: true,
      deeplinkSupported: true,
    },
    [VietnamBankCode.VCB]: {
      code: 'VCB',
      name: 'Vietcombank',
      fullName: 'Joint Stock Commercial Bank for Foreign Trade of Vietnam',
      napasCode: '970436',
      citadCode: '970436',
      swiftCode: 'BFTVVNVX',
      appScheme: 'vcb',
      qrSupported: true,
      deeplinkSupported: true,
    },
    [VietnamBankCode.TCB]: {
      code: 'TCB',
      name: 'Techcombank',
      fullName: 'Vietnam Technological and Commercial Joint Stock Bank',
      napasCode: '970407',
      citadCode: '970407',
      swiftCode: 'VTCBVNVX',
      appScheme: 'tcb',
      qrSupported: true,
      deeplinkSupported: true,
    },
    [VietnamBankCode.BIDV]: {
      code: 'BIDV',
      name: 'BIDV',
      fullName: 'Bank for Investment and Development of Vietnam',
      napasCode: '970418',
      citadCode: '970418',
      swiftCode: 'BIDVVNVX',
      appScheme: 'bidv',
      qrSupported: true,
      deeplinkSupported: true,
    },
    [VietnamBankCode.VTB]: {
      code: 'VTB',
      name: 'Vietinbank',
      fullName: 'Vietnam Joint Stock Commercial Bank for Industry and Trade',
      napasCode: '970415',
      citadCode: '970415',
      swiftCode: 'ICBVVNVX',
      appScheme: 'vietinbank',
      qrSupported: true,
      deeplinkSupported: true,
    },
    [VietnamBankCode.ACB]: {
      code: 'ACB',
      name: 'ACB',
      fullName: 'Asia Commercial Joint Stock Bank',
      napasCode: '970416',
      citadCode: '970416',
      swiftCode: 'ASCBVNVX',
      appScheme: 'acb',
      qrSupported: true,
      deeplinkSupported: true,
    },
    [VietnamBankCode.VPB]: {
      code: 'VPB',
      name: 'VPBank',
      fullName: 'Vietnam Prosperity Joint Stock Commercial Bank',
      napasCode: '970432',
      citadCode: '970432',
      swiftCode: 'VPBKVNVX',
      appScheme: 'vpbank',
      qrSupported: true,
      deeplinkSupported: true,
    },
    [VietnamBankCode.SHB]: {
      code: 'SHB',
      name: 'SHB',
      fullName: 'Saigon - Hanoi Commercial Joint Stock Bank',
      napasCode: '970443',
      citadCode: '970443',
      swiftCode: 'SHBAVNVX',
      appScheme: 'shb',
      qrSupported: true,
      deeplinkSupported: false,
    },
    [VietnamBankCode.TPB]: {
      code: 'TPB',
      name: 'TPBank',
      fullName: 'Tien Phong Commercial Joint Stock Bank',
      napasCode: '970423',
      citadCode: '970423',
      swiftCode: 'TPBVVNVX',
      appScheme: 'tpbank',
      qrSupported: true,
      deeplinkSupported: true,
    },
    [VietnamBankCode.VIB]: {
      code: 'VIB',
      name: 'VIB',
      fullName: 'Vietnam International Commercial Joint Stock Bank',
      napasCode: '970441',
      citadCode: '970441',
      swiftCode: 'VNIBVNVX',
      appScheme: 'vib',
      qrSupported: true,
      deeplinkSupported: false,
    },
    [VietnamBankCode.MSB]: {
      code: 'MSB',
      name: 'MSB',
      fullName: 'Maritime Commercial Joint Stock Bank',
      napasCode: '970426',
      citadCode: '970426',
      swiftCode: 'MCOBVNVX',
      appScheme: 'msb',
      qrSupported: true,
      deeplinkSupported: false,
    },
    [VietnamBankCode.SACOM]: {
      code: 'SACOM',
      name: 'Sacombank',
      fullName: 'Saigon Thuong Tin Commercial Joint Stock Bank',
      napasCode: '970403',
      citadCode: '970403',
      swiftCode: 'SGTTVNVX',
      appScheme: 'sacombank',
      qrSupported: true,
      deeplinkSupported: false,
    },
    [VietnamBankCode.EIB]: {
      code: 'EIB',
      name: 'Eximbank',
      fullName: 'Vietnam Export Import Commercial Joint Stock Bank',
      napasCode: '970431',
      citadCode: '970431',
      swiftCode: 'EBVIVNVX',
      appScheme: 'eximbank',
      qrSupported: true,
      deeplinkSupported: false,
    },
    [VietnamBankCode.OCB]: {
      code: 'OCB',
      name: 'OCB',
      fullName: 'Orient Commercial Joint Stock Bank',
      napasCode: '970448',
      citadCode: '970448',
      swiftCode: 'ORCOVNVX',
      appScheme: 'ocb',
      qrSupported: true,
      deeplinkSupported: false,
    },
    [VietnamBankCode.NAB]: {
      code: 'NAB',
      name: 'Nam A Bank',
      fullName: 'Nam A Commercial Joint Stock Bank',
      napasCode: '970428',
      citadCode: '970428',
      swiftCode: 'NAMAVNVX',
      appScheme: 'namabank',
      qrSupported: true,
      deeplinkSupported: false,
    },
    [VietnamBankCode.VAB]: {
      code: 'VAB',
      name: 'VietA Bank',
      fullName: 'Viet A Commercial Joint Stock Bank',
      napasCode: '970427',
      citadCode: '970427',
      swiftCode: 'VNACVNVX',
      appScheme: 'vietabank',
      qrSupported: true,
      deeplinkSupported: false,
    },
    [VietnamBankCode.PGB]: {
      code: 'PGB',
      name: 'PGBank',
      fullName: 'Petrolimex Group Commercial Joint Stock Bank',
      napasCode: '970430',
      citadCode: '970430',
      swiftCode: 'PGBLVNVX',
      appScheme: 'pgbank',
      qrSupported: true,
      deeplinkSupported: false,
    },
    [VietnamBankCode.AGRI]: {
      code: 'AGRI',
      name: 'Agribank',
      fullName: 'Vietnam Bank for Agriculture and Rural Development',
      napasCode: '970405',
      citadCode: '970405',
      swiftCode: 'VBAAVNVX',
      appScheme: 'agribank',
      qrSupported: true,
      deeplinkSupported: false,
    },
    [VietnamBankCode.SCB]: {
      code: 'SCB',
      name: 'SCB',
      fullName: 'Sai Gon Commercial Joint Stock Bank',
      napasCode: '970429',
      citadCode: '970429',
      swiftCode: 'SACLVNVX',
      appScheme: 'scb',
      qrSupported: true,
      deeplinkSupported: false,
    },
    [VietnamBankCode.BAC_A_BANK]: {
      code: 'BAC_A_BANK',
      name: 'Bac A Bank',
      fullName: 'Bac A Commercial Joint Stock Bank',
      napasCode: '970409',
      citadCode: '970409',
      swiftCode: 'NASCVNVX',
      appScheme: 'bacabank',
      qrSupported: true,
      deeplinkSupported: false,
    },
    [VietnamBankCode.PVCOM]: {
      code: 'PVCOM',
      name: 'PVcomBank',
      fullName: 'Petrovietnam Commercial Joint Stock Bank',
      napasCode: '970412',
      citadCode: '970412',
      swiftCode: 'WBVNVNVX',
      appScheme: 'pvcombank',
      qrSupported: true,
      deeplinkSupported: false,
    },
  };
  constructor(private readonly configService: ConfigService) {}
  getBankInfo(bankCode: VietnamBankCode): BankInfo {
    return this.bankInfo[bankCode];
  }
  getAllBanks(): BankInfo[] {
    return Object.values(this.bankInfo);
  }
  generateVietQRString(params: {
    bankCode: VietnamBankCode;
    accountNumber: string;
    accountName: string;
    amount?: number;
    description?: string;
  }): string {
    const bank = this.getBankInfo(params.bankCode);
    const bin = bank.napasCode;
    const accountName = this.sanitizeForQR(params.accountName);
    const description = params.description ? this.sanitizeForQR(params.description) : undefined;
    const fields: EMVCoField[] = [];
    this.pushField(fields, '00', '01');
    this.pushField(fields, '01', '12');
    const merchantAccountInfo = this.buildMerchantAccountInfo(bin, params.accountNumber);
    this.pushField(fields, '38', merchantAccountInfo);
    this.pushField(fields, '52', '0000');
    this.pushField(fields, '53', '704');
    if (params.amount != null && params.amount > 0) {
      const amountStr = Math.floor(params.amount).toString();
      this.pushField(fields, '54', amountStr);
    }
    this.pushField(fields, '58', 'VN');
    this.pushField(fields, '59', accountName);
    this.pushField(fields, '60', 'HOCHIMINH');
    if (description && description.length > 0) {
      const additionalData = this.buildAdditionalDataField(description);
      this.pushField(fields, '62', additionalData);
    }
    const payloadBeforeCrc = this.buildPayloadString(fields);
    const crcInput = payloadBeforeCrc + '6304';
    const crc = this.calculateCRC16(crcInput);
    const fullPayload = payloadBeforeCrc + '63' + '04' + crc;
    this.validateVietQRPayload(fullPayload, fields, payloadBeforeCrc, crc);
    this.logger.debug(`VietQR full payload (length=${fullPayload.length}): ${fullPayload}`);
    this.logger.debug(`VietQR CRC: ${crc}`);
    fields.forEach((f) =>
      this.logger.debug(
        `VietQR field ${f.tag}: length=${f.length} valueLength=${f.value.length} value=[${f.value}]`,
      ),
    );
    return fullPayload;
  }
  private pushField(fields: EMVCoField[], tag: string, value: string): void {
    const length = value.length;
    if (length > 99) {
      throw new BadRequestException(`VietQR field ${tag} value too long (max 99): ${length}`);
    }
    fields.push({
      tag,
      length: length.toString().padStart(2, '0'),
      value,
    });
  }
  private buildPayloadString(fields: EMVCoField[]): string {
    return fields.map((f) => f.tag + f.length + f.value).join('');
  }
  async generateQRImage(qrContent: string, options: QRGenerationOptions = {}): Promise<string> {
    const defaultOptions: QRCode.QRCodeToDataURLOptions = {
      errorCorrectionLevel: options.errorCorrectionLevel || 'M',
      type: options.type || 'image/png',
      margin: options.margin || 2,
      color: {
        dark: options.color?.dark || '#000000',
        light: options.color?.light || '#FFFFFF',
      },
      width: options.width || 300,
    };
    try {
      const qrDataURL = await QRCode.toDataURL(qrContent, defaultOptions);
      this.logger.debug(`Generated QR image for content length: ${qrContent.length}`);
      return qrDataURL;
    } catch (error) {
      this.logger.error(`Failed to generate QR image: ${error.message}`);
      throw new Error(`QR generation failed: ${error.message}`);
    }
  }
  private buildMerchantAccountInfo(bin: string, accountNumber: string): string {
    const guid = 'A00000072701';
    const s00 = '00' + this.padLength(guid.length) + guid;
    const s01 = '01' + this.padLength(bin.length) + bin;
    const s02 = '02' + this.padLength(accountNumber.length) + accountNumber;
    return s00 + s01 + s02;
  }
  private buildAdditionalDataField(description: string): string {
    const len = description.length;
    return '08' + this.padLength(len) + description;
  }
  private sanitizeForQR(text: string): string {
    if (!text || typeof text !== 'string') return '';
    let s = text.replace(/\r?\n/g, ' ').replace(/\s+/g, ' ').trim();
    s = this.normalizeVietnameseText(s);
    return s.replace(/\s+/g, ' ').trim();
  }
  private validateVietQRPayload(
    fullPayload: string,
    fields: EMVCoField[],
    payloadBeforeCrc: string,
    _expectedCrc: string,
  ): void {
    const match = fullPayload.match(/6304([0-9A-F]{4})$/);
    if (!match) {
      this.logger.warn('VietQR payload invalid: missing or malformed CRC (63)');
      return;
    }
    const crcInPayload = match[1];
    for (const f of fields) {
      const lenNum = parseInt(f.length, 10);
      if (f.value.length !== lenNum) {
        this.logger.warn(
          `VietQR field ${f.tag} length mismatch: length=${f.length} valueLength=${f.value.length}`,
        );
      }
    }
    const crcInput = payloadBeforeCrc + '6304';
    const computedCrc = this.calculateCRC16(crcInput);
    if (computedCrc !== crcInPayload) {
      this.logger.warn(
        `VietQR CRC mismatch: computed ${computedCrc}, payload has ${crcInPayload}. QR still returned.`,
      );
    }
    if (!fullPayload.startsWith('0002010212')) {
      this.logger.warn('VietQR payload may have unexpected format: expected 0002010212...');
    }
  }
  private calculateCRC16(data: string): string {
    const bytes = Buffer.from(data, 'utf8');
    const poly = 0x1021;
    let crc = 0xffff;
    for (let i = 0; i < bytes.length; i++) {
      crc ^= (bytes[i] & 0xff) << 8;
      for (let j = 0; j < 8; j++) {
        if ((crc & 0x8000) !== 0) {
          crc = ((crc << 1) ^ poly) >>> 0;
        } else {
          crc = (crc << 1) >>> 0;
        }
        crc &= 0xffff;
      }
    }
    return (crc & 0xffff).toString(16).toUpperCase().padStart(4, '0');
  }
  private padLength(length: number): string {
    return length.toString().padStart(2, '0');
  }
  private normalizeVietnameseText(text: string): string {
    return text
      .toUpperCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'D')
      .replace(/Đ/g, 'D')
      .replace(/[^A-Z0-9\s]/g, '')
      .trim();
  }
}
