import api from './config';

export const adminService = {
    // ===== Dashboard Stats =====
    getStats: async () => {
        const result = await api.get('/admin/stats');
        return result.data;
    },

    // ===== Admins =====
    getAllAdmins: async () => {
        const result = await api.get('/admin/admins');
        return result.data;
    },

    createAdmin: async (data) => {
        const result = await api.post('/admin/admins', data);
        return result.data;
    },

    updateAdmin: async (id, data) => {
        const result = await api.put(`/admin/admins/${id}`, data);
        return result.data;
    },

    deleteAdmin: async (id) => {
        const result = await api.delete(`/admin/admins/${id}`);
        return result.data;
    },

    // ===== Doctors =====
    getAllDoctors: async () => {
        const result = await api.get('/admin/doctors');
        return result.data;
    },

    getDoctorById: async (id) => {
        const result = await api.get(`/admin/doctors/${id}`);
        return result.data;
    },

    createDoctor: async (data) => {
        const result = await api.post('/admin/doctors', data);
        return result.data;
    },

    updateDoctor: async (id, data) => {
        const result = await api.put(`/admin/doctors/${id}`, data);
        return result.data;
    },

    deleteDoctor: async (id) => {
        const result = await api.delete(`/admin/doctors/${id}`);
        return result.data;
    },

    // ===== Patients =====
    getAllPatients: async () => {
        const result = await api.get('/admin/patients');
        return result.data;
    },

    getPatientById: async (id) => {
        const result = await api.get(`/admin/patients/${id}`);
        return result.data;
    },

    createPatient: async (data) => {
        const result = await api.post('/admin/patients', data);
        return result.data;
    },

    updatePatient: async (id, data) => {
        const result = await api.put(`/admin/patients/${id}`, data);
        return result.data;
    },

    deletePatient: async (id) => {
        const result = await api.delete(`/admin/patients/${id}`);
        return result.data;
    },

    // ===== Receptionists =====
    getAllReceptionists: async () => {
        const result = await api.get('/admin/receptionists');
        return result.data;
    },

    getReceptionistById: async (id) => {
        const result = await api.get(`/admin/receptionists/${id}`);
        return result.data;
    },

    createReceptionist: async (data) => {
        const result = await api.post('/admin/receptionists', data);
        return result.data;
    },

    updateReceptionist: async (id, data) => {
        const result = await api.put(`/admin/receptionists/${id}`, data);
        return result.data;
    },

    deleteReceptionist: async (id) => {
        const result = await api.delete(`/admin/receptionists/${id}`);
        return result.data;
    },

    // ===== Specialties =====
    getAllSpecialties: async () => {
        const result = await api.get('/admin/specialties');
        return result.data;
    },

    getSpecialtyById: async (id) => {
        const result = await api.get(`/admin/specialties/${id}`);
        return result.data;
    },

    createSpecialty: async (data) => {
        const result = await api.post('/admin/specialties', data);
        return result.data;
    },

    updateSpecialty: async (id, data) => {
        const result = await api.put(`/admin/specialties/${id}`, data);
        return result.data;
    },

    deleteSpecialty: async (id) => {
        const result = await api.delete(`/admin/specialties/${id}`);
        return result.data;
    },

    // ===== Rooms =====
    getAllRooms: async () => {
        const result = await api.get('/admin/rooms');
        return result.data;
    },

    getRoomById: async (id) => {
        const result = await api.get(`/admin/rooms/${id}`);
        return result.data;
    },

    createRoom: async (data) => {
        const result = await api.post('/admin/rooms', data);
        return result.data;
    },

    updateRoom: async (id, data) => {
        const result = await api.put(`/admin/rooms/${id}`, data);
        return result.data;
    },

    deleteRoom: async (id) => {
        const result = await api.delete(`/admin/rooms/${id}`);
        return result.data;
    },

    // ===== Schedules =====
    getAllSchedules: async (filters = {}) => {
        const result = await api.get('/admin/schedules', { params: filters });
        return result.data;
    },

    getScheduleById: async (id) => {
        const result = await api.get(`/admin/schedules/${id}`);
        return result.data;
    },

    createSchedule: async (data) => {
        const result = await api.post('/admin/schedules', data);
        return result.data;
    },

    updateSchedule: async (id, data) => {
        const result = await api.put(`/admin/schedules/${id}`, data);
        return result.data;
    },

    deleteSchedule: async (id) => {
        const result = await api.delete(`/admin/schedules/${id}`);
        return result.data;
    },

    // ===== Appointments (Admin CRUD) =====
    getAllAppointments: async (filters = {}) => {
        const result = await api.get('/admin/appointments', { params: filters });
        return result.data;
    },

    getAppointmentById: async (id) => {
        const result = await api.get(`/admin/appointments/${id}`);
        return result.data;
    },

    createAppointment: async (data) => {
        const result = await api.post('/admin/appointments', data);
        return result.data;
    },

    updateAppointment: async (id, data) => {
        const result = await api.put(`/admin/appointments/${id}`, data);
        return result.data;
    },

    deleteAppointment: async (id) => {
        const result = await api.delete(`/admin/appointments/${id}`);
        return result.data;
    },

    // ===== Medical Records (Admin CRUD) =====
    getAllMedicalRecords: async (filters = {}) => {
        const result = await api.get('/admin/medical-records', { params: filters });
        return result.data;
    },

    getMedicalRecordById: async (id) => {
        const result = await api.get(`/admin/medical-records/${id}`);
        return result.data;
    },

    createMedicalRecord: async (data) => {
        const result = await api.post('/admin/medical-records', data);
        return result.data;
    },

    updateMedicalRecord: async (id, data) => {
        const result = await api.put(`/admin/medical-records/${id}`, data);
        return result.data;
    },

    deleteMedicalRecord: async (id) => {
        const result = await api.delete(`/admin/medical-records/${id}`);
        return result.data;
    }
};
