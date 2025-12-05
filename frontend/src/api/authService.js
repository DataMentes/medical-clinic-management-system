import api from './config';

export const authService = {
    // Register new patient
    register: async (userData) => {
        const result = await api.post('/auth/register', userData);
        // Interceptor unwraps to: {success, message, data: {userId, email, requiresVerification}}
        // No token on registration - only after OTP verification
        return result; // Return the whole result
    },

    // Login
    login: async (email, password) => {
        const result = await api.post('/auth/login', { email, password });
        // Interceptor unwraps to: {success, message, data: {user, token, role, redirectTo}}
        if (result.data?.token) {
            localStorage.setItem('token', result.data.token);
            localStorage.setItem('user', JSON.stringify(result.data.user));
            localStorage.setItem('userRole', result.data.role.toLowerCase());
        }
        return result;
    },

    // Verify OTP (FIXED parameter name)
    verifyOTP: async (email, otpCode) => {
        const result = await api.post('/auth/verify-otp', { email, otpCode });
        // Interceptor unwraps to: {success, message, data: {user, person, patient, token, role}}
        if (result.data?.token) {
            localStorage.setItem('token', result.data.token);
            localStorage.setItem('user', JSON.stringify(result.data.user));
            localStorage.setItem('userRole', result.data.role.toLowerCase());
        }
        return result;
    },

    // Resend OTP
    resendOTP: async (email) => {
        const result = await api.post('/auth/resend-otp', { email });
        return result.data;
    },

    // Get current user
    getCurrentUser: async () => {
        const result = await api.get('/auth/me');
        return result.data.user;
    },

    // Logout
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('userRole');
    },

    // Helper methods (no changes)
    getStoredUser: () => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },

    getToken: () => {
        return localStorage.getItem('token');
    },

    isAuthenticated: () => {
        return !!localStorage.getItem('token');
    }
};
