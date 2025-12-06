/**
 * Application Constants
 * Centralized configuration values
 */

// Security
const BCRYPT_SALT_ROUNDS = 10;
const JWT_EXPIRATION = '24h';
const OTP_EXPIRATION_MINUTES = 10;
const OTP_LENGTH = 6;

// Pagination
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;
const MIN_PAGE_SIZE = 1;

// Roles (matching database enum)
const ROLES = {
  ADMIN: 'Admin',
  DOCTOR: 'Doctor',
  RECEPTIONIST: 'Receptionist',
  PATIENT: 'Patient'
};

// Role IDs (matching database)
const ROLE_IDS = {
  ADMIN: 4,
  DOCTOR: 1,
  RECEPTIONIST: 3,
  PATIENT: 2
};

// Appointment Status
const APPOINTMENT_STATUS = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  COMPLETED: 'Completed',
  CANCELED: 'Canceled'
};

// Appointment Types
const APPOINTMENT_TYPES = {
  EXAMINATION: 'Examination',
  CONSULTATION: 'Consultation'
};

// Week Days (matching database enum)
const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// Active Status
const ACTIVE_STATUS = {
  YES: 'Yes',
  NO: 'No'
};

// Gender
const GENDER = {
  MALE: 'Male',
  FEMALE: 'Female'
};

module.exports = {
  BCRYPT_SALT_ROUNDS,
  JWT_EXPIRATION,
  OTP_EXPIRATION_MINUTES,
  OTP_LENGTH,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  MIN_PAGE_SIZE,
  ROLES,
  ROLE_IDS,
  APPOINTMENT_STATUS,
  APPOINTMENT_TYPES,
  WEEK_DAYS,
  ACTIVE_STATUS,
  GENDER
};
