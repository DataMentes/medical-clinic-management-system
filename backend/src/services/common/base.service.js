/**
 * Generic Base Service for Simple CRUD Operations
 * Provides reusable logic for entities like Specialty, Room, etc.
 */

const prisma = require('../../config/database');
const { NotFoundError, ConflictError } = require('../../utils/error');

class BaseService {
  /**
   * Create a base service for a Prisma model
   * @param {string} modelName - Name of the Prisma model (e.g., 'specialty', 'room')
   * @param {Object} config - Configuration object
   * @param {string} config.nameField - Field name for the entity name (default: 'name')
   * @param {string} config.displayName - Human-readable name for error messages
   * @param {string} config.pluralKey - Key name for array in response (e.g., 'specialties', 'rooms')
   * @param {Object} config.includes - Default includes for relations
   * @param {Object} config.orderBy - Default ordering
   */
  constructor(modelName, config = {}) {
    this.modelName = modelName;
    this.model = prisma[modelName];
    this.nameField = config.nameField || 'name';
    this.displayName = config.displayName || modelName;
    this.pluralKey = config.pluralKey || modelName + 's'; // Allow custom plural
    this.defaultIncludes = config.includes || {};
    this.defaultOrderBy = config.orderBy || { [this.nameField]: 'asc' };
  }

  /**
   * Get all entities with pagination and search
   * @param {Object} options - Query options
   * @param {number} options.skip - Number of records to skip
   * @param {number} options.take - Number of records to take
   * @param {string} options.search - Search term
   * @param {Object} options.where - Additional where conditions
   * @param {Object} options.include - Additional includes
   * @returns {Object} - { total, [pluralKey]: items }
   */
  async getAll({ skip = 0, take = 20, search = '', where = {}, include = {} } = {}) {
    const searchWhere = search
      ? { [this.nameField]: { contains: search, mode: 'insensitive' } }
      : {};

    const finalWhere = { ...where, ...searchWhere };
    const finalInclude = { ...this.defaultIncludes, ...include };

    const [total, items] = await Promise.all([
      this.model.count({ where: finalWhere }),
      this.model.findMany({
        where: finalWhere,
        skip,
        take,
        include: finalInclude,
        orderBy: this.defaultOrderBy
      })
    ]);

    return {
      total,
      [this.pluralKey]: items
    };
  }

  /**
   * Get entity by ID
   * @param {number} id - Entity ID
   * @param {Object} include - Additional includes
   * @returns {Object} - Entity object
   * @throws {NotFoundError} - If entity not found
   */
  async getById(id, include = {}) {
    const entity = await this.model.findUnique({
      where: { id },
      include: { ...this.defaultIncludes, ...include }
    });

    if (!entity) {
      throw new NotFoundError(this.displayName);
    }

    return entity;
  }

  /**
   * Create new entity
   * @param {Object} data - Entity data
   * @returns {Object} - Created entity
   * @throws {ConflictError} - If entity with same name exists
   */
  async create(data) {
    // Check for duplicate name
    const name = typeof data === 'string' ? data : data[this.nameField];
    
    const existing = await this.model.findFirst({
      where: {
        [this.nameField]: {
          equals: name,
          mode: 'insensitive'
        }
      }
    });

    if (existing) {
      throw new ConflictError(`${this.displayName} already exists`);
    }

    // Create entity
    const createData = typeof data === 'string' ? { [this.nameField]: data } : data;
    return await this.model.create({ data: createData });
  }

  /**
   * Update entity by ID
   * @param {number} id - Entity ID
   * @param {Object} data - Updated data
   * @returns {Object} - Updated entity
   * @throws {NotFoundError} - If entity not found
   * @throws {ConflictError} - If name conflicts with another entity
   */
  async update(id, data) {
    // Check if entity exists
    const existing = await this.model.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError(this.displayName);
    }

    // Check for duplicate name (if name is being updated)
    const name = typeof data === 'string' ? data : data[this.nameField];
    
    if (name) {
      const duplicate = await this.model.findFirst({
        where: {
          [this.nameField]: {
            equals: name,
            mode: 'insensitive'
          },
          NOT: { id }
        }
      });

      if (duplicate) {
        throw new ConflictError(`${this.displayName} name already exists`);
      }
    }

    // Update entity
    const updateData = typeof data === 'string' ? { [this.nameField]: data } : data;
    return await this.model.update({
      where: { id },
      data: updateData
    });
  }

  /**
   * Delete entity by ID
   * @param {number} id - Entity ID
   * @param {Object} options - Deletion options
   * @param {string} options.dependencyField - Field name to check for dependencies
   * @param {string} options.dependencyName - Human-readable name for dependency
   * @returns {boolean} - True if deleted successfully
   * @throws {NotFoundError} - If entity not found
   * @throws {ConflictError} - If entity has dependencies
   */
  async delete(id, options = {}) {
    // Check if entity exists and get dependency count if needed
    const includeConfig = options.dependencyField
      ? { _count: { select: { [options.dependencyField]: true } } }
      : {};

    const entity = await this.model.findUnique({
      where: { id },
      include: includeConfig
    });

    if (!entity) {
      throw new NotFoundError(this.displayName);
    }

    // Check for dependencies
    if (options.dependencyField && entity._count[options.dependencyField] > 0) {
      const count = entity._count[options.dependencyField];
      const depName = options.dependencyName || options.dependencyField;
      throw new ConflictError(
        `Cannot delete ${this.displayName.toLowerCase()}. ${count} ${depName}(s) assigned.`
      );
    }

    // Delete entity
    await this.model.delete({ where: { id } });
    return true;
  }

  /**
   * Check if entity exists by ID
   * @param {number} id - Entity ID
   * @returns {boolean} - True if exists
   */
  async exists(id) {
    const count = await this.model.count({ where: { id } });
    return count > 0;
  }

  /**
   * Count entities with optional filter
   * @param {Object} where - Where conditions
   * @returns {number} - Count
   */
  async count(where = {}) {
    return await this.model.count({ where });
  }
}

module.exports = BaseService;
