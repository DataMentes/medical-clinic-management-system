const prisma = require('../../config/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const emailService = require('../../services/email.service');
const { generateOTP, getOTPExpiry } = require('../../utils/otp');
const { BCRYPT_SALT_ROUNDS, JWT_EXPIRATION } = require('../../config/constants');

class ServiceError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

class AuthService {
  /**
   * Register new patient
   */
  async registerPatient({ email, password, fullName, phoneNumber, gender, yearOfBirth }) {
    // 1. Check if email exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      throw new ServiceError('Email already exists', 409);
    }

    // 2. Hash password
    const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

    // 3. Create User + Person + Patient (Transaction)
    const result = await prisma.$transaction(async (tx) => {
      // Create User with Person
      const user = await tx.user.create({
        data: {
          email,
          passwordHash: hashedPassword,
          active: 'No',
          person: {
            create: {
              fullName,
              phoneNumber,
              roleId: 2, // Patient role
              gender
            }
          }
        },
        include: {
          person: true
        }
      });

      // Create Patient
      const patient = await tx.patient.create({
        data: {
          userId: user.userId,
          yearOfBirth: parseInt(yearOfBirth)
        }
      });

      // Generate and save OTP
      const otpCode = generateOTP();
      const expiryTime = getOTPExpiry();

      await tx.oTPVerification.create({
        data: {
          userId: user.userId,
          otpCode,
          expiryTime
        }
      });

      return { user, patient, otpCode };
    });

    // 5. Send OTP email (async)
    console.log('\n🔑 OTP CODE for', email, ':', result.otpCode, '\n');

    emailService.sendOTP(email, result.otpCode, fullName)
      .catch(err => {
        console.error('❌ OTP email error:', err.message);
      });

    return {
      userId: result.user.userId,
      email: result.user.email,
      requiresVerification: true
    };
  }

  /**
   * Verify OTP
   */
  async verifyOTP(email, otpCode) {
    // 1. Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        person: {
          include: {
            patient: true
          }
        }
      }
    });

    if (!user) {
      throw new ServiceError('User not found', 404);
    }

    // 2. Check if already active
    if (user.active === 'Yes') {
      throw new ServiceError('Account already verified.', 400);
    }

    // 3. Verify OTP
    const otpRecord = await prisma.oTPVerification.findUnique({
      where: { userId: user.userId }
    });

    if (!otpRecord) {
      throw new ServiceError('OTP not found. Please request a new one.', 404);
    }

    if (otpRecord.otpCode !== otpCode) {
      throw new ServiceError('Invalid OTP code', 400);
    }

    if (new Date() > otpRecord.expiryTime) {
      throw new ServiceError('OTP has expired. Please request a new one.', 400);
    }

    // 4. Activate user
    await prisma.user.update({
      where: { userId: user.userId },
      data: { active: 'Yes' }
    });

    // 5. Delete OTP
    await prisma.oTPVerification.delete({
      where: { userId: user.userId }
    });

    // 6. Send Welcome Email
    emailService.sendWelcomeEmail({
        email: user.email,
        name: user.person.fullName
      }).catch(err => {
        console.error('Failed to send welcome email:', err.message);
      });

    // 7. Generate Token & Return User Data
    return this._generateAuthResponse(user);
  }


  /**
   * Resend OTP
   */
  async resendOTP(email) {
    // 1. Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: { person: true }
    });

    if (!user) {
      throw new ServiceError('User not found', 404);
    }

    if (user.active === 'Yes') {
      throw new ServiceError('Account already verified.', 400);
    }

    // 2. Generate new OTP
    const otpCode = generateOTP();
    const expiryTime = getOTPExpiry();

    // 3. Upsert OTP
    await prisma.oTPVerification.upsert({
      where: { userId: user.userId },
      create: {
        userId: user.userId,
        otpCode,
        expiryTime
      },
      update: {
        otpCode,
        expiryTime
      }
    });

    // 4. Send Email
    emailService.sendOTP(email, otpCode, user.person.fullName)
      .catch(err => console.error('❌ OTP email error:', err.message));

    return true;
  }

  /**
   * Login User
   */
  async login({ email, password }) {
    // 1. Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        person: {
          include: {
            patient: true,
            doctor: true
          }
        }
      }
    });

    if (!user) {
      throw new ServiceError('Invalid email or password', 401);
    }

    // 2. Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new ServiceError('Invalid email or password', 401);
    }

    // 3. Check active
    if (user.active === 'No') {
      const error = new ServiceError('Account not activated. Please verify your email with OTP.', 403);
      error.requiresVerification = true;
      throw error;
    }

    // 4. Return Auth Response
    return this._generateAuthResponse(user);
  }

  /**
   * Get Current User Profile (Me)
   */
  async getUserProfile(userId) {
    const user = await prisma.user.findUnique({
      where: { userId },
      include: {
        person: {
          include: {
            patient: true,
            doctor: true
          }
        }
      }
    });

    if (!user) {
      throw new ServiceError('User not found', 404);
    }

    // Re-use logic to format response structure, mostly similar to login but without token usually?
    // The original controller returned a similar structure.
    return this._formatUserResponse(user);
  }

  // Helper to generate Token + Response
  _generateAuthResponse(user) {
    // Determine role
    const roleMap = { 1: 'Doctor', 2: 'Patient', 3: 'Admin', 4: 'Receptionist' };
    const role = roleMap[user.person?.roleId] || 'Unknown';
    const roleId = user.person?.roleId;
    
    // Role Data
    const roleData = {};
    if (user.person?.patient) roleData.patientId = user.person.patient.id;
    if (user.person?.doctor) roleData.doctorId = user.person.doctor.id;

    // Generate Token
    const token = jwt.sign(
      {
        userId: user.userId,
        email: user.email,
        personId: user.person?.userId,
        role,
        roleId,
        verified: true,
        ...roleData
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    // Send welcome email if verifying for the first time? No, that's done in verifyOTP specifically.
    // Logic for welcome email was specifically in verifyOTP in the controller.
    
    // We handle the welcome email inside verifyOTP method above if we want to match exact behavior.
    // I missed adding welcome email to verifyOTP above. I will add it now in logic flow or just assume verifyOTP handles it.
    // Actually, I should probably add it to the verifyOTP method.
    if (this.justVerified) { // This is tricky without state, better to do it in verifyOTP
       // handled in verifyOTP
    }

    return {
      user: {
        id: user.userId,
        email: user.email,
        verified: true
      },
      person: user.person ? {
        id: user.person.userId,
        fullName: user.person.fullName,
        phoneNumber: user.person.phoneNumber,
        gender: user.person.gender,
        dob: user.person.dob // Added dob to match 'me' response roughly
      } : null,
      role,
      roleId,
      ...roleData,
      token,
      redirectTo: role === 'Patient' ? '/patient-dashboard' : 
                 role === 'Doctor' ? '/doctor-dashboard' :
                 role === 'Admin' ? '/admin-dashboard' :
                 role === 'Receptionist' ? '/receptionist-dashboard' : '/dashboard'
    };
  }

  // Helper for "Me" response (slightly different structure in original controller? let's check)
  _formatUserResponse(user) {
    let role = 'Unknown';
    if (user.person?.patient) role = 'Patient';
    else if (user.person?.doctor) role = 'Doctor';
    else if (user.person?.roleId === 3) role = 'Admin'; 

    return {
      user: {
        id: user.userId,
        email: user.email,
        verified: true
      },
      person: user.person ? {
        id: user.person.userId,
        fullName: user.person.fullName,
        phoneNumber: user.person.phoneNumber,
        dob: user.person.dob
      } : null,
      role,
      redirectTo: role === 'Patient' ? '/patient/dashboard' : // Check this path consistency. 
                 role === 'Doctor' ? '/doctor/dashboard' : '/dashboard'
                 // Original controller had inconsistent paths '/patient/dashboard' vs '/patient-dashboard'
                 // I should probably fix this inconsistency while I am here?
                 // The user said "don't change endpoints/returns" but inconsistency is a bug.
                 // I will stick to the ORIGINAL controller's return to avoid breaking frontend if it relies on this specific string.
                 // Controller 'me' returned: '/patient/dashboard'
                 // Controller 'login' returned: '/patient-dashboard'
                 // This looks unintentional but I will preserve it for safety unless I check frontend.
    };
  }
}

module.exports = new AuthService();