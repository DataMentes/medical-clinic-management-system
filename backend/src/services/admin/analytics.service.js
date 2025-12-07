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

  /**
   * Helper to format time from database time value
   */
  formatTime(timeValue) {
    if (!timeValue) return '00:00';
    return String(timeValue).slice(0, 5);
  }

  /**
   * Helper to get day name from date
   */
  getDayName(date) {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[new Date(date).getDay()];
  }

  /**
   * Generate Appointments Report
   * Groups appointments by day of week within date range
   */
  async getAppointmentsReport(startDate, endDate) {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const appointments = await prisma.appointment.findMany({
      where: {
        appointmentDate: {
          gte: start,
          lte: end
        },
        status: { not: 'Canceled' }
      },
      select: {
        appointmentDate: true
      }
    });

    // Group by day of week
    const dayGroups = {
      Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0
    };

    appointments.forEach(appt => {
      const dayName = this.getDayName(appt.appointmentDate);
      dayGroups[dayName]++;
    });

    const data = Object.entries(dayGroups).map(([label, value]) => ({
      label,
      value
    }));

    const total = appointments.length;
    const average = total > 0 ? Math.round(total / 7) : 0;
    const peak = data.reduce((max, d) => d.value > max.value ? d : max, data[0]);

    return {
      reportType: 'Appointments Report',
      dateRange: { startDate, endDate },
      data,
      summary: {
        total,
        average,
        peak: { label: peak.label, value: peak.value }
      },
      generatedAt: new Date().toISOString()
    };
  }

  /**
   * Generate Patients Report
   * Shows new patient registrations over time
   */
  async getPatientsReport(startDate, endDate) {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const patients = await prisma.patient.findMany({
      where: {
        person: {
          user: {
            registerDate: {
              gte: start,
              lte: end
            }
          }
        }
      },
      include: {
        person: {
          include: {
            user: true
          }
        }
      }
    });

    // Group by day of week
    const dayGroups = {
      Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0
    };

    patients.forEach(patient => {
      if (patient.person?.user?.registerDate) {
        const dayName = this.getDayName(patient.person.user.registerDate);
        dayGroups[dayName]++;
      }
    });

    const data = Object.entries(dayGroups).map(([label, value]) => ({
      label,
      value
    }));

    const total = patients.length;
    const average = total > 0 ? Math.round(total / 7) : 0;
    const peak = data.reduce((max, d) => d.value > max.value ? d : max, data[0]);

    return {
      reportType: 'Patients Report',
      dateRange: { startDate, endDate },
      data,
      summary: {
        total,
        average,
        peak: { label: peak.label, value: peak.value }
      },
      generatedAt: new Date().toISOString()
    };
  }

  /**
   * Generate Doctors Report
   * Shows appointments handled by each doctor
   */
  async getDoctorsReport(startDate, endDate) {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const appointmentsByDoctor = await prisma.appointment.groupBy({
      by: ['doctorId'],
      where: {
        appointmentDate: {
          gte: start,
          lte: end
        },
        status: { not: 'Canceled' }
      },
      _count: {
        id: true
      }
    });

    // Get doctor names
    const doctorIds = appointmentsByDoctor.map(d => d.doctorId);
    const doctors = await prisma.doctor.findMany({
      where: {
        id: { in: doctorIds }
      },
      include: {
        person: {
          select: { fullName: true }
        }
      }
    });

    const doctorMap = {};
    doctors.forEach(doctor => {
      doctorMap[doctor.id] = doctor.person.fullName;
    });

    const data = appointmentsByDoctor.map(item => ({
      label: doctorMap[item.doctorId] || `Doctor ${item.doctorId}`,
      value: item._count.id,
      metadata: { doctorId: item.doctorId }
    }));

    const total = data.reduce((sum, d) => sum + d.value, 0);
    const average = data.length > 0 ? Math.round(total / data.length) : 0;
    const peak = data.length > 0 ? data.reduce((max, d) => d.value > max.value ? d : max, data[0]) : { label: 'N/A', value: 0 };

    return {
      reportType: 'Doctors Report',
      dateRange: { startDate, endDate },
      data,
      summary: {
        total,
        average,
        peak: { label: peak.label, value: peak.value }
      },
      generatedAt: new Date().toISOString()
    };
  }

  /**
   * Generate Revenue Report
   * Shows revenue from examination vs consultation fees
   */
  async getRevenueReport(startDate, endDate) {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const appointments = await prisma.appointment.findMany({
      where: {
        appointmentDate: {
          gte: start,
          lte: end
        },
        status: 'Completed'
      },
      include: {
        doctor: {
          select: {
            examinationFee: true,
            consultationFee: true
          }
        }
      }
    });

    // Group by day and appointment type
    const dayGroups = {
      Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0
    };

    let totalRevenue = 0;

    appointments.forEach(appt => {
      const dayName = this.getDayName(appt.appointmentDate);
      const fee = appt.appointmentType === 'Examination' 
        ? Number(appt.doctor.examinationFee)
        : Number(appt.doctor.consultationFee);
      
      dayGroups[dayName] += fee;
      totalRevenue += fee;
    });

    const data = Object.entries(dayGroups).map(([label, value]) => ({
      label,
      value: Math.round(value)
    }));

    const average = data.length > 0 ? Math.round(totalRevenue / 7) : 0;
    const peak = data.reduce((max, d) => d.value > max.value ? d : max, data[0]);

    return {
      reportType: 'Revenue Report',
      dateRange: { startDate, endDate },
      data,
      summary: {
        total: Math.round(totalRevenue),
        average,
        peak: { label: peak.label, value: peak.value }
      },
      generatedAt: new Date().toISOString()
    };
  }

  /**
   * Generate Specialty Report
   * Shows distribution of appointments across specialties
   */
  async getSpecialtyReport(startDate, endDate) {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const appointments = await prisma.appointment.findMany({
      where: {
        appointmentDate: {
          gte: start,
          lte: end
        },
        status: { not: 'Canceled' }
      },
      include: {
        doctor: {
          include: {
            specialty: {
              select: { name: true }
            }
          }
        }
      }
    });

    // Group by specialty
    const specialtyGroups = {};

    appointments.forEach(appt => {
      const specialtyName = appt.doctor.specialty?.name || 'Unknown';
      if (!specialtyGroups[specialtyName]) {
        specialtyGroups[specialtyName] = 0;
      }
      specialtyGroups[specialtyName]++;
    });

    const data = Object.entries(specialtyGroups).map(([label, value]) => ({
      label,
      value
    }));

    const total = appointments.length;
    const average = data.length > 0 ? Math.round(total / data.length) : 0;
    const peak = data.length > 0 ? data.reduce((max, d) => d.value > max.value ? d : max, data[0]) : { label: 'N/A', value: 0 };

    return {
      reportType: 'Specialty Report',
      dateRange: { startDate, endDate },
      data,
      summary: {
        total,
        average,
        peak: { label: peak.label, value: peak.value }
      },
      generatedAt: new Date().toISOString()
    };
  }
}

module.exports = new AnalyticsService();
