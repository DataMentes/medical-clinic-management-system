import apiClient from './client.js';

/**
 * Admin API Endpoints
 * جميع الـ endpoints الخاصة بلوحة تحكم الـ Admin
 */

// ==================== DASHBOARD STATS ====================

/**
 * الحصول على إحصائيات Dashboard
 * @returns {Promise<Object>} { totalPatients, totalDoctors, totalAppointments, totalSpecialties }
 */
export async function getStats() {
  try {
    const response = await apiClient.get('/admin/stats');
    return response;
  } catch (error) {
    throw error;
  }
}

// ==================== SPECIALTIES ====================

/**
 * الحصول على جميع التخصصات مع pagination
 * @param {number} page - رقم الصفحة (default: 1)
 * @param {number} limit - عدد العناصر في الصفحة (default: 20)
 * @param {string} search - نص البحث (optional)
 * @returns {Promise<Object>} { data: { specialties, pagination } }
 */
export async function getAllSpecialties(page = 1, limit = 20, search = '') {
  try {
    const params = { page, limit };
    if (search) params.search = search;
    
    const response = await apiClient.get('/admin/specialties', { params });
    return response;
  } catch (error) {
    throw error;
  }
}

/**
 * الحصول على تخصص واحد بالـ ID
 */
export async function getSpecialtyById(id) {
  try {
    const response = await apiClient.get(`/admin/specialties/${id}`);
    return response;
  } catch (error) {
    throw error;
  }
}

/**
 * إضافة تخصص جديد
 */
export async function createSpecialty(data) {
  try {
    const response = await apiClient.post('/admin/specialties', { name: data.name });
    return response;
  } catch (error) {
    throw error;
  }
}

/**
 * تحديث تخصص
 */
export async function updateSpecialty(id, data) {
  try {
    const response = await apiClient.put(`/admin/specialties/${id}`, { name: data.name });
    return response;
  } catch (error) {
    throw error;
  }
}

/**
 * حذف تخصص
 */
export async function deleteSpecialty(id) {
  try {
    const response = await apiClient.delete(`/admin/specialties/${id}`);
    return response;
  } catch (error) {
    throw error;
  }
}

// ==================== ROOMS ====================

/**
 * الحصول على جميع الغرف مع pagination
 */
export async function getAllRooms(page = 1, limit = 20, search = '') {
  try {
    const params = { page, limit };
    if (search) params.search = search;
    
    const response = await apiClient.get('/admin/rooms', { params });
    return response;
  } catch (error) {
    throw error;
  }
}

/**
 * الحصول على غرفة واحدة بالـ ID
 */
export async function getRoomById(id) {
  try {
    const response = await apiClient.get(`/admin/rooms/${id}`);
    return response;
  } catch (error) {
    throw error;
  }
}

/**
 * إضافة غرفة جديدة
 */
export async function createRoom(data) {
  try {
    const response = await apiClient.post('/admin/rooms', { roomName: data.roomName });
    return response;
  } catch (error) {
    throw error;
  }
}

/**
 * تحديث غرفة
 */
export async function updateRoom(id, data) {
  try {
    const response = await apiClient.put(`/admin/rooms/${id}`, { roomName: data.roomName });
    return response;
  } catch (error) {
    throw error;
  }
}

/**
 * حذف غرفة
 */
export async function deleteRoom(id) {
  try {
    const response = await apiClient.delete(`/admin/rooms/${id}`);
    return response;
  } catch (error) {
    throw error;
  }
}

// ==================== DOCTORS ====================

/**
 * الحصول على جميع الأطباء
 */
export async function getAllDoctors(page = 1, limit = 20, search = '') {
  const params = { page, limit };
  if (search) params.search = search;
  
  const response = await apiClient.get('/admin/doctors', { params });
  return response; // Return full response, not response.data
}

/**
 * الحصول على طبيب بالـ ID
 */
export async function getDoctorById(id) {
  try {
    const response = await apiClient.get(`/admin/doctors/${id}`);
    return response;
  } catch (error) {
    throw error;
  }
}

/**
 * إضافة طبيب جديد
 */
export async function createDoctor(data) {
  // Map frontend fields to backend expectations
  const payload = {
    email: data.email,
    password: data.password,
    fullName: data.fullName,
    phoneNumber: data.phone, // phone → phoneNumber
    gender: data.gender,
    specialtyId: parseInt(data.specialtyId), // Must be integer ID
    examinationFee: parseFloat(data.examinationFee),
    consultationFee: parseFloat(data.consultationFee),
    biography: data.biography || ''
  };
  
  const response = await apiClient.post('/admin/doctors', payload);
  return response; // Return full response
}

/**
 * تحديث طبيب
 */
