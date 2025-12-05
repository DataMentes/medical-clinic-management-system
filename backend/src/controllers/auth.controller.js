const prisma = require('../config/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const emailService = require('../services/email.service');
const { generateOTP, getOTPExpiry } = require('../utils/otp');

class AuthController {
  /**
   * Step 1: Register new patient + Send OTP
   * @route POST /api/auth/register
   */
  async register(req, res, next) {
    try {
      const { email, password, fullName, phoneNumber, gender, yearOfBirth } = req.body;

      // 1. Validation
      if (!email || !password || !fullName || !phoneNumber || !gender || !yearOfBirth) {
        return res.status(400).json({
          success: false,
          error: 'All fields are required (email, password, fullName, phoneNumber, gender, yearOfBirth)'
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          error: 'Password must be at least 6 characters'
        });
      }

      // 2. Check if email exists
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          error: 'Email already exists'
        });
      }

      // 3. Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // 4. Create User + Person + Patient (Transaction)
      const result = await prisma.$transaction(async (tx) => {
        // Create User with Person (nested create)
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

        const otp = await tx.oTPVerification.create({
          data: {
            userId: user.userId,
            otpCode,
            expiryTime
          }
        });

        return { user, patient, otpCode };
      });

      // 5. Send OTP email (async - don't wait)
      console.log('\n🔑 OTP CODE for', email, ':', result.otpCode, '\n');
      
      emailService.sendOTP(email, result.otpCode, fullName)
        .catch(err => {
          console.error('❌ OTP email error:', err.message);
        });

      // 6. Return response
      return res.status(201).json({
        success: true,
        message: 'Registration successful. Please check your email for OTP verification code.',
        data: {
          userId: result.user.userId,
          email: result.user.email,
          requiresVerification: true
        }
      });

    } catch (error) {
      console.error('Registration error:', error);
      next(error);
    }
  }

  /**
   * Step 2: Verify OTP
   * @route POST /api/auth/verify-otp
   */
  async verifyOTP(req, res, next) {
    try {
      const { email, otpCode } = req.body;

      if (!email || !otpCode) {
        return res.status(400).json({
          success: false,
          error: 'Email and OTP code are required'
        });
      }

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
      
      console.log(user);


      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      // 2. Check if user is already active
      if (user.active === 'Yes') {
        return res.status(400).json({
          success: false,
          error: 'Account already verified.'
        });
      }

      // 3. Verify OTP
      const otpRecord = await prisma.oTPVerification.findUnique({
        where: { userId: user.userId }
      });

      if (!otpRecord) {
        return res.status(404).json({
          success: false,
          error: 'OTP not found. Please request a new one.'
        });
      }

      if (otpRecord.otpCode !== otpCode) {
        return res.status(400).json({
          success: false,
          error: 'Invalid OTP code'
        });
      }

      if (new Date() > otpRecord.expiryTime) {
        return res.status(400).json({
          success: false,
          error: 'OTP has expired. Please request a new one.'
        });
      }

      // 4. Activate user account
      await prisma.user.update({
        where: { userId: user.userId },
        data: {
          active: 'Yes'
        }
      });

      // 5. Delete OTP (verified successfully)
      await prisma.oTPVerification.delete({
        where: { userId: user.userId }
      });

      // 6. Generate JWT token
      const token = jwt.sign(
        {
          id: user.userId,
          email: user.email,
          personId: user.person.userId,
          patientId: user.person.patient.id,
          role: 'Patient',
          verified: true
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      );

      // 7. Send welcome email (async)
      emailService.sendWelcomeEmail({
        email: user.email,
        name: user.person.fullName
      }).catch(err => {
        console.error('Failed to send welcome email:', err.message);
      });

      // 8. Return response
      return res.json({
        success: true,
        message: 'Email verified successfully',
        data: {
          user: {
            id: user.userId,
            email: user.email,
            verified: true
          },
          person: {
            id: user.person.userId,
            fullName: user.person.fullName,
            phoneNumber: user.person.phoneNumber
          },
          patient: {
            id: user.person.patient.id
          },
          token,
          role: 'Patient'
        }
      });

    } catch (error) {
      console.error('OTP verification error:', error);
      next(error);
    }
  }

  /**
   * Resend OTP
   * @route POST /api/auth/resend-otp
   */
  async resendOTP(req, res, next) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          error: 'Email is required'
        });
      }

      // 1. Find user
      const user = await prisma.user.findUnique({
        where: { email },
        include: {
          person: true
        }
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      // 2. Check if user is already active
      if (user.active === 'Yes') {
        return res.status(400).json({
          success: false,
          error: 'Account already verified.'
        });
      }

      // 3. Generate new OTP (will update existing record)
      const otpCode = generateOTP();
      const expiryTime = getOTPExpiry();

      // 4. Upsert OTP (update existing or create new)
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

      // 5. Send OTP email
      console.log('\n🔑 RESEND OTP for', email, ':', otpCode, '\n');
      
      emailService.sendOTP(email, otpCode, user.person.fullName)
        .catch(err => {
          console.error('❌ OTP email error:', err.message);
        });

      return res.json({
        success: true,
        message: 'New OTP sent to your email'
      });

    } catch (error) {
      console.error('Resend OTP error:', error);
      next(error);
    }
  }

  /**
   * Login user (requires verified email)
   * @route POST /api/auth/login
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: 'Email and password are required'
        });
      }

      // 1. Find user with person and role data
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
        return res.status(401).json({
          success: false,
          error: 'Invalid email or password'
        });
      }

      // 2. Verify password
      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          error: 'Invalid email or password'
        });
      }

      // 3. Check if account is active
      if (user.active === 'No') {
        return res.status(403).json({
          success: false,
          error: 'Account not activated. Please verify your email with OTP.',
          requiresVerification: true
        });
      }

      // 4. Determine role based on Person.roleId
      // roleId: 1=Doctor, 2=Patient, 3=Admin, 4=Receptionist
      const roleMap = {
        1: 'Doctor',
        2: 'Patient',
        3: 'Admin',
        4: 'Receptionist'
      };
      
      const role = roleMap[user.person?.roleId] || 'Unknown';
      const roleId = user.person?.roleId;
      
      // Add specific IDs based on role
      const roleData = {};
      if (user.person?.patient) {
        roleData.patientId = user.person.patient.id;
      }
      if (user.person?.doctor) {
        roleData.doctorId = user.person.doctor.id;
      }

      // 5. Generate token
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

      // 6. Return response with clear role info
      return res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user.userId,
            email: user.email,
            verified: true
          },
          person: user.person ? {
            id: user.person.userId,
            fullName: user.person.fullName,
            phoneNumber: user.person.phoneNumber,
            gender: user.person.gender
          } : null,
          role,
          roleId,
          ...roleData,
          token,
          redirectTo: role === 'Patient' ? '/patient-dashboard' : 
                     role === 'Doctor' ? '/doctor-dashboard' :
                     role === 'Admin' ? '/admin-dashboard' :
                     role === 'Receptionist' ? '/receptionist-dashboard' : '/dashboard'
        }
      });

    } catch (error) {
      console.error('Login error:', error);
      next(error);
    }
  }

  /**
   * Get current user
   * @route GET /api/auth/me
   */
  async me(req, res, next) {
    try {
      const userId = req.user.userId;

      const user = await prisma.user.findUnique({
        where: { userId: userId },
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
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      let role = 'Unknown';
      if (user.person?.patient) role = 'Patient';
      else if (user.person?.doctor) role = 'Doctor';

      return res.json({
        success: true,
        data: {
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
          redirectTo: role === 'Patient' ? '/patient/dashboard' : 
                     role === 'Doctor' ? '/doctor/dashboard' : '/dashboard'
        }
      });

    } catch (error) {
      console.error('Me error:', error);
      next(error);
    }
  }

  /**
   * Logout
   * @route POST /api/auth/logout
   */
  async logout(req, res, next) {
    try {
      return res.json({
        success: true,
        message: 'Logout successful'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
