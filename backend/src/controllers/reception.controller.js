const prisma = require('../config/database');

class ReceptionController {
  /**
   * Add walk-in patient (Person + Patient, NO User)
   * @route POST /api/reception/patients/walk-in
   */
  async addWalkInPatient(req, res, next) {
    try {
      const { fullName, phoneNumber, gender, yearOfBirth } = req.body;

      // Validation
      if (!fullName || !phoneNumber || !gender || !yearOfBirth) {
        return res.status(400).json({
          success: false,
          error: 'All fields are required (fullName, phoneNumber, gender, yearOfBirth)'
        });
      }

      // Check if phone number already exists
      const existingPerson = await prisma.person.findUnique({
        where: { phoneNumber }
      });

      if (existingPerson) {
        return res.status(409).json({
          success: false,
          error: 'Phone number already registered'
        });
      }

      // Create Person + Patient (Transaction)
      const result = await prisma.$transaction(async (tx) => {
        // Create Person with roleId = 1 (Patient)
        const person = await tx.person.create({
          data: {
            fullName,
            phoneNumber,
            gender,
            roleId: 2 // Patient role (1=Doctor, 2=Patient, 3=Admin, 4=Receptionist)
          }
        });

        // Create Patient
        const patient = await tx.patient.create({
          data: {
            userId: person.userId,
            yearOfBirth: parseInt(yearOfBirth)
          }
        });

        return { person, patient };
      });

      return res.status(201).json({
        success: true,
        message: 'Walk-in patient registered successfully',
        data: {
          person: result.person,
          patient: result.patient
        }
      });
    } catch (error) {
      console.error('Add walk-in patient error:', error);
      next(error);
    }
  }

  /**
   * Search for patient by name, phone, or ID
   * @route GET /api/reception/patients/search?q=value
   */
  async searchPatient(req, res, next) {
    try {
      const { q } = req.query;

      if (!q) {
        return res.status(400).json({
          success: false,
          error: 'Search query is required'
        });
      }

      // Search by phone, name, or patient ID
      const patients = await prisma.patient.findMany({
        where: {
          OR: [
            {
              person: {
                phoneNumber: { contains: q }
              }
            },
            {
              person: {
                fullName: { contains: q, mode: 'insensitive' }
              }
            },
            {
              id: isNaN(q) ? undefined : parseInt(q)
            }
          ]
        },
        include: {
          person: {
            select: {
              userId: true,
              fullName: true,
              phoneNumber: true,
              gender: true
            }
          }
        },
        take: 20
      });

      return res.json({
        success: true,
        data: patients
      });
    } catch (error) {
      console.error('Search patient error:', error);
      next(error);
    }
  }

