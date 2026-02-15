import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { AuditService } from './audit.service';

export const AUDIT_ACTION_KEY = 'audit_action';
export const AUDIT_ENTITY_KEY = 'audit_entity';
export const AUDIT_MODULE_KEY = 'audit_module';

export interface AuditMetadata {
  action: string;
  entity: string;
  module?: string;
}

export const Audit = (metadata: AuditMetadata) => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata(AUDIT_ACTION_KEY, metadata.action, descriptor.value);
    Reflect.defineMetadata(AUDIT_ENTITY_KEY, metadata.entity, descriptor.value);
    if (metadata.module) {
      Reflect.defineMetadata(AUDIT_MODULE_KEY, metadata.module, descriptor.value);
    }
    return descriptor;
  };
};

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly auditService: AuditService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const handler = context.getHandler();
    const action = this.reflector.get<string>(AUDIT_ACTION_KEY, handler);
    const entity = this.reflector.get<string>(AUDIT_ENTITY_KEY, handler);
    const module = this.reflector.get<string>(AUDIT_MODULE_KEY, handler);

    // If no audit metadata, skip
    if (!action || !entity) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const userId = request.user?.sub || request.user?.id;
    const ipAddress = request.ip || request.headers['x-forwarded-for'] || request.connection?.remoteAddress;
    const userAgent = request.headers['user-agent'];

    return next.handle().pipe(
      tap(async (response) => {
        try {
          // Extract entity ID from response or request params
          let entityId: string | undefined;
          if (response?.id) {
            entityId = response.id.toString();
          } else if (request.params?.id) {
            entityId = request.params.id;
          }

          // For CREATE actions, log the new value
          // For UPDATE/DELETE, ideally we'd compare old vs new values
          // This interceptor provides basic logging; specific services can use AuditService directly for detailed diffs
          await this.auditService.create({
            userId,
            action,
            entity,
            entityId,
            newValue: action === 'CREATE' ? response : undefined,
            module,
            ipAddress,
            userAgent,
          });
        } catch (error) {
          // Don't fail the request if audit logging fails
          console.error('Audit logging failed:', error);
        }
      }),
    );
  }
}
