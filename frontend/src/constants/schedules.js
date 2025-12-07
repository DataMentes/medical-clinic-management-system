/**
 * Schedule Constants
 * Centralized weekday mappings and options
 */

// Weekday mapping: Backend enum → Frontend display name
export const WEEKDAYS = {
  Mon: 'Monday',
  Tue: 'Tuesday',
  Wed: 'Wednesday',
  Thu: 'Thursday',
  Fri: 'Friday',
  Sat: 'Saturday',
  Sun: 'Sunday'
};

// Reverse mapping: Frontend display name → Backend enum
export const WEEKDAY_REVERSE_MAP = {
  'Monday': 'Mon',
  'Tuesday': 'Tue',
  'Wednesday': 'Wed',
  'Thursday': 'Thu',
  'Friday': 'Fri',
  'Saturday': 'Sat',
  'Sunday': 'Sun'
};

// Options for select dropdown (displays full day names)
export const WEEKDAY_OPTIONS = Object.entries(WEEKDAYS).map(([value, label]) => ({
  value: label,  // Use full name as value for form
  label          // Display full name
}));

// Backend enum values (for validation)
export const WEEKDAY_ENUM = Object.keys(WEEKDAYS);
