import api from './config';

export const scheduleService = {
    // Get all schedules (Admin view)
    getAll: async (doctorId = null) => {
        const url = doctorId ? `/schedules?doctorId=${doctorId}` : '/schedules';
        const result = await api.get(url);
        return result.data;
    },

    // Get schedule by ID
    getById: async (scheduleId) => {
        const result = await api.get(`/schedules/${scheduleId}`);
        return result.data;
    },

    // Create new schedule
    create: async (scheduleData) => {
        const result = await api.post('/schedules', scheduleData);
        return result.data;
    },

    // Update schedule
    update: async (scheduleId, scheduleData) => {
        const result = await api.put(`/schedules/${scheduleId}`, scheduleData);
        return result.data;
    },

    // Delete schedule
    delete: async (scheduleId) => {
        const result = await api.delete(`/schedules/${scheduleId}`);
        return result.data;
    }
};

export const roomService = {
    // Get all rooms
    getAll: async () => {
        const result = await api.get('/rooms');
        return result.data;
    },

    // Get room by ID
    getById: async (roomId) => {
        const result = await api.get(`/rooms/${roomId}`);
        return result.data;
    },

    // Create new room
    create: async (roomData) => {
        const result = await api.post('/rooms', roomData);
        return result.data;
    },

    // Update room
    update: async (roomId, roomData) => {
        const result = await api.put(`/rooms/${roomId}`, roomData);
        return result.data;
    },

    // Delete room
    delete: async (roomId) => {
        const result = await api.delete(`/rooms/${roomId}`);
        return result.data;
    }
};
