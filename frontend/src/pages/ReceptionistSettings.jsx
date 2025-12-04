import { useState, useEffect } from "react";
import { authService } from "../api/authService";
import { receptionistService } from "../api/receptionistService";

export default function ReceptionistSettings() {
  const [formData, setFormData] = useState({
    phone: "",
    email: "",
    password: "",
    fullName: ""
  });
  const [receptionistId, setReceptionistId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [originalEmail, setOriginalEmail] = useState("");
  const [resendingOTP, setResendingOTP] = useState(false);
  const [pendingFormData, setPendingFormData] = useState(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const user = await authService.getCurrentUser();
      if (user && user.receptionist) {
        setReceptionistId(user.receptionist.id);
        setFormData(prev => ({
          ...prev,
          phone: user.phone || "",
          email: user.email || "",
          fullName: user.fullName || ""
        }));
        setOriginalEmail(user.email);
      }
    } catch (error) {
      console.error("Failed to fetch user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const sendOTP = async (email) => {
    try {
      await authService.sendOTP(email);
      alert(`OTP has been sent to ${email}`);
    } catch (error) {
      console.error("Failed to send OTP:", error);
      alert("Failed to send OTP");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const emailChanged = formData.email && formData.email !== originalEmail;

    if (emailChanged) {
      setPendingFormData(formData);
      await sendOTP(formData.email);
      setShowOTPModal(true);
    } else {
      performSave(formData);
    }
  };

  const performSave = async (dataToSave) => {
    if (!receptionistId) return;
    setSaving(true);

    try {
      const updateData = {
        phone: dataToSave.phone,
        email: dataToSave.email,
        fullName: dataToSave.fullName
      };

      if (dataToSave.password) {
        updateData.password = dataToSave.password;
      }

      await receptionistService.updateSettings(updateData);

      alert("Settings updated successfully!");
      setOriginalEmail(dataToSave.email);

      setFormData((prev) => ({
        ...prev,
        password: ""
      }));

    } catch (error) {
      console.error("Failed to update settings:", error);
      alert("Failed to update settings: " + (error.response?.data?.error || error.message));
    } finally {
      setSaving(false);
    }
  };

  const handleOTPVerify = async (e) => {
    e.preventDefault();

    if (!otp || otp.length !== 6) {
      alert("Please enter a valid 6-digit OTP");
      return;
    }

    try {
      await authService.verifyOTP(pendingFormData.email, otp);
      await performSave(pendingFormData);
      setShowOTPModal(false);
      setOtp("");
      setPendingFormData(null);
    } catch (error) {
      console.error("OTP Verification failed:", error);
      alert("Invalid OTP");
    }
  };

  const handleResendOTP = async () => {
    if (!pendingFormData?.email) return;

    setResendingOTP(true);
    try {
      await sendOTP(pendingFormData.email);
    } finally {
      setResendingOTP(false);
    }
  };

  const handleCancelOTP = () => {
    setShowOTPModal(false);
    setOtp("");
    setPendingFormData(null);
    setFormData((prev) => ({
      ...prev,
      email: originalEmail
    }));
  };

  if (loading) return <div className="page"><p>Loading settings...</p></div>;

  return (
    <div className="page">
      <header className="page-header">
        <h1>Receptionist Settings</h1>
        <p>Manage your account information and preferences.</p>
      </header>

      <div className="card">
        <form className="form" onSubmit={handleSubmit}>
          <h3>Account Information</h3>

          <label className="field">
            <span>Full Name</span>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Full Name"
            />
          </label>

          <label className="field">
            <span>Phone Number</span>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+20 100 123 4567"
            />
          </label>

          <label className="field">
            <span>Email</span>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
            />
          </label>

          <h3 style={{ marginTop: "1.5rem" }}>Change Password</h3>

          <label className="field">
            <span>New Password</span>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Leave empty to keep current password"
              minLength={6}
            />
            {formData.password && (
              <p
                className="muted"
                style={{ marginTop: "0.5rem", fontSize: "0.85rem" }}
              >
                Password must be at least 6 characters
              </p>
            )}
          </label>

          <div className="actions-buttons" style={{ marginTop: "1.5rem" }}>
            <button
              type="submit"
              className="btn-primary"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>

      {/* OTP Modal */}
      {showOTPModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "1rem"
          }}
          onClick={handleCancelOTP}
        >
          <div
            className="card"
            style={{
              maxWidth: "400px",
              width: "100%",
              position: "relative"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <form className="form" onSubmit={handleOTPVerify}>
              <h2>Verify Email Change</h2>
              <p className="form-subtitle" style={{ marginBottom: "1.5rem" }}>
                Please enter the OTP sent to{" "}
                <strong>{pendingFormData?.email}</strong> to confirm your email change.
              </p>
              <label className="field">
                <span>OTP</span>
                <input
                  type="text"
                  required
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  maxLength={6}
                  style={{
                    textAlign: "center",
                    letterSpacing: "0.5rem",
                    fontSize: "1.2rem"
                  }}
                  autoFocus
                />
              </label>
              <div
                style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem" }}
              >
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleCancelOTP}
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ flex: 1 }}
                >
                  Verify & Save
                </button>
              </div>
              <div style={{ marginTop: "1rem", textAlign: "center" }}>
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={resendingOTP}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--accent)",
                    cursor: resendingOTP ? "not-allowed" : "pointer",
                    textDecoration: "underline",
                    fontSize: "0.9rem",
                    opacity: resendingOTP ? 0.6 : 1
                  }}
                >
                  {resendingOTP ? "Sending..." : "Resend OTP"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
