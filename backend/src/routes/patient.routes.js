const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patient.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// All routes require authentication
router.use(authMiddleware.authenticate);

// ===== Booking System =====
// Get all specialties
router.get('/specialties', patientController.getSpecialties);

// Get available doctors (filtered by specialty & date)
router.get('/doctors', patientController.getAvailableDoctors);

// Book appointment
router.post('/appointments', patientController.bookAppointment);

// ===== Appointments View =====
// Get upcoming appointments
router.get('/appointments/upcoming', patientController.getUpcomingAppointments);

// Get past appointments
router.get('/appointments/past', patientController.getPastAppointments);

// Cancel appointment (only if Pending)
router.delete('/appointments/:appointmentId', patientController.cancelAppointment);

// ===== Medical Records =====
// Get all medical records
router.get('/medical-records', patientController.getMedicalRecords);

// ===== Profile =====
// Get profile
router.get('/profile', patientController.getProfile);

// Update phone
router.put('/profile/phone', patientController.updatePhone);

// Update email - Request OTP
router.post('/profile/email/request-otp', patientController.requestEmailUpdateOTP);

// Update email - Verify & Update
router.put('/profile/email', patientController.updateEmail);

// Update password
router.put('/profile/password', patientController.updatePassword);

module.exports = router;
