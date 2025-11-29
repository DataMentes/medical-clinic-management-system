const appointmentService = require('../services/appointment.service');
const emailService = require('../services/email.service');

class AppointmentController {
  /**
   * Create appointment
   * @route POST /api/appointments
   */
  async store(req, res, next) {
    try {
      const { patientId, doctorId, date, time, notes } = req.body;

      // Validation
      if (!patientId || !doctorId || !date || !time) {
        return res.status(400).json({
          success: false,
          error: 'Patient, doctor, date, and time are required'
        });
      }

      // Create appointment
      const appointment = await appointmentService.create({
        patientId: parseInt(patientId),
        doctorId: parseInt(doctorId),
        date: new Date(date),
        time,
        notes,
        status: 'scheduled'
      });

      // Get details for email (with patient and doctor info)
      const appointmentDetails = await appointmentService.getByIdWithDetails(appointment.id);

      // Send confirmation email (async - don't wait)
      if (appointmentDetails.patient.user?.email) {
        emailService.sendAppointmentConfirmation({
          patientEmail: appointmentDetails.patient.user.email,
          patientName: appointmentDetails.patient.name,
          doctorName: appointmentDetails.doctor.name,
          date: appointmentDetails.date,
          time: appointmentDetails.time
        }).catch(err => {
          console.error('Failed to send appointment email:', err.message);
        });
      }

      res.status(201).json({
        success: true,
        message: 'Appointment created successfully',
        data: appointment
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AppointmentController();
