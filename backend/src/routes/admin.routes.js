const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// All admin routes require authentication and admin role
router.use(authMiddleware.authenticate);
router.use(authMiddleware.isAdmin);

// ==================== SPECIALTY ROUTES ====================
router.get('/specialties', adminController.getAllSpecialties);
router.get('/specialties/:id', adminController.getSpecialtyById);
router.post('/specialties', adminController.createSpecialty);
router.put('/specialties/:id', adminController.updateSpecialty);
router.delete('/specialties/:id', adminController.deleteSpecialty);

// ==================== ROOM ROUTES ====================
router.get('/rooms', adminController.getAllRooms);
router.get('/rooms/:id', adminController.getRoomById);
router.post('/rooms', adminController.createRoom);
router.put('/rooms/:id', adminController.updateRoom);
router.delete('/rooms/:id', adminController.deleteRoom);

// ==================== PATIENT ROUTES ====================
router.get('/patients', adminController.getAllPatients);
router.get('/patients/:id', adminController.getPatientById);
router.put('/patients/:id', adminController.updatePatient);
router.delete('/patients/:id', adminController.deletePatient);

// ==================== DOCTOR ROUTES ====================
router.get('/doctors', adminController.getAllDoctors);
router.get('/doctors/:id', adminController.getDoctorById);
router.post('/doctors', adminController.createDoctor);
router.put('/doctors/:id', adminController.updateDoctor);
router.delete('/doctors/:id', adminController.deleteDoctor);

// ==================== SCHEDULE ROUTES ====================
router.get('/schedules', adminController.getAllSchedules);
router.get('/schedules/:id', adminController.getScheduleById);
router.post('/schedules', adminController.createSchedule);
router.put('/schedules/:id', adminController.updateSchedule);
router.delete('/schedules/:id', adminController.deleteSchedule);

// ==================== APPOINTMENT ROUTES ====================
router.get('/appointments', adminController.getAllAppointments);
router.get('/appointments/:id', adminController.getAppointmentById);
router.post('/appointments', adminController.createAppointment);
router.put('/appointments/:id', adminController.updateAppointment);
router.delete('/appointments/:id', adminController.deleteAppointment);

// ==================== MEDICAL RECORDS ROUTES ====================
router.get('/medical-records', adminController.getAllMedicalRecords);
router.get('/medical-records/:id', adminController.getMedicalRecordById);
router.post('/medical-records', adminController.createMedicalRecord);
router.put('/medical-records/:id', adminController.updateMedicalRecord);
router.delete('/medical-records/:id', adminController.deleteMedicalRecord);

// ==================== RECEPTIONIST ROUTES ====================
router.get('/receptionists', adminController.getAllReceptionists);
router.get('/receptionists/:id', adminController.getReceptionistById);
router.post('/receptionists', adminController.createReceptionist);
router.put('/receptionists/:id', adminController.updateReceptionist);
router.delete('/receptionists/:id', adminController.deleteReceptionist);

// ==================== ADMIN ROUTES ====================
router.get('/admins', adminController.getAllAdmins);
router.post('/admins', adminController.createAdmin);
router.put('/admins/:id', adminController.updateAdmin);
router.delete('/admins/:id', adminController.deleteAdmin);

module.exports = router;
