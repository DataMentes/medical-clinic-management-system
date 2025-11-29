const jwt = require('jsonwebtoken');

class AuthMiddleware {
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

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      
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
    return this.hasRole('admin')(req, res, next);
  }

  /**
   * Check if user is doctor
   */
  isDoctor(req, res, next) {
    return this.hasRole('doctor')(req, res, next);
  }

  /**
   * Check if user is receptionist
   */
  isReceptionist(req, res, next) {
    return this.hasRole('receptionist')(req, res, next);
  }

  /**
   * Check if user is patient
   */
  isPatient(req, res, next) {
    return this.hasRole('patient')(req, res, next);
  }
}

module.exports = new AuthMiddleware();
