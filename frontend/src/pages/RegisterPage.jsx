import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register, verifyOTP } from "../api/auth.api.js";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [showOTPForm, setShowOTPForm] = useState(false);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    gender: "Male",
    phone: "",
    yearOfBirth: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    setLoading(true);
    try {
      // استدعاء API للتسجيل
      const response = await register({
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        phoneNumber: formData.phone,
        gender: formData.gender,
        yearOfBirth: formData.yearOfBirth,
      });

      if (response.success) {
        // عرض OTP form بعد التسجيل الناجح
        setShowOTPForm(true);
      } else {
        setError(response.error || "Registration failed. Please try again.");
      }
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOTPSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // تأكد من البيانات قبل الإرسال
      console.log('🔍 OTP Verification Data:', {
        email: formData.email,
        otp: otp,
        otpLength: otp.length
      });

      // استدعاء API للتحقق من OTP
      const response = await verifyOTP(formData.email, otp);

      console.log('✅ OTP Verification Response:', response);

      if (response.success && response.data) {
        // استخدام redirectTo من الـ response
        const redirectPath = response.data.redirectTo || "/patient/dashboard";
        navigate(redirectPath);
      } else {
        setError("OTP verification failed. Please try again.");
      }
    } catch (err) {
      console.error('❌ OTP Verification Error:', err);
      setError(err.message || "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setError("");
    setLoading(true);
    
    try {
      // إعادة إرسال OTP عن طريق إعادة التسجيل
      await register({
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        phoneNumber: formData.phone,
        gender: formData.gender,
        yearOfBirth: formData.yearOfBirth,
      });
      alert("OTP has been resent to your email");
    } catch (err) {
      setError(err.message || "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  if (showOTPForm) {
    return (
      <form className="form" onSubmit={handleOTPSubmit}>
        <h2>Enter the OTP</h2>
        <p className="form-subtitle">
          Please enter the OTP sent to your email to complete registration.
        </p>

        {error && (
          <div
            style={{
              padding: "0.75rem",
              backgroundColor: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              borderRadius: "var(--radius-md)",
              color: "#dc2626",
              marginBottom: "1rem",
              fontSize: "0.9rem"
            }}
          >
            {error}
          </div>
        )}

        <label className="field">
          <span>Email</span>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            placeholder="Enter your email"
          />
        </label>

        <label className="field">
          <span>OTP</span>
          <input
            type="text"
            required
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            maxLength={6}
          />
        </label>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Verifying..." : "Verify & Continue"}
        </button>
        <div style={{ marginTop: "1rem", textAlign: "center" }}>
          <button
            type="button"
            onClick={handleResendOTP}
            style={{
              background: "none",
              border: "none",
              color: "var(--primary)",
              cursor: "pointer",
              textDecoration: "underline",
              fontSize: "0.9rem",
            }}
          >
            Resend OTP
          </button>
        </div>
      </form>
    );
  }

  return (
    <form className="form" onSubmit={handleRegisterSubmit}>
      <h2>Create account</h2>
      <p className="form-subtitle">
        Register as a new patient to start booking appointments online.
      </p>

      {error && (
        <div
          style={{
            padding: "0.75rem",
            backgroundColor: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            borderRadius: "var(--radius-md)",
            color: "#dc2626",
            marginBottom: "1rem",
            fontSize: "0.9rem"
          }}
        >
          {error}
        </div>
      )}

      <label className="field">
        <span>Full Name</span>
        <input
          type="text"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          required
        />
      </label>

      <label className="field">
        <span>Email</span>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </label>

      <div className="form-grid-2">
        <label className="field">
          <span>Gender</span>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            style={{
              width: "100%",
            }}
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </label>

        <label className="field">
          <span>Year of Birth</span>
          <input
            type="number"
            name="yearOfBirth"
            placeholder="YYYY"
            min="1900"
            max={new Date().getFullYear()}
            value={formData.yearOfBirth}
            onChange={handleChange}
            required
          />
        </label>
      </div>

      <label className="field">
        <span>Phone Number</span>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          required
        />
      </label>

      <div className="form-grid-2">
        <label className="field">
          <span>Password</span>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </label>
        <label className="field">
          <span>Confirm Password</span>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
        </label>
      </div>

      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? "Creating account..." : "Sign up"}
      </button>
    </form>
  );
}
