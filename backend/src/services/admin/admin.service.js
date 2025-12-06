const prisma = require('../../config/database');
const bcrypt = require('bcrypt');
const BaseService = require('../common/base.service');
const { NotFoundError, ConflictError, ValidationError } = require('../../utils/error');
const { BCRYPT_SALT_ROUNDS, ROLE_IDS } = require('../../config/constants');

class AdminService {
  constructor() {
    // Initialize BaseService instances for simple CRUD entities
    this.specialtyService = new BaseService('specialty', {
      nameField: 'name',
      displayName: 'Specialty',
      pluralKey: 'specialties', // Correct plural form
      includes: {
        _count: { select: { doctors: true } }
      }
    });

    this.roomService = new BaseService('room', {
      nameField: 'roomName',
      displayName: 'Room',
      pluralKey: 'rooms',
      includes: {
        _count: { select: { schedules: true } }
      },
      orderBy: { roomName: 'asc' }
    });
  }

  // ==================== DASHBOARD ====================
  async getStats() {
    const [totalPatients, totalDoctors, totalAppointments, totalSpecialties] = await Promise.all([
      prisma.patient.count(),
      prisma.doctor.count(),
      prisma.appointment.count(),
      prisma.specialty.count()
    ]);
    return { totalPatients, totalDoctors, totalAppointments, totalSpecialties };
  }

  // ==================== SPECIALTY MANAGEMENT ====================
  // Delegating to BaseService for cleaner code
  async getAllSpecialties({ skip, take, search }) {
    return this.specialtyService.getAll({ skip, take, search });
  }

  async getSpecialtyById(id) {
    return this.specialtyService.getById(id, {
      doctors: { include: { person: { select: { fullName: true, phoneNumber: true } } } }
    });
  }

  async createSpecialty(name) {
    return this.specialtyService.create(name);
  }

  async updateSpecialty(id, name) {
    return this.specialtyService.update(id, name);
  }

  async deleteSpecialty(id) {
    return this.specialtyService.delete(id, {
      dependencyField: 'doctors',
      dependencyName: 'doctor'
    });
  }

  // ==================== ROOM MANAGEMENT ====================
  // Delegating to BaseService for cleaner code
  async getAllRooms({ skip, take, search }) {
    return this.roomService.getAll({ skip, take, search });
  }

  async getRoomById(id) {
    return this.roomService.getById(id, {
      schedules: { include: { doctor: { include: { person: { select: { fullName: true } } } } } }
    });
  }

  async createRoom(roomName) {
    return this.roomService.create(roomName);
  }

  async updateRoom(id, roomName) {
    return this.roomService.update(id, roomName);
  }

  async deleteRoom(id) {
    return this.roomService.delete(id, {
      dependencyField: 'schedules',
      dependencyName: 'schedule'
    });
  }

  // ==================== USERS MANAGEMENT (Doctors, Patients, Receptionists) ====================
  
