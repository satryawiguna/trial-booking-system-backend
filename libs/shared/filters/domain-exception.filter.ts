import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { DomainException } from '@app/shared/exceptions';

/**
 * Global exception filter that catches all exceptions and returns
 * a consistent JSON error response structure.
 *
 * Domain exceptions: { statusCode, errorCode, message }
 * NestJS HTTP exceptions: { statusCode, message, error (optional) }
 * Unknown exceptions: { statusCode: 500, message: "Internal server error" }
 */
@Catch()
export class DomainExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(DomainExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // Domain-level exception → structured response
    if (exception instanceof DomainException) {
      this.logger.warn(`[${exception.errorCode}] ${exception.message}`);
      return response.status(exception.statusCode).json({
        statusCode: exception.statusCode,
        errorCode: exception.errorCode,
        message: exception.message,
      });
    }

    // NestJS built-in HTTP exception
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const res = exception.getResponse();
      const message = typeof res === 'string' ? res : (res as any).message;
      this.logger.warn(`[HTTP ${status}] ${message}`);
      return response.status(status).json({
        statusCode: status,
        message: Array.isArray(message) ? message.join('; ') : message,
      });
    }

    // Unexpected exception
    this.logger.error('Unhandled exception', exception);
    return response.status(500).json({
      statusCode: 500,
      message: 'Internal server error',
    });
  }
}
