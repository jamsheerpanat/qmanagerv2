import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { Request, Response } from 'express';

/**
 * Without this, every database-level failure reached the client as a bare 500
 * "Internal server error" with no indication of what went wrong — a duplicate
 * product code and a malformed payload looked identical from the browser.
 *
 * Prisma messages can echo schema details, so the client gets a clean sentence
 * and the full error is written to the server log for diagnosis.
 */
@Catch(
  Prisma.PrismaClientKnownRequestError,
  Prisma.PrismaClientValidationError,
  Prisma.PrismaClientUnknownRequestError,
)
export class PrismaExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaExceptionFilter.name);

  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const { status, message } = this.translate(exception);

    this.logger.error(
      `${request.method} ${request.url} -> ${status}: ${exception.message}`,
    );

    response.status(status).json({
      statusCode: status,
      message,
      path: request.url,
    });
  }

  private translate(exception: Error): { status: number; message: string } {
    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      switch (exception.code) {
        case 'P2002':
          return {
            status: HttpStatus.CONFLICT,
            message: `A record with this ${this.fieldsOf(exception)} already exists.`,
          };
        case 'P2003':
          return {
            status: HttpStatus.BAD_REQUEST,
            message:
              'A referenced record does not exist. Please refresh the page and try again.',
          };
        case 'P2025':
          return {
            status: HttpStatus.NOT_FOUND,
            message: 'The requested record was not found.',
          };
        case 'P2000':
          return {
            status: HttpStatus.BAD_REQUEST,
            message: 'One of the submitted values is too long for its field.',
          };
        case 'P2014':
          return {
            status: HttpStatus.BAD_REQUEST,
            message:
              'This record is still referenced by other records and cannot be changed.',
          };
      }
      return {
        status: HttpStatus.BAD_REQUEST,
        message: `The database rejected this request (${exception.code}).`,
      };
    }

    if (exception instanceof Prisma.PrismaClientValidationError) {
      return {
        status: HttpStatus.BAD_REQUEST,
        message:
          'The submitted data does not match the expected format. Please check the form and try again.',
      };
    }

    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'A database error occurred. Please try again.',
    };
  }

  /** Human-readable name of the column(s) that tripped a unique constraint. */
  private fieldsOf(exception: Prisma.PrismaClientKnownRequestError): string {
    const target = (exception.meta as { target?: unknown } | undefined)?.target;
    if (Array.isArray(target) && target.length) return target.join(', ');
    if (typeof target === 'string' && target) return target;
    return 'value';
  }
}
