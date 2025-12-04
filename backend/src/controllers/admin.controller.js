const prisma = require('../config/database');

class AdminController {
  // ==================== SPECIALTY MANAGEMENT ====================
  
  /**
   * Get all specialties
   * @route GET /api/admin/specialties
   */
  async getAllSpecialties(req, res, next) {
    try {
      const { page = 1, limit = 20, search = '' } = req.query;
      
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const take = parseInt(limit);
      
      // Build where clause for search
      const where = search ? {
        name: {
          contains: search,
          mode: 'insensitive'
        }
      } : {};
      
      // Get total count
      const total = await prisma.specialty.count({ where });
      
      // Get specialties with doctor count
      const specialties = await prisma.specialty.findMany({
        where,
        skip,
        take,
        include: {
          _count: {
            select: { doctors: true }
          }
        },
        orderBy: { name: 'asc' }
      });
      
      return res.json({
        success: true,
        data: {
          specialties,
          pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / parseInt(limit))
          }
        }
      });
    } catch (error) {
      console.error('Get all specialties error:', error);
      next(error);
    }
  }
  
  /**
   * Get specialty by ID
   * @route GET /api/admin/specialties/:id
   */
  async getSpecialtyById(req, res, next) {
    try {
      const { id } = req.params;
      
      const specialty = await prisma.specialty.findUnique({
        where: { id: parseInt(id) },
        include: {
          doctors: {
            include: {
              person: {
                select: {
                  fullName: true,
                  phoneNumber: true
                }
              }
            }
          },
          _count: {
            select: { doctors: true }
          }
        }
      });
      
      if (!specialty) {
        return res.status(404).json({
          success: false,
          error: 'Specialty not found'
        });
      }
      
      return res.json({
        success: true,
        data: specialty
      });
    } catch (error) {
      console.error('Get specialty by ID error:', error);
      next(error);
    }
  }
  
  /**
   * Create new specialty
   * @route POST /api/admin/specialties
   */
  async createSpecialty(req, res, next) {
    try {
      const { name } = req.body;
      
      if (!name) {
        return res.status(400).json({
          success: false,
          error: 'Specialty name is required'
        });
      }
      
      // Check if specialty already exists
      const existing = await prisma.specialty.findFirst({
        where: {
          name: {
            equals: name,
            mode: 'insensitive'
          }
        }
      });
      
      if (existing) {
        return res.status(409).json({
          success: false,
          error: 'Specialty already exists'
        });
      }
      
      const specialty = await prisma.specialty.create({
        data: { name }
      });
      
      return res.status(201).json({
        success: true,
        message: 'Specialty created successfully',
        data: specialty
      });
    } catch (error) {
      console.error('Create specialty error:', error);
      next(error);
    }
  }
  
  /**
   * Update specialty
   * @route PUT /api/admin/specialties/:id
   */
  async updateSpecialty(req, res, next) {
    try {
      const { id } = req.params;
      const { name } = req.body;
      
      if (!name) {
        return res.status(400).json({
          success: false,
          error: 'Specialty name is required'
        });
      }
      
      // Check if specialty exists
      const existing = await prisma.specialty.findUnique({
        where: { id: parseInt(id) }
      });
      
      if (!existing) {
        return res.status(404).json({
          success: false,
          error: 'Specialty not found'
        });
      }
      
      // Check if name already used by another specialty
      const duplicate = await prisma.specialty.findFirst({
        where: {
          name: {
            equals: name,
            mode: 'insensitive'
          },
          NOT: {
            id: parseInt(id)
          }
        }
      });
      
      if (duplicate) {
        return res.status(409).json({
          success: false,
          error: 'Specialty name already exists'
        });
      }
      
      const specialty = await prisma.specialty.update({
        where: { id: parseInt(id) },
        data: { name }
      });
      
      return res.json({
        success: true,
        message: 'Specialty updated successfully',
        data: specialty
      });
    } catch (error) {
      console.error('Update specialty error:', error);
      next(error);
    }
  }
  
  /**
   * Delete specialty
   * @route DELETE /api/admin/specialties/:id
   */
  async deleteSpecialty(req, res, next) {
    try {
      const { id } = req.params;
      
      // Check if specialty exists
      const specialty = await prisma.specialty.findUnique({
        where: { id: parseInt(id) },
        include: {
          _count: {
            select: { doctors: true }
          }
        }
      });
      
      if (!specialty) {
        return res.status(404).json({
          success: false,
          error: 'Specialty not found'
        });
      }
      
      // Check if specialty has assigned doctors
      if (specialty._count.doctors > 0) {
        return res.status(409).json({
          success: false,
          error: `Cannot delete specialty. ${specialty._count.doctors} doctor(s) are assigned to this specialty. Please reassign them first.`
        });
      }
      
      await prisma.specialty.delete({
        where: { id: parseInt(id) }
      });
      
      return res.json({
        success: true,
        message: 'Specialty deleted successfully'
      });
    } catch (error) {
      console.error('Delete specialty error:', error);
      next(error);
    }
  }
  
  // ==================== ROOM MANAGEMENT ====================
  
  /**
   * Get all rooms
   * @route GET /api/admin/rooms
   */
  async getAllRooms(req, res, next) {
    try {
      const { page = 1, limit = 20, search = '' } = req.query;
      
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const take = parseInt(limit);
      
      const where = search ? {
        roomName: {
          contains: search,
          mode: 'insensitive'
        }
      } : {};
      
      const total = await prisma.room.count({ where });
      
      const rooms = await prisma.room.findMany({
        where,
        skip,
        take,
        include: {
          _count: {
            select: { schedules: true }
          }
        },
        orderBy: { roomName: 'asc' }
      });
      
      return res.json({
        success: true,
        data: {
          rooms,
          pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / parseInt(limit))
          }
        }
      });
    } catch (error) {
      console.error('Get all rooms error:', error);
      next(error);
    }
  }

  /**
   * Get room by ID
   * @route GET /api/admin/rooms/:id
   */
  async getRoomById(req, res, next) {
    try {
      const { id } = req.params;
      
      const room = await prisma.room.findUnique({
        where: { id: parseInt(id) },
        include: {
          schedules: {
            include: {
              doctor: {
                include: {
                  person: {
                    select: { fullName: true }
                  }
                }
              }
            }
          },
          _count: {
            select: { schedules: true }
          }
        }
      });
      
      if (!room) {
        return res.status(404).json({
          success: false,
          error: 'Room not found'
        });
      }
      
      return res.json({
        success: true,
        data: room
      });
    } catch (error) {
      console.error('Get room by ID error:', error);
      next(error);
    }
  }

  /**
   * Create new room
   * @route POST /api/admin/rooms
   */
  async createRoom(req, res, next) {
    try {
      const { roomName } = req.body;
      
      if (!roomName) {
        return res.status(400).json({
          success: false,
          error: 'Room name is required'
        });
      }
      
      const existing = await prisma.room.findFirst({
        where: {
          roomName: {
            equals: roomName,
            mode: 'insensitive'
          }
        }
      });
      
      if (existing) {
        return res.status(409).json({
          success: false,
          error: 'Room already exists'
        });
      }
      
      const room = await prisma.room.create({
        data: { roomName }
      });
      
      return res.status(201).json({
        success: true,
        message: 'Room created successfully',
        data: room
      });
    } catch (error) {
      console.error('Create room error:', error);
      next(error);
    }
  }

  /**
   * Update room
   * @route PUT /api/admin/rooms/:id
   */
  async updateRoom(req, res, next) {
    try {
      const { id } = req.params;
      const { roomName } = req.body;
      
      if (!roomName) {
        return res.status(400).json({
          success: false,
          error: 'Room name is required'
        });
      }
      
      const existing = await prisma.room.findUnique({
        where: { id: parseInt(id) }
      });
      
      if (!existing) {
        return res.status(404).json({
          success: false,
          error: 'Room not found'
        });
      }
      
      const duplicate = await prisma.room.findFirst({
        where: {
          roomName: {
            equals: roomName,
            mode: 'insensitive'
          },
          NOT: {
            id: parseInt(id)
          }
        }
      });
      
      if (duplicate) {
        return res.status(409).json({
          success: false,
          error: 'Room name already exists'
        });
      }
      
      const room = await prisma.room.update({
        where: { id: parseInt(id) },
        data: { roomName }
      });
      
      return res.json({
        success: true,
        message: 'Room updated successfully',
        data: room
      });
    } catch (error) {
      console.error('Update room error:', error);
      next(error);
    }
  }

  /**
   * Delete room
   * @route DELETE /api/admin/rooms/:id
   */
  async deleteRoom(req, res, next) {
    try {
      const { id } = req.params;
      
      const room = await prisma.room.findUnique({
        where: { id: parseInt(id) },
        include: {
          _count: {
            select: { schedules: true }
          }
        }
      });
      
      if (!room) {
        return res.status(404).json({
          success: false,
          error: 'Room not found'
        });
      }
      
      if (room._count.schedules > 0) {
        return res.status(409).json({
          success: false,
          error: `Cannot delete room. It is used in ${room._count.schedules} schedule(s).`
        });
      }
      
      await prisma.room.delete({
        where: { id: parseInt(id) }
      });
      
      return res.json({
        success: true,
        message: 'Room deleted successfully'
      });
    } catch (error) {
      console.error('Delete room error:', error);
      next(error);
    }
  }
  
  // ==================== PATIENT MANAGEMENT ====================
  
  /**
   * Get all patients
   * @route GET /api/admin/patients
   */
  async getAllPatients(req, res, next) {
    try {
      const { page = 1, limit = 20, search = '' } = req.query;
      
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const take = parseInt(limit);
      
      // Build where clause for search across User, Person, Patient
      const where = search ? {
        OR: [
          { person: { fullName: { contains: search, mode: 'insensitive' } } },
          { person: { phoneNumber: { contains: search } } },
          { person: { user: { email: { contains: search, mode: 'insensitive' } } } }
        ]
      } : {};
      
      const total = await prisma.patient.count({ where });
      
      const patients = await prisma.patient.findMany({
        where,
        skip,
        take,
        include: {
          person: {
            include: {
              user: {
                select: {
                  email: true,
                  active: true,
                  registerDate: true
                }
              }
            }
          },
          _count: {
            select: { 
              appointments: true
            }
          }
        },
        orderBy: { person: { user: { registerDate: 'desc' } } }
      });
      
      // Transform data for cleaner response
      const formattedPatients = patients.map(p => ({
        id: p.id,
        userId: p.userId,
        fullName: p.person.fullName,
        email: p.person.user.email,
        phoneNumber: p.person.phoneNumber,
        gender: p.person.gender,
        yearOfBirth: p.yearOfBirth,
        active: p.person.user.active,
        registerDate: p.person.user.registerDate,
        appointmentsCount: p._count.appointments
      }));
      
      return res.json({
        success: true,
        data: {
          patients: formattedPatients,
          pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / parseInt(limit))
          }
        }
      });
    } catch (error) {
      console.error('Get all patients error:', error);
      next(error);
    }
  }

  /**
   * Get patient by ID
   * @route GET /api/admin/patients/:id
   */
  async getPatientById(req, res, next) {
    try {
      const { id } = req.params;
      
      const patient = await prisma.patient.findUnique({
        where: { id: parseInt(id) },
        include: {
          person: {
            include: {
              user: {
                select: {
                  email: true,
                  active: true,
                  registerDate: true,
                  activeDate: true
                }
              }
            }
          },
          appointments: {
            include: {
              doctor: {
                include: {
                  person: { select: { fullName: true } },
                  specialty: true
                }
              },
              schedule: {
                include: { room: true }
              }
            },
            orderBy: { appointmentDate: 'desc' },
            take: 10 // Last 10 appointments
          }
        }
      });
      
      if (!patient) {
        return res.status(404).json({
          success: false,
          error: 'Patient not found'
        });
      }
      
      // Format response
      const data = {
        id: patient.id,
        userId: patient.userId,
        fullName: patient.person.fullName,
        email: patient.person.user.email,
        phoneNumber: patient.person.phoneNumber,
        gender: patient.person.gender,
        yearOfBirth: patient.yearOfBirth,
        active: patient.person.user.active,
        registerDate: patient.person.user.registerDate,
        activeDate: patient.person.user.activeDate,
        appointments: patient.appointments
      };
      
      return res.json({
        success: true,
        data
      });
    } catch (error) {
      console.error('Get patient by ID error:', error);
      next(error);
    }
  }

  /**
   * Update patient
   * @route PUT /api/admin/patients/:id
   */
  async updatePatient(req, res, next) {
    try {
      const { id } = req.params;
      const { fullName, phoneNumber, yearOfBirth, gender, active } = req.body;
      
      const patient = await prisma.patient.findUnique({
        where: { id: parseInt(id) },
        include: { person: true }
      });
      
      if (!patient) {
        return res.status(404).json({
          success: false,
          error: 'Patient not found'
        });
      }
      
      // Update transaction
      const updatedPatient = await prisma.$transaction(async (tx) => {
        // Update Person
        if (fullName || phoneNumber || gender) {
          await tx.person.update({
            where: { userId: patient.userId },
            data: {
              fullName,
              phoneNumber,
              gender
            }
          });
        }
        
        // Update Patient
        if (yearOfBirth) {
          await tx.patient.update({
            where: { id: parseInt(id) },
            data: { yearOfBirth: parseInt(yearOfBirth) }
          });
        }
        
        // Update User (Active status)
        if (active) {
          await tx.user.update({
            where: { userId: patient.userId },
            data: { active }
          });
        }
        
        return tx.patient.findUnique({
          where: { id: parseInt(id) },
          include: {
            person: {
              include: { user: true }
            }
          }
        });
      });
      
      return res.json({
        success: true,
        message: 'Patient updated successfully',
        data: {
          id: updatedPatient.id,
          fullName: updatedPatient.person.fullName,
          phoneNumber: updatedPatient.person.phoneNumber,
          yearOfBirth: updatedPatient.yearOfBirth,
          active: updatedPatient.person.user.active
        }
      });
    } catch (error) {
      console.error('Update patient error:', error);
      next(error);
    }
  }

  /**
   * Delete patient
   * @route DELETE /api/admin/patients/:id
   */
  async deletePatient(req, res, next) {
    try {
      const { id } = req.params;
      
      const patient = await prisma.patient.findUnique({
        where: { id: parseInt(id) },
        include: {
          person: true,
          appointments: {
            where: {
              status: 'Confirmed',
              appointmentDate: { gt: new Date() }
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
      
      // Prevent delete if has future confirmed appointments
      if (patient.appointments.length > 0) {
        return res.status(409).json({
          success: false,
          error: 'Cannot delete patient with future confirmed appointments. Cancel them first.'
        });
      }
      
      // Cascade delete transaction
      await prisma.$transaction(async (tx) => {
        const userId = patient.userId;
        
        // 1. Delete Medical Records (via appointments)
        // Find all appointments for this patient
        const appointments = await tx.appointment.findMany({
          where: { patientId: patient.id },
          select: { id: true }
        });
        const appointmentIds = appointments.map(a => a.id);
        
        if (appointmentIds.length > 0) {
          await tx.medicalRecord.deleteMany({
            where: { appointmentId: { in: appointmentIds } }
          });
        }
        
        // 2. Delete Appointments
        await tx.appointment.deleteMany({
          where: { patientId: patient.id }
        });
        
        // 3. Delete Patient
        await tx.patient.delete({
          where: { id: patient.id }
        });
        
        // 4. Delete Person
        await tx.person.delete({
          where: { userId: userId }
        });
        
        // 5. Delete OTP
        await tx.oTPVerification.deleteMany({
          where: { userId: userId }
        });
        
        // 6. Delete User
        await tx.user.delete({
          where: { userId: userId }
        });
      });
      
      return res.json({
        success: true,
        message: 'Patient and all related data deleted successfully'
      });
    } catch (error) {
      console.error('Delete patient error:', error);
      next(error);
    }
  }
  
  // ==================== DOCTOR MANAGEMENT ====================
  
  /**
   * Get all doctors
   * @route GET /api/admin/doctors
   */
  async getAllDoctors(req, res, next) {
    try {
      const { page = 1, limit = 20, search = '', specialtyId } = req.query;
      
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const take = parseInt(limit);
      
      // Build where clause
      const where = {
        AND: [
          search ? {
            OR: [
              { person: { fullName: { contains: search, mode: 'insensitive' } } },
              { person: { user: { email: { contains: search, mode: 'insensitive' } } } }
            ]
          } : {},
          specialtyId ? { specialtyId: parseInt(specialtyId) } : {}
        ]
      };
      
      const total = await prisma.doctor.count({ where });
      
      const doctors = await prisma.doctor.findMany({
        where,
        skip,
        take,
        include: {
          person: {
            include: {
              user: {
                select: {
                  email: true,
                  active: true,
                  registerDate: true
                }
              }
            }
          },
          specialty: true,
          _count: {
            select: { 
              schedules: true
            }
          }
        },
        orderBy: { person: { fullName: 'asc' } }
      });
      
      // Format response
      const formattedDoctors = doctors.map(d => ({
        id: d.id,
        userId: d.userId,
        fullName: d.person.fullName,
        email: d.person.user.email,
        phoneNumber: d.person.phoneNumber,
        specialty: d.specialty.name,
        examinationFee: d.examinationFee,
        consultationFee: d.consultationFee,
        active: d.person.user.active,
        schedulesCount: d._count.schedules
      }));
      
      return res.json({
        success: true,
        data: {
          doctors: formattedDoctors,
          pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / parseInt(limit))
          }
        }
      });
    } catch (error) {
      console.error('Get all doctors error:', error);
      next(error);
    }
  }

  /**
   * Get doctor by ID
   * @route GET /api/admin/doctors/:id
   */
  async getDoctorById(req, res, next) {
    try {
      const { id } = req.params;
      
      const doctor = await prisma.doctor.findUnique({
        where: { id: parseInt(id) },
        include: {
          person: {
            include: {
              user: {
                select: {
                  email: true,
                  active: true,
                  registerDate: true
                }
              }
            }
          },
          specialty: true,
          schedules: {
            include: { room: true },
            orderBy: { dayOfWeek: 'asc' }
          }
        }
      });
      
      if (!doctor) {
        return res.status(404).json({
          success: false,
          error: 'Doctor not found'
        });
      }
      
      return res.json({
        success: true,
        data: doctor
      });
    } catch (error) {
      console.error('Get doctor by ID error:', error);
      next(error);
    }
  }

  /**
   * Create new doctor
   * @route POST /api/admin/doctors
   */
  async createDoctor(req, res, next) {
    try {
      const { 
        email, password, fullName, phoneNumber, gender,
        specialtyId, examinationFee, consultationFee 
      } = req.body;
      
      // Basic validation
      if (!email || !password || !fullName || !specialtyId) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields'
        });
      }
      
      // Check if email exists
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });
      
      if (existingUser) {
        return res.status(409).json({
          success: false,
          error: 'Email already registered'
        });
      }
      
      // Hash password (using bcrypt directly or helper)
      // For now assuming bcrypt is available or using simple hash for demo
      // In real app, use bcrypt.hash(password, 10)
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Transaction to create User -> Person -> Doctor
      const result = await prisma.$transaction(async (tx) => {
        // 1. Create User with Person
        const user = await tx.user.create({
          data: {
            email,
            passwordHash: hashedPassword,
            active: 'Yes', // Doctors are active by default
            person: {
              create: {
                fullName,
                phoneNumber,
                gender: gender || 'Male', // Default if missing
                roleId: 1 // Doctor Role ID (1=Doctor, 2=Patient, 3=Admin, 4=Receptionist)
              }
            }
          },
          include: { person: true }
        });
        
        // 2. Create Doctor
        const doctor = await tx.doctor.create({
          data: {
            userId: user.userId,
            specialtyId: parseInt(specialtyId),
            examinationFee: parseFloat(examinationFee || 0),
            consultationFee: parseFloat(consultationFee || 0)
          },
          include: { specialty: true }
        });
        
        return { user, doctor };
      });
      
      return res.status(201).json({
        success: true,
        message: 'Doctor created successfully',
        data: {
          id: result.doctor.id,
          fullName: result.user.person.fullName,
          email: result.user.email,
          specialty: result.doctor.specialty.name
        }
      });
    } catch (error) {
      console.error('Create doctor error:', error);
      next(error);
    }
  }

  /**
   * Update doctor
   * @route PUT /api/admin/doctors/:id
   */
  async updateDoctor(req, res, next) {
    try {
      const { id } = req.params;
      const { 
        fullName, phoneNumber, gender, active,
        specialtyId, examinationFee, consultationFee 
      } = req.body;
      
      const doctor = await prisma.doctor.findUnique({
        where: { id: parseInt(id) },
        include: { person: true }
      });
      
      if (!doctor) {
        return res.status(404).json({
          success: false,
          error: 'Doctor not found'
        });
      }
      
      // Update transaction
      const updatedDoctor = await prisma.$transaction(async (tx) => {
        // Update Person
        if (fullName || phoneNumber || gender) {
          await tx.person.update({
            where: { userId: doctor.userId },
            data: {
              fullName,
              phoneNumber,
              gender
            }
          });
        }
        
        // Update User (Active status)
        if (active) {
          await tx.user.update({
            where: { userId: doctor.userId },
            data: { active }
          });
        }
        
        // Update Doctor
        if (specialtyId || examinationFee || consultationFee) {
          const doctorData = {};
          if (specialtyId) doctorData.specialtyId = parseInt(specialtyId);
          if (examinationFee) doctorData.examinationFee = parseFloat(examinationFee);
          if (consultationFee) doctorData.consultationFee = parseFloat(consultationFee);
          
          await tx.doctor.update({
            where: { id: parseInt(id) },
            data: doctorData
          });
        }
        
        return tx.doctor.findUnique({
          where: { id: parseInt(id) },
          include: {
            person: { include: { user: true } },
            specialty: true
          }
        });
      });
      
      return res.json({
        success: true,
        message: 'Doctor updated successfully',
        data: updatedDoctor
      });
    } catch (error) {
      console.error('Update doctor error:', error);
      next(error);
    }
  }

  /**
   * Delete doctor
   * @route DELETE /api/admin/doctors/:id
   */
  async deleteDoctor(req, res, next) {
    try {
      const { id } = req.params;
      
      const doctor = await prisma.doctor.findUnique({
        where: { id: parseInt(id) },
        include: {
          person: true,
          schedules: {
            include: {
              appointments: {
                where: {
                  status: 'Confirmed',
                  appointmentDate: { gt: new Date() }
                }
              }
            }
          }
        }
      });
      
      if (!doctor) {
        return res.status(404).json({
          success: false,
          error: 'Doctor not found'
        });
      }
      
      // Check for future appointments in any schedule
      const hasFutureAppointments = doctor.schedules.some(s => s.appointments.length > 0);
      
      if (hasFutureAppointments) {
        return res.status(409).json({
          success: false,
          error: 'Cannot delete doctor with future confirmed appointments. Cancel them first.'
        });
      }
      
      // Cascade delete transaction
      await prisma.$transaction(async (tx) => {
        const userId = doctor.userId;
        
        // 1. Delete Schedules (and their appointments)
        // Note: This assumes appointments can be deleted or set to null. 
        // Ideally we should handle past appointments carefully.
        // For now, we delete schedules which might fail if appointments exist.
        // So we delete appointments first.
        
        const scheduleIds = doctor.schedules.map(s => s.id);
        
        if (scheduleIds.length > 0) {
          // Delete appointments for these schedules
          await tx.appointment.deleteMany({
            where: { scheduleId: { in: scheduleIds } }
          });
          
          // Delete schedules
          await tx.doctorSchedule.deleteMany({
            where: { doctorId: doctor.id }
          });
        }
        
        // 2. Delete Doctor
        await tx.doctor.delete({
          where: { id: doctor.id }
        });
        
        // 3. Delete Person
        await tx.person.delete({
          where: { userId: userId }
        });
        
        // 4. Delete User
        await tx.user.delete({
          where: { userId: userId }
        });
      });
      
      return res.json({
        success: true,
        message: 'Doctor and all related data deleted successfully'
      });
    } catch (error) {
      console.error('Delete doctor error:', error);
      next(error);
    }
  }
  
  // ==================== SCHEDULE MANAGEMENT ====================
  
  /**
   * Get all schedules
   * @route GET /api/admin/schedules
   */
  async getAllSchedules(req, res, next) {
    try {
      const { page = 1, limit = 20, doctorId, roomId, dayOfWeek } = req.query;
      
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const take = parseInt(limit);
      
      // Build where clause
      const where = {
        AND: [
          doctorId ? { doctorId: parseInt(doctorId) } : {},
          roomId ? { roomId: parseInt(roomId) } : {},
          dayOfWeek ? { dayOfWeek: dayOfWeek } : {}
        ]
      };
      
      const total = await prisma.doctorSchedule.count({ where });
      
      const schedules = await prisma.doctorSchedule.findMany({
        where,
        skip,
        take,
        include: {
          doctor: {
            include: {
              person: { select: { fullName: true } },
              specialty: true
            }
          },
          room: true,
          _count: {
            select: { appointments: true }
          }
        },
        orderBy: [
          { dayOfWeek: 'asc' },
          { startTime: 'asc' }
        ]
      });
      
      // Format response
      const formattedSchedules = schedules.map(s => ({
        id: s.id,
        doctorName: s.doctor.person.fullName,
        specialty: s.doctor.specialty.name,
        roomName: s.room.roomName,
        dayOfWeek: s.dayOfWeek,
        startTime: s.startTime,
        endTime: s.endTime,
        maxPatients: s.maxPatients,
        appointmentsCount: s._count.appointments
      }));
      
      return res.json({
        success: true,
        data: {
          schedules: formattedSchedules,
          pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / parseInt(limit))
          }
        }
      });
    } catch (error) {
      console.error('Get all schedules error:', error);
      next(error);
    }
  }

  /**
   * Get schedule by ID
   * @route GET /api/admin/schedules/:id
   */
  async getScheduleById(req, res, next) {
    try {
      const { id } = req.params;
      
      const schedule = await prisma.doctorSchedule.findUnique({
        where: { id: parseInt(id) },
        include: {
          doctor: {
            include: {
              person: { select: { fullName: true } },
              specialty: true
            }
          },
          room: true,
          appointments: {
            include: {
              patient: {
                include: {
                  person: { select: { fullName: true, phoneNumber: true } }
                }
              }
            },
            orderBy: { appointmentDate: 'desc' },
            take: 10
          }
        }
      });
      
      if (!schedule) {
        return res.status(404).json({
          success: false,
          error: 'Schedule not found'
        });
      }
      
      return res.json({
        success: true,
        data: schedule
      });
    } catch (error) {
      console.error('Get schedule by ID error:', error);
      next(error);
    }
  }

  /**
   * Create new schedule
   * @route POST /api/admin/schedules
   */
  async createSchedule(req, res, next) {
    try {
      const { 
        doctorId, roomId, dayOfWeek, 
        startTime, endTime, maxPatients 
      } = req.body;
      
      // Validation
      if (!doctorId || !roomId || !dayOfWeek || !startTime || !endTime) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields'
        });
      }
      
      // Check for conflicts
      // 1. Doctor availability: Cannot be in two places at once
      const doctorConflict = await prisma.doctorSchedule.findFirst({
        where: {
          doctorId: parseInt(doctorId),
          dayOfWeek,
          OR: [
            {
              AND: [
                { startTime: { lte: startTime } },
                { endTime: { gt: startTime } }
              ]
            },
            {
              AND: [
                { startTime: { lt: endTime } },
                { endTime: { gte: endTime } }
              ]
            }
          ]
        }
      });
      
      if (doctorConflict) {
        return res.status(409).json({
          success: false,
          error: 'Doctor already has a schedule overlapping with this time'
        });
      }
      
      // 2. Room availability: Cannot have two doctors in same room at same time
      const roomConflict = await prisma.doctorSchedule.findFirst({
        where: {
          roomId: parseInt(roomId),
          dayOfWeek,
          OR: [
            {
              AND: [
                { startTime: { lte: startTime } },
                { endTime: { gt: startTime } }
              ]
            },
            {
              AND: [
                { startTime: { lt: endTime } },
                { endTime: { gte: endTime } }
              ]
            }
          ]
        }
      });
      
      if (roomConflict) {
        return res.status(409).json({
          success: false,
          error: 'Room is already booked for this time'
        });
      }
      
      const schedule = await prisma.doctorSchedule.create({
        data: {
          doctorId: parseInt(doctorId),
          roomId: parseInt(roomId),
          dayOfWeek,
          startTime,
          endTime,
          maxPatients: parseInt(maxPatients || 20)
        },
        include: {
          doctor: { include: { person: true } },
          room: true
        }
      });
      
      return res.status(201).json({
        success: true,
        message: 'Schedule created successfully',
        data: schedule
      });
    } catch (error) {
      console.error('Create schedule error:', error);
      next(error);
    }
  }

  /**
   * Update schedule
   * @route PUT /api/admin/schedules/:id
   */
  async updateSchedule(req, res, next) {
    try {
      const { id } = req.params;
      const { 
        roomId, dayOfWeek, startTime, endTime, maxPatients 
      } = req.body;
      
      const schedule = await prisma.doctorSchedule.findUnique({
        where: { id: parseInt(id) }
      });
      
      if (!schedule) {
        return res.status(404).json({
          success: false,
          error: 'Schedule not found'
        });
      }
      
      // If changing time/room, check conflicts
      if (roomId || dayOfWeek || startTime || endTime) {
        const newRoomId = roomId ? parseInt(roomId) : schedule.roomId;
        const newDay = dayOfWeek || schedule.dayOfWeek;
        const newStart = startTime || schedule.startTime;
        const newEnd = endTime || schedule.endTime;
        
        // Check Doctor Conflict (excluding current schedule)
        const doctorConflict = await prisma.doctorSchedule.findFirst({
          where: {
            doctorId: schedule.doctorId,
            dayOfWeek: newDay,
            id: { not: parseInt(id) },
            OR: [
              {
                AND: [
                  { startTime: { lte: newStart } },
                  { endTime: { gt: newStart } }
                ]
              },
              {
                AND: [
                  { startTime: { lt: newEnd } },
                  { endTime: { gte: newEnd } }
                ]
              }
            ]
          }
        });
        
        if (doctorConflict) {
          return res.status(409).json({
            success: false,
            error: 'Doctor conflict: Overlapping schedule'
          });
        }
        
        // Check Room Conflict
        const roomConflict = await prisma.doctorSchedule.findFirst({
          where: {
            roomId: newRoomId,
            dayOfWeek: newDay,
            id: { not: parseInt(id) },
            OR: [
              {
                AND: [
                  { startTime: { lte: newStart } },
                  { endTime: { gt: newStart } }
                ]
              },
              {
                AND: [
                  { startTime: { lt: newEnd } },
                  { endTime: { gte: newEnd } }
                ]
              }
            ]
          }
        });
        
        if (roomConflict) {
          return res.status(409).json({
            success: false,
            error: 'Room conflict: Room already booked'
          });
        }
      }
      
      const data = {};
      if (roomId) data.roomId = parseInt(roomId);
      if (dayOfWeek) data.dayOfWeek = dayOfWeek;
      if (startTime) data.startTime = startTime;
      if (endTime) data.endTime = endTime;
      if (maxPatients) data.maxPatients = parseInt(maxPatients);
      
      const updatedSchedule = await prisma.doctorSchedule.update({
        where: { id: parseInt(id) },
        data,
        include: {
          doctor: { include: { person: true } },
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
   * @route DELETE /api/admin/schedules/:id
   */
  async deleteSchedule(req, res, next) {
    try {
      const { id } = req.params;
      
      const schedule = await prisma.doctorSchedule.findUnique({
        where: { id: parseInt(id) },
        include: {
          _count: {
            select: { appointments: true }
          }
        }
      });
      
      if (!schedule) {
        return res.status(404).json({
          success: false,
          error: 'Schedule not found'
        });
      }
      
      if (schedule._count.appointments > 0) {
        return res.status(409).json({
          success: false,
          error: `Cannot delete schedule. It has ${schedule._count.appointments} appointments.`
        });
      }
      
      await prisma.doctorSchedule.delete({
        where: { id: parseInt(id) }
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
  
  // ==================== APPOINTMENT MANAGEMENT ====================
  
  /**
   * Get all appointments
   * @route GET /api/admin/appointments
   */
  async getAllAppointments(req, res, next) {
    try {
      const { 
        page = 1, limit = 20, 
        doctorId, patientId, status, date 
      } = req.query;
      
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const take = parseInt(limit);
      
      // Build where clause
      const where = {
        AND: [
          doctorId ? { doctorId: parseInt(doctorId) } : {},
          patientId ? { patientId: parseInt(patientId) } : {},
          status ? { status: status } : {},
          date ? {
            appointmentDate: {
              gte: new Date(date + 'T00:00:00.000Z'),
              lt: new Date(date + 'T23:59:59.999Z')
            }
          } : {}
        ]
      };
      
      const total = await prisma.appointment.count({ where });
      
      const appointments = await prisma.appointment.findMany({
        where,
        skip,
        take,
        include: {
          doctor: {
            include: {
              person: { select: { fullName: true } },
              specialty: true
            }
          },
          patient: {
            include: {
              person: { select: { fullName: true, phoneNumber: true } }
            }
          },
          schedule: {
            include: { room: true }
          }
        },
        orderBy: { appointmentDate: 'desc' }
      });
      
      // Format response
      const formattedAppointments = appointments.map(a => ({
        id: a.id,
        patientName: a.patient.person.fullName,
        doctorName: a.doctor.person.fullName,
        specialty: a.doctor.specialty.name,
        date: a.appointmentDate,
        time: a.time,
        status: a.status,
        type: a.type,
        room: a.schedule.room.roomName
      }));
      
      return res.json({
        success: true,
        data: {
          appointments: formattedAppointments,
          pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / parseInt(limit))
          }
        }
      });
    } catch (error) {
      console.error('Get all appointments error:', error);
      next(error);
    }
  }

  /**
   * Get appointment by ID
   * @route GET /api/admin/appointments/:id
   */
  async getAppointmentById(req, res, next) {
    try {
      const { id } = req.params;
      
      const appointment = await prisma.appointment.findUnique({
        where: { id: parseInt(id) },
        include: {
          doctor: {
            include: {
              person: { select: { fullName: true } },
              specialty: true
            }
          },
          patient: {
            include: {
              person: { select: { fullName: true, phoneNumber: true } }
            }
          },
          schedule: {
            include: { room: true }
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
      
      return res.json({
        success: true,
        data: appointment
      });
    } catch (error) {
      console.error('Get appointment by ID error:', error);
      next(error);
    }
  }

  /**
   * Create appointment (Admin Override)
   * @route POST /api/admin/appointments
   */
  async createAppointment(req, res, next) {
    try {
      const { 
        patientId, doctorId, scheduleId, 
        date, time, type, status 
      } = req.body;
      
      // Validation
      if (!patientId || !doctorId || !scheduleId || !date || !time) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields'
        });
      }
      
      // Check if slot is taken
      const existing = await prisma.appointment.findFirst({
        where: {
          doctorId: parseInt(doctorId),
          appointmentDate: new Date(date),
          time: time,
          status: { not: 'Cancelled' }
        }
      });
      
      if (existing) {
        return res.status(409).json({
          success: false,
          error: 'Time slot already booked'
        });
      }
      
      const appointment = await prisma.appointment.create({
        data: {
          patientId: parseInt(patientId),
          doctorId: parseInt(doctorId),
          scheduleId: parseInt(scheduleId),
          appointmentDate: new Date(date),
          time: time,
          type: type || 'Consultation',
          status: status || 'Confirmed'
        },
        include: {
          patient: { include: { person: true } },
          doctor: { include: { person: true } }
        }
      });
      
      return res.status(201).json({
        success: true,
        message: 'Appointment created successfully',
        data: appointment
      });
    } catch (error) {
      console.error('Create appointment error:', error);
      next(error);
    }
  }

  /**
   * Update appointment
   * @route PUT /api/admin/appointments/:id
   */
  async updateAppointment(req, res, next) {
    try {
      const { id } = req.params;
      const { date, time, status, type } = req.body;
      
      const appointment = await prisma.appointment.findUnique({
        where: { id: parseInt(id) }
      });
      
      if (!appointment) {
        return res.status(404).json({
          success: false,
          error: 'Appointment not found'
        });
      }
      
      // If rescheduling, check availability
      if ((date && date !== appointment.appointmentDate.toISOString().split('T')[0]) || 
          (time && time !== appointment.time)) {
            
        const newDate = date ? new Date(date) : appointment.appointmentDate;
        const newTime = time || appointment.time;
        
        const conflict = await prisma.appointment.findFirst({
          where: {
            doctorId: appointment.doctorId,
            appointmentDate: newDate,
            time: newTime,
            status: { not: 'Cancelled' },
            id: { not: parseInt(id) }
          }
        });
        
        if (conflict) {
          return res.status(409).json({
            success: false,
            error: 'New time slot is already booked'
          });
        }
      }
      
      const data = {};
      if (date) data.appointmentDate = new Date(date);
      if (time) data.time = time;
      if (status) data.status = status;
      if (type) data.type = type;
      
      const updatedAppointment = await prisma.appointment.update({
        where: { id: parseInt(id) },
        data,
        include: {
          patient: { include: { person: true } },
          doctor: { include: { person: true } }
        }
      });
      
      return res.json({
        success: true,
        message: 'Appointment updated successfully',
        data: updatedAppointment
      });
    } catch (error) {
      console.error('Update appointment error:', error);
      next(error);
    }
  }

  /**
   * Delete appointment
   * @route DELETE /api/admin/appointments/:id
   */
  async deleteAppointment(req, res, next) {
    try {
      const { id } = req.params;
      
      const appointment = await prisma.appointment.findUnique({
        where: { id: parseInt(id) },
        include: { medicalRecord: true }
      });
      
      if (!appointment) {
        return res.status(404).json({
          success: false,
          error: 'Appointment not found'
        });
      }
      
      // If has medical records, prevent delete (or cascade if needed)
      if (appointment.medicalRecord.length > 0) {
        return res.status(409).json({
          success: false,
          error: 'Cannot delete appointment with medical records. Delete records first.'
        });
      }
      
      await prisma.appointment.delete({
        where: { id: parseInt(id) }
      });
      
      return res.json({
        success: true,
        message: 'Appointment deleted successfully'
      });
    } catch (error) {
      console.error('Delete appointment error:', error);
      next(error);
    }
  }
  
  // ==================== MEDICAL RECORDS MANAGEMENT ====================
  
  /**
   * Get all medical records
   * @route GET /api/admin/medical-records
   */
  async getAllMedicalRecords(req, res, next) {
    try {
      const { page = 1, limit = 20, patientId, doctorId, search = '' } = req.query;
      
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const take = parseInt(limit);
      
      // Build where clause
      const where = {
        AND: [
          patientId ? { appointment: { patientId: parseInt(patientId) } } : {},
          doctorId ? { appointment: { doctorId: parseInt(doctorId) } } : {},
          search ? {
            OR: [
              { diagnosis: { contains: search, mode: 'insensitive' } },
              { prescription: { contains: search, mode: 'insensitive' } },
              { appointment: { patient: { person: { fullName: { contains: search, mode: 'insensitive' } } } } }
            ]
          } : {}
        ]
      };
      
      const total = await prisma.medicalRecord.count({ where });
      
      const records = await prisma.medicalRecord.findMany({
        where,
        skip,
        take,
        include: {
          appointment: {
            include: {
              patient: {
                include: { person: { select: { fullName: true } } }
              },
              doctor: {
                include: { person: { select: { fullName: true } } }
              }
            }
          }
        },
        orderBy: { appointment: { appointmentDate: 'desc' } }
      });
      
      // Format response
      const formattedRecords = records.map(r => ({
        id: r.id,
        appointmentId: r.appointmentId,
        patientName: r.appointment.patient.person.fullName,
        doctorName: r.appointment.doctor.person.fullName,
        date: r.appointment.appointmentDate,
        diagnosis: r.diagnosis,
        prescription: r.prescription,
        notes: r.notes
      }));
      
      return res.json({
        success: true,
        data: {
          records: formattedRecords,
          pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / parseInt(limit))
          }
        }
      });
    } catch (error) {
      console.error('Get all medical records error:', error);
      next(error);
    }
  }

  /**
   * Get medical record by ID
   * @route GET /api/admin/medical-records/:id
   */
  async getMedicalRecordById(req, res, next) {
    try {
      const { id } = req.params;
      
      const record = await prisma.medicalRecord.findUnique({
        where: { id: parseInt(id) },
        include: {
          appointment: {
            include: {
              patient: {
                include: { person: { select: { fullName: true, phoneNumber: true, gender: true } } }
              },
              doctor: {
                include: { person: { select: { fullName: true } }, specialty: true }
              }
            }
          }
        }
      });
      
      if (!record) {
        return res.status(404).json({
          success: false,
          error: 'Medical record not found'
        });
      }
      
      return res.json({
        success: true,
        data: record
      });
    } catch (error) {
      console.error('Get medical record by ID error:', error);
      next(error);
    }
  }

  /**
   * Create medical record
   * @route POST /api/admin/medical-records
   */
  async createMedicalRecord(req, res, next) {
    try {
      const { appointmentId, diagnosis, prescription, notes } = req.body;
      
      if (!appointmentId || !diagnosis || !prescription) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields'
        });
      }
      
      // Check if appointment exists
      const appointment = await prisma.appointment.findUnique({
        where: { id: parseInt(appointmentId) }
      });
      
      if (!appointment) {
        return res.status(404).json({
          success: false,
          error: 'Appointment not found'
        });
      }
      
      // Check if record already exists for this appointment
      const existing = await prisma.medicalRecord.findFirst({
        where: { appointmentId: parseInt(appointmentId) }
      });
      
      if (existing) {
        return res.status(409).json({
          success: false,
          error: 'Medical record already exists for this appointment'
        });
      }
      
      const record = await prisma.medicalRecord.create({
        data: {
          appointmentId: parseInt(appointmentId),
          diagnosis,
          prescription,
          notes
        }
      });
      
      // Optionally update appointment status to Completed
      if (appointment.status !== 'Completed') {
        await prisma.appointment.update({
          where: { id: parseInt(appointmentId) },
          data: { status: 'Completed' }
        });
      }
      
      return res.status(201).json({
        success: true,
        message: 'Medical record created successfully',
        data: record
      });
    } catch (error) {
      console.error('Create medical record error:', error);
      next(error);
    }
  }

  /**
   * Update medical record
   * @route PUT /api/admin/medical-records/:id
   */
  async updateMedicalRecord(req, res, next) {
    try {
      const { id } = req.params;
      const { diagnosis, prescription, notes } = req.body;
      
      const record = await prisma.medicalRecord.findUnique({
        where: { id: parseInt(id) }
      });
      
      if (!record) {
        return res.status(404).json({
          success: false,
          error: 'Medical record not found'
        });
      }
      
      const updatedRecord = await prisma.medicalRecord.update({
        where: { id: parseInt(id) },
        data: {
          diagnosis,
          prescription,
          notes
        }
      });
      
      return res.json({
        success: true,
        message: 'Medical record updated successfully',
        data: updatedRecord
      });
    } catch (error) {
      console.error('Update medical record error:', error);
      next(error);
    }
  }

  /**
   * Delete medical record
   * @route DELETE /api/admin/medical-records/:id
   */
  async deleteMedicalRecord(req, res, next) {
    try {
      const { id } = req.params;
      
      const record = await prisma.medicalRecord.findUnique({
        where: { id: parseInt(id) }
      });
      
      if (!record) {
        return res.status(404).json({
          success: false,
          error: 'Medical record not found'
        });
      }
      
      await prisma.medicalRecord.delete({
        where: { id: parseInt(id) }
      });
      
      return res.json({
        success: true,
        message: 'Medical record deleted successfully'
      });
    } catch (error) {
      console.error('Delete medical record error:', error);
      next(error);
    }
  }
  
  // ==================== RECEPTIONIST MANAGEMENT ====================
  
  /**
   * Get all receptionists
   * @route GET /api/admin/receptionists
   */
  async getAllReceptionists(req, res, next) {
    try {
      const { page = 1, limit = 20, search = '' } = req.query;
      
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const take = parseInt(limit);
      
      // Build where clause (Role ID 4 = Receptionist)
      const where = {
        roleId: 4,
        OR: search ? [
          { fullName: { contains: search, mode: 'insensitive' } },
          { user: { email: { contains: search, mode: 'insensitive' } } }
        ] : undefined
      };
      
      const total = await prisma.person.count({ where });
      
      const receptionists = await prisma.person.findMany({
        where,
        skip,
        take,
        include: {
          user: {
            select: {
              email: true,
              active: true,
              registerDate: true
            }
          }
        },
        orderBy: { fullName: 'asc' }
      });
      
      // Format response
      const formattedReceptionists = receptionists.map(r => ({
        userId: r.userId,
        fullName: r.fullName,
        email: r.user?.email,
        phoneNumber: r.phoneNumber,
        gender: r.gender,
        active: r.user?.active,
        registerDate: r.user?.registerDate
      }));
      
      return res.json({
        success: true,
        data: {
          receptionists: formattedReceptionists,
          pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / parseInt(limit))
          }
        }
      });
    } catch (error) {
      console.error('Get all receptionists error:', error);
      next(error);
    }
  }

  /**
   * Get receptionist by ID
   * @route GET /api/admin/receptionists/:id
   */
  async getReceptionistById(req, res, next) {
    try {
      const { id } = req.params;
      
      const receptionist = await prisma.person.findFirst({
        where: { 
          userId: parseInt(id),
          roleId: 4
        },
        include: {
          user: {
            select: {
              email: true,
              active: true,
              registerDate: true,
              activeDate: true
            }
          }
        }
      });
      
      if (!receptionist) {
        return res.status(404).json({
          success: false,
          error: 'Receptionist not found'
        });
      }
      
      return res.json({
        success: true,
        data: receptionist
      });
    } catch (error) {
      console.error('Get receptionist by ID error:', error);
      next(error);
    }
  }

  /**
   * Create new receptionist
   * @route POST /api/admin/receptionists
   */
  async createReceptionist(req, res, next) {
    try {
      const { email, password, fullName, phoneNumber, gender } = req.body;
      
      // Basic validation
      if (!email || !password || !fullName || !phoneNumber) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields'
        });
      }
      
      // Check if email exists
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });
      
      if (existingUser) {
        return res.status(409).json({
          success: false,
          error: 'Email already registered'
        });
      }
      
      // Hash password
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Create User with Person (Receptionist role)
      const user = await prisma.user.create({
        data: {
          email,
          passwordHash: hashedPassword,
          active: 'Yes', // Receptionists are active by default
          person: {
            create: {
              fullName,
              phoneNumber,
              gender: gender || 'Male',
              roleId: 4 // Receptionist Role (1=Doctor, 2=Patient, 3=Admin, 4=Receptionist)
            }
          }
        },
        include: { person: true }
      });
      
      return res.status(201).json({
        success: true,
        message: 'Receptionist created successfully',
        data: {
          userId: user.userId,
          fullName: user.person.fullName,
          email: user.email
        }
      });
    } catch (error) {
      console.error('Create receptionist error:', error);
      next(error);
    }
  }

  /**
   * Update receptionist
   * @route PUT /api/admin/receptionists/:id
   */
  async updateReceptionist(req, res, next) {
    try {
      const { id } = req.params;
      const { fullName, phoneNumber, gender, active } = req.body;
      
      const receptionist = await prisma.person.findFirst({
        where: { 
          userId: parseInt(id),
          roleId: 4
        }
      });
      
      if (!receptionist) {
        return res.status(404).json({
          success: false,
          error: 'Receptionist not found'
        });
      }
      
      // Update transaction
      const updatedReceptionist = await prisma.$transaction(async (tx) => {
        // Update Person
        if (fullName || phoneNumber || gender) {
          await tx.person.update({
            where: { userId: parseInt(id) },
            data: {
              fullName,
              phoneNumber,
              gender
            }
          });
        }
        
        // Update User (Active status)
        if (active) {
          await tx.user.update({
            where: { userId: parseInt(id) },
            data: { active }
          });
        }
        
        return tx.person.findUnique({
          where: { userId: parseInt(id) },
          include: { user: true }
        });
      });
      
      return res.json({
        success: true,
        message: 'Receptionist updated successfully',
        data: updatedReceptionist
      });
    } catch (error) {
      console.error('Update receptionist error:', error);
      next(error);
    }
  }

  /**
   * Delete receptionist
   * @route DELETE /api/admin/receptionists/:id
   */
  async deleteReceptionist(req, res, next) {
    try {
      const { id } = req.params;
      
      const receptionist = await prisma.person.findFirst({
        where: { 
          userId: parseInt(id),
          roleId: 4
        }
      });
      
      if (!receptionist) {
        return res.status(404).json({
          success: false,
          error: 'Receptionist not found'
        });
      }
      
      // Delete transaction
      await prisma.$transaction(async (tx) => {
        // Delete Person
        await tx.person.delete({
          where: { userId: parseInt(id) }
        });
        
        // Delete User
        await tx.user.delete({
          where: { userId: parseInt(id) }
        });
      });
      
      return res.json({
        success: true,
        message: 'Receptionist deleted successfully'
      });
    } catch (error) {
      console.error('Delete receptionist error:', error);
      next(error);
    }
  }
  
  // ==================== ADMIN MANAGEMENT ====================
  
  /**
   * Get all admins
   * @route GET /api/admin/admins
   */
  async getAllAdmins(req, res, next) {
    try {
      const { page = 1, limit = 20, search = '' } = req.query;
      
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const take = parseInt(limit);
      
      // Build where clause (Role ID 3 = Admin)
      const where = {
        roleId: 3,
        OR: search ? [
          { fullName: { contains: search, mode: 'insensitive' } },
          { user: { email: { contains: search, mode: 'insensitive' } } }
        ] : undefined
      };
      
      const total = await prisma.person.count({ where });
      
      const admins = await prisma.person.findMany({
        where,
        skip,
        take,
        include: {
          user: {
            select: {
              email: true,
              active: true,
              registerDate: true
            }
          }
        },
        orderBy: { fullName: 'asc' }
      });
      
      // Format response
      const formattedAdmins = admins.map(a => ({
        userId: a.userId,
        fullName: a.fullName,
        email: a.user.email,
        phoneNumber: a.phoneNumber,
        gender: a.gender,
        active: a.user.active,
        registerDate: a.user.registerDate
      }));
      
      return res.json({
        success: true,
        data: {
          admins: formattedAdmins,
          pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / parseInt(limit))
          }
        }
      });
    } catch (error) {
      console.error('Get all admins error:', error);
      next(error);
    }
  }

  /**
   * Create new admin
   * @route POST /api/admin/admins
   */
  async createAdmin(req, res, next) {
    try {
      const { 
        email, password, fullName, phoneNumber, gender 
      } = req.body;
      
      // Validation
      if (!email || !password || !fullName) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields'
        });
      }
      
      // Check if email exists
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });
      
      if (existingUser) {
        return res.status(409).json({
          success: false,
          error: 'Email already registered'
        });
      }
      
      // Hash password
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Create User + Person (Role 3 = Admin)
      const user = await prisma.user.create({
        data: {
          email,
          passwordHash: hashedPassword,
          active: 'Yes',
          person: {
            create: {
              fullName,
              phoneNumber,
              gender: gender || 'Male',
              roleId: 3 // Admin Role
            }
          }
        },
        include: { person: true }
      });
      
      return res.status(201).json({
        success: true,
        message: 'Admin created successfully',
        data: {
          userId: user.userId,
          fullName: user.person.fullName,
          email: user.email
        }
      });
    } catch (error) {
      console.error('Create admin error:', error);
      next(error);
    }
  }

  /**
   * Update admin
   * @route PUT /api/admin/admins/:id
   */
  async updateAdmin(req, res, next) {
    try {
      const { id } = req.params; // This is userId
      const { fullName, phoneNumber, gender, active } = req.body;
      
      const admin = await prisma.person.findUnique({
        where: { userId: parseInt(id) },
        include: { user: true }
      });
      
      if (!admin || admin.roleId !== 3) {
        return res.status(404).json({
          success: false,
          error: 'Admin not found'
        });
      }
      
      // Update transaction
      const updatedAdmin = await prisma.$transaction(async (tx) => {
        // Update Person
        if (fullName || phoneNumber || gender) {
          await tx.person.update({
            where: { userId: parseInt(id) },
            data: {
              fullName,
              phoneNumber,
              gender
            }
          });
        }
        
        // Update User (Active status)
        if (active) {
          // Prevent deactivating self (optional check, requires req.user)
          if (req.user && req.user.userId === parseInt(id) && active === 'No') {
            throw new Error('Cannot deactivate your own account');
          }
          
          await tx.user.update({
            where: { userId: parseInt(id) },
            data: { active }
          });
        }
        
        return tx.person.findUnique({
          where: { userId: parseInt(id) },
          include: { user: true }
        });
      });
      
      return res.json({
        success: true,
        message: 'Admin updated successfully',
        data: {
          userId: updatedAdmin.userId,
          fullName: updatedAdmin.fullName,
          email: updatedAdmin.user.email,
          active: updatedAdmin.user.active
        }
      });
    } catch (error) {
      console.error('Update admin error:', error);
      if (error.message === 'Cannot deactivate your own account') {
        return res.status(403).json({ success: false, error: error.message });
      }
      next(error);
    }
  }

  /**
   * Delete admin
   * @route DELETE /api/admin/admins/:id
   */
  async deleteAdmin(req, res, next) {
    try {
      const { id } = req.params; // This is userId
      
      // Prevent self-delete
      if (req.user && req.user.userId === parseInt(id)) {
        return res.status(403).json({
          success: false,
          error: 'Cannot delete your own account'
        });
      }
      
      const admin = await prisma.person.findUnique({
        where: { userId: parseInt(id) }
      });
      
      if (!admin || admin.roleId !== 3) {
        return res.status(404).json({
          success: false,
          error: 'Admin not found'
        });
      }
      
      // Delete transaction
      await prisma.$transaction(async (tx) => {
        // Delete Person
        await tx.person.delete({
          where: { userId: parseInt(id) }
        });
        
        // Delete User
        await tx.user.delete({
          where: { userId: parseInt(id) }
        });
      });
      
      return res.json({
        success: true,
        message: 'Admin deleted successfully'
      });
    } catch (error) {
      console.error('Delete admin error:', error);
      next(error);
    }
  }
}

module.exports = new AdminController();
