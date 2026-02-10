import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GenerateAdminQRDto, AdminQRResponse } from '../dto/admin-qr.dto';
import { VietQRService } from './vietqr.service';
import { BankDeeplinkService } from './bank-deeplink.service';
import { BankQRConfigService } from './bank-qr-config.service';
import { VietnamBankCode } from '../dto/bank-qr.dto';
import { QRGenerationOptions } from '../interfaces/bank.interface';

@Injectable()
export class AdminQRService {
  private readonly logger = new Logger(AdminQRService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly vietQRService: VietQRService,
    private readonly bankDeeplinkService: BankDeeplinkService,
    private readonly bankQRConfigService: BankQRConfigService,
  ) {}

  /**
   * Generate QR code using admin bank account.
   * Uses database configuration if an active config exists; otherwise falls back to env vars (ADMIN_* or defaults).
   */
  async generateAdminQR(dto: GenerateAdminQRDto): Promise<AdminQRResponse> {
    this.logger.log('Generating admin QR code');

    try {
      // 1) Prefer active bank config from database
      const bankConfig = await this.bankQRConfigService.getBankInfoForQR();

      let bankCode: VietnamBankCode;
      let adminAccountNumber: string;
      let adminAccountName: string;
      let adminBankName: string;
      let bankBin: string;

      if (bankConfig) {
        const {
          bankBin: bin,
          accountNumber,
          accountName,
          bankCode: adminBankCode,
          bankName,
        } = bankConfig;
        bankBin = bin;
        adminAccountNumber = accountNumber;
        adminAccountName = accountName;
        adminBankName = bankName || `Bank ${bin}`;

        if (
          adminBankCode &&
          Object.values(VietnamBankCode).includes(adminBankCode as VietnamBankCode)
        ) {
          bankCode = adminBankCode as VietnamBankCode;
        } else {
          const resolved = this.binToBankCode(bin);
          if (!resolved) {
            throw new BadRequestException(
              `Unsupported bank BIN: ${bin}. Use a supported BIN (e.g. 970422 for MB, 970432 for VPBank).`,
            );
          }
          bankCode = resolved;
        }
      } else {
        // 2) Fallback: env vars or defaults (no DB config required)
        const envConfig = await this.getAdminBankConfig();
        if (!Object.values(VietnamBankCode).includes(envConfig.bankCode as VietnamBankCode)) {
          throw new BadRequestException(
            'Admin bank not configured. Set ADMIN_BANK_CODE (e.g. VPB, MB) or create a config via POST /admin/bank-qr-config',
          );
        }
        if (!/^[0-9]{6,20}$/.test(envConfig.accountNumber)) {
          throw new BadRequestException(
            'Admin account number invalid. Set ADMIN_ACCOUNT_NUMBER (6–20 digits) or configure via admin API.',
          );
        }
        if (!envConfig.accountName || envConfig.accountName.trim().length < 2) {
          throw new BadRequestException(
            'Admin account name invalid. Set ADMIN_ACCOUNT_NAME (min 2 chars) or configure via admin API.',
          );
        }

        bankCode = envConfig.bankCode as VietnamBankCode;
        const bankInfo = this.vietQRService.getBankInfo(bankCode);
        if (!bankInfo) {
          throw new BadRequestException(`Bank info not found for: ${bankCode}`);
        }
        bankBin = bankInfo.napasCode;
        adminAccountNumber = envConfig.accountNumber;
        adminAccountName = envConfig.accountName;
        adminBankName = envConfig.bankName;
      }

      const bankInfo = this.vietQRService.getBankInfo(bankCode);
      if (!bankInfo) {
        throw new BadRequestException(`Bank info not found for: ${bankCode}`);
      }

      // Generate VietQR EMVCo format string
      const qrContent = this.vietQRService.generateVietQRString({
        bankCode,
        accountNumber: adminAccountNumber,
        accountName: adminAccountName,
        amount: dto.amount,
        description: dto.description,
      });

      // Generate QR code image
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

      // VietQR.io public image URL - QR from this URL is accepted by all Vietnamese bank apps
      const qrImageUrl = this.buildVietQRioImageUrl(
        bankCode,
        adminAccountNumber,
        dto.amount,
        dto.description,
      );

      // Generate deeplink
      const deeplink = this.bankDeeplinkService.generateDeeplink({
        bankCode,
        accountNumber: adminAccountNumber,
        accountName: adminAccountName,
        amount: dto.amount,
        description: dto.description,
        qrContent,
      });

      const response: AdminQRResponse = {
        success: true,
        qrImageBase64: qrBase64,
        qrImageUrl,
        qrContent,
        bank: {
          bankCode,
          bankName: adminBankName || `Bank ${bankBin}`,
          accountNumber: adminAccountNumber,
          accountName: adminAccountName,
        },
        amount: dto.amount,
        description: dto.description,
        deeplink: deeplink || undefined,
      };

      this.logger.log(
        `Successfully generated admin QR for ${bankCode} (BIN: ${bankBin}) - ${adminAccountNumber}`,
      );
      return response;
    } catch (error) {
      this.logger.error(`Failed to generate admin QR: ${error.message}`, error.stack);
      throw error;
    }
  }

