const prisma = require('../../config/database');

class RoleService {
  /**
   * Get all roles
   */
  async getAll() {
    return await prisma.role.findMany({
      orderBy: {
        id: 'asc'
      }
    });
  }

  /**
   * Get role by ID
   */
  async getById(roleId) {
    return await prisma.role.findUnique({
      where: { id: roleId }
    });
  }

  /**
   * Get role by name
   */
  async getByName(roleName) {
    return await prisma.role.findFirst({
      where: { roleName }
    });
  }

  /**
   * Create role
   */
  async create(roleName) {
    return await prisma.role.create({
      data: { roleName }
    });
  }
}

module.exports = new RoleService();