  // PATIENTS
  async getAllPatients({ skip, take, search }) {
    const where = search ? {
      OR: [
        { person: { fullName: { contains: search, mode: 'insensitive' } } },
        { person: { phoneNumber: { contains: search } } },
        { person: { user: { email: { contains: search, mode: 'insensitive' } } } }
      ]
    } : {};

    // ✅ OPTIMIZED: Use select instead of include to fetch only needed fields
    const [total, patients] = await Promise.all([
      prisma.patient.count({ where }),
      prisma.patient.findMany({
        where, skip, take,
        select: {
          id: true,
          userId: true,
          yearOfBirth: true,
          person: {
            select: {
              fullName: true,
              phoneNumber: true,
              gender: true,
              user: {
                select: {
                  email: true,
                  active: true,
                  registerDate: true
                }
              }
            }
          },
          _count: { select: { appointments: true } }
        },
        orderBy: { person: { user: { registerDate: 'desc' } } }
      })
    ]);

    // Format response
    const formatted = patients.map(p => ({
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

    return { total, patients: formatted };
  }

  async getPatientById(id) {
    // ✅ OPTIMIZED: Limit appointments and use select
    const patient = await prisma.patient.findUnique({
      where: { id },
      include: {
        person: { include: { user: { select: { email: true, active: true, registerDate: true } } } },
        appointments: {
          select: {
            id: true,
            appointmentDate: true,
            appointmentType: true,
            status: true,
            feePaid: true,
            doctor: {
              select: {
                person: { select: { fullName: true } },
                specialty: { select: { name: true } }
              }
            },
            schedule: {
              select: {
                room: { select: { roomName: true } }
              }
            }
          },
          orderBy: { appointmentDate: 'desc' },
          take: 10 // ✅ Limit to latest 10
        }
      }
    });
    if (!patient) throw new NotFoundError('Patient');

    return {
      id: patient.id, userId: patient.userId,
      fullName: patient.person.fullName, email: patient.person.user.email,
      phoneNumber: patient.person.phoneNumber, gender: patient.person.gender,
      yearOfBirth: patient.yearOfBirth, active: patient.person.user.active,
      registerDate: patient.person.user.registerDate,
      appointments: patient.appointments
    };
  }

  // DOCTORS
  async getAllDoctors({ skip, take, search }) {
    const where = search ? {
      OR: [
        { person: { fullName: { contains: search, mode: 'insensitive' } } },
        { specialty: { name: { contains: search, mode: 'insensitive' } } },
        { person: { phoneNumber: { contains: search } } },
        { person: { user: { email: { contains: search, mode: 'insensitive' } } } }
      ]
    } : {};

    // ✅ OPTIMIZED: Use select to reduce data transfer
    const [total, doctors] = await Promise.all([
      prisma.doctor.count({ where }),
      prisma.doctor.findMany({
        where, skip, take,
        select: {
          id: true,
          userId: true,
          specialtyId: true,
          person: {
            select: {
              fullName: true,
              phoneNumber: true,
              user: {
                select: {
                  email: true,
                  active: true,
                  registerDate: true
                }
              }
            }
          },
          specialty: { select: { name: true } },
          _count: { select: { appointments: true } }
        },
        orderBy: { person: { user: { registerDate: 'desc' } } }
      })
    ]);

    const formatted = doctors.map(d => ({
      id: d.id,
      userId: d.userId,
      fullName: d.person.fullName,
      email: d.person.user.email,
      phoneNumber: d.person.phoneNumber,
      specialty: d.specialty.name,
      active: d.person.user.active,
      registerDate: d.person.user.registerDate,
      appointmentsCount: d._count.appointments
    }));

    return { total, doctors: formatted };
  }

  async getDoctorById(id) {
    // ✅ OPTIMIZED: Use select
    const doctor = await prisma.doctor.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
        specialtyId: true,
        examinationFee: true,
        consultationFee: true,
        biography: true,
        person: {
          select: {
            fullName: true,
            phoneNumber: true,
            user: {
              select: {
                email: true,
                active: true,
                registerDate: true
              }
            }
          }
        },
        specialty: { select: { name: true } },
        schedules: {
          select: {
            id: true,
            weekDay: true,
            startTime: true,
            endTime: true,
            maxCapacity: true,
            room: { select: { roomName: true } }
          },
          orderBy: { weekDay: 'asc' }
        }
      }
    });
    if (!doctor) throw new NotFoundError('Doctor');
    return doctor;
  }

  async updateDoctor(id, data) {
    const doctor = await prisma.doctor.findUnique({ where: { id } });
    if (!doctor) throw new NotFoundError('Doctor');

    // ✅ INPUT VALIDATION
    if (data.examinationFee !== undefined) {
      const fee = parseFloat(data.examinationFee);
      if (isNaN(fee) || fee < 0) {
        throw new ValidationError('examinationFee must be a positive number');
      }
    }

    if (data.consultationFee !== undefined) {
      const fee = parseFloat(data.consultationFee);
      if (isNaN(fee) || fee < 0) {
        throw new ValidationError('consultationFee must be a positive number');
      }
    }

    if (data.specialtyId !== undefined) {
      const specialty = await prisma.specialty.findUnique({
        where: { id: parseInt(data.specialtyId) }
      });
      if (!specialty) {
        throw new NotFoundError('Specialty');
      }
    }

    await prisma.$transaction([
      prisma.doctor.update({
        where: { id },
        data: {
          specialtyId: data.specialtyId ? parseInt(data.specialtyId) : undefined,
          examinationFee: data.examinationFee ? parseFloat(data.examinationFee) : undefined,
          consultationFee: data.consultationFee ? parseFloat(data.consultationFee) : undefined,
          biography: data.biography
        }
      }),
      ...(data.fullName || data.phoneNumber ? [
        prisma.person.update({
          where: { userId: doctor.userId },
          data: {
            fullName: data.fullName,
            phoneNumber: data.phoneNumber
          }
        })
      ] : []),
      ...(data.active ? [prisma.user.update({ where: { userId: doctor.userId }, data: { active: data.active } })] : []),
      ...(data.password ? [prisma.user.update({ where: { userId: doctor.userId }, data: { passwordHash: await bcrypt.hash(data.password, 10) } })] : [])
    ]);
    return { success: true };
  }

