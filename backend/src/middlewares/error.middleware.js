/**
 * Global Error Handling Middleware
 * Catches all errors and returns consistent error responses
 */

const { ServiceError } = require('../utils/error');

/**
 * Development error response (includes stack trace)
 */
function sendErrorDev(err, res) {
  res.status(err.statusCode || 500).json({
    success: false,
    error: err.message,
    stack: err.stack,
    details: err
  });
}

/**
 * Production error response (no stack trace)
 */
function sendErrorProd(err, res) {
  // Operational error - send message to client
  if (err.statusCode) {
    res.status(err.statusCode).json({
      success: false,
      error: err.message || err.error || 'An error occurred' // Support both formats
    });
  } else {
    // Programming or unknown error - don't leak details
    console.error('ERROR 💥', err);
    res.status(500).json({
      success: false,
      error: 'Something went wrong'
    });
  }
}

/**
 * Main error handler
 */
function errorHandler(err, req, res, next) {
  // Handle plain error objects (legacy format: { statusCode, message })
  if (!err.statusCode && err.status) {
    err.statusCode = err.status;
  }
  
  // Set default statusCode if not set
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log error for debugging
  if (process.env.NODE_ENV !== 'production') {
    console.error('Error Details:', {
      message: err.message || err.error,
      statusCode: err.statusCode,
      stack: err.stack,
      path: req.path,
      method: req.method
    });
  }

  // Send appropriate response based on environment
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else {
    sendErrorProd(err, res);
  }
}

/**
 * Handle 404 Not Found
 */
function notFoundHandler(req, res, next) {
  const error = new ServiceError(
    `Cannot ${req.method} ${req.originalUrl}`,
    404
  );
  next(error);
}

/**
 * Async error wrapper
 * Wraps async route handlers to catch errors automatically
 * Usage: router.get('/path', asyncHandler(async (req, res) => {...}))
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler
};
