const prisma = require('../../config/database');

class RoomService {
  /**
   * Get all rooms
   */
  async getAll() {
    return await prisma.room.findMany({
      orderBy: {
        name: 'asc'
      }
    });
  }

  /**
   * Get room by ID
   */
  async getById(roomId) {
    return await prisma.room.findUnique({
      where: { id: roomId },
      include: {
        schedules: {
          include: {
            doctor: {
              include: {
                person: true
              }
            }
          }
        }
      }
    });
  }

  /**
   * Create room
   */
  async create(name) {
    return await prisma.room.create({
      data: { name }
    });
  }

  /**
   * Update room
   */
  async update(roomId, name) {
    return await prisma.room.update({
      where: { id: roomId },
      data: { name }
    });
  }

  /**
   * Delete room
   */
  async delete(roomId) {
    return await prisma.room.delete({
      where: { id: roomId }
    });
  }
}

module.exports = new RoomService();