  // RECEPTIONISTS
  async getAllReceptionists({ skip, take, search }) {
    const where = search ? {
      person: {
        OR: [
          { fullName: { contains: search, mode: 'insensitive' } },
          { phoneNumber: { contains: search } }
        ]
      }
    } : {};

    // ✅ OPTIMIZED: Use select
    const [total, users] = await Promise.all([
      prisma.user.count({ where: { person: { roleId: 4, ...where.person } } }),
      prisma.user.findMany({
        where: { person: { roleId: 4, ...where.person } },
        skip, take,
        select: {
          userId: true,
          email: true,
          active: true,
          registerDate: true,
          person: {
            select: {
              fullName: true,
              phoneNumber: true,
              gender: true
            }
          }
        },
        orderBy: { registerDate: 'desc' }
      })
    ]);

    const formatted = users.map(u => ({
      userId: u.userId,
      fullName: u.person.fullName,
      email: u.email,
      phoneNumber: u.person.phoneNumber,
      gender: u.person.gender,
      active: u.active,
      registerDate: u.registerDate
    }));

    return { total, receptionists: formatted };
  }

  // CREATE / DELETE / TOGGLE HELPERS
  async createUserEntity({ email, password, fullName, phoneNumber, gender, roleId, specificData, roleTable, roleDataMapper }) {
    if (existingUser) throw new ConflictError('Email already registered');
    const existingPhone = await prisma.person.findUnique({ where: { phoneNumber } });
    if (existingPhone) throw new ConflictError('Phone number already registered');

    const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

    return await prisma.$transaction(async (tx) => {
      const person = await tx.person.create({
        data: { fullName, phoneNumber, roleId, gender }
      });
      const user = await tx.user.create({
        data: { userId: person.userId, email, passwordHash: hashedPassword, active: 'Yes' }
      });

      let entity = null;
      if (roleTable && roleDataMapper) {
        const entityData = roleDataMapper(person.userId, specificData);
        entity = await tx[roleTable].create({ data: entityData });
      }

      const result = { user, person };
      if (roleTable) result[roleTable] = entity;
      return result;
    });
  }

  async createDoctor(data) {
    return this.createUserEntity({
      ...data, roleId: 1, roleTable: 'doctor',
      roleDataMapper: (userId, d) => ({
        userId, specialtyId: parseInt(d.specialtyId),
        consultationFee: parseFloat(d.consultationFee), examinationFee: parseFloat(d.examinationFee),
        biography: d.biography
      })
    });
  }

  async createPatient(data) {
    // roleId 2 based on Auth logic
    return this.createUserEntity({
      ...data, roleId: 2, roleTable: 'patient', specificData: data,
      roleDataMapper: (userId, d) => ({ userId, yearOfBirth: parseInt(d.yearOfBirth) })
    });
  }

  async createReceptionist(data) {
    return this.createUserEntity({
      ...data, roleId: 4, roleTable: null, roleDataMapper: null
    });
  }

