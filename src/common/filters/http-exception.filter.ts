import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';

// Catches EVERYTHING — HttpExceptions thrown by us, Prisma errors,
// and any unexpected runtime error — and normalizes them into one
// consistent JSON shape so API consumers never get a surprise format.
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      message =
        typeof res === 'string'
          ? res
          : ((res as any).message ?? exception.message);
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      // Prisma error codes reference: https://www.prisma.io/docs/orm/reference/error-reference
      switch (exception.code) {
        case 'P2025': // record not found (e.g. update/delete on missing row)
          status = HttpStatus.NOT_FOUND;
          message = 'Resource not found';
          break;
        case 'P2002': // unique constraint violation
          status = HttpStatus.CONFLICT;
          message = `Duplicate value for field(s): ${(exception.meta?.target as string[])?.join(', ')}`;
          break;
        case 'P2003': // foreign key constraint violation (e.g. deleting a Category that still has Recipes)
          status = HttpStatus.CONFLICT;
          message = 'Cannot complete this operation: related records still reference this row';
          break;
        default:
          status = HttpStatus.BAD_REQUEST;
          message = 'Database request error';
      }
    } else if (exception instanceof Error) {
      this.logger.error(exception.message, exception.stack);
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    });
  }
}
