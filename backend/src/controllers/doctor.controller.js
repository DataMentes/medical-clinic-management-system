const prisma = require('../config/database');

class DoctorController {
  /**
   * Get all available rooms
   * @route GET /api/doctor/rooms
   */
  async getRooms(req, res, next) {
    try {
      const rooms = await prisma.room.findMany({
        orderBy: { roomName: 'asc' }
      });

      return res.json({
        success: true,
        data: rooms
      });
    } catch (error) {
      console.error('Get rooms error:', error);
      next(error);
    }
  }

  /**
   * Get my weekly schedule
   * @route GET /api/doctor/schedule
   */
  async getMySchedule(req, res, next) {
    try {
      const userId = req.user.userId;

      // Get doctor info
      const person = await prisma.person.findUnique({
        where: { userId },
        include: { doctor: true }
      });

      if (!person?.doctor) {
        return res.status(404).json({
          success: false,
          error: 'Doctor profile not found'
        });
      }

      // Get all schedules
      const schedules = await prisma.doctorSchedule.findMany({
        where: { doctorId: person.doctor.id },
        include: {
          room: true
        },
        orderBy: {
          weekDay: 'asc'
        }
      });

      const formattedSchedules = schedules.map(s => ({
        ...s,
        startTime: s.startTime.toISOString().substring(11, 16),
        endTime: s.endTime.toISOString().substring(11, 16)
      }));

      return res.json({
        success: true,
        data: formattedSchedules
      });
    } catch (error) {
      console.error('Get schedule error:', error);
      next(error);
    }
  }

  /**
   * Add new schedule (with conflict check)
   * @route POST /api/doctor/schedule
   */
  async addSchedule(req, res, next) {
    try {
      const userId = req.user.userId;
      const { weekDay, roomId, startTime, endTime, maxCapacity } = req.body;

      // Validation
      if (!weekDay || !roomId || !startTime || !endTime || !maxCapacity) {
        return res.status(400).json({
          success: false,
          error: 'All fields are required'
        });
      }

      // Get doctor info
      const person = await prisma.person.findUnique({
        where: { userId },
        include: { doctor: true }
      });

      if (!person?.doctor) {
        return res.status(404).json({
          success: false,
          error: 'Doctor profile not found'
        });
      }

      const doctorId = person.doctor.id;

      // Convert time strings to DateTime for Prisma Time fields
      const startDateTime = new Date(`1970-01-01T${startTime}:00.000Z`);
      const endDateTime = new Date(`1970-01-01T${endTime}:00.000Z`);

      // Check room availability for this day and time (allow multiple schedules per day)
      const conflictingRoomSchedule = await prisma.doctorSchedule.findFirst({
        where: {
          roomId: parseInt(roomId),
          weekDay,
          OR: [
            {
              AND: [
                { startTime: { lte: startDateTime } },
                { endTime: { gt: startDateTime } }
              ]
            },
            {
              AND: [
                { startTime: { lt: endDateTime } },
                { endTime: { gte: endDateTime } }
              ]
            }
          ]
        }
      });

      if (conflictingRoomSchedule) {
        return res.status(409).json({
          success: false,
          error: 'Room is already booked for this time slot'
        });
      }

      // Create schedule
      const schedule = await prisma.doctorSchedule.create({
        data: {
          doctorId,
          weekDay,
          roomId: parseInt(roomId),
          startTime: startDateTime,
          endTime: endDateTime,
          maxCapacity: parseInt(maxCapacity)
        },
        include: {
          room: true
        }
      });

      return res.status(201).json({
        success: true,
        message: 'Schedule created successfully',
        data: schedule
      });
    } catch (error) {
      console.error('Add schedule error:', error);
      next(error);
    }
  }

