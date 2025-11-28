/**
 * Middleware for [Purpose]
 * Replace [Purpose] with actual purpose (e.g., Authentication, Validation)
 */
class ResourceMiddleware {
  /**
   * Example middleware function
   * @param {Request} req 
   * @param {Response} res 
   * @param {NextFunction} next 
   */
  checkSomething(req, res, next) {
    // Your logic here
    const isValid = true; // Replace with actual validation

    if (!isValid) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed'
      });
    }

    next();
  }

  /**
   * Validate request body
   */
  validateBody(req, res, next) {
    const { field1, field2 } = req.body;
    const errors = [];

    if (!field1) {
      errors.push('Field1 is required');
    }

    if (!field2) {
      errors.push('Field2 is required');
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        errors
      });
    }

    next();
  }

  /**
   * Validate ID parameter
   */
  validateId(req, res, next) {
    const id = parseInt(req.params.id);

    if (isNaN(id) || id < 1) {
      return res.status(400).json({
        success: false,
        error: 'Invalid ID parameter'
      });
    }

    next();
  }
}

module.exports = new ResourceMiddleware();
