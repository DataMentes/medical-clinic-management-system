const prisma = require('../../config/database');
const userService = require('./user.service');
const personService = require('../common/person.service');
const patientService = require('../patient/patient.service');
const doctorService = require('../doctor/doctor.service');

class AdminService {
  /**
   * Create doctor account (User + Person + Doctor)
   * @param data {email, password, fullName, phoneNumber, dob, specialtyId, consultationFee, examinationFee, biography}
   */
  async createDoctor(data) {
    return await prisma.$transaction(async (tx) => {
      // 1. Create User
      const user = await tx.user.create({
        data: {
          email: data.email,
          passwordHash: data.passwordHash
        }
      });

      // 2. Create Person
      const person = await tx.person.create({
        data: {
          userId: user.id,
          fullName: data.fullName,
          phoneNumber: data.phoneNumber,
          dob: new Date(data.dob)
        }
      });

      // 3. Create Doctor
      const doctor = await tx.doctor.create({
        data: {
          personId: person.id,
          specialtyId: data.specialtyId,
          consultationFee: data.consultationFee,
          examinationFee: data.examinationFee,
          biography: data.biography || null
        }
      });

      return { user, person, doctor };
    });
  }

  /**
   * Create receptionist account (User + Person)
   * @param data {email, password, fullName, phoneNumber, dob}
   */
  async createReceptionist(data) {
    return await prisma.$transaction(async (tx) => {
      // 1. Create User
      const user = await tx.user.create({
        data: {
          email: data.email,
          passwordHash: data.passwordHash
        }
      });

      // 2. Create Person
      const person = await tx.person.create({
        data: {
          userId: user.id,
          fullName: data.fullName,
          phoneNumber: data.phoneNumber,
          dob: new Date(data.dob)
        }
      });

      return { user, person };
    });
  }

  /**
   * Get all users with their roles
   */
  async getAllUsers() {
    return await prisma.user.findMany({
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
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  /**
   * Activate/Deactivate user
   */
  async toggleUserStatus(userId, isActive) {
    return await prisma.user.update({
      where: { id: userId },
      data: { isActive }
    });
  }

  /**
   * Delete user account (cascade delete)
   */
  async deleteUser(userId) {
    return await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
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

      if (!user) throw new Error('User not found');

      // Delete in order: Patient/Doctor → Person → User
      if (user.person?.patient) {
        await tx.patient.delete({ where: { id: user.person.patient.id } });
      }

      if (user.person?.doctor) {
        await tx.doctor.delete({ where: { id: user.person.doctor.id } });
      }

      if (user.person) {
        await tx.person.delete({ where: { id: user.person.id } });
      }

      await tx.user.delete({ where: { id: userId } });

      return { success: true };
    });
  }
}

module.exports = new AdminService();
