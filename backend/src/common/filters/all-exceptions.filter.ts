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

        // Handle validation errors
        if (Array.isArray(responseObj.message)) {
          code = ERROR_CODES.VAL_001;
          message = getErrorMessage(code);
          errors = this.formatValidationErrors(responseObj.message as string[]);
        } else if (typeof responseObj.message === 'string') {
          message = responseObj.message;
        }

        // Check for custom error code
        if (responseObj.code && typeof responseObj.code === 'string') {
          code = responseObj.code as ErrorCode;
          message = getErrorMessage(code);
        }
      } else if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      }
    }

    // Log error for debugging (non-client errors)
    if (status >= 500) {
      this.logger.error(
        `${request.method} ${request.url} - ${status}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
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

    response.status(status).send(errorResponse);
  }

  private formatValidationErrors(messages: string[]): Record<string, string[]> {
    const errors: Record<string, string[]> = {};

    for (const msg of messages) {
      // Extract field name from validation message
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
