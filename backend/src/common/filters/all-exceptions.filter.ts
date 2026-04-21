import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import { ERROR_CODES, getErrorMessage, ErrorCode } from '../constants/error-codes.constant';
import { ErrorResponse } from '../interfaces/api-response.interface';
import { getCorrelationId } from '../constants/async-context';
import { Sanitizer } from '../utils/sanitizer.util';
import { LoggingConfigService } from '../config/logging.config';
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest<FastifyRequest>();
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = getErrorMessage(ERROR_CODES.SYS_001);
    let code: ErrorCode = ERROR_CODES.SYS_001;
    let errors: Record<string, string[]> | undefined;
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const responseObj = exceptionResponse as Record<string, unknown>;
        if (Array.isArray(responseObj.message)) {
          code = ERROR_CODES.VAL_001;
          message = getErrorMessage(code);
          errors = this.formatValidationErrors(responseObj.message as string[]);
        } else if (typeof responseObj.message === 'string') {
          message = responseObj.message;
        }
        if (responseObj.code && typeof responseObj.code === 'string') {
          code = responseObj.code as ErrorCode;
          message = getErrorMessage(code);
        }
      } else if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      }
    }
    const correlationId = getCorrelationId();
    const config = LoggingConfigService.getConfig();
    const logParts: string[] = [];
    logParts.push(`[${correlationId}] ${request.method} ${request.url} - ${status}`);
    logParts.push(`  error: ${message}`);
    logParts.push(`  code: ${code}`);
    if (config.enableRequestBodyLogging && request.body) {
      const sanitizedBody = config.sanitizeSensitive
        ? Sanitizer.sanitize(request.body)
        : request.body;
      const truncatedBody = Sanitizer.truncate(sanitizedBody, config.maxBodySize);
      logParts.push(`  requestBody: ${JSON.stringify(truncatedBody, null, 2)}`);
    }
    const user = (request as any).user;
    if (user) {
      logParts.push(`  userId: ${user.id}, role: ${user.role}`);
    }
    if (status >= 500) {
      this.logger.error(
        logParts.join('\n'),
        exception instanceof Error ? exception.stack : String(exception),
      );
    } else if (status >= 400) {
      this.logger.warn(logParts.join('\n'));
    }
    const errorResponse: ErrorResponse = {
      success: false,
      data: null,
      message,
      code,
      timestamp: new Date().toISOString(),
      path: request.url,
      ...(errors && { errors }),
    };
    if (correlationId) {
      response.header('X-Correlation-ID', correlationId);
    }
    response.status(status).send(errorResponse);
  }
  private formatValidationErrors(messages: string[]): Record<string, string[]> {
    const errors: Record<string, string[]> = {};
    for (const msg of messages) {
      const match = msg.match(/^(\w+)\s/);
      const field = match ? match[1] : 'general';
      if (!errors[field]) {
        errors[field] = [];
      }
      errors[field].push(msg);
    }
    return errors;
  }
}
