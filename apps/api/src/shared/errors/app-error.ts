import { ApiErrorItem, HTTP_STATUS, HttpStatusCode } from '@erp/shared';

/**
 * Base Application Error
 * All operational, known business errors inherit from this class.
 */
export class AppError extends Error {
  public readonly statusCode: HttpStatusCode;
  public readonly code: string;
  public readonly errors: ApiErrorItem[];
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode: HttpStatusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR,
    code: string = 'INTERNAL_ERROR',
    errors: ApiErrorItem[] = []
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.errors = errors.length > 0 ? errors : [{ message, code }];
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  constructor(message: string = 'Bad request', code: string = 'BAD_REQUEST', errors: ApiErrorItem[] = []) {
    super(message, HTTP_STATUS.BAD_REQUEST, code, errors);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Authentication required', code: string = 'UNAUTHORIZED') {
    super(message, HTTP_STATUS.UNAUTHORIZED, code);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Access denied', code: string = 'FORBIDDEN') {
    super(message, HTTP_STATUS.FORBIDDEN, code);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found', code: string = 'NOT_FOUND') {
    super(message, HTTP_STATUS.NOT_FOUND, code);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource conflict', code: string = 'CONFLICT', errors: ApiErrorItem[] = []) {
    super(message, HTTP_STATUS.CONFLICT, code, errors);
  }
}

export class ValidationError extends AppError {
  constructor(message: string = 'Validation failed', errors: ApiErrorItem[] = []) {
    super(message, HTTP_STATUS.UNPROCESSABLE_ENTITY, 'VALIDATION_ERROR', errors);
  }
}

export class TooManyRequestsError extends AppError {
  constructor(message: string = 'Too many requests, please try again later', code: string = 'TOO_MANY_REQUESTS') {
    super(message, HTTP_STATUS.TOO_MANY_REQUESTS, code);
  }
}
