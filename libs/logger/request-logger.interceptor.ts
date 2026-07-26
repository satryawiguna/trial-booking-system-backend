import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Response, Request } from 'express';

/**
 * Logs every HTTP request with: method, URL, status code, and duration.
 *
 * Output format:
 *   [HTTP] GET /api/v1/trial-classes 200 12ms
 */
@Injectable()
export class RequestLoggerInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, url } = request;
    const now = Date.now();

    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse<Response>();
        const { statusCode } = response;
        const duration = Date.now() - now;
        this.logger.log(`${method} ${url} ${statusCode} ${duration}ms`);
      }),
    );
  }
}
