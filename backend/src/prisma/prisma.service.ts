import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { getCorrelationId } from '../common/constants/async-context';
import { LoggingConfigService } from '../common/config/logging.config';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'stdout', level: 'info' },
        { emit: 'stdout', level: 'warn' },
        { emit: 'stdout', level: 'error' },
      ],
    });
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Database connection established');

    // Add query logging middleware
    const config = LoggingConfigService.getConfig();
    if (config.enableDbQueryLogging) {
      this.setupQueryLogging(config.slowQueryThreshold);
    }
  }

  private setupQueryLogging(slowQueryThreshold: number) {
    this.$use(async (params, next) => {
      const correlationId = getCorrelationId();
      const before = Date.now();

      const result = await next(params);

      const after = Date.now();
      const duration = after - before;

      // Log slow queries as warnings
      if (duration >= slowQueryThreshold) {
        this.logger.warn(
          `[${correlationId}] Slow query detected - ${duration}ms\n` +
          `  model: ${params.model}\n` +
          `  action: ${params.action}`
        );
      } else {
        // Log all queries as debug
        this.logger.debug(
          `[${correlationId}] Query executed - ${duration}ms\n` +
          `  model: ${params.model}\n` +
          `  action: ${params.action}`
        );
      }

      return result;
    });
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Database connection closed');
  }

  async cleanDatabase() {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('cleanDatabase is not allowed in production');
    }
    // Used for testing - deletes all data
    const models = Reflect.ownKeys(this).filter(
      (key) => typeof key === 'string' && !key.startsWith('_') && !key.startsWith('$'),
    );

    return Promise.all(
      models.map((modelKey) => {
        const model = this[modelKey as keyof this];
        if (model && typeof model === 'object' && 'deleteMany' in model) {
          return (model as { deleteMany: () => Promise<unknown> }).deleteMany();
        }
        return Promise.resolve();
      }),
    );
  }
}
