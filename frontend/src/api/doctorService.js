import api from './config';

export const doctorService = {
    // Get dashboard data
    getDashboard: async () => {
        const response = await api.get('/doctor/dashboard');
        return response.data;
    },

    // Get appointments
    getAppointments: async (params = {}) => {
        const response = await api.get('/doctor/appointments', { params });
        return response.data;
    },

    // Get patients in clinic (checked-in)
    getPatientsInClinic: async () => {
        const response = await api.get('/doctor/patients-in-clinic');
        return response.data;
    },

    // Get medical record
    getMedicalRecord: async (patientId) => {
        const response = await api.get(`/doctor/medical-record/${patientId}`);
        return response.data;
    },

    // Create/Update medical record
    updateMedicalRecord: async (patientId, data) => {
        const response = await api.post(`/doctor/medical-record/${patientId}`, data);
        return response.data;
    },

    // Update settings
    updateSettings: async (data) => {
        const response = await api.put('/doctor/settings', data);
        return response.data;
    }
};
