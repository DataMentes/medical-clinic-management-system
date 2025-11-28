const resourceService = require('../services/resource.service');

/**
 * Controller for [Resource]
 * Replace [Resource] with your actual resource name
 */
class ResourceController {
  /**
   * Get all resources
   * @route GET /api/resources
   */
  async index(req, res, next) {
    try {
      const resources = await resourceService.getAll(req.query);
      
      res.json({
        success: true,
        count: resources.length,
        data: resources
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get single resource
   * @route GET /api/resources/:id
   */
  async show(req, res, next) {
    try {
      const resource = await resourceService.getById(req.params.id);
      
      if (!resource) {
        return res.status(404).json({
          success: false,
          error: 'Resource not found'
        });
      }

      res.json({
        success: true,
        data: resource
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create new resource
   * @route POST /api/resources
   */
  async store(req, res, next) {
    try {
      // Add validation here
      const resource = await resourceService.create(req.body);
      
      res.status(201).json({
        success: true,
        message: 'Resource created successfully',
        data: resource
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update resource
   * @route PUT /api/resources/:id
   */
  async update(req, res, next) {
    try {
      const resource = await resourceService.update(req.params.id, req.body);
      
      res.json({
        success: true,
        message: 'Resource updated successfully',
        data: resource
      });
    } catch (error) {
      if (error.code === 'P2025') {
        return res.status(404).json({
          success: false,
          error: 'Resource not found'
        });
      }
      next(error);
    }
  }

  /**
   * Delete resource
   * @route DELETE /api/resources/:id
   */
  async destroy(req, res, next) {
    try {
      await resourceService.delete(req.params.id);
      
      res.json({
        success: true,
        message: 'Resource deleted successfully'
      });
    } catch (error) {
      if (error.code === 'P2025') {
        return res.status(404).json({
          success: false,
          error: 'Resource not found'
        });
      }
      next(error);
    }
  }
}

module.exports = new ResourceController();
