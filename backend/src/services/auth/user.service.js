const prisma = require('../../config/database');

class UserService {
  /**
   * Find user by email
   */
  async findByEmail(email) {
    return await prisma.user.findUnique({
      where: { email },
      include: {
        person: {
          include: {
            patient: true,
            doctor: {
              include: {
                specialty: true
              }
            }
          }
        }
      }
    });
  }

  /**
   * Find user by ID
   */
  async findById(userId) {
    return await prisma.user.findUnique({
      where: { id: userId },
      include: {
        person: {
          include: {
            patient: true,
            doctor: true
          }
        }
      }
    });
  }

  /**
   * Create user
   * @param data {email, passwordHash}
   */
  async create(data) {
    return await prisma.user.create({
      data: {
        email: data.email,
        passwordHash: data.passwordHash
      }
    });
  }

  /**
   * Update user password
   */
  async updatePassword(userId, newPasswordHash) {
    const result = await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash }
    });
    return !!result;
  }

  /**
   * Delete user
   */
  async delete(userId) {
    return await prisma.user.delete({
      where: { id: userId }
    });
  }
}

module.exports = new UserService();
