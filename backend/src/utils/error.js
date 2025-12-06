/**
 * Custom Error Classes for consistent error handling across the application
 */

/**
 * Base Service Error
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 */
class ServiceError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.name = 'ServiceError';
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validation Error (400)
 * Used for invalid input data
 */
class ValidationError extends ServiceError {
  constructor(message = 'Validation failed') {
    super(message, 400);
    this.name = 'ValidationError';
  }
}

/**
 * Not Found Error (404)
 * Used when a resource is not found
 */
class NotFoundError extends ServiceError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404);
    this.name = 'NotFoundError';
  }
}

/**
 * Conflict Error (409)
 * Used when there's a conflict (e.g., duplicate entry)
 */
class ConflictError extends ServiceError {
  constructor(message = 'Conflict detected') {
    super(message, 409);
    this.name = 'ConflictError';
  }
}

/**
 * Unauthorized Error (401)
 * Used for authentication failures
 */
class UnauthorizedError extends ServiceError {
  constructor(message = 'Unauthorized access') {
    super(message, 401);
    this.name = 'UnauthorizedError';
  }
}

/**
 * Forbidden Error (403)
 * Used for authorization failures
 */
class ForbiddenError extends ServiceError {
  constructor(message = 'Forbidden access') {
    super(message, 403);
    this.name = 'ForbiddenError';
  }
}

module.exports = {
  ServiceError,
  ValidationError,
  NotFoundError,
  ConflictError,
  UnauthorizedError,
  ForbiddenError
};
