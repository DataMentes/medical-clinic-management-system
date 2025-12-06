import apiClient from './client.js';

/**
 * Authentication API Endpoints
 * جميع endpoints الخاصة بالـ authentication
 */

/**
 * تسجيل مريض جديد
 * @param {Object} userData - بيانات المستخدم
 * @param {string} userData.email - البريد الإلكتروني
 * @param {string} userData.password - كلمة المرور
 * @param {string} userData.fullName - الاسم الكامل
 * @param {string} userData.phoneNumber - رقم الهاتف
 * @param {string} userData.gender - الجنس (Male/Female)
 * @param {number} userData.yearOfBirth - سنة الميلاد
 * @returns {Promise<Object>} Response data
 */
export async function register(userData) {
  try {
    const response = await apiClient.post('/auth/register', {
      email: userData.email,
      password: userData.password,
      fullName: userData.fullName,
      phoneNumber: userData.phoneNumber,
      gender: userData.gender,
      yearOfBirth: parseInt(userData.yearOfBirth),
    });
    return response;
  } catch (error) {
    throw error;
  }
}

/**
 * التحقق من OTP بعد التسجيل
 * @param {string} email - البريد الإلكتروني
 * @param {string} otp - رمز OTP
 * @returns {Promise<Object>} Response with token and user data
 */
export async function verifyOTP(email, otp) {
  try {
    const payload = {
      email,
      otpCode: otp,  // Backend expects 'otpCode', not 'otp'
    };

    console.log('📤 Sending to Backend:', payload);
    console.log('🌐 API Endpoint:', '/auth/verify-otp');

    const response = await apiClient.post('/auth/verify-otp', payload);
    
    console.log('📥 Backend Response:', response);

    // حفظ token في localStorage
    if (response.data?.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userRole', response.data.role || 'Patient');
      
      // Dispatch custom event to update DashboardLayout
      window.dispatchEvent(new Event('roleChange'));
    }
    
    return response;
  } catch (error) {
    console.error('💥 API Error:', error);
    throw error;
  }
}

/**
 * تسجيل الدخول
 * @param {string} email - البريد الإلكتروني
 * @param {string} password - كلمة المرور
 * @returns {Promise<Object>} Response with token and user data
 */
export async function login(email, password) {
  try {
    const response = await apiClient.post('/auth/login', {
      email,
      password,
    });
    
    // حفظ token وبيانات المستخدم في localStorage
    if (response.data?.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userRole', response.data.role || 'Patient');
      
      // Dispatch custom event to update DashboardLayout
      window.dispatchEvent(new Event('roleChange'));
    }
    
    return response;
  } catch (error) {
    throw error;
  }
}

/**
 * الحصول على بيانات المستخدم الحالي
 * @returns {Promise<Object>} User data
 */
export async function getCurrentUser() {
  try {
    const response = await apiClient.get('/auth/me');
    return response;
  } catch (error) {
    throw error;
  }
}

/**
 * تسجيل الخروج (Client-side only)
 * يمسح token من localStorage
 */
export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('userRole');
}
