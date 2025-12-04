import api from './config';

export const patientService = {
    // Get dashboard data
    getDashboard: async () => {
        const response = await api.get('/patient/dashboard');
        return response.data;
    },

    // Get appointments
    getAppointments: async () => {
        const response = await api.get('/patient/appointments');
        return response.data;
    },

    // Get medical history
    getMedicalHistory: async () => {
        const response = await api.get('/patient/medical-history');
        return response.data;
    },

    // Update settings
    updateSettings: async (data) => {
        const response = await api.put('/patient/settings', data);
        return response.data;
    }
};
