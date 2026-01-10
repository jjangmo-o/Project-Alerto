import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();

    const exceptionResponse = exception.getResponse();

    let message = 'An error occurred';

    if (typeof exceptionResponse === 'string') {
      message = exceptionResponse;
    } else if (
      typeof exceptionResponse === 'object' &&
      (exceptionResponse as any).message
    ) {
      message = (exceptionResponse as any).message;
    }

    response.status(status).json({
      statusCode: status,
      error: exception.name,
      message,
      timestamp: new Date().toISOString(),
    });
  }
}
