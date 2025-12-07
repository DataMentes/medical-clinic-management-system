const adminService = require('../services/admin/admin.service');
const analyticsService = require('../services/admin/analytics.service');

class AdminController {
  
  // ==================== DASHBOARD ====================

  async getStats(req, res, next) {
    try {
      const data = await adminService.getStats();
      return res.json({ success: true, data });
    } catch (error) {
      if (error.statusCode) return res.status(error.statusCode).json({ success: false, error: error.message });
      next(error);
    }
  }

  // ==================== SPECIALTY MANAGEMENT ====================
  
  async getAllSpecialties(req, res, next) {
    try {
      const { page = 1, limit = 20, search = '' } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const take = parseInt(limit);

      const { total, specialties } = await adminService.getAllSpecialties({ skip, take, search });
      
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
      next(error);
    }
  }

  async getSpecialtyById(req, res, next) {
    try {
      const data = await adminService.getSpecialtyById(parseInt(req.params.id));
      if (!data) return res.status(404).json({ success: false, error: 'Specialty not found' });
      return res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async createSpecialty(req, res, next) {
    try {
      const { name } = req.body;
      if (!name) return res.status(400).json({ success: false, error: 'Specialty name is required' });

      const data = await adminService.createSpecialty(name);
      return res.status(201).json({ success: true, message: 'Specialty created successfully', data });
    } catch (error) {
      if (error.statusCode) return res.status(error.statusCode).json({ success: false, error: error.message });
      next(error);
    }
  }

  async updateSpecialty(req, res, next) {
    try {
      const { name } = req.body;
      if (!name) return res.status(400).json({ success: false, error: 'Specialty name is required' });

      const data = await adminService.updateSpecialty(parseInt(req.params.id), name);
      return res.json({ success: true, message: 'Specialty updated successfully', data });
    } catch (error) {
      if (error.statusCode) return res.status(error.statusCode).json({ success: false, error: error.message });
      next(error);
    }
  }

  async deleteSpecialty(req, res, next) {
    try {
      await adminService.deleteSpecialty(parseInt(req.params.id));
      return res.json({ success: true, message: 'Specialty deleted successfully' });
    } catch (error) {
      if (error.statusCode) return res.status(error.statusCode).json({ success: false, error: error.message });
      next(error);
    }
  }

  // ==================== ROOM MANAGEMENT ====================

  async getAllRooms(req, res, next) {
    try {
      const { page = 1, limit = 20, search = '' } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const take = parseInt(limit);

      const { total, rooms } = await adminService.getAllRooms({ skip, take, search });
      
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
      next(error);
    }
  }

  async getRoomById(req, res, next) {
    try {
      const data = await adminService.getRoomById(parseInt(req.params.id));
      if (!data) return res.status(404).json({ success: false, error: 'Room not found' });
      return res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async createRoom(req, res, next) {
    try {
      const { roomName } = req.body;
      if (!roomName) return res.status(400).json({ success: false, error: 'Room name is required' });

      const data = await adminService.createRoom(roomName);
      return res.status(201).json({ success: true, message: 'Room created successfully', data });
    } catch (error) {
      if (error.statusCode) return res.status(error.statusCode).json({ success: false, error: error.message });
      next(error);
    }
  }

  async updateRoom(req, res, next) {
    try {
      const { roomName } = req.body;
      if (!roomName) return res.status(400).json({ success: false, error: 'Room name is required' });

      const data = await adminService.updateRoom(parseInt(req.params.id), roomName);
      return res.json({ success: true, message: 'Room updated successfully', data });
    } catch (error) {
      if (error.statusCode) return res.status(error.statusCode).json({ success: false, error: error.message });
      next(error);
    }
  }

  async deleteRoom(req, res, next) {
    try {
      await adminService.deleteRoom(parseInt(req.params.id));
      return res.json({ success: true, message: 'Room deleted successfully' });
    } catch (error) {
      if (error.statusCode) return res.status(error.statusCode).json({ success: false, error: error.message });
      next(error);
    }
  }

  // ==================== PATIENT MANAGEMENT ====================

  async getAllPatients(req, res, next) {
    try {
      const { page = 1, limit = 20, search = '' } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const take = parseInt(limit);

      const { total, patients } = await adminService.getAllPatients({ skip, take, search });

      return res.json({
        success: true,
        data: {
          patients,
          pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / parseInt(limit))
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async getPatientById(req, res, next) {
    try {
      const data = await adminService.getPatientById(parseInt(req.params.id));
      return res.json({ success: true, data });
    } catch (error) {
      if (error.statusCode) return res.status(error.statusCode).json({ success: false, error: error.message });
      next(error);
    }
  }

  async createPatient(req, res, next) {
    try {
      const { email, password, fullName, phoneNumber, gender, yearOfBirth } = req.body;
      // Basic check
      if (!email || !password || !fullName) return res.status(400).json({ success: false, error: 'Mandatory fields missing' });

      const data = await adminService.createPatient(req.body);
      return res.status(201).json({ success: true, message: 'Patient created successfully', data: data.user });
    } catch (error) {
      if (error.statusCode) return res.status(error.statusCode).json({ success: false, error: error.message });
      next(error);
    }
  }
  
  // Note: Previous controller handled updatePatient? 
  // I didn't see explicit updatePatient in file view, likely minimal or handled elsewhere?
  async updatePatient(req, res, next) {
    try {
      const { id } = req.params;
      await adminService.updatePatient(parseInt(id), req.body);
      return res.json({ success: true, message: 'Patient updated successfully' });
    } catch (error) {
      if (error.statusCode) return res.status(error.statusCode).json({ success: false, error: error.message });
      next(error);
    }
  }

  async deletePatient(req, res, next) {
    try {
      const { id } = req.params;
      await adminService.deleteUserEntity(parseInt(id), 'patient');
      return res.json({ success: true, message: 'Patient deleted successfully' });
    } catch (error) {
       if (error.statusCode) return res.status(error.statusCode).json({ success: false, error: error.message });
       next(error);
    }
  }

  // ==================== DOCTOR MANAGEMENT ====================

  async getAllDoctors(req, res, next) {
    try {
      const { page = 1, limit = 20, search = '' } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const take = parseInt(limit);

      const { total, doctors } = await adminService.getAllDoctors({ skip, take, search });
      
      return res.json({
        success: true,
        data: {
          doctors,
          pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / parseInt(limit))
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async getDoctorById(req, res, next) {
    try {
      const data = await adminService.getDoctorById(parseInt(req.params.id));
      return res.json({ success: true, data });
    } catch (error) {
      if (error.statusCode) return res.status(error.statusCode).json({ success: false, error: error.message });
      next(error);
    }
  }

  async createDoctor(req, res, next) {
    try {
      const { email, password, fullName, phoneNumber, specialtyId } = req.body;
      if (!email || !password || !fullName || !specialtyId) {
        return res.status(400).json({ success: false, error: 'Mandatory fields missing' });
      }

      const data = await adminService.createDoctor(req.body);
      return res.status(201).json({ success: true, message: 'Doctor created successfully', data: data.user });
    } catch (error) {
      if (error.statusCode) return res.status(error.statusCode).json({ success: false, error: error.message });
      next(error);
    }
  }

  async updateDoctor(req, res, next) {
    try {
      const { id } = req.params;
      const data = await adminService.updateDoctor(parseInt(id), req.body);
      return res.json({ success: true, message: 'Doctor updated successfully' });
    } catch (error) {
      if (error.statusCode) return res.status(error.statusCode).json({ success: false, error: error.message });
      next(error);
    }
  }

  async deleteDoctor(req, res, next) {
    try {
      const { id } = req.params;
      await adminService.deleteUserEntity(parseInt(id), 'doctor');
      return res.json({ success: true, message: 'Doctor deleted successfully' });
    } catch (error) {
      if (error.statusCode) return res.status(error.statusCode).json({ success: false, error: error.message });
      next(error);
    }
  }

  // ==================== RECEPTIONIST MANAGEMENT ====================

  async getAllReceptionists(req, res, next) {
    try {
      const { page = 1, limit = 20, search = '' } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const take = parseInt(limit);

      const { total, receptionists } = await adminService.getAllReceptionists({ skip, take, search });
      
      return res.json({
        success: true,
        data: {
          receptionists,
          pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / parseInt(limit))
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async createReceptionist(req, res, next) {
    try {
      const { email, password, fullName } = req.body;
      if (!email || !password || !fullName) {
        return res.status(400).json({ success: false, error: 'Mandatory fields missing' });
      }

      const data = await adminService.createReceptionist(req.body);
      return res.status(201).json({ success: true, message: 'Receptionist created successfully', data: data.user });
    } catch (error) {
      if (error.statusCode) return res.status(error.statusCode).json({ success: false, error: error.message });
      next(error);
    }
  }

  async deleteReceptionist(req, res, next) {
    try {
      const { id } = req.params;
      // Receptionist ID logic: previously we decided we treat it as UserID
      // because getAllReceptionists returns userId as id.
      await adminService.deleteUserEntity(parseInt(id), 'user');
      return res.json({ success: true, message: 'Receptionist deleted successfully' });
    } catch (error) {
      if (error.statusCode) return res.status(error.statusCode).json({ success: false, error: error.message });
      next(error);
    }
  }

  async getReceptionistById(req, res, next) {
    try {
      const data = await adminService.getReceptionistById(parseInt(req.params.id));
      return res.json({ success: true, data });
    } catch (error) {
      if (error.statusCode) return res.status(error.statusCode).json({ success: false, error: error.message });
      next(error);
    }
  }

  async updateReceptionist(req, res, next) {
    try {
      const { id } = req.params;
      await adminService.updateReceptionist(parseInt(id), req.body);
      return res.json({ success: true, message: 'Receptionist updated successfully' });
    } catch (error) {
       if (error.statusCode) return res.status(error.statusCode).json({ success: false, error: error.message });
       next(error);
    }
  }

  // ==================== ADMIN MANAGEMENT ====================

  async getAllAdmins(req, res, next) {
    try {
      const { page = 1, limit = 20, search = '' } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const take = parseInt(limit);
      const { total, admins } = await adminService.getAllAdmins({ skip, take, search });
      return res.json({ success: true, data: { admins, pagination: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / parseInt(limit)) } } });
    } catch (error) { next(error); }
  }

  async createAdmin(req, res, next) {
    try {
      const { email } = req.body;
      if (!email) return res.status(400).json({ success: false, error: 'Email required' });
      const data = await adminService.createAdmin(req.body);
      return res.status(201).json({ success: true, message: 'Admin created', data: data.user });
    } catch (error) {
       if (error.statusCode) return res.status(error.statusCode).json({ success: false, error: error.message });
       next(error);
    }
  }

  async updateAdmin(req, res, next) {
    try {
      await adminService.updateAdmin(parseInt(req.params.id), req.body);
      return res.json({ success: true, message: 'Admin updated' });
    } catch (error) {
      if (error.statusCode) return res.status(error.statusCode).json({ success: false, error: error.message });
      next(error);
    }
  }

  async deleteAdmin(req, res, next) {
    try {
      await adminService.deleteAdmin(parseInt(req.params.id));
      return res.json({ success: true, message: 'Admin deleted' });
    } catch (error) {
      if (error.statusCode) return res.status(error.statusCode).json({ success: false, error: error.message });
      next(error);
    }
  }

  // ==================== SCHEDULES ====================

  async getAllSchedules(req, res, next) {
    try {
      const { page = 1, limit = 20 } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const take = parseInt(limit);
      const { total, schedules } = await adminService.getAllSchedules({ skip, take });
      return res.json({ success: true, data: { schedules, pagination: { total, page: parseInt(page), limit: parseInt(limit) } } });
    } catch (error) { next(error); }
  }

  async getScheduleById(req, res, next) {
    try {
       const data = await adminService.getScheduleById(parseInt(req.params.id));
       return res.json({ success: true, data });
    } catch (error) {
       if (error.statusCode) return res.status(error.statusCode).json({ success: false, error: error.message });
       next(error);
    }
  }

  async createSchedule(req, res, next) {
    try {
       const data = await adminService.createSchedule(req.body);
       return res.status(201).json({ success: true, message: 'Schedule created', data });
    } catch (error) {
       if (error.statusCode) return res.status(error.statusCode).json({ success: false, error: error.message });
       next(error);
    }
  }

  async updateSchedule(req, res, next) {
    try {
       const data = await adminService.updateSchedule(parseInt(req.params.id), req.body);
       return res.json({ success: true, message: 'Schedule updated', data });
    } catch (error) {
       if (error.statusCode) return res.status(error.statusCode).json({ success: false, error: error.message });
       next(error);
    }
  }

  async deleteSchedule(req, res, next) {
    try {
       await adminService.deleteSchedule(parseInt(req.params.id));
       return res.json({ success: true, message: 'Schedule deleted' });
    } catch (error) {
       if (error.statusCode) return res.status(error.statusCode).json({ success: false, error: error.message });
       next(error);
    }
  }

  // ==================== APPOINTMENTS ====================

  async getAllAppointments(req, res, next) {
    try {
       const { page = 1, limit = 20 } = req.query;
       const skip = (parseInt(page) - 1) * parseInt(limit);
       const take = parseInt(limit);
       const { total, appointments } = await adminService.getAllAppointments({ skip, take });
       return res.json({ success: true, data: { appointments, pagination: { total, page: parseInt(page), limit: parseInt(limit) } } });
    } catch (error) { next(error); }
  }

  async getAppointmentById(req, res, next) {
    try {
       const data = await adminService.getAppointmentById(parseInt(req.params.id));
       return res.json({ success: true, data });
    } catch (error) {
       if (error.statusCode) return res.status(error.statusCode).json({ success: false, error: error.message });
       next(error);
    }
  }

  async createAppointment(req, res, next) {
    try {
       const data = await adminService.createAppointment(req.body);
       return res.status(201).json({ success: true, message: 'Appointment created', data });
    } catch (error) {
       if (error.statusCode) return res.status(error.statusCode).json({ success: false, error: error.message });
       next(error);
    }
  }

  async updateAppointment(req, res, next) {
    try {
       const data = await adminService.updateAppointment(parseInt(req.params.id), req.body);
       return res.json({ success: true, message: 'Appointment updated', data });
    } catch (error) {
       if (error.statusCode) return res.status(error.statusCode).json({ success: false, error: error.message });
       next(error);
    }
  }

  async deleteAppointment(req, res, next) {
    try {
       await adminService.deleteAppointment(parseInt(req.params.id));
       return res.json({ success: true, message: 'Appointment deleted' });
    } catch (error) {
       if (error.statusCode) return res.status(error.statusCode).json({ success: false, error: error.message });
       next(error);
    }
  }

  // ==================== MEDICAL RECORDS ====================

  async getAllMedicalRecords(req, res, next) {
    try {
       const { page = 1, limit = 20 } = req.query;
       const skip = (parseInt(page) - 1) * parseInt(limit);
       const take = parseInt(limit);
       const { total, records } = await adminService.getAllMedicalRecords({ skip, take });
       return res.json({ success: true, data: { records, pagination: { total, page: parseInt(page), limit: parseInt(limit) } } });
    } catch (error) { next(error); }
  }

  async getMedicalRecordById(req, res, next) {
    try {
       const data = await adminService.getMedicalRecordById(parseInt(req.params.id));
       return res.json({ success: true, data });
    } catch (error) {
       if (error.statusCode) return res.status(error.statusCode).json({ success: false, error: error.message });
       next(error);
    }
  }

  async createMedicalRecord(req, res, next) {
     try {
       const data = await adminService.createMedicalRecord(req.body);
       return res.status(201).json({ success: true, message: 'Record created', data });
    } catch (error) {
       if (error.statusCode) return res.status(error.statusCode).json({ success: false, error: error.message });
       next(error);
    }
  }

  async updateMedicalRecord(req, res, next) {
    try {
       const data = await adminService.updateMedicalRecord(parseInt(req.params.id), req.body);
       return res.json({ success: true, message: 'Record updated', data });
    } catch (error) {
       if (error.statusCode) return res.status(error.statusCode).json({ success: false, error: error.message });
       next(error);
    }
  }

  async deleteMedicalRecord(req, res, next) {
    try {
       await adminService.deleteMedicalRecord(parseInt(req.params.id));
       return res.json({ success: true, message: 'Record deleted' });
    } catch (error) {
       if (error.statusCode) return res.status(error.statusCode).json({ success: false, error: error.message });
       next(error);
    }
  }

  // ==================== REPORTS ====================

  async getAppointmentsReport(req, res, next) {
    try {
      const { startDate, endDate } = req.query;
      if (!startDate || !endDate) {
        return res.status(400).json({ 
          success: false, 
          error: 'startDate and endDate are required' 
        });
      }
      const report = await analyticsService.getAppointmentsReport(startDate, endDate);
      return res.json({ success: true, data: report });
    } catch (error) {
      console.error('Appointments report error:', error);
      next(error);
    }
  }

  async getPatientsReport(req, res, next) {
    try {
      const { startDate, endDate } = req.query;
      if (!startDate || !endDate) {
        return res.status(400).json({ 
          success: false, 
          error: 'startDate and endDate are required' 
        });
      }
      const report = await analyticsService.getPatientsReport(startDate, endDate);
      return res.json({ success: true, data: report });
    } catch (error) {
      console.error('Patients report error:', error);
      next(error);
    }
  }

  async getDoctorsReport(req, res, next) {
    try {
      const { startDate, endDate } = req.query;
      if (!startDate || !endDate) {
        return res.status(400).json({ 
          success: false, 
          error: 'startDate and endDate are required' 
        });
      }
      const report = await analyticsService.getDoctorsReport(startDate, endDate);
      return res.json({ success: true, data: report });
    } catch (error) {
      console.error('Doctors report error:', error);
      next(error);
    }
  }

  async getRevenueReport(req, res, next) {
    try {
      const { startDate, endDate } = req.query;
      if (!startDate || !endDate) {
        return res.status(400).json({ 
          success: false, 
          error: 'startDate and endDate are required' 
        });
      }
      const report = await analyticsService.getRevenueReport(startDate, endDate);
      return res.json({ success: true, data: report });
    } catch (error) {
      console.error('Revenue report error:', error);
      next(error);
    }
  }

  async getSpecialtyReport(req, res, next) {
    try {
      const { startDate, endDate } = req.query;
      if (!startDate || !endDate) {
        return res.status(400).json({ 
          success: false, 
          error: 'startDate and endDate are required' 
        });
      }
      const report = await analyticsService.getSpecialtyReport(startDate, endDate);
      return res.json({ success: true, data: report });
    } catch (error) {
      console.error('Specialty report error:', error);
      next(error);
    }
  }

}

module.exports = new AdminController();