  /**
   * Book appointment for a patient
   * @route POST /api/reception/appointments
   */
  async bookAppointmentForPatient(req, res, next) {
    try {
      const { patientId, doctorId, scheduleId, appointmentType, appointmentDate, feePaid } = req.body;

      // Validation
      if (!patientId || !doctorId || !scheduleId || !appointmentType || !appointmentDate) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields'
        });
      }

      // Verify patient exists
      const patient = await prisma.patient.findUnique({
        where: { id: parseInt(patientId) }
      });

      if (!patient) {
        return res.status(404).json({
          success: false,
          error: 'Patient not found'
        });
      }

      // Verify schedule exists and get capacity
      const schedule = await prisma.doctorSchedule.findUnique({
        where: { id: parseInt(scheduleId) }
      });

      if (!schedule) {
        return res.status(404).json({
          success: false,
          error: 'Schedule not found'
        });
      }

      // Check capacity for the given date
      const appointmentCount = await prisma.appointment.count({
        where: {
          scheduleId: parseInt(scheduleId),
          appointmentDate: new Date(appointmentDate),
          status: { not: 'Canceled' }
        }
      });

      if (appointmentCount >= schedule.maxCapacity) {
        return res.status(400).json({
          success: false,
          error: 'Schedule is full for this date'
        });
      }

      // Create appointment
      const appointment = await prisma.appointment.create({
        data: {
          patientId: parseInt(patientId),
          doctorId: parseInt(doctorId),
          scheduleId: parseInt(scheduleId),
          appointmentType,
          appointmentDate: new Date(appointmentDate),
          feePaid: parseFloat(feePaid) || 0,
          status: 'Pending'
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
        }
      });

      return res.status(201).json({
        success: true,
        message: 'Appointment booked successfully',
        data: appointment
      });
    } catch (error) {
      console.error('Book appointment error:', error);
      next(error);
    }
  }

  /**
   * Get all upcoming appointments (sorted by date)
   * @route GET /api/reception/appointments/upcoming?page=1&limit=20&doctorId=X&date=YYYY-MM-DD
   */
  async getUpcomingAppointments(req, res, next) {
    try {
      const { page = 1, limit = 20, doctorId, date } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);

      const where = {
        appointmentDate: { gte: new Date() },
        status: { in: ['Pending', 'Confirmed'] }
      };

      if (doctorId) {
        where.doctorId = parseInt(doctorId);
      }

      if (date) {
        where.appointmentDate = new Date(date);
      }

      const [appointments, total] = await Promise.all([
        prisma.appointment.findMany({
          where,
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
          orderBy: [
            { appointmentDate: 'asc' },
            { schedule: { startTime: 'asc' } }
          ],
          skip,
          take: parseInt(limit)
        }),
        prisma.appointment.count({ where })
      ]);

      return res.json({
        success: true,
        data: {
          appointments,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages: Math.ceil(total / parseInt(limit))
          }
        }
      });
    } catch (error) {
      console.error('Get upcoming appointments error:', error);
      next(error);
    }
  }

  /**
   * Get appointments for specific doctor on specific date
   * @route GET /api/reception/appointments/doctor/:doctorId?date=YYYY-MM-DD
   */
  async getDoctorAppointments(req, res, next) {
    try {
      const { doctorId } = req.params;
      const { date } = req.query;

      if (!doctorId || !date) {
        return res.status(400).json({
          success: false,
          error: 'Doctor ID and date are required'
        });
      }

      const appointments = await prisma.appointment.findMany({
        where: {
          doctorId: parseInt(doctorId),
          appointmentDate: new Date(date),
          status: { not: 'Canceled' }
        },
        include: {
          patient: {
            include: {
              person: true
            }
          },
          schedule: {
            include: {
              room: true
            }
          }
        },
        orderBy: {
          schedule: {
            startTime: 'asc'
          }
        }
      });

      return res.json({
        success: true,
        data: appointments
      });
    } catch (error) {
      console.error('Get doctor appointments error:', error);
      next(error);
    }
  }

  /**
   * Check-in patient (confirm appointment)
   * @route PATCH /api/reception/appointments/:appointmentId/checkin
   */
  async checkInPatient(req, res, next) {
    try {
      const { appointmentId } = req.params;

      if (!appointmentId) {
        return res.status(400).json({
          success: false,
          error: 'Appointment ID is required'
        });
      }

      // Get appointment
      const appointment = await prisma.appointment.findUnique({
        where: { id: parseInt(appointmentId) }
      });

      if (!appointment) {
        return res.status(404).json({
          success: false,
          error: 'Appointment not found'
        });
      }

      // Check if already confirmed
      if (appointment.status === 'Confirmed') {
        return res.status(400).json({
          success: false,
          error: 'Appointment already confirmed'
        });
      }

      // Check if canceled or completed
      if (appointment.status === 'Canceled') {
        return res.status(400).json({
          success: false,
          error: 'Cannot check-in canceled appointment'
        });
      }

      if (appointment.status === 'Completed') {
        return res.status(400).json({
          success: false,
          error: 'Appointment already completed'
        });
      }

      // Update status to Confirmed
      const updatedAppointment = await prisma.appointment.update({
        where: { id: parseInt(appointmentId) },
        data: { status: 'Confirmed' },
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
        }
      });

      return res.json({
        success: true,
        message: 'Patient checked in successfully',
        data: updatedAppointment
      });
    } catch (error) {
      console.error('Check-in patient error:', error);
      next(error);
    }
  }

  /**
   * Cancel appointment
   * @route DELETE /api/reception/appointments/:appointmentId
   */
  async cancelAppointment(req, res, next) {
    try {
      const { appointmentId } = req.params;

      if (!appointmentId) {
        return res.status(400).json({
          success: false,
          error: 'Appointment ID is required'
        });
      }

      // Get appointment
      const appointment = await prisma.appointment.findUnique({
        where: { id: parseInt(appointmentId) }
      });

      if (!appointment) {
        return res.status(404).json({
          success: false,
          error: 'Appointment not found'
        });
      }

      // Check if already completed
      if (appointment.status === 'Completed') {
        return res.status(400).json({
          success: false,
          error: 'Cannot cancel completed appointment'
        });
      }

      // Check if already canceled
      if (appointment.status === 'Canceled') {
        return res.status(400).json({
          success: false,
          error: 'Appointment is already canceled'
        });
      }

      // Cancel appointment
      const canceledAppointment = await prisma.appointment.update({
        where: { id: parseInt(appointmentId) },
        data: { status: 'Canceled' },
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
        }
      });

      return res.json({
        success: true,
        message: 'Appointment canceled successfully',
        data: canceledAppointment
      });
    } catch (error) {
      console.error('Cancel appointment error:', error);
      next(error);
    }
  }
}

module.exports = new ReceptionController();
