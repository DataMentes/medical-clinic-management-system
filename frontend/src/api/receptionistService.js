import api from './config';

export const receptionistService = {
    // Get dashboard data
    getDashboard: async () => {
        const response = await api.get('/receptionist/dashboard');
        return response.data;
    },

    // Get today's appointments grouped by doctor
    getTodayAppointmentsByDoctor: async () => {
        const response = await api.get('/receptionist/appointments/today');
        return response.data;
    },

    // Search patients
    searchPatients: async (query) => {
        const response = await api.get('/receptionist/patients/search', {
            params: { query }
        });
        return response.data;
    },

    // Update settings
    updateSettings: async (data) => {
        const response = await api.put('/receptionist/settings', data);
        return response.data;
    }
};
