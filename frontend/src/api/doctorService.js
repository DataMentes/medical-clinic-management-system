import api from './config';

export const doctorService = {
    // ===== Dashboard =====
    getDashboard: async () => {
        const result = await api.get('/doctor/dashboard');
        return result.data;
    },

    getPatientsInClinic: async () => {
        const result = await api.get('/doctor/patients-in-clinic');
        return result.data;
    },

    // ===== Profile =====
    getProfile: async () => {
        const result = await api.get('/doctor/profile');
        return result.data;
    },

    updatePhone: async (phoneNumber) => {
        const result = await api.put('/doctor/profile/phone', { phoneNumber });
        return result.data;
    },

    updatePassword: async (currentPassword, newPassword) => {
        const result = await api.put('/doctor/profile/password', { 
            currentPassword, 
            newPassword 
        });
        return result.data;
    },

    // ===== Schedule Management =====
    getMySchedule: async () => {
        const result = await api.get('/doctor/schedule');
        return result.data;
    },

    addSchedule: async (scheduleData) => {
        const result = await api.post('/doctor/schedule', scheduleData);
        return result.data;
    },

    updateSchedule: async (scheduleId, scheduleData) => {
        const result = await api.put(`/doctor/schedule/${scheduleId}`, scheduleData);
        return result.data;
    },

    deleteSchedule: async (scheduleId) => {
        const result = await api.delete(`/doctor/schedule/${scheduleId}`);
        return result.data;
    },

    // ===== Appointments =====
    getTodayAppointments: async () => {
        const result = await api.get('/doctor/appointments/today');
        return result.data;
    },

    getWeekAppointments: async (startDate) => {
        const result = await api.get('/doctor/appointments/week', {
            params: { startDate }
        });
        return result.data;
    },

    getAppointmentDetails: async (appointmentId) => {
        const result = await api.get(`/doctor/appointments/${appointmentId}`);
        return result.data;
    },

    // ===== Medical Records =====
    // FIXED: Uses appointmentId, not patientId
    addMedicalRecord: async (appointmentId, recordData) => {
        const result = await api.post(
            `/doctor/appointments/${appointmentId}/medical-record`, 
            recordData
        );
        return result.data;
    }
};
