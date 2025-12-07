const prisma = require('../../config/database');

class ScheduleService {
  /**
   * Create doctor schedule
   * @param data {doctorId, weekDay, roomId, startTime, endTime, maxCapacity}
   */
  async create(data) {
    return await prisma.doctorSchedule.create({
      data: {
        doctorId: data.doctorId,
        weekDay: data.weekDay,
        roomId: data.roomId,
        startTime: data.startTime,
        endTime: data.endTime,
        maxCapacity: data.maxCapacity
      },
      include: {
        doctor: {
          include: {
            person: true
          }
        },
        room: true
      }
    });
  }

  /**
   * Get schedules for doctor
   */
  async getByDoctor(doctorId) {
    return await prisma.doctorSchedule.findMany({
      where: { doctorId },
      include: {
        room: true
      },
      orderBy: [
        { weekDay: 'asc' },
        { startTime: 'asc' }
      ]
    });
  }

  /**
   * Get schedule by ID
   */
  async getById(scheduleId) {
    return await prisma.doctorSchedule.findUnique({
      where: { id: scheduleId },
      include: {
        doctor: {
          include: {
            person: true,
            specialty: true
          }
        },
        room: true
      }
    });
  }

  /**
   * Get doctor schedule by day
   */
  async getByDoctorAndDay(doctorId, weekDay) {
    return await prisma.doctorSchedule.findMany({
      where: {
        doctorId,
        weekDay
      },
      include: {
        room: true
      },
      orderBy: {
        startTime: 'asc'
      }
    });
  }

  /**
   * Update schedule
   */
  async update(scheduleId, data) {
    return await prisma.doctorSchedule.update({
      where: { id: scheduleId },
      data: {
        startTime: data.startTime,
        endTime: data.endTime,
        maxCapacity: data.maxCapacity,
        roomId: data.roomId
      }
    });
  }

  /**
   * Delete schedule
   */
  async delete(scheduleId) {
    return await prisma.doctorSchedule.delete({
      where: { id: scheduleId }
    });
  }

  /**
   * Get all schedules
   */
  async getAll() {
    return await prisma.doctorSchedule.findMany({
      include: {
        doctor: {
          include: {
            person: true,
            specialty: true
          }
        },
        room: true
      },
      orderBy: [
        { weekDay: 'asc' },
        { startTime: 'asc' }
      ]
    });
  }
}

module.exports = new ScheduleService();