  async deleteUser(userId) {
    return await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { userId },
        include: { person: { include: { doctor: true, patient: true } } }
      });
      if (!user) throw new NotFoundError('User');

      // Explicit Deletion Order to confirm logic although Cascade might exist
      if (user.person?.doctor) await tx.doctor.delete({ where: { id: user.person.doctor.id } });
      if (user.person?.patient) await tx.patient.delete({ where: { id: user.person.patient.id } });
      if (user.person) await tx.person.delete({ where: { userId } });
      await tx.user.delete({ where: { userId } });
      
      return { success: true };
    });
  }
  
  // Wrapper for consistency
  async deleteUserEntity(entityId, entityType) {
    let userId;
    if (entityType === 'doctor') {
      const doc = await prisma.doctor.findUnique({ where: { id: entityId } });
      if (!doc) throw new NotFoundError('Doctor');
      userId = doc.userId;
    } else if (entityType === 'patient') {
      const pat = await prisma.patient.findUnique({ where: { id: entityId } });
      if (!pat) throw new NotFoundError('Patient');
      userId = pat.userId;
    } else {
      userId = entityId; 
    }
    return this.deleteUser(userId);
  }

  // ==================== MISSING METHODS RESTORATION ====================

  async updatePatient(id, data) {
    const patient = await prisma.patient.findUnique({ where: { id } });
    if (!patient) throw new NotFoundError('Patient');

    await prisma.$transaction([
      prisma.person.update({
        where: { userId: patient.userId },
        data: {
          fullName: data.fullName,
          phoneNumber: data.phoneNumber,
          gender: data.gender
        }
      }),
      prisma.patient.update({
        where: { id },
        data: {
          yearOfBirth: parseInt(data.yearOfBirth)
        }
      }),
      ...(data.active ? [prisma.user.update({ where: { userId: patient.userId }, data: { active: data.active } })] : []),
      ...(data.password ? [prisma.user.update({ where: { userId: patient.userId }, data: { passwordHash: await bcrypt.hash(data.password, 10) } })] : [])
    ]);
    return { success: true };
  }

  // RECEPTIONIST EXTRAS
  async getReceptionistById(id) {
    // Receptionist ID is UserId
    const user = await prisma.user.findUnique({
      where: { userId: id },
      include: { person: true }
    });
    if (!user || user.person.roleId !== 4) throw new NotFoundError('Receptionist');
    
    return {
      id: user.userId, fullName: user.person.fullName, email: user.email,
      phoneNumber: user.person.phoneNumber, active: user.active, registerDate: user.registerDate
    };
  }

  async updateReceptionist(id, data) {
    // id is userId
    const user = await prisma.user.findUnique({ where: { userId: id } });
    if (!user || user.person.roleId !== 4) throw new NotFoundError('Receptionist');

    await prisma.$transaction([
      prisma.person.update({
        where: { userId: id },
        data: { fullName: data.fullName, phoneNumber: data.phoneNumber }
      }),
      ...(data.active ? [prisma.user.update({ where: { userId: id }, data: { active: data.active } })] : []),
      ...(data.password ? [prisma.user.update({ where: { userId: id }, data: { passwordHash: await bcrypt.hash(data.password, 10) } })] : [])
    ]);

    return { success: true };
  }

  // ADMINS
  async getAllAdmins({ skip, take, search }) {
    const userWhere = {
      person: { roleId: 3, ...(search ? { OR: [{ fullName: { contains: search, mode: 'insensitive' } }, { phoneNumber: { contains: search } }] } : {}) },
      ...(search ? { email: { contains: search, mode: 'insensitive' } } : {})
    };
    const [total, users] = await Promise.all([
      prisma.user.count({ where: userWhere }),
      prisma.user.findMany({ where: userWhere, skip, take, include: { person: true }, orderBy: { registerDate: 'desc' } })
    ]);
    const formatted = users.map(u => ({
      id: u.userId, fullName: u.person.fullName, email: u.email,
      phoneNumber: u.person.phoneNumber, active: u.active, registerDate: u.registerDate
    }));
    return { total, admins: formatted };
  }

  async createAdmin(data) {
    return this.createUserEntity({ ...data, roleId: 3, roleTable: null, roleDataMapper: null });
  }

  async updateAdmin(id, data) {
    // Reuse Receptionist update logic as it's just User+Person update
    return this.updateReceptionist(id, data);
  }

  async deleteAdmin(id) {
    return this.deleteUser(id);
  }

  // SCHEDULES
  async getAllSchedules({ skip, take }) {
    const [total, schedules] = await Promise.all([
      prisma.doctorSchedule.count(),
      prisma.doctorSchedule.findMany({
        skip, take,
        include: {
          doctor: { include: { person: { select: { fullName: true } } } },
          room: true
        },
        orderBy: { weekDay: 'asc' }
      })
    ]);
    return { total, schedules };
  }

  async getScheduleById(id) {
    const schedule = await prisma.doctorSchedule.findUnique({
      where: { id },
      include: { doctor: { include: { person: true } }, room: true }
    });
    if (!schedule) throw new NotFoundError('Schedule');
    return schedule;
  }

  async createSchedule(data) {
    // ✅ INPUT VALIDATION
    const { WEEK_DAYS } = require('../../config/constants');
    
    // Validate weekDay
    if (!WEEK_DAYS.includes(data.weekDay)) {
      throw new ValidationError(`Invalid weekDay. Must be one of: ${WEEK_DAYS.join(', ')}`);
    }
    
    // Validate times
    const start = new Date(`1970-01-01T${data.startTime}`);
    const end = new Date(`1970-01-01T${data.endTime}`);
    if (start >= end) {
      throw new ValidationError('startTime must be before endTime');
    }
    
    // Validate maxCapacity
    if (!data.maxCapacity || data.maxCapacity <= 0) {
      throw new ValidationError('maxCapacity must be a positive number');
    }

    const conflict = await prisma.doctorSchedule.findFirst({
      where: {
        doctorId: parseInt(data.doctorId),
        weekDay: data.weekDay
      }
    }); // Unique constraint usually handles this but good to check
    if (conflict) throw new ConflictError('Doctor already has a schedule for this day');

    return prisma.doctorSchedule.create({
      data: {
        doctorId: parseInt(data.doctorId),
        roomId: parseInt(data.roomId),
        weekDay: data.weekDay,
        startTime: data.startTime,
        endTime: data.endTime,
        maxCapacity: parseInt(data.maxCapacity)
      }
    });
  }

  async updateSchedule(id, data) {
    const schedule = await prisma.doctorSchedule.findUnique({ where: { id } });
    if (!schedule) throw new NotFoundError('Schedule');

    return prisma.doctorSchedule.update({
      where: { id },
      data: {
        doctorId: parseInt(data.doctorId),
        roomId: parseInt(data.roomId),
        weekDay: data.weekDay,
        startTime: data.startTime ? new Date(`1970-01-01T${data.startTime}`) : undefined,
        endTime: data.endTime ? new Date(`1970-01-01T${data.endTime}`) : undefined,
        maxCapacity: parseInt(data.maxCapacity)
      }
    });
  }

  async deleteSchedule(id) {
    await prisma.doctorSchedule.delete({ where: { id } });
    return true;
  }

  // APPOINTMENTS
  async getAllAppointments({ skip, take }) {
    const [total, appointments] = await Promise.all([
      prisma.appointment.count(),
      prisma.appointment.findMany({
        skip, take,
        include: {
          patient: { include: { person: { select: { fullName: true } } } },
          doctor: { include: { person: { select: { fullName: true } } } },
          schedule: { include: { room: true } }
        },
        orderBy: { appointmentDate: 'desc' }
      })
    ]);
    return { total, appointments };
  }

  async getAppointmentById(id) {
    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        patient: { include: { person: true } },
        doctor: { include: { person: true } },
        schedule: { include: { room: true } },
        medicalRecord: true
      }
    });
    if (!appointment) throw new NotFoundError('Appointment');
    return appointment;
  }

  async createAppointment(data) {
    // Logic usually complex (check availability etc), but for Admin create we might force it?
    // Minimal implementation for now
    return prisma.appointment.create({
      data: {
        patientId: parseInt(data.patientId),
        doctorId: parseInt(data.doctorId),
        scheduleId: parseInt(data.scheduleId),
        appointmentDate: new Date(data.appointmentDate),
        appointmentType: data.appointmentType,
        status: data.status || 'Pending',
        feePaid: parseFloat(data.feePaid || 0)
      }
    });
  }

  async updateAppointment(id, data) {
    return prisma.appointment.update({
      where: { id },
      data: {
        status: data.status,
        feePaid: data.feePaid ? parseFloat(data.feePaid) : undefined,
        appointmentDate: data.appointmentDate ? new Date(data.appointmentDate) : undefined
      }
    });
  }

  async deleteAppointment(id) {
    await prisma.appointment.delete({ where: { id } });
    return true;
  }

  // MEDICAL RECORDS
  async getAllMedicalRecords({ skip, take }) {
    const [total, records] = await Promise.all([
      prisma.medicalRecord.count(),
      prisma.medicalRecord.findMany({
        skip, take,
        include: {
          appointment: {
             include: {
                 patient: { include: { person: { select: { fullName: true } } } },
                 doctor: { include: { person: { select: { fullName: true } } } }
             }
          }
        },
        orderBy: { id: 'desc' }
      })
    ]);
    return { total, records };
  }

  async getMedicalRecordById(id) {
    const record = await prisma.medicalRecord.findUnique({
      where: { id },
      include: { appointment: true }
    });
    if (!record) throw new NotFoundError('Medical record');
    return record;
  }

  async createMedicalRecord(data) {
    return prisma.medicalRecord.create({
      data: {
        appointmentId: parseInt(data.appointmentId),
        diagnosis: data.diagnosis,
        prescription: data.prescription,
        notes: data.notes
      }
    });
  }

  async updateMedicalRecord(id, data) {
    return prisma.medicalRecord.update({
      where: { id },
      data: {
        diagnosis: data.diagnosis,
        prescription: data.prescription,
        notes: data.notes
      }
    });
  }

  async deleteMedicalRecord(id) {
    await prisma.medicalRecord.delete({ where: { id } });
    return true;
  }


}

module.exports = new AdminService();
