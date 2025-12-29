import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { FastifyRequest } from 'fastify';
import { ApiResponse } from '../interfaces/api-response.interface';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    const request = context.switchToHttp().getRequest<FastifyRequest>();

    return next.handle().pipe(
      map((data) => {
        // If data already has success property, it's already formatted
        if (data && typeof data === 'object' && 'success' in data) {
          return data;
        }

        // Handle pagination metadata
        if (data && typeof data === 'object' && 'items' in data && 'meta' in data) {
          return {
            success: true,
            data: data.items,
            message: 'Thành công',
            code: 'SUCCESS',
            timestamp: new Date().toISOString(),
            path: request.url,
            meta: data.meta,
          };
        }

        return {
          success: true,
          data,
          message: 'Thành công',
          code: 'SUCCESS',
          timestamp: new Date().toISOString(),
          path: request.url,
        };
      }),
    );
  }
}
