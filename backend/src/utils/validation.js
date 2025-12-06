/**
 * Validation Utilities
 * Reusable validation functions for input data
 */

const { ValidationError } = require('./error');

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid
 * @throws {ValidationError} - If invalid
 */
function validateEmail(email) {
  if (!email) {
    throw new ValidationError('Email is required');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ValidationError('Invalid email format');
  }

  return true;
}

/**
 * Validate phone number format
 * @param {string} phone - Phone number to validate
 * @returns {boolean} - True if valid
 * @throws {ValidationError} - If invalid
 */
function validatePhoneNumber(phone) {
  if (!phone) {
    throw new ValidationError('Phone number is required');
  }

  // Egyptian phone number format: 11 digits starting with 01
  const phoneRegex = /^01[0-9]{9}$/;
  if (!phoneRegex.test(phone)) {
    throw new ValidationError('Invalid phone number format (must be 11 digits starting with 01)');
  }

  return true;
}

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @param {number} minLength - Minimum password length (default: 6)
 * @returns {boolean} - True if valid
 * @throws {ValidationError} - If invalid
 */
function validatePassword(password, minLength = 6) {
  if (!password) {
    throw new ValidationError('Password is required');
  }

  if (password.length < minLength) {
    throw new ValidationError(`Password must be at least ${minLength} characters long`);
  }

  return true;
}

/**
 * Validate required fields in an object
 * @param {Object} obj - Object to validate
 * @param {Array<string>} fields - Array of required field names
 * @returns {boolean} - True if all fields present
 * @throws {ValidationError} - If any field is missing
 */
function validateRequiredFields(obj, fields) {
  const missingFields = fields.filter(field => !obj[field]);
  
  if (missingFields.length > 0) {
    throw new ValidationError(`Missing required fields: ${missingFields.join(', ')}`);
  }

  return true;
}

/**
 * Validate ID (must be positive integer)
 * @param {any} id - ID to validate
 * @param {string} resourceName - Name of resource for error message
 * @returns {number} - Parsed ID
 * @throws {ValidationError} - If invalid
 */
function validateId(id, resourceName = 'Resource') {
  const parsedId = parseInt(id);
  
  if (isNaN(parsedId) || parsedId <= 0) {
    throw new ValidationError(`Invalid ${resourceName} ID`);
  }

  return parsedId;
}

/**
 * Validate pagination parameters
 * @param {Object} query - Query object with page and limit
 * @returns {Object} - Validated { page, limit, skip, take }
 */
function validatePagination(query) {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 20)); // Max 100 items per page
  
  return {
    page,
    limit,
    skip: (page - 1) * limit,
    take: limit
  };
}

/**
 * Validate enum value
 * @param {any} value - Value to validate
 * @param {Array} allowedValues - Array of allowed values
 * @param {string} fieldName - Field name for error message
 * @returns {any} - The validated value
 * @throws {ValidationError} - If value not in allowed values
 */
function validateEnum(value, allowedValues, fieldName = 'Field') {
  if (!allowedValues.includes(value)) {
    throw new ValidationError(
      `${fieldName} must be one of: ${allowedValues.join(', ')}`
    );
  }

  return value;
}

/**
 * Sanitize input string (trim and remove extra spaces)
 * @param {string} str - String to sanitize
 * @returns {string} - Sanitized string
 */
function sanitizeString(str) {
  if (typeof str !== 'string') return str;
  return str.trim().replace(/\s+/g, ' ');
}

module.exports = {
  validateEmail,
  validatePhoneNumber,
  validatePassword,
  validateRequiredFields,
  validateId,
  validatePagination,
  validateEnum,
  sanitizeString
};
