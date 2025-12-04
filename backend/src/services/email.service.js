const { createTransporter } = require('../config/email');

const CLINIC_NAME = 'LifeCare Clinic';
const CLINIC_EMAIL = process.env.EMAIL_USER;
const FROM = `${CLINIC_NAME} <${CLINIC_EMAIL}>`;
class EmailService {
  /**
   * Send welcome email to new patient
   */
  async sendWelcomeEmail(user) {
    try {
      const transporter = createTransporter();

      const mailOptions = {
        from: FROM,
        to: user.email,
        subject: `Welcome to ${CLINIC_NAME}`,
        html: `
          <h2>Welcome ${user.name}!</h2>
          <p>Thank you for registering with ${CLINIC_NAME}.</p>
          <p>You can now:</p>
          <ul>
            <li>Book appointments</li>
            <li>View your medical records</li>
            <li>Contact our doctors</li>
          </ul>
          <p>Best regards,<br>${CLINIC_NAME} Team</p>
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
   * Send OTP verification code
   */
  async sendOTP(email, otpCode, fullName) {
    try {
      const transporter = createTransporter();

      const mailOptions = {
        from: FROM,
        to: email,
        subject: 'Email Verification - OTP Code',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Email Verification</h2>
            <p>Dear ${fullName},</p>
            <p>Thank you for registering with ${CLINIC_NAME}.</p>
            <p>Your verification code is:</p>
            <div style="background: #f0f0f0; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
              ${otpCode}
            </div>
            <p><strong>This code will expire in 5 minutes.</strong></p>
            <p>If you didn't request this code, please ignore this email.</p>
            <p>Best regards,<br>${CLINIC_NAME} Team</p>
          </div>
        `
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('✅ OTP email sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ OTP email error:', error.message);
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
        from: FROM,
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
          <p>Best regards,<br>${CLINIC_NAME} Team</p>
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
        from: FROM,
        to: user.email,
        subject: 'Password Reset Request',
        html: `
          <h2>Password Reset</h2>
          <p>Dear ${user.name},</p>
          <p>You requested to reset your password. Click the link below:</p>
          <a href="${resetUrl}">${resetUrl}</a>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this, please ignore this email.</p>
          <p>Best regards,<br>${CLINIC_NAME} Team</p>
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
        from: FROM,
        to,
        subject,
        html: `
          <div style="font-family: Arial, sans-serif;">
            <h2>${subject}</h2>
            <p>${message}</p>
            <p>Best regards,<br>${CLINIC_NAME} Team</p>
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
