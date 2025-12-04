const prisma = require('../../config/database');

class AnalyticsService {
  /**
   * Count total appointments
   */
  async countTotalAppointments() {
    return await prisma.appointment.count();
  }

  /**
   * Count total doctors
   */
  async countTotalDoctors() {
    return await prisma.doctor.count();
  }

  /**
   * Count total patients
   */
  async countTotalPatients() {
    return await prisma.patient.count();
  }

  /**
   * Count appointments by status
   */
  async countAppointmentsByStatus(status) {
    return await prisma.appointment.count({
      where: { status }
    });
  }

  /**
   * Get appointment stats for doctor
   */
  async getAppointmentStatsForDoctor(doctorId) {
    const stats = await prisma.appointment.groupBy({
      by: ['status'],
      where: { doctorId },
      _count: {
        id: true
      }
    });

    return stats.map(stat => ({
      status: stat.status,
      count: stat._count.id
    }));
  }

  /**
   * Get dashboard stats
   */
  async getDashboardStats() {
    const [
      totalAppointments,
      totalDoctors,
      totalPatients,
      pendingAppointments,
      confirmedAppointments,
      completedAppointments
    ] = await Promise.all([
      this.countTotalAppointments(),
      this.countTotalDoctors(),
      this.countTotalPatients(),
      this.countAppointmentsByStatus('Pending'),
      this.countAppointmentsByStatus('Confirmed'),
      this.countAppointmentsByStatus('Completed')
    ]);

    return {
      totalAppointments,
      totalDoctors,
      totalPatients,
      appointmentsByStatus: {
        pending: pendingAppointments,
        confirmed: confirmedAppointments,
        completed: completedAppointments
      }
    };
  }

  /**
   * Get patient stats
   */
  async getPatientStats(patientId) {
    const [
      totalAppointments,
      completedAppointments,
      totalRecords
    ] = await Promise.all([
      prisma.appointment.count({ where: { patientId } }),
      prisma.appointment.count({ where: { patientId, status: 'Completed' } }),
      prisma.medicalRecord.count({
        where: {
          appointment: { patientId }
        }
      })
    ]);

    return {
      totalAppointments,
      completedAppointments,
      totalRecords
    };
  }

  /**
   * Get doctor stats
   */
  async getDoctorStats(doctorId) {
    const [
      totalAppointments,
      completedAppointments,
      totalPatients
    ] = await Promise.all([
      prisma.appointment.count({ where: { doctorId } }),
      prisma.appointment.count({ where: { doctorId, status: 'Completed' } }),
      prisma.appointment.findMany({
        where: { doctorId },
        distinct: ['patientId']
      }).then(appointments => appointments.length)
    ]);

    return {
      totalAppointments,
      completedAppointments,
      totalPatients
    };
  }
}

module.exports = new AnalyticsService();
