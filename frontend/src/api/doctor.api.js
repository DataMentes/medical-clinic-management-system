import apiClient from './client.js';

/**
 * Get today's appointments
 * @returns {Promise<Object>} Today's appointments
 */
export async function getTodayAppointments() {
  try {
    const response = await apiClient.get('/doctor/appointments/today');
    console.log('📅 Doctor Today Appointments Response:', response);
    return response;
  } catch (error) {
    console.error('❌ Error fetching today appointments:', error);
    throw error;
  }
}

/**
 * Get weekly schedule
 * @returns {Promise<Object>} Weekly schedules
 */
export async function getWeeklySchedule() {
  try {
    const response = await apiClient.get('/doctor/schedule');
    console.log('📆 Doctor Weekly Schedule Response:', response);
    return response;
  } catch (error) {
    console.error('❌ Error fetching weekly schedule:', error);
    throw error;
  }
}

/**
 * Get patients currently in clinic
 * @returns {Promise<Object>} Patients in clinic
 */
export async function getPatientsInClinic() {
  try {
    const response = await apiClient.get('/doctor/patients-in-clinic');
    console.log('👥 Patients in Clinic Response:', response);
    return response;
  } catch (error) {
    console.error('❌ Error fetching patients in clinic:', error);
    throw error;
  }
}

/**
 * Get all available rooms
 * @returns {Promise<Object>} Rooms list
 */
export async function getRooms() {
  try {
    const response = await apiClient.get('/doctor/rooms');
    return response;
  } catch (error) {
    console.error('❌ Error fetching rooms:', error);
    throw error;
  }
}

/**
 * Get appointments for week
 * @param {string} startDate YYYY-MM-DD
 * @returns {Promise<Object>} Week appointments
 */
export async function getWeekAppointments(startDate) {
  try {
    const params = startDate ? { startDate } : {};
    const response = await apiClient.get('/doctor/appointments/week', { params });
    console.log('📅 Doctor Week Appointments Response:', response);
    return response;
  } catch (error) {
    console.error('❌ Error fetching week appointments:', error);
    throw error;
  }
}
/**
 * Get appointment details with history
 * @param {number} id Appointment ID
 * @returns {Promise<Object>} Appointment details
 */
export async function getAppointmentDetails(id) {
  try {
    const response = await apiClient.get(`/doctor/appointments/${id}`);
    console.log('🩺 Appointment Details Response:', response);
    return response;
  } catch (error) {
    console.error('❌ Error fetching appointment details:', error);
    throw error;
  }
}

/**
 * Add medical record
 * @param {number} appointmentId 
 * @param {Object} data { diagnosis, prescription, notes }
 * @returns {Promise<Object>} Created record
 */
export async function addMedicalRecord(appointmentId, data) {
  try {
    const response = await apiClient.post(`/doctor/appointments/${appointmentId}/medical-record`, data);
    return response;
  } catch (error) {
    throw error;
  }
}

/**
 * Add new schedule slot
 * @param {Object} data { weekDay, roomId, startTime, endTime, maxCapacity }
 * @returns {Promise<Object>} Created schedule
 */
export async function addSchedule(data) {
  try {
    const response = await apiClient.post('/doctor/schedule', data);
    return response;
  } catch (error) {
    console.error('❌ Error adding schedule:', error);
    throw error;
  }
}

/**
 * Delete schedule slot
 * @param {number} scheduleId 
 * @returns {Promise<Object>} Delete confirmation
 */
export async function deleteSchedule(scheduleId) {
  try {
    const response = await apiClient.delete(`/doctor/schedule/${scheduleId}`);
    console.log('🗑️ Delete Schedule Response:', response);
    return response;
  } catch (error) {
    console.error('❌ Error deleting schedule:', error);
    throw error;
  }
}
