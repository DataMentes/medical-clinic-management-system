const prisma = require('../../config/database');

class MedicalRecordService {
  /**
   * Create medical record
   * @param data {appointmentId, diagnosis, prescription, notes}
   */
  async create(data) {
    return await prisma.medicalRecord.create({
      data: {
        appointmentId: data.appointmentId,
        diagnosis: data.diagnosis,
        prescription: data.prescription,
        notes: data.notes || null
      },
      include: {
        appointment: {
          include: {
            patient: {
              include: {
                person: true
              }
            },
            doctor: {
              include: {
                person: true
              }
            }
          }
        }
      }
    });
  }

  /**
   * Get medical record by ID
   */
  async getById(recordId) {
    return await prisma.medicalRecord.findUnique({
      where: { id: recordId },
      include: {
        appointment: {
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
            }
          }
        }
      }
    });
  }

  /**
   * Get medical records for patient
   */
  async getByPatient(patientId) {
    return await prisma.medicalRecord.findMany({
      where: {
        appointment: {
          patientId
        }
      },
      include: {
        appointment: {
          include: {
            doctor: {
              include: {
                person: true,
                specialty: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  /**
   * Get medical record for appointment
   */
  async getByAppointment(appointmentId) {
    return await prisma.medicalRecord.findUnique({
      where: { appointmentId },
      include: {
        appointment: {
          include: {
            patient: {
              include: {
                person: true
              }
            },
            doctor: {
              include: {
                person: true
              }
            }
          }
        }
      }
    });
  }

  /**
   * Update medical record
   */
  async update(recordId, data) {
    return await prisma.medicalRecord.update({
      where: { id: recordId },
      data: {
        diagnosis: data.diagnosis,
        prescription: data.prescription,
        notes: data.notes
      }
    });
  }

  /**
   * Delete medical record
   */
  async delete(recordId) {
    return await prisma.medicalRecord.delete({
      where: { id: recordId }
    });
  }
}

module.exports = new MedicalRecordService();