export async function updateDoctor(id, data) {
  const payload = {
    fullName: data.fullName,
    phoneNumber: data.phone, // phone → phoneNumber
    specialtyId: data.specialtyId ? parseInt(data.specialtyId) : undefined,
    examinationFee: data.examinationFee ? parseFloat(data.examinationFee) : undefined,
    consultationFee: data.consultationFee ? parseFloat(data.consultationFee) : undefined,
    biography: data.biography,
    active: data.active
  };
  
  // Only include password if provided
  if (data.password) {
    payload.password = data.password;
  }
  
  const response = await apiClient.put(`/admin/doctors/${id}`, payload);
  return response; // Return full response
}

/**
 * حذف طبيب
 */
export async function deleteDoctor(id) {
  try {
    const response = await apiClient.delete(`/admin/doctors/${id}`);
    return response;
  } catch (error) {
    throw error;
  }
}

// ==================== PATIENTS ====================

/**
 * الحصول على جميع المرضى
 */
export async function getAllPatients(page = 1, limit = 20, search = '') {
  const params = { page, limit };
  if (search) params.search = search;
  
  const response = await apiClient.get('/admin/patients', { params });
  return response;
}

/**
 * الحصول على مريض بالـ ID
 */
export async function getPatientById(id) {
  try {
    const response = await apiClient.get(`/admin/patients/${id}`);
    return response;
  } catch (error) {
    throw error;
  }
}

/**
 * إضافة مريض جديد
 */
export async function createPatient(data) {
  const payload = {
    email: data.email,
    password: data.password,
    fullName: data.fullName,
    phoneNumber: data.phone, // phone → phoneNumber
    gender: data.gender,
    yearOfBirth: parseInt(data.yearOfBirth)
  };
  
  const response = await apiClient.post('/admin/patients', payload);
  return response;
}

/**
 * تحديث مريض
 */
export async function updatePatient(id, data) {
  const payload = {
    fullName: data.fullName,
    phoneNumber: data.phone, // phone → phoneNumber
    gender: data.gender,
    yearOfBirth: data.yearOfBirth ? parseInt(data.yearOfBirth) : undefined,
    active: data.active
  };
  
  if (data.password) {
    payload.password = data.password;
  }
  
  const response = await apiClient.put(`/admin/patients/${id}`, payload);
  return response;
}

/**
 * حذف مريض
 */
export async function deletePatient(id) {
  try {
    const response = await apiClient.delete(`/admin/patients/${id}`);
    return response;
  } catch (error) {
    throw error;
  }
}

// ==================== RECEPTIONISTS ====================

/**
 * الحصول على جميع الموظفين
 */
export async function getAllReceptionists(page = 1, limit = 20, search = '') {
  const params = { page, limit };
  if (search) params.search = search;
  
  const response = await apiClient.get('/admin/receptionists', { params });
  return response;
}

/**
 * الحصول على موظف بالـ ID
 */
export async function getReceptionistById(id) {
  try {
    const response = await apiClient.get(`/admin/receptionists/${id}`);
    return response;
  } catch (error) {
    throw error;
  }
}

/**
 * إضافة موظف جديد
 */
export async function createReceptionist(data) {
  const payload = {
    email: data.email,
    password: data.password,
    fullName: data.fullName,
    phoneNumber: data.phone, // phone → phoneNumber
    gender: data.gender
  };
  
  const response = await apiClient.post('/admin/receptionists', payload);
  return response;
}

/**
 * تحديث موظف
 */
export async function updateReceptionist(id, data) {
  const payload = {
    fullName: data.fullName,
    phoneNumber: data.phone, // phone → phoneNumber
    active: data.active
  };
  
  if (data.password) {
    payload.password = data.password;
  }
  
  const response = await apiClient.put(`/admin/receptionists/${id}`, payload);
  return response;
}

/**
 * حذف موظف
 */
export async function deleteReceptionist(id) {
  try {
    const response = await apiClient.delete(`/admin/receptionists/${id}`);
    return response;
  } catch (error) {
    throw error;
  }
}

// ==================== ADMINS ====================

/**
 * الحصول على جميع المدراء
 */
export async function getAllAdmins(page = 1, limit = 20, search = '') {
  const params = { page, limit };
  if (search) params.search = search;
  
  const response = await apiClient.get('/admin/admins', { params });
  return response;
}

/**
 * إضافة مدير جديد
 */
export async function createAdmin(data) {
  const payload = {
    email: data.email,
    password: data.password,
    fullName: data.fullName,
    phoneNumber: data.phone, // phone → phoneNumber
    gender: data.gender
  };
  
  const response = await apiClient.post('/admin/admins', payload);
  return response;
}

/**
 * تحديث مدير
 */
export async function updateAdmin(id, data) {
  const payload = {
    fullName: data.fullName,
    phoneNumber: data.phone, // phone → phoneNumber
    active: data.active
  };
  
  if (data.password) {
    payload.password = data.password;
  }
  
  const response = await apiClient.put(`/admin/admins/${id}`, payload);
  return response;
}

/**
 * حذف مدير
 */
export async function deleteAdmin(id) {
  try {
    const response = await apiClient.delete(`/admin/admins/${id}`);
    return response;
  } catch (error) {
    throw error;
  }
}

// ==================== SCHEDULES ====================

