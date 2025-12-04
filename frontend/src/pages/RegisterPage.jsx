import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../api/authService";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [showOTPForm, setShowOTPForm] = useState(false);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    gender: "MALE",
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
      // Send OTP first
      await authService.sendOTP(formData.email);
      setShowOTPForm(true);
    } catch (err) {
      console.error('Send OTP error:', err);
      setError(err.response?.data?.error || "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOTPSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Verify OTP
      await authService.verifyOTP(formData.email, otp);

      // Register user
      const registerData = {
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        phone: formData.phone,
        gender: formData.gender,
        yearOfBirth: formData.yearOfBirth ? parseInt(formData.yearOfBirth) : null
      };

      const response = await authService.register(registerData);

      // Navigate to patient dashboard
      navigate("/patient-dashboard");
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.error || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      await authService.sendOTP(formData.email);
      alert("OTP has been resent to your email");
    } catch (err) {
      console.error('Resend OTP error:', err);
      setError("Failed to resend OTP. Please try again.");
    }
  };

  if (showOTPForm) {
    return (
      <form className="form" onSubmit={handleOTPSubmit}>
        <h2>Enter the OTP</h2>
        <p className="form-subtitle">
          Please enter the OTP sent to your email to complete registration.
        </p>

        {error && <div className="error-message" style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}

        <label className="field">
          <span>OTP</span>
          <input
            type="text"
            required
            placeholder="Enter 6-digit OTP"
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
            disabled={loading}
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
        <div style={{ marginTop: "1rem", textAlign: "center" }}>
          <button
            type="button"
            onClick={() => setShowOTPForm(false)}
            disabled={loading}
            style={{
              background: "none",
              border: "none",
              color: "var(--text-soft)",
              cursor: "pointer",
              fontSize: "0.9rem",
            }}
          >
            ← Back to registration
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

      {error && <div className="error-message" style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}

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
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
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
        {loading ? "Sending OTP..." : "Sign up"}
      </button>
    </form>
  );
}
