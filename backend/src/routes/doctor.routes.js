const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctor.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// All routes require authentication and doctor role
router.use(authMiddleware.authenticate);
router.use(authMiddleware.isDoctor);

// ===== Schedule Management =====
// Get my weekly schedule
router.get('/schedule', doctorController.getMySchedule);

// Add new schedule
router.post('/schedule', doctorController.addSchedule);

// Update schedule
router.put('/schedule/:scheduleId', doctorController.updateSchedule);

// Delete schedule
router.delete('/schedule/:scheduleId', doctorController.deleteSchedule);

// ===== Appointments =====
// Get today's confirmed appointments
router.get('/appointments/today', doctorController.getTodayAppointments);

// Get appointments for specific week
router.get('/appointments/week', doctorController.getWeekAppointments);

// Get appointment details with patient's medical history
router.get('/appointments/:appointmentId', doctorController.getAppointmentDetails);

// Add medical record for appointment
router.post('/appointments/:appointmentId/medical-record', doctorController.addMedicalRecord);

// ===== Profile Management =====
// Get profile
router.get('/profile', doctorController.getProfile);

// Update phone number
router.put('/profile/phone', doctorController.updatePhone);

// Update password
router.put('/profile/password', doctorController.updatePassword);

// ===== Dashboard =====
// Get dashboard data
router.get('/dashboard', doctorController.getDashboard);

// Get patients in clinic (today's confirmed)
router.get('/patients-in-clinic', doctorController.getPatientsInClinic);


module.exports = router;
