import api from './config';

export const patientService = {
    // ===== Dashboard =====
    getDashboard: async () => {
        const result = await api.get('/patient/dashboard');
        return result.data;
    },

    // ===== Profile =====
    getProfile: async () => {
        const result = await api.get('/patient/profile');
        return result.data;
    },

    updatePhone: async (phoneNumber) => {
        const result = await api.put('/patient/profile/phone', { phoneNumber });
        return result.data;
    },

    requestEmailUpdateOTP: async (newEmail) => {
        const result = await api.post('/patient/profile/email/request-otp', { newEmail });
        return result.data;
    },

    updateEmail: async (newEmail, otpCode) => {
        const result = await api.put('/patient/profile/email', { newEmail, otpCode });
        return result.data;
    },

    updatePassword: async (currentPassword, newPassword) => {
        const result = await api.put('/patient/profile/password', { 
            currentPassword, 
            newPassword 
        });
        return result.data;
    },

    // ===== Booking Flow =====
    getSpecialties: async () => {
        const result = await api.get('/patient/specialties');
        return result.data;
    },

    getAvailableDoctors: async (specialtyId, date) => {
        const result = await api.get('/patient/doctors', {
            params: { specialtyId, date }
        });
        return result.data;
    },

    bookAppointment: async (appointmentData) => {
        const result = await api.post('/patient/appointments', appointmentData);
        return result.data;
    },

    // ===== Appointments =====
    getUpcomingAppointments: async () => {
        const result = await api.get('/patient/appointments/upcoming');
        return result.data;
    },

    getPastAppointments: async () => {
        const result = await api.get('/patient/appointments/past');
        return result.data;
    },

    cancelAppointment: async (appointmentId) => {
        const result = await api.delete(`/patient/appointments/${appointmentId}`);
        return result.data;
    },

    // ===== Medical Records =====
    getMedicalRecords: async () => {
        const result = await api.get('/patient/medical-records');
        return result.data;
    }
};
