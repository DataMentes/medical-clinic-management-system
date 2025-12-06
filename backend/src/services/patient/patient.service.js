const prisma = require('../../config/database');
const { NotFoundError, ConflictError } = require('../../utils/error');

class PatientService {
  /**
   * Get available doctors by specialty and date
   * @param specialtyId - Specialty ID
   * @param date - Date string (YYYY-MM-DD), defaults to today
   */
  async getAvailableDoctors(specialtyId, date = new Date()) {
    const targetDate = new Date(date);
    const weekday = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][targetDate.getDay()];

    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const doctors = await prisma.doctor.findMany({
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
            room: true,
            appointments: {
              where: {
                appointmentDate: {
                  gte: startOfDay,
                  lt: endOfDay
                },
                status: {
                  not: 'Canceled'
                }
              }
            }
          }
        }
      }
    });

    // Transform schedules to availableSlots format as per API documentation
    return doctors.map(doctor => {
      const availableSlots = doctor.schedules.map(schedule => {
        const bookedCount = schedule.appointments?.length || 0;
        const available = bookedCount < schedule.maxCapacity;
        
        // Format time from startTime
        const time = schedule.startTime ? 
          new Date(schedule.startTime).toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
          }) : '00:00';

        return {
          scheduleId: schedule.id,
          time,
          available,
          bookedCount,
          maxCapacity: schedule.maxCapacity
        };
      });

      return {
        doctorId: doctor.id,
        fullName: doctor.person.fullName,
        specialty: doctor.specialty.name,
        examinationFee: doctor.examinationFee,
        consultationFee: doctor.consultationFee,
        availableSlots
      };
    });
  }

  /**
   * Get upcoming appointments for patient
   */
  async getUpcomingAppointments(patientId) {
    const now = new Date();

    // ✅ OPTIMIZED: Use select to fetch only needed fields
    return await prisma.appointment.findMany({
      where: {
        patientId: parseInt(patientId),
        appointmentDate: {
          gte: now
        },
        status: {
          not: 'Canceled'
        }
      },
      select: {
        id: true,
        appointmentDate: true,
        appointmentType: true,
        status: true,
        feePaid: true,
        doctor: {
          select: {
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
            startTime: true,
            endTime: true,
            room: {
              select: {
                roomName: true
              }
            }
          }
        }
      },
      orderBy: {
        appointmentDate: 'asc'
      }
    });
  }

  /**
   * Get past appointments with medical records
   */
  async getPastAppointments(patientId) {
    const now = new Date();

    // ✅ OPTIMIZED: Use select
    return await prisma.appointment.findMany({
      where: {
        patientId: parseInt(patientId),
        appointmentDate: {
          lt: now
        }
      },
      select: {
        id: true,
        appointmentDate: true,
        appointmentType: true,
        status: true,
        feePaid: true,
        doctor: {
          select: {
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
            startTime: true,
            endTime: true,
            room: {
              select: {
                roomName: true
              }
            }
          }
        },
        medicalRecord: {
          select: {
            id: true,
            diagnosis: true,
            prescription: true,
            notes: true
          }
        }
      },
      orderBy: {
        appointmentDate: 'desc'
      }
    });
  }

  /**
   * Get all medical records for patient
   */
  async getMedicalRecords(patientId) {
    // ✅ OPTIMIZED: Use select
    return await prisma.medicalRecord.findMany({
      where: {
        appointment: {
          patientId: parseInt(patientId)
        }
      },
      select: {
        id: true,
        diagnosis: true,
        prescription: true,
        notes: true,
        appointment: {
          select: {
            id: true,
            appointmentDate: true,
            appointmentType: true,
            doctor: {
              select: {
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
        id: 'desc'
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

    if (!person) throw new NotFoundError('Person');

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
      throw new ConflictError('Email already in use');
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