  private binToBankCode(bankBin: string): VietnamBankCode | null {
    const map: Record<string, VietnamBankCode> = {
      '970422': VietnamBankCode.MB,
      '970436': VietnamBankCode.VCB,
      '970415': VietnamBankCode.VTB,
      '970418': VietnamBankCode.BIDV,
      '970432': VietnamBankCode.VPB,
      '970407': VietnamBankCode.TCB,
      '970403': VietnamBankCode.SHB,
      '970405': VietnamBankCode.ACB,
      '970448': VietnamBankCode.OCB,
    };
    return map[bankBin] ?? null;
  }

  /** Default admin bank config when env vars are not set (development / demo) */
  private static readonly DEFAULT_ADMIN_BANK = {
    bankCode: 'VPB',
    bankName: 'VPBank',
    accountNumber: '10393335845',
    accountName: 'Le Duc Tuan',
  };

  /**
   * Get admin bank configuration from database first, then fallback to env vars with defaults.
   * Database configuration takes priority over environment variables.
   * @deprecated Use database configuration instead. This method is kept for backward compatibility.
   */
  async getAdminBankConfig(): Promise<{
    bankCode: string;
    bankName: string;
    accountNumber: string;
    accountName: string;
  }> {
    // Try to get from database first
    const dbConfig = await this.bankQRConfigService.getBankInfoForQR();
    if (dbConfig) {
      return {
        bankCode: dbConfig.bankCode || 'UNKNOWN',
        bankName: dbConfig.bankName || `Bank ${dbConfig.bankBin}`,
        accountNumber: dbConfig.accountNumber,
        accountName: dbConfig.accountName,
      };
    }

    // Fallback to environment variables with defaults
    return {
      bankCode:
        this.configService.get<string>('ADMIN_BANK_CODE') ??
        AdminQRService.DEFAULT_ADMIN_BANK.bankCode,
      bankName:
        this.configService.get<string>('ADMIN_BANK_NAME') ??
        AdminQRService.DEFAULT_ADMIN_BANK.bankName,
      accountNumber:
        this.configService.get<string>('ADMIN_ACCOUNT_NUMBER') ??
        AdminQRService.DEFAULT_ADMIN_BANK.accountNumber,
      accountName:
        this.configService.get<string>('ADMIN_ACCOUNT_NAME') ??
        AdminQRService.DEFAULT_ADMIN_BANK.accountName,
    };
  }

  /**
   * Build VietQR.io public image URL - returns a QR image that is accepted by all Vietnamese bank apps.
   * Format: https://img.vietqr.io/image/{bankSlug}-{account}-qr_only.jpg (e.g. vpb-10393335845)
   */
  private buildVietQRioImageUrl(
    bankCode: string,
    accountNumber: string,
    amount?: number,
    description?: string,
  ): string {
    const slug = bankCode.toLowerCase();
    const base = `https://img.vietqr.io/image/${slug}-${accountNumber}-qr_only.jpg`;
    const params = new URLSearchParams();
    if (amount != null && amount > 0) params.set('amount', String(amount));
    if (description && description.trim()) params.set('addInfo', description.trim());
    const query = params.toString();
    return query ? `${base}?${query}` : base;
  }

  /**
   * Validate admin bank configuration (bank code, account number format, account name).
   * Checks database configuration first, then falls back to environment variables.
   */
  async validateAdminConfig(): Promise<boolean> {
    try {
      // Check if we have an active database configuration
      const dbConfig = await this.bankQRConfigService.getBankInfoForQR();
      if (dbConfig) {
        // Validate database configuration
        if (!/^[0-9]{6,10}$/.test(dbConfig.bankBin)) {
          return false;
        }
        if (!/^[0-9]{6,20}$/.test(dbConfig.accountNumber)) {
          return false;
        }
        if (!dbConfig.accountName || dbConfig.accountName.trim().length < 2) {
          return false;
        }
        return true;
      }

      // Fallback to environment variables validation
      const config = await this.getAdminBankConfig();

      if (!Object.values(VietnamBankCode).includes(config.bankCode as VietnamBankCode)) {
        return false;
      }

      if (!/^[0-9]{6,20}$/.test(config.accountNumber)) {
        return false;
      }

      if (!config.accountName || config.accountName.trim().length < 2) {
        return false;
      }

      return true;
    } catch (error) {
      this.logger.error(`Failed to validate admin config: ${error.message}`);
      return false;
    }
  }
}
