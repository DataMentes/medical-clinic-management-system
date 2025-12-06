import { useState, useEffect } from "react";

const DOCTOR_DATA_KEY = "doctorUserData";

export default function DoctorSettings() {
  const [formData, setFormData] = useState({
    phone: "",
    email: "",
    password: "",
    currentPassword: ""
  });
  const [saving, setSaving] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [originalEmail, setOriginalEmail] = useState("");
  const [resendingOTP, setResendingOTP] = useState(false);
  const [pendingFormData, setPendingFormData] = useState(null);

  // قراءة البيانات الحالية من localStorage عند تحميل الصفحة
  useEffect(() => {
    const savedData = JSON.parse(
      localStorage.getItem(DOCTOR_DATA_KEY) || "null"
    );
    if (savedData) {
      const email = savedData.email || "";
      setFormData((prev) => ({
        ...prev,
        phone: savedData.phone || "",
        email: email
      }));
      setOriginalEmail(email);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // إرسال OTP إلى الإيميل الجديد
  const sendOTP = (email) => {
    // في التطبيق الحقيقي، هنا هيكون API call لإرسال OTP
    // محاكاة إرسال OTP
    console.log(`OTP sent to ${email}`);
    alert(`OTP has been sent to ${email}`);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // التحقق إذا كان الإيميل تغير
    const emailChanged = formData.email && formData.email !== originalEmail;

    if (emailChanged) {
      // حفظ البيانات المؤقتة لإكمال الحفظ بعد التحقق من OTP
      setPendingFormData(formData);
      // إرسال OTP إلى الإيميل الجديد
      sendOTP(formData.email);
      // عرض نافذة OTP
      setShowOTPModal(true);
    } else {
      // لو الإيميل ما تغيرش، نحفظ مباشرة
      performSave();
    }
  };

  const performSave = () => {
    setSaving(true);

    // محاكاة عملية الحفظ (في التطبيق الحقيقي هيكون API call)
    setTimeout(() => {
      const dataToSave = {
        phone: formData.phone,
        email: formData.email,
        updatedAt: new Date().toISOString()
      };

      // لو فيه password جديد، نحفظه (في التطبيق الحقيقي هيكون encrypted)
      if (formData.password) {
        dataToSave.password = formData.password; // في التطبيق الحقيقي: hashed password
      }

      localStorage.setItem(DOCTOR_DATA_KEY, JSON.stringify(dataToSave));

      setSaving(false);
      alert("Settings updated successfully!");

      // تحديث الإيميل الأصلي
      setOriginalEmail(formData.email);

      // reset password fields بعد الحفظ
      setFormData((prev) => ({
        ...prev,
        password: "",
        currentPassword: ""
      }));
    }, 500);
  };

  const handleOTPVerify = (e) => {
    e.preventDefault();

    if (!otp || otp.length !== 6) {
      alert("Please enter a valid 6-digit OTP");
      return;
    }

    // للـ demo، نحاكي التحقق الناجح
    setTimeout(() => {
      performSave();
      setShowOTPModal(false);
      setOtp("");
      setPendingFormData(null);
    }, 500);
  };

  const handleResendOTP = () => {
    if (!formData.email) return;

    setResendingOTP(true);
    setTimeout(() => {
      sendOTP(formData.email);
      setResendingOTP(false);
    }, 500);
  };

  const handleCancelOTP = () => {
    setShowOTPModal(false);
    setOtp("");
    setPendingFormData(null);
    // إرجاع الإيميل إلى القيمة الأصلية
    if (pendingFormData) {
      setFormData((prev) => ({
        ...prev,
        email: originalEmail
      }));
    }
  };

  return (
    <div className="page">
      <header className="page-header">
        <h1>Doctor Settings</h1>
        <p>Manage your doctor account information and preferences.</p>
      </header>

      <div className="card">
        <form className="form" onSubmit={handleSubmit}>
          <h3>Account Information</h3>

          {/* رقم الموبايل */}
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

          {/* الإيميل */}
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

          {/* الباسورد الحالي (للتأكيد عند تغيير الباسورد) */}
          <label className="field">
            <span>Current Password</span>
            <input
              type="password"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              placeholder="Enter current password to change password"
            />
          </label>

          {/* الباسورد الجديد */}
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
                <strong>{formData.email}</strong> to confirm your email change.
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


