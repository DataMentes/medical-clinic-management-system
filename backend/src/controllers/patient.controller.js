const patientService = require('../services/patient/patient.service');
const appointmentService = require('../services/appointment/appointment.service');
const adminService = require('../services/admin/admin.service');
const emailService = require('../services/email.service');
const { generateOTP, getOTPExpiry } = require('../utils/otp');
const prisma = require('../config/database');
const bcrypt = require('bcrypt');

class PatientController {
  /**
   * Get all specialties (for slider)
   * @route GET /api/patient/specialties
   */
  async getSpecialties(req, res, next) {
    try {
      const { specialties } = await adminService.getAllSpecialties({ skip: 0, take: 100, search: '' });

      return res.json({
        success: true,
        data: specialties
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get available doctors filtered by specialty and date
   * @route GET /api/patient/doctors?specialtyId=X&date=YYYY-MM-DD
   */
  async getAvailableDoctors(req, res, next) {
    try {
      const { specialtyId, date } = req.query;

      if (!specialtyId) {
        return res.status(400).json({
          success: false,
          error: 'Specialty ID is required'
        });
      }

      const doctors = await patientService.getAvailableDoctors(
        specialtyId,
        date || new Date()
      );

      return res.json({
        success: true,
        data: doctors
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Book an appointment
   * @route POST /api/patient/appointments
   */
  async bookAppointment(req, res, next) {
    try {
      const { doctorId, scheduleId, appointmentDate, appointmentType, feePaid } = req.body;
      const userId = req.user.userId; // From auth middleware

      // Validation
      if (!doctorId || !scheduleId || !appointmentType) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields'
        });
      }

      // Get patient ID from user
      const person = await prisma.person.findUnique({
        where: { userId },
        include: {
          patient: true
        }
      });

      if (!person?.patient) {
        return res.status(404).json({
          success: false,
          error: 'Patient not found'
        });
      }

      const patientId = person.patient.id;

      // Check schedule capacity
      const schedule = await prisma.doctorSchedule.findUnique({
        where: { id: parseInt(scheduleId) }
      });

      if (!schedule) {
        return res.status(404).json({
          success: false,
          error: 'Schedule not found'
        });
      }

      const appointmentCount = await prisma.appointment.count({
        where: {
          scheduleId: parseInt(scheduleId),
          status: { not: 'Canceled' }
        }
      });

      if (appointmentCount >= schedule.maxCapacity) {
        return res.status(400).json({
          success: false,
          error: 'Schedule is full. Please select another time.'
        });
      }

      // Create appointment
      console.log('📝 Creating appointment with data:', {
        patientId,
        doctorId: parseInt(doctorId),
        scheduleId: parseInt(scheduleId),
        appointmentDate,
        appointmentDateParsed: new Date(appointmentDate),
        appointmentType,
        status: 'Pending',
        feePaid: feePaid || 0
      });

      const appointment = await prisma.appointment.create({
        data: {
          patientId,
          doctorId: parseInt(doctorId),
          scheduleId: parseInt(scheduleId),
          appointmentDate: new Date(appointmentDate),
          appointmentType,
          status: 'Pending',
          feePaid: feePaid || 0
        },
        include: {
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

      console.log('✅ Appointment created successfully:', {
        id: appointment.id,
        patientId: appointment.patientId,
        doctorId: appointment.doctorId,
        appointmentDate: appointment.appointmentDate,
        status: appointment.status
      });

      // Send email notification
      const user = await prisma.user.findUnique({
        where: { userId },
        include: {
          person: true
        }
      });

      emailService.sendAppointmentConfirmation(
        user.email,
        user.person.fullName,
        appointment
      ).catch(err => {
        console.error('Failed to send appointment email:', err.message);
      });

      return res.status(201).json({
        success: true,
        message: 'Appointment booked successfully',
        data: appointment
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get upcoming appointments
   * @route GET /api/patient/appointments/upcoming
   */
  async getUpcomingAppointments(req, res, next) {
    try {
      const userId = req.user.userId;

      const person = await prisma.person.findUnique({
        where: { userId },
        include: { patient: true }
      });

      if (!person?.patient) {
        return res.status(404).json({
          success: false,
          error: 'Patient not found'
        });
      }

      const appointments = await patientService.getUpcomingAppointments(person.patient.id);

      return res.json({
        success: true,
        data: appointments
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get past appointments with medical records
   * @route GET /api/patient/appointments/past
   */
  async getPastAppointments(req, res, next) {
    try {
      const userId = req.user.userId;

      const person = await prisma.person.findUnique({
        where: { userId },
        include: { patient: true }
      });

      if (!person?.patient) {
        return res.status(404).json({
          success: false,
          error: 'Patient not found'
        });
      }

      const appointments = await patientService.getPastAppointments(person.patient.id);

      return res.json({
        success: true,
        data: appointments
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all medical records
   * @route GET /api/patient/medical-records
   */
  async getMedicalRecords(req, res, next) {
    try {
      const userId = req.user.userId;

      const person = await prisma.person.findUnique({
        where: { userId },
        include: { patient: true }
      });

      if (!person?.patient) {
        return res.status(404).json({
          success: false,
          error: 'Patient not found'
        });
      }

      const records = await patientService.getMedicalRecords(person.patient.id);

      return res.json({
        success: true,
        data: records
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cancel an appointment (only if status is Pending)
   * @route DELETE /api/patient/appointments/:appointmentId
   */
  async cancelAppointment(req, res, next) {
    try {
      const userId = req.user.userId;
      const { appointmentId } = req.params;

      if (!appointmentId) {
        return res.status(400).json({
          success: false,
          error: 'Appointment ID is required'
        });
      }

      // Get patient info
      const person = await prisma.person.findUnique({
        where: { userId },
        include: { patient: true }
      });

      if (!person?.patient) {
        return res.status(404).json({
          success: false,
          error: 'Patient not found'
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

      // Verify ownership
      if (appointment.patientId !== person.patient.id) {
        return res.status(403).json({
          success: false,
          error: 'You are not authorized to cancel this appointment'
        });
      }

      // Check if appointment is already confirmed
      if (appointment.status === 'Confirmed') {
        return res.status(400).json({
          success: false,
          error: 'Cannot cancel confirmed appointments. Please contact reception.'
        });
      }

      // Check if appointment is already completed or canceled
      if (appointment.status === 'Completed') {
        return res.status(400).json({
          success: false,
          error: 'Cannot cancel completed appointments'
        });
      }

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
      next(error);
    }
  }

  /**
   * Get patient profile
   * @route GET /api/patient/profile
   */
  async getProfile(req, res, next) {
    try {
      const userId = req.user.userId;

      const profile = await patientService.getProfile(userId);

      return res.json({
        success: true,
        data: profile
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update phone number
   * @route PUT /api/patient/profile/phone
   */
  async updatePhone(req, res, next) {
    try {
      const { newPhone } = req.body;
      const userId = req.user.userId;

      if (!newPhone) {
        return res.status(400).json({
          success: false,
          error: 'Phone number is required'
        });
      }

      // Update phone
      await patientService.updatePhone(userId, newPhone);

      return res.json({
        success: true,
        message: 'Phone number updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update email - Step 1: Send OTP
   * @route POST /api/patient/profile/email/request-otp
   */
  async requestEmailUpdateOTP(req, res, next) {
    try {
      const userId = req.user.userId;

      // Generate OTP
      const otpCode = generateOTP();
      const expiryTime = getOTPExpiry();

      // Save OTP
      await prisma.oTPVerification.upsert({
        where: { userId },
        create: { userId, otpCode, expiryTime },
        update: { otpCode, expiryTime }
      });

      // Get current email
      const user = await prisma.user.findUnique({
        where: { userId },
        include: { person: true }
      });

      // Send OTP
      emailService.sendOTP(user.email, otpCode, user.person.fullName)
        .catch(err => console.error('OTP email error:', err.message));

      return res.json({
        success: true,
        message: 'OTP sent to your current email'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update email - Step 2: Verify OTP and update
   * @route PUT /api/patient/profile/email
   */
  async updateEmail(req, res, next) {
    try {
      const { newEmail, otpCode } = req.body;
      const userId = req.user.userId;

      if (!newEmail || !otpCode) {
        return res.status(400).json({
          success: false,
          error: 'Email and OTP are required'
        });
      }

      // Verify OTP
      const otpRecord = await prisma.oTPVerification.findUnique({
        where: { userId }
      });

      if (!otpRecord || otpRecord.otpCode !== otpCode) {
        return res.status(400).json({
          success: false,
          error: 'Invalid OTP code'
        });
      }

      if (new Date() > otpRecord.expiryTime) {
        return res.status(400).json({
          success: false,
          error: 'OTP has expired'
        });
      }

      // Update email
      await patientService.updateEmail(userId, newEmail);

      // Delete OTP
      await prisma.oTPVerification.delete({
        where: { userId }
      });

      return res.json({
        success: true,
        message: 'Email updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update password
   * @route PUT /api/patient/profile/password
   */
  async updatePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user.userId;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          error: 'Current and new password are required'
        });
      }

      // Get user
      const user = await prisma.user.findUnique({
        where: { userId }
      });

      // Verify current password
      const isValidPassword = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          error: 'Current password is incorrect'
        });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update password
      await patientService.updatePassword(userId, hashedPassword);

      return res.json({
        success: true,
        message: 'Password updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get patient dashboard data (aggregated)
   * @route GET /api/patient/dashboard
   */
  async getDashboard(req, res, next) {
    try {
      const userId = req.user.userId; // From auth middleware
      
      // Get patient ID
      const person = await prisma.person.findUnique({
        where: { userId },
        include: { patient: true }
      });

      if (!person?.patient) {
        return res.status(404).json({
          success: false,
          error: 'Patient not found'
        });
      }

      const patientId = person.patient.id;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Aggregate data from existing queries
      const [upcoming, pastCount, recordsCount] = await Promise.all([
        // Get next 5 upcoming appointments
        prisma.appointment.findMany({
          where: {
            patientId,
            appointmentDate: { gte: today },
            status: { in: ['Pending', 'Confirmed'] }
          },
          take: 5,
          orderBy: { appointmentDate: 'asc' },
          include: {
            doctor: {
              include: {
                person: { 
                  select: { fullName: true } 
                },
                specialty: { 
                  select: { specialtyName: true } 
                }
              }
            },
            schedule: { 
              include: { room: true } 
            }
          }
        }),
        
        // Count past completed appointments
        prisma.appointment.count({
          where: {
            patientId,
            appointmentDate: { lt: today },
            status: 'Completed'
          }
        }),
        
        // Count medical records
        prisma.medicalRecord.count({
          where: { patientId }
        })
      ]);
      
      return res.json({
        success: true,
        data: {
          upcomingAppointments: upcoming,
          stats: {
            totalPastAppointments: pastCount,
            totalMedicalRecords: recordsCount
          }
        }
      });
      
    } catch (error) {
      console.error('Patient dashboard error:', error);
      next(error);
    }
  }
}

module.exports = new PatientController();
