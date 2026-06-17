/**
 * Base application error with HTTP status code and error code.
 * All application errors extend this class for consistent handling.
 */
export class AppError extends Error {
  public constructor(
    message: string,
    public readonly statusCode: number,
    public readonly errorCode: string,
    public readonly context?: Readonly<Record<string, unknown>>,
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/** 400 — Invalid request data */
export class ValidationError extends AppError {
  public constructor(message: string, field?: string) {
    super(message, 400, 'VALIDATION_ERROR', { field });
  }
}

/** 401 — Missing or invalid authentication */
export class AuthenticationError extends AppError {
  public constructor(message = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR');
  }
}

/** 403 — Authenticated but not authorized */
export class AuthorizationError extends AppError {
  public constructor(resource: string) {
    super(`Access denied to resource: ${resource}`, 403, 'AUTHORIZATION_ERROR', { resource });
  }
}

/** 404 — Resource not found */
export class NotFoundError extends AppError {
  public constructor(resource: string, id: string) {
    super(`${resource} not found: ${id}`, 404, 'NOT_FOUND', { resource, id });
  }
}

/** 409 — Conflict with existing state */
export class ConflictError extends AppError {
  public constructor(message: string) {
    super(message, 409, 'CONFLICT');
  }
}

/** 422 — Emission calculation failure */
export class EmissionCalculationError extends AppError {
  public constructor(message: string, activityKind: string) {
    super(message, 422, 'EMISSION_CALC_ERROR', { activityKind });
  }
}

/** 429 — Rate limit exceeded */
export class RateLimitError extends AppError {
  public constructor(retryAfterSeconds: number) {
    super('Rate limit exceeded', 429, 'RATE_LIMIT_EXCEEDED', { retryAfterSeconds });
  }
}

/** 503 — External dependency unavailable */
export class ExternalServiceError extends AppError {
  public constructor(service: string, cause?: unknown) {
    super(`External service unavailable: ${service}`, 503, 'EXTERNAL_SERVICE_ERROR',
      { service, cause: String(cause) });
  }
}

/** Type guard for AppError */
export const isAppError = (error: unknown): error is AppError =>
  error instanceof AppError;
