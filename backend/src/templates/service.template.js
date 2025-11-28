const prisma = require('../config/database');

/**
 * Service for [Resource] operations
 * Replace [Resource] with your actual resource name
 */
class ResourceService {
  /**
   * Get all resources with optional filters
   * @param {Object} filters - Query filters
   * @returns {Promise<Array>}
   */
  async getAll(filters = {}) {
    return await prisma.resource.findMany({
      where: filters
    });
  }

  /**
   * Get resource by ID
   * @param {number} id - Resource ID
   * @returns {Promise<Object|null>}
   */
  async getById(id) {
    return await prisma.resource.findUnique({
      where: { id: parseInt(id) }
    });
  }

  /**
   * Create new resource
   * @param {Object} data - Resource data
   * @returns {Promise<Object>}
   */
  async create(data) {
    return await prisma.resource.create({
      data
    });
  }

  /**
   * Update existing resource
   * @param {number} id - Resource ID
   * @param {Object} data - Updated data
   * @returns {Promise<Object>}
   */
  async update(id, data) {
    return await prisma.resource.update({
      where: { id: parseInt(id) },
      data
    });
  }

  /**
   * Delete resource
   * @param {number} id - Resource ID
   * @returns {Promise<Object>}
   */
  async delete(id) {
    return await prisma.resource.delete({
      where: { id: parseInt(id) }
    });
  }

  /**
   * Find resource by specific field
   * @param {string} field - Field name
   * @param {any} value - Field value
   * @returns {Promise<Object|null>}
   */
  async findBy(field, value) {
    return await prisma.resource.findFirst({
      where: { [field]: value }
    });
  }
}

module.exports = new ResourceService();
