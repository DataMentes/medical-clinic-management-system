import api from './config';

export const appointmentService = {
    // Get all appointments (filtered by user role on backend)
    getAll: async (params = {}) => {
        const response = await api.get('/appointments', { params });
        return response.data;
    },

    // Get today's appointments
    getToday: async () => {
        const response = await api.get('/appointments/today');
        return response.data;
    },

    // Book appointment
    book: async (data) => {
        const response = await api.post('/appointments', data);
        return response.data;
    },

    // Update appointment
    update: async (id, data) => {
        const response = await api.put(`/appointments/${id}`, data);
        return response.data;
    },

    // Cancel appointment
    cancel: async (id) => {
        const response = await api.delete(`/appointments/${id}`);
        return response.data;
    },

    // Check-in patient
    checkIn: async (id) => {
        const response = await api.put(`/appointments/${id}/check-in`);
        return response.data;
    }
};
