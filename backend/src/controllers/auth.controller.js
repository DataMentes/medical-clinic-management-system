const authService = require('../services/auth/auth.service');

class AuthController {
  /**
   * Register new patient
   */
  async register(req, res, next) {
    try {
      const { email, password, fullName, phoneNumber, gender, yearOfBirth } = req.body;

      // Basic Validation
      if (!email || !password || !fullName || !phoneNumber || !gender || !yearOfBirth) {
        return res.status(400).json({
          success: false,
          error: 'All fields are required (email, password, fullName, phoneNumber, gender, yearOfBirth)'
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          error: 'Password must be at least 6 characters'
        });
      }

      // Call Service
      const result = await authService.registerPatient(req.body);

      return res.status(201).json({
        success: true,
        message: 'Registration successful. Please check your email for OTP verification code.',
        data: result
      });
    } catch (error) {
      if (error.statusCode) {
        return res.status(error.statusCode).json({ success: false, error: error.message });
      }
      next(error);
    }
  }

  /**
   * Verify OTP
   */
  async verifyOTP(req, res, next) {
    try {
      const { email, otpCode } = req.body;

      if (!email || !otpCode) {
        return res.status(400).json({
          success: false,
          error: 'Email and OTP code are required'
        });
      }

      const result = await authService.verifyOTP(email, otpCode);

      return res.json({
        success: true,
        message: 'Email verified successfully',
        data: result
      });
    } catch (error) {
      if (error.statusCode) {
        return res.status(error.statusCode).json({ success: false, error: error.message });
      }
      next(error);
    }
  }

  /**
   * Resend OTP
   */
  async resendOTP(req, res, next) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          error: 'Email is required'
        });
      }

      await authService.resendOTP(email);

      return res.json({
        success: true,
        message: 'New OTP sent to your email'
      });
    } catch (error) {
      if (error.statusCode) {
        return res.status(error.statusCode).json({ success: false, error: error.message });
      }
      next(error);
    }
  }

  /**
   * Login
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: 'Email and password are required'
        });
      }

      const result = await authService.login({ email, password });

      // Check if verification is needed (handled by service throwing error, but if we wanted to pass data...)
      // The service throws error with requiresVerification: true if needed.
      // We need to catch that specific error property potentially?
      // Service logic:
      // if (user.active === 'No') {
      //   const error = new ServiceError('...', 403);
      //   error.requiresVerification = true;
      //   throw error;
      // }
      // So here in catch block we can check for it.

      return res.json({
        success: true,
        message: 'Login successful',
        data: result
      });
    } catch (error) {
      if (error.statusCode) {
        const response = { success: false, error: error.message };
        if (error.requiresVerification) {
          response.requiresVerification = true;
        }
        return res.status(error.statusCode).json(response);
      }
      next(error);
    }
  }

  /**
   * Get Current User (Me)
   */
  async me(req, res, next) {
    try {
      // req.user is set by authMiddleware
      const userId = req.user.userId;

      const result = await authService.getUserProfile(userId);

      return res.json({
        success: true,
        data: result
      });
    } catch (error) {
      if (error.statusCode) {
        return res.status(error.statusCode).json({ success: false, error: error.message });
      }
      next(error);
    }
  }

  /**
   * Logout
   */
  async logout(req, res, next) {
    try {
      return res.json({
        success: true,
        message: 'Logout successful'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
