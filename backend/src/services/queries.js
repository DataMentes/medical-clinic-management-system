// This file implements Queries for various modules in the medical clinic management system.

const db = require('./db');

/* ==========================================================
   1) USERS MODULE
   ========================================================== */

const userQueries = {
    // Find User By Email
    async findUserByEmail(email) {
        const { rows } = await db.query(
            'SELECT * FROM USERS WHERE Email = $1',
            [email]
        );
        return rows[0];
    },

    // Find User By Id
    async findUserById(userId) {
        const { rows } = await db.query(
            'SELECT * FROM USERS WHERE UserID = $1',
            [userId]
        );
        return rows[0];
    },

    // Create User -> data includes { email, passwordHash }
    async createUser(data) {
        const { rows } = await db.query(
            'INSERT INTO USERS (Email, PasswordHash) VALUES ($1, $2) RETURNING UserID',
            [data.email, data.passwordHash]
        );
        return rows[0].UserID;
    },

    // Update User Password
    async updateUserPassword(userId, newHash) {
        const result = await db.query(
            'UPDATE USERS SET PasswordHash = $1 WHERE UserID = $2',
            [newHash, userId]
        );
        return result.rowCount > 0;
    }
};

/* ==========================================================
   2) PERSONS MODULE
   ========================================================== */

const personQueries = {
    // Create Person -> data includes { userId, fullName, phoneNumber, roleId }
    async createPerson(data) {
        const { rows } = await db.query(
            'INSERT INTO PERSONS (UserID, FullName, PhoneNumber, RoleID) VALUES ($1, $2, $3, $4) RETURNING UserID',
            [data.userId, data.fullName, data.phoneNumber, data.roleId]
        );
        return rows[0].UserID;
    },

    // Update Person 
    async updatePerson(userId, data) {
        const result = await db.query(
            'UPDATE PERSONS SET FullName = $1, PhoneNumber = $2 WHERE UserID = $3',
            [data.fullName, data.phoneNumber, userId]
        );
        return result.rowCount > 0;
    },

    // Get Person By User Id
    async getPersonByUserId(userId) {
        const { rows } = await db.query(
            'SELECT * FROM PERSONS WHERE UserID = $1',
            [userId]
        );
        return rows[0];
    }
};

/* ==========================================================
   3) ROLES MODULE
   ========================================================== */

const roleQueries = {
    // Get Role By Id
    async getRoleById(roleId) {
        const { rows } = await db.query(
            'SELECT * FROM Role WHERE RoleID = $1',
            [roleId]
        );
        return rows[0];
    },

    // Get All Roles
    async getAllRoles() {
        const { rows } = await db.query('SELECT * FROM Role');
        return rows;
    }
};

/* ==========================================================
   4) OTP VERIFICATION MODULE
   ========================================================== */

const otpQueries = {
    // Create OTP For User
    async createOTPForUser(userId, otpCode, expiryTime) {
        const result = await db.query(
            `INSERT INTO OTP_VERIFICATION (UserID, OTP_Code, ExpiryTime) 
       VALUES ($1, $2, $3) 
       ON CONFLICT (UserID) 
       DO UPDATE SET OTP_Code = EXCLUDED.OTP_Code, ExpiryTime = EXCLUDED.ExpiryTime`,
            [userId, otpCode, expiryTime]
        );
        return result;
    },

    // Get Latest OTP
    async getLatestOTP(userId) {
        const { rows } = await db.query(
            'SELECT * FROM OTP_VERIFICATION WHERE UserID = $1',
            [userId]
        );
        return rows[0];
    }
};

/* ==========================================================
   5) SPECIALTIES MODULE
   ========================================================== */

const specialtyQueries = {
    // Get All Specialties
    async getAllSpecialties() {
        const { rows } = await db.query('SELECT * FROM SPECIALTIES');
        return rows;
    },

    // Get Specialty By Id
    async getSpecialtyById(id) {
        const { rows } = await db.query(
            'SELECT * FROM SPECIALTIES WHERE SpecialtyID = $1',
            [id]
        );
        return rows[0];
    }
};

/* ==========================================================
   6) DOCTORS MODULE
   ========================================================== */

const doctorQueries = {
    // Get All Doctors
    async getAllDoctors() {
        const { rows } = await db.query(
            `SELECT d.*, p.FullName 
       FROM DOCTORS d 
       JOIN PERSONS p ON d.UserID = p.UserID`
        );
        return rows;
    },

    // Get Doctor By Id
    async getDoctorById(doctorId) {
        const { rows } = await db.query(
            'SELECT * FROM DOCTORS WHERE DoctorID = $1',
            [doctorId]
        );
        return rows[0];
    },

    // Create Doctor
    async createDoctor(data) {
        const { rows } = await db.query(
            'INSERT INTO DOCTORS (UserID, SpecialtyID, ExaminationFee, Biography) VALUES ($1, $2, $3, $4) RETURNING DoctorID',
            [data.userId, data.specialtyId, data.examinationFee, data.biography]
        );
        return rows[0].DoctorID;
    },

    // Update Doctor
    async updateDoctor(doctorId, data) {
        const result = await db.query(
            'UPDATE DOCTORS SET ExaminationFee = $1, Biography = $2 WHERE DoctorID = $3',
            [data.examinationFee, data.biography, doctorId]
        );
        return result.rowCount > 0;
    },

    // Get Doctors By Specialty
    async getDoctorsBySpecialty(specialtyId) {
        const { rows } = await db.query(
            `SELECT d.*, p.FullName 
       FROM DOCTORS d 
       JOIN PERSONS p ON d.UserID = p.UserID 
       WHERE d.SpecialtyID = $1`,
            [specialtyId]
        );
        return rows;
    }
};

