/**
 * Generate random 6-digit OTP
 */
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Get OTP expiry time (5 minutes from now)
 */
function getOTPExpiry() {
  return new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
}

module.exports = {
  generateOTP,
  getOTPExpiry
};
