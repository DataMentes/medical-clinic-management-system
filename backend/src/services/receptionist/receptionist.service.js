const prisma = require('../../config/database');
const { NotFoundError, ValidationError } = require('../../utils/error');
const personService = require('../common/person.service');
const patientService = require('../patient/patient.service');
const appointmentService = require('../appointment/appointment.service');

class ReceptionistService {
  /**
   * Register walk-in patient (Person + Patient without User account)
   * @param data {fullName, phoneNumber, dob, yearOfBirth}
   */
  async registerWalkInPatient(data) {
    return await prisma.$transaction(async (tx) => {
      // 1. Create Person (without userId - walk-in patient)
      const person = await tx.person.create({
        data: {
          userId: null, // No user account
          fullName: data.fullName,
          phoneNumber: data.phoneNumber,
          dob: new Date(data.dob)
        }
      });

      // 2. Create Patient
      const patient = await tx.patient.create({
        data: {
          personId: person.id,
          yearOfBirth: data.yearOfBirth
        }
      });

      return { person, patient };
    });
  }

  /**
   * Book appointment for patient
   * @param data {patientId, doctorId, scheduleId, appointmentDate, appointmentType}
   */
  async bookAppointment(data) {
    // Check if schedule has available slots
    const schedule = await prisma.doctorSchedule.findUnique({
      where: { id: data.scheduleId }
    });

    if (!schedule) {
      throw new NotFoundError('Schedule');
    }

    // Count existing appointments for this schedule on the appointment date
    const appointmentCount = await prisma.appointment.count({
      where: {
        scheduleId: data.scheduleId,
        appointmentDate: new Date(data.appointmentDate),
        status: { not: 'Cancelled' }
      }
    });

    if (appointmentCount >= schedule.maxCapacity) {
      throw new ValidationError('Schedule is full');
    }

    // Create appointment (no email notification for receptionist bookings - walk-in patients)
    const appointment = await prisma.appointment.create({
      data: {
        patientId: parseInt(data.patientId),
        doctorId: parseInt(data.doctorId),
        scheduleId: parseInt(data.scheduleId),
        appointmentDate: new Date(data.appointmentDate),
        appointmentType: data.appointmentType,
        status: 'Pending'
      }
    });

    return appointment;
  }

  /**
   * Get patient by phone number (for quick lookup)
   */
  async findPatientByPhone(phoneNumber) {
    const person = await prisma.person.findFirst({
      where: { phoneNumber },
      include: {
        patient: true,
        user: {
          select: {
            email: true
          }
        }
      }
    });

    return person?.patient || null;
  }

  /**
   * Get today's appointments
   */
  async getTodayAppointments() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return await prisma.appointment.findMany({
      where: {
        bookingTime: {
          gte: today,
          lt: tomorrow
        }
      },
      include: {
        patient: {
          include: {
            person: true
          }
        },
        doctor: {
          include: {
            person: true,
            specialty: true
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
   * Update appointment status (confirm, cancel, etc.)
   */
  async updateAppointmentStatus(appointmentId, status) {
    return await appointmentService.updateStatus(appointmentId, status);
  }

  /**
   * Get patient appointment history
   */
  async getPatientHistory(patientId) {
    return await prisma.appointment.findMany({
      where: { patientId },
      include: {
        doctor: {
          include: {
            person: true,
            specialty: true
          }
        },
        schedule: true,
        medicalRecord: true
      },
      orderBy: {
        bookingTime: 'desc'
      }
    });
  }
}

module.exports = new ReceptionistService();