/* ==========================================================
   7) DOCTOR SCHEDULES MODULE
   ========================================================== */

const scheduleQueries = {
    // Create Doctor Schedule
    async createDoctorSchedule(data) {
        const { rows } = await db.query(
            'INSERT INTO DOCTORSCHEDULES (DoctorID, Weekday, RoomID, StartTime, EndTime, MaxCapacity) VALUES ($1, $2, $3, $4, $5, $6) RETURNING ScheduleID',
            [data.doctorId, data.weekday, data.roomId, data.startTime, data.endTime, data.maxCapacity]
        );
        return rows[0].ScheduleID;
    },

    // Get Schedules For Doctor
    async getSchedulesForDoctor(doctorId) {
        const { rows } = await db.query(
            'SELECT * FROM DOCTORSCHEDULES WHERE DoctorID = $1',
            [doctorId]
        );
        return rows;
    },

    // Get Doctor Schedule By Id
    async getDoctorScheduleById(scheduleId) {
        const { rows } = await db.query(
            'SELECT * FROM DOCTORSCHEDULES WHERE ScheduleID = $1',
            [scheduleId]
        );
        return rows[0];
    },

    // Get Doctor Schedule By Day
    async getDoctorScheduleByDay(doctorId, weekday) {
        const { rows } = await db.query(
            'SELECT * FROM DOCTORSCHEDULES WHERE DoctorID = $1 AND Weekday = $2',
            [doctorId, weekday]
        );
        return rows;
    },

    // Update Doctor Schedule
    async updateDoctorSchedule(scheduleId, data) {
        const result = await db.query(
            'UPDATE DOCTORSCHEDULES SET StartTime = $1, EndTime = $2, MaxCapacity = $3, RoomID = $4 WHERE ScheduleID = $5',
            [data.startTime, data.endTime, data.maxCapacity, data.roomId, scheduleId]
        );
        return result.rowCount > 0;
    },

    // Delete Doctor Schedule
    async deleteDoctorSchedule(scheduleId) {
        const result = await db.query(
            'DELETE FROM DOCTORSCHEDULES WHERE ScheduleID = $1',
            [scheduleId]
        );
        return result.rowCount > 0;
    }
};

/* ==========================================================
   8) ROOMS MODULE
   ========================================================== */

const roomQueries = {
    // Get All Rooms
    async getAllRooms() {
        const { rows } = await db.query('SELECT * FROM ROOMS');
        return rows;
    },

    // Get Room By Id
    async getRoomById(roomId) {
        const { rows } = await db.query(
            'SELECT * FROM ROOMS WHERE RoomID = $1',
            [roomId]
        );
        return rows[0];
    },
};

/* ==========================================================
   9) PATIENTS MODULE
   ========================================================== */

const patientQueries = {
    // Create Patient
    async createPatient(data) {
        const { rows } = await db.query(
            'INSERT INTO PATIENTS (UserID, YearOfBirth) VALUES ($1, $2) RETURNING PatientID',
            [data.userId, data.yearOfBirth]
        );
        return rows[0].PatientID;
    },

    // Get Patient By Id
    async getPatientById(patientId) {
        const { rows } = await db.query(
            'SELECT * FROM PATIENTS WHERE PatientID = $1',
            [patientId]
        );
        return rows[0];
    },

    // Get Patient By User Id
    async getPatientByUserId(userId) {
        const { rows } = await db.query(
            'SELECT * FROM PATIENTS WHERE UserID = $1',
            [userId]
        );
        return rows[0];
    }
};

/* ==========================================================
   10) APPOINTMENTS MODULE
   ========================================================== */