  /**
   * Update existing schedule
   * @route PUT /api/doctor/schedule/:scheduleId
   */
  async updateSchedule(req, res, next) {
    try {
      const userId = req.user.userId;
      const { scheduleId } = req.params;
      const { roomId, startTime, endTime, maxCapacity } = req.body;

      // Get doctor info
      const person = await prisma.person.findUnique({
        where: { userId },
        include: { doctor: true }
      });

      if (!person?.doctor) {
        return res.status(404).json({
          success: false,
          error: 'Doctor profile not found'
        });
      }

      // Get schedule
      const schedule = await prisma.doctorSchedule.findUnique({
        where: { id: parseInt(scheduleId) }
      });

      if (!schedule) {
        return res.status(404).json({
          success: false,
          error: 'Schedule not found'
        });
      }

      // Verify ownership
      if (schedule.doctorId !== person.doctor.id) {
        return res.status(403).json({
          success: false,
          error: 'You are not authorized to update this schedule'
        });
      }

      // Convert time strings to DateTime if provided
      const startDateTime = startTime ? new Date(`1970-01-01T${startTime}:00.000Z`) : null;
      const endDateTime = endTime ? new Date(`1970-01-01T${endTime}:00.000Z`) : null;

      // If changing room or time, check for conflicts
      if (roomId || startDateTime || endDateTime) {
        const newRoomId = roomId ? parseInt(roomId) : schedule.roomId;
        const newStartTime = startDateTime || schedule.startTime;
        const newEndTime = endDateTime || schedule.endTime;

        const conflictingSchedule = await prisma.doctorSchedule.findFirst({
          where: {
            id: { not: parseInt(scheduleId) },
            roomId: newRoomId,
            weekDay: schedule.weekDay,
            OR: [
              {
                AND: [
                  { startTime: { lte: newStartTime } },
                  { endTime: { gt: newStartTime } }
                ]
              },
              {
                AND: [
                  { startTime: { lt: newEndTime } },
                  { endTime: { gte: newEndTime } }
                ]
              }
            ]
          }
        });

        if (conflictingSchedule) {
          return res.status(409).json({
            success: false,
            error: 'Room is already booked for this time slot'
          });
        }
      }

      // Update schedule
      const updateData = {};
      if (roomId) updateData.roomId = parseInt(roomId);
      if (startDateTime) updateData.startTime = startDateTime;
      if (endDateTime) updateData.endTime = endDateTime;
      if (maxCapacity) updateData.maxCapacity = parseInt(maxCapacity);

      const updatedSchedule = await prisma.doctorSchedule.update({
        where: { id: parseInt(scheduleId) },
        data: updateData,
        include: {
          room: true
        }
      });

      return res.json({
        success: true,
        message: 'Schedule updated successfully',
        data: updatedSchedule
      });
    } catch (error) {
      console.error('Update schedule error:', error);
      next(error);
    }
  }

  /**
   * Delete schedule
   * @route DELETE /api/doctor/schedule/:scheduleId
   */
  async deleteSchedule(req, res, next) {
    try {
      const userId = req.user.userId;
      const { scheduleId } = req.params;

      // Get doctor info
      const person = await prisma.person.findUnique({
        where: { userId },
        include: { doctor: true }
      });

      if (!person?.doctor) {
        return res.status(404).json({
          success: false,
          error: 'Doctor profile not found'
        });
      }

      // Get schedule
      const schedule = await prisma.doctorSchedule.findUnique({
        where: { id: parseInt(scheduleId) }
      });

      if (!schedule) {
        return res.status(404).json({
          success: false,
          error: 'Schedule not found'
        });
      }

      // Verify ownership
      if (schedule.doctorId !== person.doctor.id) {
        return res.status(403).json({
          success: false,
          error: 'You are not authorized to delete this schedule'
        });
      }

      // Check if schedule has future appointments
      const futureAppointments = await prisma.appointment.count({
        where: {
          scheduleId: parseInt(scheduleId),
          appointmentDate: { gte: new Date() },
          status: { in: ['Pending', 'Confirmed'] }
        }
      });

      if (futureAppointments > 0) {
        return res.status(400).json({
          success: false,
          error: 'Cannot delete schedule with future appointments'
        });
      }

      // Delete schedule
      await prisma.doctorSchedule.delete({
        where: { id: parseInt(scheduleId) }
      });

      return res.json({
        success: true,
        message: 'Schedule deleted successfully'
      });
    } catch (error) {
      console.error('Delete schedule error:', error);
      next(error);
    }
  }

