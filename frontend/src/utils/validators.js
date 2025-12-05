/**
 * Form validation utilities
 */

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone) => {
  // Egyptian phone: 11 digits starting with 01
  const phoneRegex = /^01[0-2,5]{1}[0-9]{8}$/;
  return phoneRegex.test(phone);
};

export const validatePassword = (password) => {
  // At least 6 characters
  return password && password.length >= 6;
};

export const validateOTP = (otp) => {
  // 6 digit code
  const otpRegex = /^\d{6}$/;
  return otpRegex.test(otp);
};

export const validateRequired = (value) => {
  return value && value.trim().length > 0;
};

export default {
  validateEmail,
  validatePhone,
  validatePassword,
  validateOTP,
  validateRequired
};
