const authService = require('../services/auth.service');
const emailService = require('../services/email.service');
const jwt = require('jsonwebtoken');

class AuthController {
  /**
   * Register new user
   * @route POST /api/auth/register
   */
  async register(req, res, next) {
    try {
      const { email, password, name, role } = req.body;

      // Validation
      if (!email || !password || !name) {
        return res.status(400).json({
          success: false,
          error: 'Email, password, and name are required'
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          error: 'Password must be at least 6 characters'
        });
      }

      // Validate role
      const validRoles = ['admin', 'doctor', 'receptionist', 'patient'];
      if (role && !validRoles.includes(role)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid role'
        });
      }

      // Check if email exists
      const existingUser = await authService.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          error: 'Email already exists'
        });
      }

      // Create user
      const user = await authService.createUser({
        email,
        password,
        name,
        role: role || 'patient'
      });

      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      );

      // Send welcome email (async - don't wait)
      emailService.sendWelcomeEmail({
        email: user.email,
        name: user.name
      }).catch(err => {
        // Log error but don't fail registration
        console.error('Failed to send welcome email:', err.message);
      });

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user,
          token
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Login user
   * @route POST /api/auth/login
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      // Validation
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: 'Email and password are required'
        });
      }

      // Find user
      const user = await authService.findByEmail(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Invalid email or password'
        });
      }

      // Verify password
      const isPasswordValid = await authService.verifyPassword(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          error: 'Invalid email or password'
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      );

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: userWithoutPassword,
          token,
          redirectTo: this.getRedirectPath(user.role)
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get current user info
   * @route GET /api/auth/me
   */
  async me(req, res, next) {
    try {
      // User already attached by auth middleware
      const user = await authService.findByEmail(req.user.email);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      const { password: _, ...userWithoutPassword } = user;

      res.json({
        success: true,
        data: {
          user: userWithoutPassword,
          redirectTo: this.getRedirectPath(user.role)
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Logout user
   * @route POST /api/auth/logout
   */
  async logout(req, res, next) {
    try {
      // In JWT-based auth, logout is handled on client side by removing token
      // Here you can add token blacklisting if needed
      
      res.json({
        success: true,
        message: 'Logout successful'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Helper: Get redirect path based on role
   */
  getRedirectPath(role) {
    const redirectPaths = {
      admin: '/admin/dashboard',
      doctor: '/doctor/dashboard',
      receptionist: '/receptionist/dashboard',
      patient: '/patient/dashboard'
    };

    return redirectPaths[role] || '/dashboard';
  }
}

module.exports = new AuthController();