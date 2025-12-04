const prisma = require('../../config/database');

class PersonService {
  /**
   * Create person
   * @param data {userId, fullName, phoneNumber, dob}
   */
  async create(data) {
    return await prisma.person.create({
      data: {
        userId: data.userId,
        fullName: data.fullName,
        phoneNumber: data.phoneNumber,
        dob: data.dob
      }
    });
  }

  /**
   * Update person
   */
  async update(userId, data) {
    const person = await prisma.person.findUnique({
      where: { userId }
    });

    if (!person) return null;

    return await prisma.person.update({
      where: { userId },
      data: {
        fullName: data.fullName,
        phoneNumber: data.phoneNumber
      }
    });
  }

  /**
   * Get person by user ID
   */
  async getByUserId(userId) {
    return await prisma.person.findUnique({
      where: { userId },
      include: {
        user: true,
        patient: true,
        doctor: {
          include: {
            specialty: true
          }
        }
      }
    });
  }

  /**
   * Get person by ID
   */
  async getById(personId) {
    return await prisma.person.findUnique({
      where: { id: personId },
      include: {
        user: true,
        patient: true,
        doctor: true
      }
    });
  }
}

module.exports = new PersonService();
