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
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
            <h2 style="color: #2c5aa0;">Appointment Confirmed ✓</h2>
            <p>Dear <strong>${appointment.patientName}</strong>,</p>
            <p>Your appointment has been successfully confirmed with the following details:</p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0;"><strong>👨‍⚕️ Doctor:</strong></td>
                  <td style="padding: 8px 0;">${appointment.doctorName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;"><strong>📅 Date:</strong></td>
                  <td style="padding: 8px 0;">${appointment.date}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;"><strong>🕐 Time:</strong></td>
                  <td style="padding: 8px 0;">${appointment.time}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;"><strong>🏥 Room:</strong></td>
                  <td style="padding: 8px 0;">${appointment.room}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;"><strong>📋 Type:</strong></td>
                  <td style="padding: 8px 0;">${appointment.appointmentType}</td>
                </tr>
              </table>
            </div>
            
            <div style="background: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0;">
              <strong>⏰ Important Reminder:</strong>
              <p style="margin: 5px 0 0 0;">Please arrive <strong>10 minutes early</strong> for check-in.</p>
            </div>
            
            <p style="color: #666; font-size: 14px; margin-top: 30px;">
              If you need to cancel or reschedule, please contact us as soon as possible.
            </p>
            
            <p>Best regards,<br><strong>${CLINIC_NAME} Team</strong></p>
          </div>
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
