const prisma = require('../../config/database');

class DoctorService {
  /**
   * Get all doctors with their details
   */
  async getAll() {
    return await prisma.doctor.findMany({
      include: {
        person: {
          include: {
            user: {
              select: {
                email: true
              }
            }
          }
        },
        specialty: true,
        schedules: {
          include: {
            room: true
          }
        }
      },
      orderBy: {
        id: 'asc'
      }
    });
  }

  /**
   * Get doctor by ID
   */
  async getById(doctorId) {
    return await prisma.doctor.findUnique({
      where: { id: doctorId },
      include: {
        person: {
          include: {
            user: {
              select: {
                email: true
              }
            }
          }
        },
        specialty: true,
        schedules: {
          include: {
            room: true
          }
        }
      }
    });
  }

  /**
   * Get doctor by person ID
   */
  async getByPersonId(personId) {
    return await prisma.doctor.findUnique({
      where: { personId },
      include: {
        person: {
          include: {
            user: true
          }
        },
        specialty: true
      }
    });
  }

  /**
   * Create doctor
   * @param data {personId, specialtyId, consultationFee, examinationFee, biography}
   */
  async create(data) {
    return await prisma.doctor.create({
      data: {
        personId: data.personId,
        specialtyId: data.specialtyId,
        consultationFee: data.consultationFee,
        examinationFee: data.examinationFee,
        biography: data.biography || null
      },
      include: {
        person: true,
        specialty: true
      }
    });
  }

  /**
   * Update doctor
   */
  async update(doctorId, data) {
    return await prisma.doctor.update({
      where: { id: doctorId },
      data: {
        consultationFee: data.consultationFee,
        examinationFee: data.examinationFee,
        biography: data.biography
      }
    });
  }

  /**
   * Get doctors by specialty
   */
  async getBySpecialty(specialtyId) {
    return await prisma.doctor.findMany({
      where: { specialtyId },
      include: {
        person: {
          include: {
            user: {
              select: {
                email: true
              }
            }
          }
        },
        specialty: true
      }
    });
  }

  /**
   * Delete doctor
   */
  async delete(doctorId) {
    return await prisma.doctor.delete({
      where: { id: doctorId }
    });
  }
}

module.exports = new DoctorService();
