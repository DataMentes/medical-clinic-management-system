const jwt = require('jsonwebtoken');

class AuthMiddleware {
  constructor() {
    // Bind methods to preserve 'this' context when used as middleware
    this.authenticate = this.authenticate.bind(this);
    this.isAdmin = this.isAdmin.bind(this);
    this.isDoctor = this.isDoctor.bind(this);
    this.isReceptionist = this.isReceptionist.bind(this);
    this.isPatient = this.isPatient.bind(this);
  }

  /**
   * Authenticate user from JWT token
   * Adds user info to req.user
   */
  authenticate(req, res, next) {
    try {
      // Get token from header
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          success: false,
          error: 'Authentication token is required'
        });
      }

      const token = authHeader.split(' ')[1];

      // ✅ SECURITY: No fallback secret - fail if missing
      const secret = process.env.JWT_SECRET;
      if (!secret) {
        console.error('CRITICAL: JWT_SECRET environment variable is not set');
        return res.status(500).json({
          success: false,
          error: 'Server configuration error'
        });
      }

      // Verify token
      const decoded = jwt.verify(token, secret);
      
      // Attach user to request
      req.user = decoded;
      
      next();
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          error: 'Invalid token'
        });
      }
      
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          error: 'Token expired'
        });
      }

      return res.status(500).json({
        success: false,
        error: 'Authentication failed'
      });
    }
  }

  /**
   * Check if user has specific role
   * Usage: authMiddleware.hasRole('admin')
   */
  hasRole(...allowedRoles) {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }

      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          error: 'Insufficient permissions'
        });
      }

      next();
    };
  }

  /**
   * Check if user is admin
   */
  isAdmin(req, res, next) {
    return this.hasRole('Admin')(req, res, next);
  }

  /**
   * Check if user is doctor
   */
  isDoctor(req, res, next) {
    return this.hasRole('Doctor')(req, res, next);
  }

  /**
   * Check if user is receptionist
   */
  isReceptionist(req, res, next) {
    return this.hasRole('Receptionist')(req, res, next);
  }

  /**
   * Check if user is patient
   */
  isPatient(req, res, next) {
    return this.hasRole('Patient')(req, res, next);
  }
}

module.exports = new AuthMiddleware();
