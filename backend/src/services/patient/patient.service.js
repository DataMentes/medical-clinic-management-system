const prisma = require('../../config/database');

class PatientService {
  /**
   * Get available doctors by specialty and date
   * @param specialtyId - Specialty ID
   * @param date - Date string (YYYY-MM-DD), defaults to today
   */
  async getAvailableDoctors(specialtyId, date = new Date()) {
    const targetDate = new Date(date);
    const weekday = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][targetDate.getDay()];

    return await prisma.doctor.findMany({
      where: {
        specialtyId: parseInt(specialtyId),
        schedules: {
          some: {
            weekDay: weekday
          }
        }
      },
      include: {
        person: {
          select: {
            fullName: true,
            phoneNumber: true
          }
        },
        specialty: {
          select: {
            name: true
          }
        },
        schedules: {
          where: {
            weekDay: weekday
          },
          include: {
            room: true
          }
        }
      }
    });
  }

  /**
   * Get upcoming appointments for patient
   */
  async getUpcomingAppointments(patientId) {
    const now = new Date();

    return await prisma.appointment.findMany({
      where: {
        patientId: parseInt(patientId),
        bookingTime: {
          gte: now
        },
        status: {
          not: 'Canceled'
        }
      },
      include: {
        doctor: {
          include: {
            person: {
              select: {
                fullName: true
              }
            },
            specialty: {
              select: {
                name: true
              }
            }
          }
        },
        schedule: {
          include: {
            room: true
          }
        }
      },
      orderBy: {
        bookingTime: 'asc'
      }
    });
  }

  /**
   * Get past appointments with medical records
   */
  async getPastAppointments(patientId) {
    const now = new Date();

    return await prisma.appointment.findMany({
      where: {
        patientId: parseInt(patientId),
        bookingTime: {
          lt: now
        }
      },
      include: {
        doctor: {
          include: {
            person: {
              select: {
                fullName: true
              }
            },
            specialty: {
              select: {
                name: true
              }
            }
          }
        },
        schedule: {
          include: {
            room: true
          }
        },
        medicalRecord: true
      },
      orderBy: {
        bookingTime: 'desc'
      }
    });
  }

  /**
   * Get all medical records for patient
   */
  async getMedicalRecords(patientId) {
    return await prisma.medicalRecord.findMany({
      where: {
        appointment: {
          patientId: parseInt(patientId)
        }
      },
      include: {
        appointment: {
          include: {
            doctor: {
              include: {
                person: {
                  select: {
                    fullName: true
                  }
                },
                specialty: {
                  select: {
                    name: true
                  }
                }
              }
            },
            schedule: {
              select: {
                weekDay: true,
                startTime: true,
                endTime: true
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
   * Get patient profile
   */
  async getProfile(userId) {
    return await prisma.user.findUnique({
      where: { userId },
      include: {
        person: {
          include: {
            patient: true
          }
        }
      }
    });
  }

  /**
   * Update phone number (requires OTP verification first)
   */
  async updatePhone(userId, phoneNumber) {
    const person = await prisma.person.findUnique({
      where: { userId }
    });

    if (!person) throw new Error('Person not found');

    return await prisma.person.update({
      where: { userId },
      data: { phoneNumber }
    });
  }

  /**
   * Update email (requires OTP verification first)
   */
  async updateEmail(userId, newEmail) {
    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: newEmail }
    });

    if (existingUser && existingUser.userId !== userId) {
      throw new Error('Email already in use');
    }

    return await prisma.user.update({
      where: { userId },
      data: { email: newEmail }
    });
  }

  /**
   * Update password (requires OTP verification first)
   */
  async updatePassword(userId, newPasswordHash) {
    return await prisma.user.update({
      where: { userId },
      data: { passwordHash: newPasswordHash }
    });
  }
}

module.exports = new PatientService();
