const { createTransporter } = require('../config/email');

class EmailService {
  /**
   * Send welcome email to new patient
   */
  async sendWelcomeEmail(user) {
    try {
      const transporter = createTransporter();

      const mailOptions = {
        from: `"Medical Clinic" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: 'Welcome to Medical Clinic',
        html: `
          <h2>Welcome ${user.name}!</h2>
          <p>Thank you for registering with our medical clinic.</p>
          <p>You can now:</p>
          <ul>
            <li>Book appointments</li>
            <li>View your medical records</li>
            <li>Contact our doctors</li>
          </ul>
          <p>Best regards,<br>Medical Clinic Team</p>
        `
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('✅ Welcome email sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Email error:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send appointment confirmation
   */
  async sendAppointmentConfirmation(appointment) {
    try {
      const transporter = createTransporter();

      const mailOptions = {
        from: `"Medical Clinic" <${process.env.EMAIL_USER}>`,
        to: appointment.patientEmail,
        subject: 'Appointment Confirmation',
        html: `
          <h2>Appointment Confirmed</h2>
          <p>Dear ${appointment.patientName},</p>
          <p>Your appointment has been confirmed:</p>
          <ul>
            <li><strong>Doctor:</strong> ${appointment.doctorName}</li>
            <li><strong>Date:</strong> ${appointment.date}</li>
            <li><strong>Time:</strong> ${appointment.time}</li>
          </ul>
          <p>Please arrive 10 minutes early.</p>
          <p>Best regards,<br>Medical Clinic Team</p>
        `
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('✅ Appointment email sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Email error:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordReset(user, resetToken) {
    try {
      const transporter = createTransporter();
      const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

      const mailOptions = {
        from: `"Medical Clinic" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: 'Password Reset Request',
        html: `
          <h2>Password Reset</h2>
          <p>Dear ${user.name},</p>
          <p>You requested to reset your password. Click the link below:</p>
          <a href="${resetUrl}">${resetUrl}</a>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this, please ignore this email.</p>
          <p>Best regards,<br>Medical Clinic Team</p>
        `
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('✅ Password reset email sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Email error:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send generic notification
   */
  async sendNotification(to, subject, message) {
    try {
      const transporter = createTransporter();

      const mailOptions = {
        from: `"Medical Clinic" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html: `
          <div style="font-family: Arial, sans-serif;">
            <h2>${subject}</h2>
            <p>${message}</p>
            <p>Best regards,<br>Medical Clinic Team</p>
          </div>
        `
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('✅ Notification sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Email error:', error.message);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new EmailService();
