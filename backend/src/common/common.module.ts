
import { Module, Global } from '@nestjs/common';
import { EnhancedLoggerService } from './services/enhanced-logger.service';

@Global()
@Module({
  providers: [EnhancedLoggerService],
  exports: [EnhancedLoggerService],
})
export class CommonModule {}
