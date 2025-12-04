import api from './config';

export const scheduleService = {
    // Get all schedules
    getAll: async (doctorId = null) => {
        const params = {};
        if (doctorId) params.doctorId = doctorId;
        const response = await api.get('/schedules', { params });
        return response.data;
    },

    // Create schedule (admin only)
    create: async (data) => {
        const response = await api.post('/schedules', data);
        return response.data;
    },

    // Update schedule  
    update: async (id, data) => {
        const response = await api.put(`/schedules/${id}`, data);
        return response.data;
    },

    // Delete schedule
    delete: async (id) => {
        const response = await api.delete(`/schedules/${id}`);
        return response.data;
    }
};

export const specialtyService = {
    // Get all specialties
    getAll: async () => {
        const response = await api.get('/specialties');
        return response.data;
    },

    // Create specialty
    create: async (data) => {
        const response = await api.post('/specialties', data);
        return response.data;
    },

    // Update specialty
    update: async (id, data) => {
        const response = await api.put(`/specialties/${id}`, data);
        return response.data;
    },

    // Delete specialty
    delete: async (id) => {
        const response = await api.delete(`/specialties/${id}`);
        return response.data;
    }
};

export const roomService = {
    // Get all rooms
    getAll: async () => {
        const response = await api.get('/rooms');
        return response.data;
    },

    // Create room
    create: async (data) => {
        const response = await api.post('/rooms', data);
        return response.data;
    },

    // Update room
    update: async (id, data) => {
        const response = await api.put(`/rooms/${id}`, data);
        return response.data;
    },

    // Delete room
    delete: async (id) => {
        const response = await api.delete(`/rooms/${id}`);
        return response.data;
    }
};
