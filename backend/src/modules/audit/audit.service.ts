import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { AuditLog, Prisma } from '@prisma/client';

export interface CreateAuditLogDto {
  userId?: number;
  action: string;
  entity: string;
  entityId?: string;
  oldValue?: Record<string, unknown>;
  newValue?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  module?: string;
}

export interface AuditLogFilter {
  userId?: number;
  action?: string;
  entity?: string;
  entityId?: string;
  module?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateAuditLogDto): Promise<AuditLog> {
    return this.prisma.auditLog.create({
      data: {
        userId: dto.userId,
        action: dto.action,
        entity: dto.entity,
        entityId: dto.entityId,
        targetTable: dto.entity.toLowerCase(),
        targetId: dto.entityId ? parseInt(dto.entityId, 10) || null : null,
        oldValue: dto.oldValue as Prisma.InputJsonValue,
        newValue: dto.newValue as Prisma.InputJsonValue,
        ipAddress: dto.ipAddress,
        userAgent: dto.userAgent,
        module: dto.module,
      },
    });
  }

  async findAll(filter: AuditLogFilter) {
    const { userId, action, entity, entityId, module, startDate, endDate, page = 1, limit = 20 } = filter;

    const where: Prisma.AuditLogWhereInput = {};

    if (userId) where.userId = userId;
    if (action) where.action = action;
    if (entity) where.entity = entity;
    if (entityId) where.entityId = entityId;
    if (module) where.module = module;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              phoneNumber: true,
              role: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: bigint) {
    return this.prisma.auditLog.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            phoneNumber: true,
            role: true,
          },
        },
      },
    });
  }

  async getActionTypes(): Promise<string[]> {
    const result = await this.prisma.auditLog.findMany({
      select: { action: true },
      distinct: ['action'],
    });
    return result.map((r) => r.action);
  }

  async getEntityTypes(): Promise<string[]> {
    const result = await this.prisma.auditLog.findMany({
      select: { entity: true },
      distinct: ['entity'],
    });
    return result.map((r) => r.entity);
  }

  async getModules(): Promise<string[]> {
    const result = await this.prisma.auditLog.findMany({
      where: { module: { not: null } },
      select: { module: true },
      distinct: ['module'],
    });
    return result.map((r) => r.module).filter(Boolean) as string[];
  }

  // Utility method to compute diff between old and new values
  computeDiff(
    oldValue: Record<string, unknown> | null,
    newValue: Record<string, unknown> | null,
  ): Record<string, { old: unknown; new: unknown }> {
    const diff: Record<string, { old: unknown; new: unknown }> = {};

    if (!oldValue && !newValue) return diff;

    const allKeys = new Set([...Object.keys(oldValue || {}), ...Object.keys(newValue || {})]);

    for (const key of allKeys) {
      const oldVal = oldValue?.[key];
      const newVal = newValue?.[key];

      if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
        diff[key] = { old: oldVal, new: newVal };
      }
    }

    return diff;
  }

  // Log a CREATE action
  async logCreate(params: {
    userId?: number;
    entity: string;
    entityId: string;
    newValue: Record<string, unknown>;
    module?: string;
    ipAddress?: string;
    userAgent?: string;
  }) {
    return this.create({
      userId: params.userId,
      action: 'CREATE',
      entity: params.entity,
      entityId: params.entityId,
      newValue: params.newValue,
      module: params.module,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    });
  }

  // Log an UPDATE action
  async logUpdate(params: {
    userId?: number;
    entity: string;
    entityId: string;
    oldValue: Record<string, unknown>;
    newValue: Record<string, unknown>;
    module?: string;
    ipAddress?: string;
    userAgent?: string;
  }) {
    return this.create({
      userId: params.userId,
      action: 'UPDATE',
      entity: params.entity,
      entityId: params.entityId,
      oldValue: params.oldValue,
      newValue: params.newValue,
      module: params.module,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    });
  }

  // Log a DELETE action
  async logDelete(params: {
    userId?: number;
    entity: string;
    entityId: string;
    oldValue: Record<string, unknown>;
    module?: string;
    ipAddress?: string;
    userAgent?: string;
  }) {
    return this.create({
      userId: params.userId,
      action: 'DELETE',
      entity: params.entity,
      entityId: params.entityId,
      oldValue: params.oldValue,
      module: params.module,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    });
  }

  // Log a LOGIN action
  async logLogin(params: {
    userId: number;
    ipAddress?: string;
    userAgent?: string;
  }) {
    return this.create({
      userId: params.userId,
      action: 'LOGIN',
      entity: 'User',
      entityId: params.userId.toString(),
      module: 'Auth',
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    });
  }

  // Log a LOGOUT action
  async logLogout(params: {
    userId: number;
    ipAddress?: string;
    userAgent?: string;
  }) {
    return this.create({
      userId: params.userId,
      action: 'LOGOUT',
      entity: 'User',
      entityId: params.userId.toString(),
      module: 'Auth',
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    });
  }

  // Log an EXPORT action
  async logExport(params: {
    userId?: number;
    entity: string;
    module?: string;
    ipAddress?: string;
    userAgent?: string;
    metadata?: Record<string, unknown>;
  }) {
    return this.create({
      userId: params.userId,
      action: 'EXPORT',
      entity: params.entity,
      newValue: params.metadata,
      module: params.module,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    });
  }
}
