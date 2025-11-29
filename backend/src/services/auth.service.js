// backend/src/services/auth.service.js
const prisma = require('../config/database');
const bcrypt = require('bcrypt');

class AuthService {
  async findByEmail(email) {
    return await prisma.user.findUnique({
      where: { email }
    });
  }

  async createUser(data) {
    const hashedPassword = await bcrypt.hash(data.password, 10);

    return await prisma.user.create({
      data: {
        ...data,
        password: hashedPassword
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    });
  }

  async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}

module.exports = new AuthService();