import apiClient from './client.js';

/**
 * Patient API Endpoints
 * جميع endpoints الخاصة بالـ Patient Module
 */

/**
 * الحصول على dashboard data (stats)
 * @returns {Promise<Object>} Dashboard statistics
 */
export async function getDashboardStats() {
  try {
    const response = await apiClient.get('/patient/dashboard');
    return response;
  } catch (error) {
    console.error('💥 Get Dashboard Stats Error:', error);
    throw error;
  }
}

/**
 * الحصول على upcoming appointments
 * @returns {Promise<Array>} List of upcoming appointments
 */
export async function getUpcomingAppointments() {
  try {
    console.log('📤 Fetching Upcoming Appointments...');
    const response = await apiClient.get('/patient/appointments/upcoming');
    console.log('📥 Upcoming Appointments Response:', response);
    return response;
  } catch (error) {
    console.error('💥 Get Upcoming Appointments Error:', error);
    throw error;
  }
}

/**
 * الحصول على past appointments with medical records
 * @returns {Promise<Array>} List of past appointments
 */
export async function getPastAppointments() {
  try {
    console.log('📤 Fetching Past Appointments...');
    const response = await apiClient.get('/patient/appointments/past');
    console.log('📥 Past Appointments Response:', response);
    return response;
  } catch (error) {
    console.error('💥 Get Past Appointments Error:', error);
    throw error;
  }
}

/**
 * الحصول على medical records
 * @returns {Promise<Array>} List of medical records
 */
export async function getMedicalRecords() {
  try {
    const response = await apiClient.get('/patient/medical-records');
    return response;
  } catch (error) {
    console.error('💥 Get Medical Records Error:', error);
    throw error;
  }
}

/**
 * الحصول على specialties للحجز
 * @returns {Promise<Array>} List of available specialties
 */
export async function getSpecialties() {
  try {
    const response = await apiClient.get('/patient/specialties');
    return response;
  } catch (error) {
    console.error('💥 Get Specialties Error:', error);
    throw error;
  }
}

/**
 * الحصول على available doctors لتخصص معين
 * @param {number} specialtyId - Specialty ID
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {Promise<Array>} List of available doctors with slots
 */
export async function getAvailableDoctors(specialtyId, date) {
  try {
    console.log('🔍 getAvailableDoctors called with:', { specialtyId, date });
    console.log('🌐 API URL:', `/patient/doctors?specialtyId=${specialtyId}&date=${date}`);
    console.log('⏰ Request started at:', new Date().toISOString());
    
    const startTime = Date.now();
    const response = await apiClient.get('/patient/doctors', {
      params: { specialtyId, date }
    });
    const endTime = Date.now();
    
    console.log(`✅ Request completed in ${endTime - startTime}ms`);
    console.log('📥 Response:', response);
    
    return response;
  } catch (error) {
    console.error('💥 Get Available Doctors Error:', error);
    console.error('💥 Error details:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    throw error;
  }
}

/**
 * حجز موعد جديد
 * @param {Object} appointmentData - Appointment data
 * @param {number} appointmentData.doctorId - Doctor ID
 * @param {number} appointmentData.scheduleId - Schedule ID
 * @param {string} appointmentData.appointmentDate - Date in YYYY-MM-DD format
 * @param {string} appointmentData.appointmentType - Type: "Examination" or "Consultation"
 * @returns {Promise<Object>} Created appointment
 */
export async function bookAppointment(appointmentData) {
  try {
    const response = await apiClient.post('/patient/appointments', {
      doctorId: appointmentData.doctorId,
      scheduleId: appointmentData.scheduleId,
      appointmentDate: appointmentData.appointmentDate,
      appointmentType: appointmentData.appointmentType
    });
    return response;
  } catch (error) {
    console.error('💥 Book Appointment Error:', error);
    throw error;
  }
}

/**
 * إلغاء موعد
 * @param {number} appointmentId - Appointment ID to cancel
 * @returns {Promise<Object>} Cancellation confirmation
 */
export async function cancelAppointment(appointmentId) {
  try {
    console.log(`📤 Canceling Appointment ID: ${appointmentId}`);
    const response = await apiClient.delete(`/patient/appointments/${appointmentId}`);
    console.log('📥 Cancel Appointment Response:', response);
    return response;
  } catch (error) {
    console.error('💥 Cancel Appointment Error:', error);
    throw error;
  }
}
