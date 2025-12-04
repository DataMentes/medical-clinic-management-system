import api from './config';

export const adminService = {
    // Dashboard
    getStats: async () => {
        const response = await api.get('/admin/stats');
        return response.data;
    },

    // Admins
    getAllAdmins: async () => {
        const response = await api.get('/admin/admins');
        return response.data;
    },

    createAdmin: async (data) => {
        const response = await api.post('/admin/admins', data);
        return response.data;
    },

    updateAdmin: async (id, data) => {
        const response = await api.put(`/admin/admins/${id}`, data);
        return response.data;
    },

    deleteAdmin: async (id) => {
        const response = await api.delete(`/admin/admins/${id}`);
        return response.data;
    },

    // Doctors
    getAllDoctors: async () => {
        const response = await api.get('/admin/doctors');
        return response.data;
    },

    createDoctor: async (data) => {
        const response = await api.post('/admin/doctors', data);
        return response.data;
    },

    updateDoctor: async (id, data) => {
        const response = await api.put(`/admin/doctors/${id}`, data);
        return response.data;
    },

    deleteDoctor: async (id) => {
        const response = await api.delete(`/admin/doctors/${id}`);
        return response.data;
    },

    // Patients
    getAllPatients: async () => {
        const response = await api.get('/admin/patients');
        return response.data;
    },

    getPatientById: async (id) => {
        const response = await api.get(`/admin/patients/${id}`);
        return response.data;
    },

    updatePatient: async (id, data) => {
        const response = await api.put(`/admin/patients/${id}`, data);
        return response.data;
    },

    deletePatient: async (id) => {
        const response = await api.delete(`/admin/patients/${id}`);
        return response.data;
    },

    // Receptionists
    getAllReceptionists: async () => {
        const response = await api.get('/admin/receptionists');
        return response.data;
    },

    createReceptionist: async (data) => {
        const response = await api.post('/admin/receptionists', data);
        return response.data;
    },

    updateReceptionist: async (id, data) => {
        const response = await api.put(`/admin/receptionists/${id}`, data);
        return response.data;
    },

    deleteReceptionist: async (id) => {
        const response = await api.delete(`/admin/receptionists/${id}`);
        return response.data;
    }
};
