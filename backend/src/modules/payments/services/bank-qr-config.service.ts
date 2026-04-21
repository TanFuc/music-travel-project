import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { BankQRConfig } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  CreateBankQRConfigDto,
  UpdateBankQRConfigDto,
  BankQRConfigResponse,
} from '../dto/bank-qr-config.dto';
@Injectable()
export class BankQRConfigService {
  private readonly logger = new Logger(BankQRConfigService.name);
  constructor(private readonly prisma: PrismaService) {}
  async create(dto: CreateBankQRConfigDto): Promise<BankQRConfigResponse> {
    this.logger.log(`Creating bank QR config for BIN: ${dto.bankBin}`);
    try {
      if (dto.isActive !== false) {
        await this.deactivateAllConfigs();
      }
      const config = await this.prisma.bankQRConfig.create({
        data: {
          bankBin: dto.bankBin,
          accountNumber: dto.accountNumber,
          accountName: dto.accountName.trim().toUpperCase(),
          isActive: dto.isActive ?? true,
        },
      });
      this.logger.log(`Created bank QR config with ID: ${config.id}`);
      return this.mapToResponse(config);
    } catch (error) {
      this.logger.error(`Failed to create bank QR config: ${error.message}`, error.stack);
      throw new BadRequestException(`Failed to create bank QR configuration: ${error.message}`);
    }
  }
  async findAll(): Promise<BankQRConfigResponse[]> {
    this.logger.log('Retrieving all bank QR configurations');
    try {
      const configs = await this.prisma.bankQRConfig.findMany({
        orderBy: [{ isActive: 'desc' }, { createdAt: 'desc' }],
      });
      return configs.map((config: BankQRConfig) => this.mapToResponse(config));
    } catch (error) {
      this.logger.error(`Failed to retrieve bank QR configs: ${error.message}`, error.stack);
      throw new BadRequestException(`Failed to retrieve bank QR configurations: ${error.message}`);
    }
  }
  async findOne(id: number): Promise<BankQRConfigResponse> {
    this.logger.log(`Retrieving bank QR config with ID: ${id}`);
    try {
      const config = await this.prisma.bankQRConfig.findUnique({
        where: { id },
      });
      if (!config) {
        throw new NotFoundException(`Bank QR configuration with ID ${id} not found`);
      }
      return this.mapToResponse(config);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to retrieve bank QR config: ${error.message}`, error.stack);
      throw new BadRequestException(`Failed to retrieve bank QR configuration: ${error.message}`);
    }
  }
  async findActive(): Promise<BankQRConfigResponse | null> {
    this.logger.log('Retrieving active bank QR configuration');
    try {
      const config = await this.prisma.bankQRConfig.findFirst({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
      });
      return config ? this.mapToResponse(config) : null;
    } catch (error) {
      this.logger.error(`Failed to retrieve active bank QR config: ${error.message}`, error.stack);
      throw new BadRequestException(
        `Failed to retrieve active bank QR configuration: ${error.message}`,
      );
    }
  }
  async update(id: number, dto: UpdateBankQRConfigDto): Promise<BankQRConfigResponse> {
    this.logger.log(`Updating bank QR config with ID: ${id}`);
    try {
      const existingConfig = await this.prisma.bankQRConfig.findUnique({
        where: { id },
      });
      if (!existingConfig) {
        throw new NotFoundException(`Bank QR configuration with ID ${id} not found`);
      }
      if (dto.isActive === true) {
        await this.deactivateAllConfigs();
      }
      const updateData: Record<string, unknown> = {};
      if (dto.bankBin !== undefined) {
        updateData.bankBin = dto.bankBin;
      }
      if (dto.accountNumber !== undefined) {
        updateData.accountNumber = dto.accountNumber;
      }
      if (dto.accountName !== undefined) {
        updateData.accountName = dto.accountName.trim().toUpperCase();
      }
      if (dto.isActive !== undefined) {
        updateData.isActive = dto.isActive;
      }
      const config = await this.prisma.bankQRConfig.update({
        where: { id },
        data: updateData,
      });
      this.logger.log(`Updated bank QR config with ID: ${config.id}`);
      return this.mapToResponse(config);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to update bank QR config: ${error.message}`, error.stack);
      throw new BadRequestException(`Failed to update bank QR configuration: ${error.message}`);
    }
  }
  async remove(id: number): Promise<void> {
    this.logger.log(`Deleting bank QR config with ID: ${id}`);
    try {
      const existingConfig = await this.prisma.bankQRConfig.findUnique({
        where: { id },
      });
      if (!existingConfig) {
        throw new NotFoundException(`Bank QR configuration with ID ${id} not found`);
      }
      await this.prisma.bankQRConfig.delete({
        where: { id },
      });
      this.logger.log(`Deleted bank QR config with ID: ${id}`);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to delete bank QR config: ${error.message}`, error.stack);
      throw new BadRequestException(`Failed to delete bank QR configuration: ${error.message}`);
    }
  }
  async activate(id: number): Promise<BankQRConfigResponse> {
    this.logger.log(`Activating bank QR config with ID: ${id}`);
    try {
      const existingConfig = await this.prisma.bankQRConfig.findUnique({
        where: { id },
      });
      if (!existingConfig) {
        throw new NotFoundException(`Bank QR configuration with ID ${id} not found`);
      }
      await this.deactivateAllConfigs();
      const config = await this.prisma.bankQRConfig.update({
        where: { id },
        data: { isActive: true },
      });
      this.logger.log(`Activated bank QR config with ID: ${config.id}`);
      return this.mapToResponse(config);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to activate bank QR config: ${error.message}`, error.stack);
      throw new BadRequestException(`Failed to activate bank QR configuration: ${error.message}`);
    }
  }
  private async deactivateAllConfigs(): Promise<void> {
    await this.prisma.bankQRConfig.updateMany({
      where: { isActive: true },
      data: { isActive: false },
    });
  }
  private mapToResponse(config: BankQRConfig): BankQRConfigResponse {
    return {
      id: config.id,
      bankBin: config.bankBin,
      accountNumber: config.accountNumber,
      accountName: config.accountName,
      isActive: config.isActive,
      createdAt: config.createdAt,
      updatedAt: config.updatedAt,
    };
  }
  async validateActiveConfigExists(): Promise<boolean> {
    const activeConfig = await this.findActive();
    return activeConfig !== null;
  }
  async getBankInfoForQR(): Promise<{
    bankBin: string;
    accountNumber: string;
    accountName: string;
    bankCode?: string;
    bankName?: string;
  } | null> {
    const activeConfig = await this.findActive();
    if (!activeConfig) {
      return null;
    }
    const bankCodeMapping: Record<
      string,
      {
        code: string;
        name: string;
      }
    > = {
      '970422': { code: 'MB', name: 'MB Bank' },
      '970436': { code: 'VCB', name: 'Vietcombank' },
      '970415': { code: 'VTB', name: 'Vietinbank' },
      '970418': { code: 'BIDV', name: 'BIDV' },
      '970432': { code: 'VPB', name: 'VPBank' },
      '970407': { code: 'TCB', name: 'Techcombank' },
      '970403': { code: 'SHB', name: 'SHB' },
      '970405': { code: 'ACB', name: 'ACB' },
      '970448': { code: 'OCB', name: 'OCB' },
      '970454': { code: 'CAKE', name: 'CAKE by VPBank' },
    };
    const bankInfo = bankCodeMapping[activeConfig.bankBin];
    return {
      bankBin: activeConfig.bankBin,
      accountNumber: activeConfig.accountNumber,
      accountName: activeConfig.accountName,
      bankCode: bankInfo?.code,
      bankName: bankInfo?.name,
    };
  }
}
