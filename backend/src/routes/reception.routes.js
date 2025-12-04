const express = require('express');
const router = express.Router();
const receptionController = require('../controllers/reception.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// All routes require authentication and receptionist role
router.use(authMiddleware.authenticate);
router.use(authMiddleware.isReceptionist);

// ===== Patient Management =====
// Add walk-in patient (Person + Patient, no User account)
router.post('/patients/walk-in', receptionController.addWalkInPatient);

// Search for patient
router.get('/patients/search', receptionController.searchPatient);

// ===== Appointment Management =====
// Book appointment for patient
router.post('/appointments', receptionController.bookAppointmentForPatient);

// Get upcoming appointments
router.get('/appointments/upcoming', receptionController.getUpcomingAppointments);

// Get doctor's appointments for specific date
router.get('/appointments/doctor/:doctorId', receptionController.getDoctorAppointments);

// Check-in patient (confirm appointment)
router.patch('/appointments/:appointmentId/checkin', receptionController.checkInPatient);

// Cancel appointment
router.delete('/appointments/:appointmentId', receptionController.cancelAppointment);

module.exports = router;
