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

  constructor(private readonly prisma: PrismaService) { }

  /**
   * Create a new bank QR configuration
   * Ensures only one active configuration exists at a time
   */
  async create(dto: CreateBankQRConfigDto): Promise<BankQRConfigResponse> {
    this.logger.log(`Creating bank QR config for BIN: ${dto.bankBin}`);

    try {
      // If creating an active config, deactivate all existing ones
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

  /**
   * Get all bank QR configurations
   */
  async findAll(): Promise<BankQRConfigResponse[]> {
    this.logger.log('Retrieving all bank QR configurations');

    try {
      const configs = await this.prisma.bankQRConfig.findMany({
        orderBy: [
          { isActive: 'desc' }, // Active configs first
          { createdAt: 'desc' }, // Then by creation date
        ],
      });

      return configs.map((config: BankQRConfig) => this.mapToResponse(config));
    } catch (error) {
      this.logger.error(`Failed to retrieve bank QR configs: ${error.message}`, error.stack);
      throw new BadRequestException(`Failed to retrieve bank QR configurations: ${error.message}`);
    }
  }

  /**
   * Get a specific bank QR configuration by ID
   */
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

  /**
   * Get the currently active bank QR configuration
   * Returns null if no active configuration exists
   */
  async findActive(): Promise<BankQRConfigResponse | null> {
    this.logger.log('Retrieving active bank QR configuration');

    try {
      const config = await this.prisma.bankQRConfig.findFirst({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' }, // Get the most recent active config
      });

      return config ? this.mapToResponse(config) : null;
    } catch (error) {
      this.logger.error(`Failed to retrieve active bank QR config: ${error.message}`, error.stack);
      throw new BadRequestException(
        `Failed to retrieve active bank QR configuration: ${error.message}`,
      );
    }
  }

  /**
   * Update a bank QR configuration
   */
  async update(id: number, dto: UpdateBankQRConfigDto): Promise<BankQRConfigResponse> {
    this.logger.log(`Updating bank QR config with ID: ${id}`);

    try {
      // Check if config exists
      const existingConfig = await this.prisma.bankQRConfig.findUnique({
        where: { id },
      });

      if (!existingConfig) {
        throw new NotFoundException(`Bank QR configuration with ID ${id} not found`);
      }

      // If setting this config as active, deactivate all others
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

  /**
   * Delete a bank QR configuration
   */
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

  /**
   * Activate a specific bank QR configuration and deactivate all others
   */
  async activate(id: number): Promise<BankQRConfigResponse> {
    this.logger.log(`Activating bank QR config with ID: ${id}`);

    try {
      // Check if config exists
      const existingConfig = await this.prisma.bankQRConfig.findUnique({
        where: { id },
      });

      if (!existingConfig) {
        throw new NotFoundException(`Bank QR configuration with ID ${id} not found`);
      }

      // Deactivate all configs first
      await this.deactivateAllConfigs();

      // Then activate the specified one
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

  /**
   * Deactivate all bank QR configurations
   */
  private async deactivateAllConfigs(): Promise<void> {
    await this.prisma.bankQRConfig.updateMany({
      where: { isActive: true },
      data: { isActive: false },
    });
  }

  /**
   * Map Prisma model to response DTO
   */
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

  /**
   * Validate that at least one active configuration exists
   */
  async validateActiveConfigExists(): Promise<boolean> {
    const activeConfig = await this.findActive();
    return activeConfig !== null;
  }

  /**
   * Get bank information for QR generation
   * Returns the active bank configuration with additional metadata
   */
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

    // Map bank BIN to bank code (this is a simplified mapping)
    // In a real implementation, you might want to store this in the database
    // or have a more comprehensive mapping service
    const bankCodeMapping: Record<string, { code: string; name: string }> = {
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