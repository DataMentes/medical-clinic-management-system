import api from './config';

export const receptionistService = {
    // Get dashboard
    getDashboard: async () => {
        const result = await api.get('/reception/dashboard');
        return result.data;
    },

    // Get upcoming appointments (filters optional)
    getUpcomingAppointments: async (filters = {}) => {
        const result = await api.get('/reception/appointments/upcoming', {
            params: filters
        });
        return result.data;
    },

    // Get doctor's appointments for specific date
    getDoctorAppointments: async (doctorId, date) => {
        const result = await api.get(`/reception/appointments/doctor/${doctorId}`, {
            params: { date }
        });
        return result.data;
    },

    // Search patients (by name, phone, or ID)
    searchPatients: async (query) => {
        const result = await api.get('/reception/patients/search', {
            params: { q: query }
        });
        return result.data;
    },

    // Add walk-in patient (no user account)
    addWalkInPatient: async (patientData) => {
        const result = await api.post('/reception/patients/walk-in', patientData);
        return result.data;
    },

    // Book appointment for any patient
    bookAppointment: async (appointmentData) => {
        const result = await api.post('/reception/appointments', appointmentData);
        return result.data;
    },

    // Check-in patient (NOTICE: 'checkin' not 'check-in')
    checkInPatient: async (appointmentId) => {
        const result = await api.patch(`/reception/appointments/${appointmentId}/checkin`);
        return result.data;
    },

    // Cancel appointment
    cancelAppointment: async (appointmentId) => {
        const result = await api.delete(`/reception/appointments/${appointmentId}`);
        return result.data;
    }
};