  /**
   * Get today's confirmed appointments
   * @route GET /api/doctor/appointments/today
   */
  async getTodayAppointments(req, res, next) {
    try {
      const userId = req.user.userId;

      // Get doctor info
      const person = await prisma.person.findUnique({
        where: { userId },
        include: { doctor: true }
      });

      if (!person?.doctor) {
        return res.status(404).json({
          success: false,
          error: 'Doctor profile not found'
        });
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Get confirmed appointments for today
      const appointments = await prisma.appointment.findMany({
        where: {
          doctorId: person.doctor.id,
          appointmentDate: {
            gte: today,
            lt: tomorrow
          },
          status: 'Confirmed'
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
          },
          medicalRecord: true
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
      console.error('Get today appointments error:', error);
      next(error);
    }
  }

  /**
   * Update appointment
   * @route PUT /api/doctor/appointments/:appointmentId
   */
  async updateAppointment(req, res, next) {
    try {
      const userId = req.user.userId;
      const { appointmentId } = req.params;
      const { type, status } = req.body;

      // Get doctor info
      const person = await prisma.person.findUnique({
        where: { userId },
        include: { doctor: true }
      });

      if (!person?.doctor) {
        return res.status(404).json({
          success: false,
          error: 'Doctor profile not found'
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
      if (appointment.doctorId !== person.doctor.id) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to update this appointment'
        });
      }

      // Build update data (only status and appointmentType are editable)
      const updateData = {};
      if (status) updateData.status = status;
      if (type) updateData.appointmentType = type;

      // Update appointment
      const updated = await prisma.appointment.update({
        where: { id: parseInt(appointmentId) },
        data: updateData,
        include: {
          patient: {
            include: { person: true }
          },
          schedule: {
            include: { room: true }
          }
        }
      });

      return res.json({
        success: true,
        message: 'Appointment updated successfully',
        data: updated
      });
    } catch (error) {
      console.error('Update appointment error:', error);
      next(error);
    }
  }

  /**
   * Get appointments for a specific week
   * @route GET /api/doctor/appointments/week?startDate=YYYY-MM-DD
   */
  async getWeekAppointments(req, res, next) {
    try {
      const userId = req.user.userId;
      const { startDate } = req.query;

      // Get doctor info
      const person = await prisma.person.findUnique({
        where: { userId },
        include: { doctor: true }
      });

      if (!person?.doctor) {
        return res.status(404).json({
          success: false,
          error: 'Doctor profile not found'
        });
      }

      // Calculate week range
      const weekStart = startDate ? new Date(startDate) : new Date();
      weekStart.setHours(0, 0, 0, 0);
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);

      const appointments = await prisma.appointment.findMany({
        where: {
          doctorId: person.doctor.id,
          appointmentDate: {
            gte: weekStart,
            lt: weekEnd
          },
          status: { in: ['Pending', 'Confirmed'] }
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
        orderBy: [
          { appointmentDate: 'asc' },
          { schedule: { startTime: 'asc' } }
        ]
      });

      // Group by date
      const groupedByDate = appointments.reduce((acc, apt) => {
        const dateKey = apt.appointmentDate.toISOString().split('T')[0];
        if (!acc[dateKey]) {
          acc[dateKey] = [];
        }
        acc[dateKey].push(apt);
        return acc;
      }, {});

      return res.json({
        success: true,
        data: {
          weekStart: weekStart.toISOString().split('T')[0],
          weekEnd: weekEnd.toISOString().split('T')[0],
          appointments: groupedByDate
        }
      });
    } catch (error) {
      console.error('Get week appointments error:', error);
      next(error);
    }
  }

  /**
   * Get appointment details with patient's medical history
   * @route GET /api/doctor/appointments/:appointmentId
   */
  async getAppointmentDetails(req, res, next) {
    try {
      const userId = req.user.userId;
      const { appointmentId } = req.params;

      // Get doctor info
      const person = await prisma.person.findUnique({
        where: { userId },
        include: { doctor: true }
      });

      if (!person?.doctor) {
        return res.status(404).json({
          success: false,
          error: 'Doctor profile not found'
        });
      }

      // Get appointment
      const appointment = await prisma.appointment.findUnique({
        where: { id: parseInt(appointmentId) },
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
          },
          medicalRecord: true
        }
      });

      if (!appointment) {
        return res.status(404).json({
          success: false,
          error: 'Appointment not found'
        });
      }

      // Verify this is the doctor's appointment
      if (appointment.doctorId !== person.doctor.id) {
        return res.status(403).json({
          success: false,
          error: 'You are not authorized to view this appointment'
        });
      }

      // Get patient's medical history
      const medicalHistory = await prisma.medicalRecord.findMany({
        where: {
          appointment: {
            patientId: appointment.patientId
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
                  specialty: true
                }
              }
            }
          }
        },
        orderBy: {
          appointment: {
            appointmentDate: 'desc'
          }
        }
      });