const appointmentQueries = {
    // Create Appointment
    async createAppointment(data) {
        const { rows } = await db.query(
            `INSERT INTO APPOINTMENTS 
       (PatientID, ScheduleID, DoctorID, AppointmentType, Status, FeePaid, BookingTime, ParentAppointmentID) 
       VALUES ($1, $2, $3, $4, 'Pending', $5, NOW(), $6) RETURNING AppointmentID`,
            [data.patientId, data.scheduleId, data.doctorId, data.appointmentType, data.feePaid, data.parentAppointmentId || null]
        );
        return rows[0].AppointmentID;
    },

    // Count Appointments For Schedule
    async countAppointmentsForSchedule(scheduleId) {
        const { rows } = await db.query(
            `SELECT COUNT(*) as count FROM APPOINTMENTS WHERE ScheduleID = $1 AND Status != 'Canceled'`,
            [scheduleId]
        );
        return parseInt(rows[0].count);
    },

    // Get Appointment By Id
    async getAppointmentById(appointmentId) {
        const { rows } = await db.query(
            'SELECT * FROM APPOINTMENTS WHERE AppointmentID = $1',
            [appointmentId]
        );
        return rows[0];
    },

    // Get Appointments For Doctor
    async getAppointmentsForDoctor(doctorId) {
        const { rows } = await db.query(
            'SELECT * FROM APPOINTMENTS WHERE DoctorID = $1',
            [doctorId]
        );
        return rows;
    },

    // Get Appointments For Patient
    async getAppointmentsForPatient(patientId) {
        const { rows } = await db.query(
            'SELECT * FROM APPOINTMENTS WHERE PatientID = $1',
            [patientId]
        );
        return rows;
    },

    // Get Appointments By Schedule
    async getAppointmentsBySchedule(scheduleId) {
        const { rows } = await db.query(
            'SELECT * FROM APPOINTMENTS WHERE ScheduleID = $1',
            [scheduleId]
        );
        return rows;
    },

    // Get Follow Up Appointments
    async getFollowUpAppointments(parentAppointmentId) {
        const { rows } = await db.query(
            'SELECT * FROM APPOINTMENTS WHERE ParentAppointmentID = $1',
            [parentAppointmentId]
        );
        return rows;
    },

    // Update Appointment Status
    async updateAppointmentStatus(appointmentId, status) {
        const result = await db.query(
            'UPDATE APPOINTMENTS SET Status = $1 WHERE AppointmentID = $2',
            [status, appointmentId]
        );
        return result.rowCount > 0;
    },

    // Update Appointment
    async updateAppointment(appointmentId, data) {
        const result = await db.query(
            'UPDATE APPOINTMENTS SET AppointmentType = $1, FeePaid = $2 WHERE AppointmentID = $3',
            [data.appointmentType, data.feePaid, appointmentId]
        );
        return result.rowCount > 0;
    }
};

/* ==========================================================
   11) MEDICAL RECORDS MODULE
   ========================================================== */

const medicalRecordQueries = {
    // Create Medical Record
    async createMedicalRecord(data) {
        const { rows } = await db.query(
            'INSERT INTO MEDICALRECORDS (AppointmentID, Diagnosis, Prescription, Notes) VALUES ($1, $2, $3, $4) RETURNING RecordID',
            [data.appointmentId, data.diagnosis, data.prescription, data.notes]
        );
        return rows[0].RecordID;
    },

    // Get Medical Record By Id
    async getMedicalRecordById(recordId) {
        const { rows } = await db.query(
            'SELECT * FROM MEDICALRECORDS WHERE RecordID = $1',
            [recordId]
        );
        return rows[0];
    },

    // Get Medical Records For Patient
    async getMedicalRecordsForPatient(patientId) {
        const { rows } = await db.query(
            `SELECT m.* FROM MEDICALRECORDS m
       JOIN APPOINTMENTS a ON m.AppointmentID = a.AppointmentID
       WHERE a.PatientID = $1`,
            [patientId]
        );
        return rows;
    },

    // Get Medical Records For Appointment
    async getMedicalRecordsForAppointment(appointmentId) {
        const { rows } = await db.query(
            'SELECT * FROM MEDICALRECORDS WHERE AppointmentID = $1',
            [appointmentId]
        );
        return rows;
    }
};

/* ==========================================================
   12) ADMIN ANALYTICS MODULE
   ========================================================== */

const analyticsQueries = {
    // Count Total Appointments
    async countTotalAppointments() {
        const { rows } = await db.query('SELECT COUNT(*) as total FROM APPOINTMENTS');
        return parseInt(rows[0].total);
    },

    // Count Total Doctors
    async countTotalDoctors() {
        const { rows } = await db.query('SELECT COUNT(*) as total FROM DOCTORS');
        return parseInt(rows[0].total);
    },

    // Count Total Patients
    async countTotalPatients() {
        const { rows } = await db.query('SELECT COUNT(*) as total FROM PATIENTS');
        return parseInt(rows[0].total);
    },

    // Count Appointments By Status
    async countAppointmentsByStatus(status) {
        const { rows } = await db.query(
            'SELECT COUNT(*) as total FROM APPOINTMENTS WHERE Status = $1',
            [status]
        );
        return parseInt(rows[0].total);
    },

    // Get Appointment Stats For Doctor 
    async getAppointmentStatsForDoctor(doctorId) {
        const { rows } = await db.query(
            'SELECT Status, COUNT(*) as count FROM APPOINTMENTS WHERE DoctorID = $1 GROUP BY Status',
            [doctorId]
        );
        return rows.map(row => ({
            status: row.status,
            count: parseInt(row.count)
        }));
    }
};

module.exports = {
    userQueries,
    personQueries,
    roleQueries,
    otpQueries,
    specialtyQueries,
    doctorQueries,
    scheduleQueries,
    roomQueries,
    patientQueries,
    appointmentQueries,
    medicalRecordQueries,
    analyticsQueries
};