import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  ValidationPipe,
  UsePipes,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiConsumes } from '@nestjs/swagger';
import { BankQRService } from '../services/bank-qr.service';
import { AdminQRService } from '../services/admin-qr.service';
import { GenerateBankQRDto, BankQRResponse, VietnamBankCode } from '../dto/bank-qr.dto';
import { GenerateAdminQRDto, AdminQRResponse } from '../dto/admin-qr.dto';
import { Public } from '@/common/decorators/public.decorator';
@ApiTags('payment/bank-qr')
@Controller('payment')
@Public()
export class BankQRController {
  constructor(
    private readonly bankQRService: BankQRService,
    private readonly adminQRService: AdminQRService,
  ) {}
  @Post('generate-qr')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @ApiOperation({
    summary: 'Generate QR code using admin bank account',
    description:
      'Generate VietQR EMVCo format QR code using database-configured admin bank account with base64 image and deeplink',
  })
  @ApiResponse({
    status: 201,
    description: 'Admin QR code generated successfully',
    type: AdminQRResponse,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input parameters or admin bank not configured',
  })
  @ApiConsumes('application/json')
  async generateQR(
    @Body()
    dto: GenerateAdminQRDto,
  ): Promise<AdminQRResponse> {
    const isConfigValid = await this.adminQRService.validateAdminConfig();
    if (!isConfigValid) {
      throw new BadRequestException(
        [
          'Admin bank account not properly configured.',
          'Please create and activate a bank configuration using the admin API: POST /admin/bank-qr-config',
          'with valid bankBin (6-10 digits), accountNumber (6-20 digits), and accountName (min 2 chars).',
        ].join(' '),
      );
    }
    return this.adminQRService.generateAdminQR(dto);
  }
  @Post('generate-custom-qr')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @ApiOperation({
    summary: 'Generate Vietnam bank payment QR code with custom bank account',
    description:
      'Generate VietQR EMVCo format QR code with custom bank account, base64 image and bank mobile app deeplink',
  })
  @ApiResponse({
    status: 201,
    description: 'Custom QR code generated successfully',
    type: BankQRResponse,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input parameters',
  })
  @ApiConsumes('application/json')
  async generateCustomQR(
    @Body()
    dto: GenerateBankQRDto,
  ): Promise<BankQRResponse> {
    const isValidAccount = this.bankQRService.validateBankAccount(dto.bankCode, dto.accountNumber);
    if (!isValidAccount) {
      throw new BadRequestException('Invalid account number format for the selected bank');
    }
    return this.bankQRService.generateBankQR(dto);
  }
  @Get('qr-image')
  @ApiOperation({
    summary: 'Generate QR code as base64 string',
    description: 'Generate and return QR code as base64 encoded string',
  })
  @ApiQuery({ name: 'bankCode', enum: VietnamBankCode, description: 'Bank code' })
  @ApiQuery({ name: 'accountNumber', type: 'string', description: 'Account number' })
  @ApiQuery({ name: 'accountName', type: 'string', description: 'Account holder name' })
  @ApiQuery({ name: 'amount', type: 'number', required: false, description: 'Amount in VND' })
  @ApiQuery({
    name: 'description',
    type: 'string',
    required: false,
    description: 'Payment description',
  })
  @ApiResponse({
    status: 200,
    description: 'QR code as base64 string',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            qrBase64: { type: 'string', description: 'Base64 encoded PNG image' },
            contentType: { type: 'string', example: 'image/png' },
            filename: { type: 'string', example: 'qr-code.png' },
          },
        },
      },
    },
  })
  async generateQRImage(
    @Query('bankCode')
    bankCode: VietnamBankCode,
    @Query('accountNumber')
    accountNumber: string,
    @Query('accountName')
    accountName: string,
    @Query('amount')
    amount?: number,
    @Query('description')
    description?: string,
  ): Promise<{
    qrBase64: string;
    contentType: string;
    filename: string;
  }> {
    if (!bankCode || !accountNumber || !accountName) {
      throw new BadRequestException('bankCode, accountNumber, and accountName are required');
    }
    const dto: GenerateBankQRDto = {
      bankCode,
      accountNumber,
      accountName,
      amount: amount ? Number(amount) : undefined,
      description,
    };
    const isValidAccount = this.bankQRService.validateBankAccount(dto.bankCode, dto.accountNumber);
    if (!isValidAccount) {
      throw new BadRequestException('Invalid account number format for the selected bank');
    }
    const qrBuffer = await this.bankQRService.generateQRImage(dto);
    const qrBase64 = qrBuffer.toString('base64');
    return {
      qrBase64: `data:image/png;base64,${qrBase64}`,
      contentType: 'image/png',
      filename: `qr-${bankCode}-${Date.now()}.png`,
    };
  }
  @Get('banks')
  @ApiOperation({
    summary: 'Get supported banks',
    description: 'Get list of all supported Vietnamese banks with QR and deeplink capabilities',
  })
  @ApiResponse({
    status: 200,
    description: 'List of supported banks',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          code: { type: 'string', example: 'MB' },
          name: { type: 'string', example: 'MB Bank' },
          fullName: { type: 'string', example: 'Military Commercial Joint Stock Bank' },
          qrSupported: { type: 'boolean', example: true },
          deeplinkSupported: { type: 'boolean', example: true },
        },
      },
    },
  })
  getSupportedBanks() {
    return {
      success: true,
      data: this.bankQRService.getSupportedBanks(),
      total: Object.keys(VietnamBankCode).length,
    };
  }
  @Post('validate-qr')
  @ApiOperation({
    summary: 'Validate and parse VietQR string',
    description: 'Validate VietQR format and extract payment information',
  })
  @ApiResponse({
    status: 200,
    description: 'QR validation result',
    schema: {
      type: 'object',
      properties: {
        valid: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            bankCode: { type: 'string' },
            accountNumber: { type: 'string' },
            amount: { type: 'number' },
            description: { type: 'string' },
          },
        },
      },
    },
  })
  validateQR(
    @Body()
    body: {
      qrString: string;
    },
  ) {
    const { qrString } = body;
    if (!qrString) {
      throw new BadRequestException('qrString is required');
    }
    const isValid = this.bankQRService.validateVietQRString(qrString);
    const parsedData = isValid ? this.bankQRService.parseVietQRString(qrString) : null;
    return {
      success: true,
      valid: isValid,
      data: parsedData,
    };
  }
  @Get('test-qr')
  @ApiOperation({
    summary: 'Generate test QR code (Development only)',
    description: 'Generate a test QR code with sample data for development and testing',
  })
  @ApiResponse({
    status: 200,
    description: 'Test QR code generated',
    type: BankQRResponse,
  })
  @ApiResponse({
    status: 400,
    description: 'Test mode not available in production',
  })
  async generateTestQR(): Promise<BankQRResponse> {
    return this.bankQRService.generateTestQR();
  }
  @Get('health')
  @ApiOperation({
    summary: 'Health check for bank QR service',
    description: 'Check if the bank QR service is working properly',
  })
  @ApiResponse({
    status: 200,
    description: 'Service is healthy',
  })
  healthCheck() {
    return {
      success: true,
      message: 'Bank QR service is running',
      timestamp: new Date().toISOString(),
      supportedBanks: Object.keys(VietnamBankCode).length,
    };
  }
}
