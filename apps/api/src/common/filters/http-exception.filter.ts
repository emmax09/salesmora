import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { ApiErrorResponse } from '@salesmora/contracts';

interface HttpRequest {
  url: string;
}

interface HttpResponse {
  status(code: number): HttpResponse;
  json(body: ApiErrorResponse): HttpResponse;
}

@Catch()
export class GlobalHttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const http = host.switchToHttp();
    const response = http.getResponse<HttpResponse>();
    const request = http.getRequest<HttpRequest>();
    const statusCode = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;
    const exceptionBody = exception instanceof HttpException ? exception.getResponse() : null;
    const body = typeof exceptionBody === 'object' && exceptionBody !== null ? exceptionBody : {};
    const details = 'message' in body ? body.message : null;
    const message = exception instanceof HttpException
      ? typeof exceptionBody === 'string'
        ? exceptionBody
        : typeof details === 'string' || Array.isArray(details)
          ? details
          : HttpStatus[statusCode]
      : 'Internal server error';
    const error =
      'error' in body && typeof body.error === 'string' ? body.error : HttpStatus[statusCode];

    response.status(statusCode).json({
      statusCode,
      error: error ?? 'Error',
      message: typeof message === 'string' || Array.isArray(message) ? message : 'Request failed',
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
