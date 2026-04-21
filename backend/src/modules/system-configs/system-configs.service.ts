import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { UpsertSystemConfigDto } from './dto/upsert-system-config.dto';
@Injectable()
export class SystemConfigsService {
  constructor(private prisma: PrismaService) {}
  async findAll() {
    return this.prisma.systemConfig.findMany();
  }
  async findByKey(key: string) {
    const config = await this.prisma.systemConfig.findUnique({
      where: { key },
    });
    if (!config) {
      throw new NotFoundException(`Config with key ${key} not found`);
    }
    return config;
  }
  async upsert(dto: UpsertSystemConfigDto) {
    return this.prisma.systemConfig.upsert({
      where: { key: dto.key },
      create: {
        key: dto.key,
        value: dto.value,
        type: dto.type ?? 'TEXT',
        description: dto.description,
      },
      update: {
        value: dto.value,
        type: dto.type ?? 'TEXT',
        description: dto.description,
      },
    });
  }
  async remove(key: string) {
    return this.prisma.systemConfig
      .delete({
        where: { key },
      })
      .catch(() => {
        throw new NotFoundException(`Config with key ${key} not found`);
      });
  }
  async getPublicConfigs() {
    const configs = await this.prisma.systemConfig.findMany();
    const configMap: Record<string, any> = {};
    configs.forEach((c) => {
      configMap[c.key] = c.value;
    });
    return configMap;
  }
}
