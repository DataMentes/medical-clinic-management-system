const prisma = require('../../config/database');

class SpecialtyService {
  /**
   * Get all specialties
   */
  async getAll() {
    return await prisma.specialty.findMany({
      orderBy: {
        name: 'asc'
      }
    });
  }

  /**
   * Get specialty by ID
   */
  async getById(specialtyId) {
    return await prisma.specialty.findUnique({
      where: { id: specialtyId },
      include: {
        doctors: {
          include: {
            person: true
          }
        }
      }
    });
  }

  /**
   * Create specialty
   */
  async create(name) {
    return await prisma.specialty.create({
      data: { name }
    });
  }

  /**
   * Update specialty
   */
  async update(specialtyId, name) {
    return await prisma.specialty.update({
      where: { id: specialtyId },
      data: { name }
    });
  }

  /**
   * Delete specialty
   */
  async delete(specialtyId) {
    return await prisma.specialty.delete({
      where: { id: specialtyId }
    });
  }
}

module.exports = new SpecialtyService();