/**
 * الحصول على جميع المواعيد
 */
export async function getAllSchedules(page = 1, limit = 20) {
  try {
    const params = { page, limit };
    const response = await apiClient.get('/admin/schedules', { params });
    return response;
  } catch (error) {
    throw error;
  }
}

/**
 * الحصول على موعد بالـ ID
 */
export async function getScheduleById(id) {
  try {
    const response = await apiClient.get(`/admin/schedules/${id}`);
    return response;
  } catch (error) {
    throw error;
  }
}

/**
 * إضافة موعد جديد
 */
export async function createSchedule(data) {
  try {
    const payload = {
      doctorId: parseInt(data.doctorId),
      roomId: parseInt(data.roomId),
      weekDay: data.weekDay,
      startTime: data.startTime, // Format: "HH:MM:SS"
      endTime: data.endTime,     // Format: "HH:MM:SS"
      maxCapacity: parseInt(data.maxCapacity)
    };
    
    const response = await apiClient.post('/admin/schedules', payload);
    return response;
  } catch (error) {
    throw error;
  }
}

/**
 * تحديث موعد
 */
export async function updateSchedule(id, data) {
  try {
    const payload = {
      doctorId: parseInt(data.doctorId),
      roomId: parseInt(data.roomId),
      weekDay: data.weekDay,
      startTime: data.startTime,
      endTime: data.endTime,
      maxCapacity: parseInt(data.maxCapacity)
    };
    
    const response = await apiClient.put(`/admin/schedules/${id}`, payload);
    return response;
  } catch (error) {
    throw error;
  }
}

/**
 * حذف موعد
 */
export async function deleteSchedule(id) {
  try {
    const response = await apiClient.delete(`/admin/schedules/${id}`);
    return response;
  } catch (error) {
    throw error;
  }
}

// ==================== APPOINTMENTS ====================

/**
 * الحصول على جميع المواعيد
 */
export async function getAllAppointments(page = 1, limit = 20) {
  try {
    const params = { page, limit };
    const response = await apiClient.get('/admin/appointments', { params });
    return response;
  } catch (error) {
    throw error;
  }
}

/**
 * الحصول على موعد بالـ ID
 */
export async function getAppointmentById(id) {
  try {
    const response = await apiClient.get(`/admin/appointments/${id}`);
    return response;
  } catch (error) {
    throw error;
  }
}

/**
 * إضافة موعد جديد
 */
export async function createAppointment(data) {
  try {
    const payload = {
      patientId: parseInt(data.patientId),
      doctorId: parseInt(data.doctorId),
      scheduleId: parseInt(data.scheduleId),
      appointmentDate: data.appointmentDate, // Format: "YYYY-MM-DD"
      appointmentType: data.appointmentType, // "Examination" or "Consultation"
      status: data.status || 'Pending'
    };
    
    const response = await apiClient.post('/admin/appointments', payload);
    return response;
  } catch (error) {
    throw error;
  }
}

/**
 * تحديث موعد
 */
export async function updateAppointment(id, data) {
  try {
    const payload = {
      status: data.status,
      appointmentDate: data.appointmentDate
    };
    
    const response = await apiClient.put(`/admin/appointments/${id}`, payload);
    return response;
  } catch (error) {
    throw error;
  }
}

/**
 * حذف موعد
 */
export async function deleteAppointment(id) {
  try {
    const response = await apiClient.delete(`/admin/appointments/${id}`);
    return response;
  } catch (error) {
    throw error;
  }
}

// ==================== REPORTS ====================

/**
 * Get Appointments Report
 * @param {string} startDate - Format: YYYY-MM-DD
 * @param {string} endDate - Format: YYYY-MM-DD
 */
export async function getAppointmentsReport(startDate, endDate) {
  try {
    const response = await apiClient.get('/admin/reports/appointments', {
      params: { startDate, endDate }
    });
    return response;
  } catch (error) {
    throw error;
  }
}

/**
 * Get Patients Report
 */
export async function getPatientsReport(startDate, endDate) {
  try {
    const response = await apiClient.get('/admin/reports/patients', {
      params: { startDate, endDate }
    });
    return response;
  } catch (error) {
    throw error;
  }
}

/**
 * Get Doctors Report
 */
export async function getDoctorsReport(startDate, endDate) {
  try {
    const response = await apiClient.get('/admin/reports/doctors', {
      params: { startDate, endDate }
    });
    return response;
  } catch (error) {
    throw error;
  }
}

/**
 * Get Revenue Report
 */
export async function getRevenueReport(startDate, endDate) {
  try {
    const response = await apiClient.get('/admin/reports/revenue', {
      params: { startDate, endDate }
    });
    return response;
  } catch (error) {
    throw error;
  }
}

/**
 * Get Specialty Report
 */
export async function getSpecialtyReport(startDate, endDate) {
  try {
    const response = await apiClient.get('/admin/reports/specialty', {
      params: { startDate, endDate }
    });
    return response;
  } catch (error) {
    throw error;
  }
}
