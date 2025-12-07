import api from './client.js';

/**
 * Receptionist API Client
 */

// Get dashboard data (today's appointments, stats)
export const getDashboard = async () => {
  return await api.get('/reception/dashboard');
};

// Add walk-in patient (no user account)
export const addWalkInPatient = async (patientData) => {
  return await api.post('/reception/patients/walk-in', patientData);
};

// Search for patient by name/phone
export const searchPatient = async (query) => {
  return await api.get(`/reception/patients/search?q=${encodeURIComponent(query)}`);
};

// Book appointment for patient
export const bookAppointmentForPatient = async (appointmentData) => {
  return await api.post('/reception/appointments', appointmentData);
};

// Get upcoming appointments (with filtering)
export const getUpcomingAppointments = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return await api.get(`/reception/appointments/upcoming?${queryString}`);
};

// Get doctor's appointments for specific date
export const getDoctorAppointments = async (doctorId, date) => {
  return await api.get(`/reception/appointments/doctor/${doctorId}?date=${date}`);
};

// Check-in patient (confirm appointment)
export const checkInPatient = async (appointmentId) => {
  return await api.patch(`/reception/appointments/${appointmentId}/checkin`);
};

// Cancel appointment
export const cancelAppointment = async (appointmentId) => {
  return await api.delete(`/reception/appointments/${appointmentId}`);
};

// Get specialties (from reception API - uses patient controller)
export const getSpecialties = async () => {
  return await api.get('/reception/specialties');
};

// Get available doctors for specialty and date (from reception API - uses patient controller)
export const getAvailableDoctors = async (specialtyId, date) => {
  return await api.get(`/reception/doctors/available?specialtyId=${specialtyId}&date=${date}`);
};

export default {
  getDashboard,
  addWalkInPatient,
  searchPatient,
  bookAppointmentForPatient,
  getUpcomingAppointments,
  getDoctorAppointments,
  checkInPatient,
  cancelAppointment,
  getSpecialties,
  getAvailableDoctors
};