      return res.json({
        success: true,
        data: {
          appointment,
          medicalHistory
        }
      });
    } catch (error) {
      console.error('Get appointment details error:', error);
      next(error);
    }
  }

  /**
   * Add medical record for appointment
   * @route POST /api/doctor/appointments/:appointmentId/medical-record
   */
  async addMedicalRecord(req, res, next) {
    try {
      const userId = req.user.userId;
      const { appointmentId } = req.params;
      const { diagnosis, prescription, notes } = req.body;

      // Validation
      if (!diagnosis || !prescription) {
        return res.status(400).json({
          success: false,
          error: 'Diagnosis and prescription are required'
        });
      }

      // Get doctor info
      const person = await prisma.person.findUnique({
        where: { userId },
        include: { doctor: true }
      });

      if (!person?.doctor) {
        return res.status(404).json({
          success: false,
          error: 'Doctor profile not found'
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

      // Verify this is the doctor's appointment
      if (appointment.doctorId !== person.doctor.id) {
        return res.status(403).json({
          success: false,
          error: 'You are not authorized to add records for this appointment'
        });
      }

      // Check if medical record already exists
      const existingRecord = await prisma.medicalRecord.findFirst({
        where: { appointmentId: parseInt(appointmentId) }
      });

      if (existingRecord) {
        return res.status(409).json({
          success: false,
          error: 'Medical record already exists for this appointment'
        });
      }

      // Create medical record and update appointment status
      const result = await prisma.$transaction(async (tx) => {
        // Create medical record
        const medicalRecord = await tx.medicalRecord.create({
          data: {
            appointmentId: parseInt(appointmentId),
            diagnosis,
            prescription,
            notes
          }
        });

        // Update appointment status to Completed
        await tx.appointment.update({
          where: { id: parseInt(appointmentId) },
          data: { status: 'Completed' }
        });

        return medicalRecord;
      });

      return res.status(201).json({
        success: true,
        message: 'Medical record created successfully',
        data: result
      });
    } catch (error) {
      console.error('Add medical record error:', error);
      next(error);
    }
  }

  /**
   * Get doctor profile
   * @route GET /api/doctor/profile
   */
  async getProfile(req, res, next) {
    try {
      const userId = req.user.userId;

      const user = await prisma.user.findUnique({
        where: { userId },
        include: {
          person: {
            include: {
              doctor: {
                include: {
                  specialty: true
                }
              }
            }
          }
        }
      });

      if (!user || !user.person?.doctor) {
        return res.status(404).json({
          success: false,
          error: 'Doctor profile not found'
        });
      }

      return res.json({
        success: true,
        data: {
          user: {
            id: user.userId,
            email: user.email
          },
          person: {
            fullName: user.person.fullName,
            phoneNumber: user.person.phoneNumber,
            gender: user.person.gender
          },
          doctor: {
            id: user.person.doctor.id,
            specialty: user.person.doctor.specialty,
            examinationFee: user.person.doctor.examinationFee,
            consultationFee: user.person.doctor.consultationFee,
            biography: user.person.doctor.biography
          }
        }
      });
    } catch (error) {
      console.error('Get profile error:', error);
      next(error);
    }
  }

  /**
   * Update phone number
   * @route PUT /api/doctor/profile/phone
   */
  async updatePhone(req, res, next) {
    try {
      const userId = req.user.userId;
      const { phoneNumber } = req.body;

      if (!phoneNumber) {
        return res.status(400).json({
          success: false,
          error: 'Phone number is required'
        });
      }

      // Check if phone already exists
      const existingPhone = await prisma.person.findFirst({
        where: {
          phoneNumber,
          userId: { not: userId }
        }
      });

      if (existingPhone) {
        return res.status(409).json({
          success: false,
          error: 'Phone number already in use'
        });
      }

      const updatedPerson = await prisma.person.update({
        where: { userId },
        data: { phoneNumber }
      });

      return res.json({
        success: true,
        message: 'Phone number updated successfully',
        data: {
          phoneNumber: updatedPerson.phoneNumber
        }
      });
    } catch (error) {
      console.error('Update phone error:', error);
      next(error);
    }
  }

  /**
   * Update password
   * @route PUT /api/doctor/profile/password
   */
  async updatePassword(req, res, next) {
    try {
      const userId = req.user.userId;
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          error: 'Current password and new password are required'
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          error: 'New password must be at least 6 characters'
        });
      }

      // Get user
      const user = await prisma.user.findUnique({
        where: { userId }
      });

      // Verify current password
      const bcrypt = require('bcrypt');
      const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
      
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          error: 'Current password is incorrect'
        });
      }

      // Hash new password
      const newPasswordHash = await bcrypt.hash(newPassword, 12);

      // Update password
      await prisma.user.update({
        where: { userId },
        data: { passwordHash: newPasswordHash }
      });

      return res.json({
        success: true,
        message: 'Password updated successfully'
      });
    } catch (error) {
      console.error('Update password error:', error);
      next(error);
    }
  }

  /**
   * Get doctor dashboard data (aggregated)
   * @route GET /api/doctor/dashboard
   */
  async getDashboard(req, res, next) {
    try {
      const userId = req.user.userId;
      
      // Get doctor info
      const person = await prisma.person.findUnique({
        where: { userId },
        include: { doctor: true }
      });

      if (!person?.doctor) {
        return res.status(404).json({
          success: false,
          error: 'Doctor profile not found'
        });
      }

      const doctorId = person.doctor.id;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const weekEnd = new Date(today);
      weekEnd.setDate(weekEnd.getDate() + 7);
      
      // Get full appointments data (not just count)
      const [todayAppointments, weekAppointments, scheduleCount] = await Promise.all([
        // Get today's FULL appointments (not just count)
        prisma.appointment.findMany({
          where: {
            doctorId,
            appointmentDate: { gte: today, lt: tomorrow },
            status: 'Confirmed' // Only Confirmed status (CheckedIn doesn't exist in enum)
          },
          include: {
            patient: {
              include: {
                person: {
                  select: {
                    fullName: true,
                    phoneNumber: true,
                    gender: true
                  }
                }
              }
            },
            schedule: {
              include: { room: true }
            },
            medicalRecord: true
          },
          orderBy: {
            schedule: { startTime: 'asc' }
          }
        }),
        
        // Get next week's appointments
        prisma.appointment.findMany({
          where: {
            doctorId,
            appointmentDate: { gte: today, lt: weekEnd },
            status: { in: ['Pending', 'Confirmed'] }
          },
          take: 10,
          orderBy: { appointmentDate: 'asc' },
          include: {
            patient: {
              include: {
                person: { 
                  select: { 
                    fullName: true, 
                    phoneNumber: true,
                    gender: true
                  } 
                }
              }
            },
            schedule: { 
              include: { room: true } 
            }
          }
        }),
        
        // Count total schedule entries
        prisma.doctorSchedule.count({
          where: { doctorId }
        })
      ]);
      
      return res.json({
        success: true,
        data: {
          todayAppointments,  // Full array, not count
          upcomingAppointments: weekAppointments,
          stats: {
            todayAppointmentsCount: todayAppointments.length,
            totalScheduleSlots: scheduleCount
          }
        }
      });
      
    } catch (error) {
      console.error('Doctor dashboard error:', error);
      next(error);
    }
  }

  /**
   * Get patients currently in clinic (today's confirmed appointments)
   * @route GET /api/doctor/patients-in-clinic
   */
  async getPatientsInClinic(req, res, next) {
    try {
      const userId = req.user.userId;
      
      // Get doctor info
      const person = await prisma.person.findUnique({
        where: { userId },
        include: { doctor: true }
      });

      if (!person?.doctor) {
        return res.status(404).json({
          success: false,
          error: 'Doctor profile not found'
        });
      }

      const doctorId = person.doctor.id;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const patientsInClinic = await prisma.appointment.findMany({
        where: {
          doctorId,
          appointmentDate: { gte: today, lt: tomorrow },
          status: 'Confirmed' 
        },
        orderBy: { 
          appointmentDate: 'asc'
        },
        include: {
          patient: {
            include: {
              person: {
                select: {
                  fullName: true,
                  phoneNumber: true,
                  gender: true
                }
              }
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
        data: patientsInClinic
      });
      
    } catch (error) {
      console.error('Patients in clinic error:', error);
      next(error);
    }
  }

  /**
   * Get patient's complete medical history
   * @route GET /api/doctor/patients/:patientId/medical-history
   */
  async getPatientMedicalHistory(req, res, next) {
    try {
      const userId = req.user.userId;
      const { patientId } = req.params;
      
      // Get doctor info
      const person = await prisma.person.findUnique({
        where: { userId },
        include: { doctor: true }
      });

      if (!person?.doctor) {
        return res.status(404).json({
          success: false,
          error: 'Doctor profile not found'
        });
      }

      // Verify patient exists
      const patient = await prisma.patient.findUnique({
        where: { id: parseInt(patientId) },
        include: {
          person: {
            select: {
              fullName: true,
              phoneNumber: true,
              gender: true
            }
          }
        }
      });

      if (!patient) {
        return res.status(404).json({
          success: false,
          error: 'Patient not found'
        });
      }

      // Get all medical records for this patient
      const medicalHistory = await prisma.medicalRecord.findMany({
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
                  startTime: true,
                  endTime: true
                }
              }
            }
          }
        },
        orderBy: {
          appointment: {
            appointmentDate: 'desc'
          }
        }
      });

      return res.json({
        success: true,
        data: {
          patient,
          medicalHistory
        }
      });
      
    } catch (error) {
      console.error('Get patient medical history error:', error);
      next(error);
    }
  }
}

module.exports = new DoctorController();
