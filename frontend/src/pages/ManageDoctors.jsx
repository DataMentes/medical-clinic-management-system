import { useState, useEffect } from "react";
import { adminService } from "../api/adminService";
// Removed supportingServices import - using adminService instead

export default function ManageDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    gender: "Male",  // Capitalized to match backend format
    specialtyId: "",
    examinationFee: "",
    consultationFee: "",
    biography: ""
  });

  // Fetch doctors and specialties
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [doctorsResponse, specialtiesResponse] = await Promise.all([
        adminService.getAllDoctors(),
        adminService.getAllSpecialties() // Fixed: was getAll()
      ]);

      // Backend returns: {doctors: [...], pagination: {...}}
      // Access the doctors array from the response
      const doctorsData = doctorsResponse.doctors || [];
      const specialtiesData = specialtiesResponse.specialties || [];

      const formattedDoctors = doctorsData.map(d => ({
        id: d.id,
        userId: d.userId,
        fullName: d.fullName,
        email: d.email,
        phone: d.phoneNumber,
        gender: d.gender,
        specialty: d.specialty,
        specialtyId: d.specialtyId,
        examinationFee: d.examinationFee,
        consultationFee: d.consultationFee,
        biography: d.biography
      }));

      setDoctors(formattedDoctors);
      setSpecialties(specialtiesData);
    } catch (error) {
      console.error("Failed to fetch data:", error);
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

  const handleAdd = () => {
    setEditingDoctor(null);
    setFormData({
      fullName: "",
      email: "",
      phone: "",
      password: "",
      gender: "Male",  // Capitalized to match backend format
      specialtyId: "",
      examinationFee: "",
      consultationFee: "",
      biography: ""
    });
    setShowModal(true);
  };

  const handleEdit = (doctor) => {
    setEditingDoctor(doctor);
    setFormData({
      fullName: doctor.fullName,
      email: doctor.email,
      phone: doctor.phone || "",
      password: "",
      gender: doctor.gender || "Male",
      specialtyId: doctor.specialtyId || "",
      examinationFee: doctor.examinationFee?.toString() || "",
      consultationFee: doctor.consultationFee?.toString() || "",
      biography: doctor.biography || ""
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this doctor?")) {
      try {
        await adminService.deleteDoctor(id);
        setDoctors(prev => prev.filter(d => d.id !== id));
      } catch (error) {
        console.error("Failed to delete doctor:", error);
        alert("Failed to delete doctor");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const doctorData = {
        fullName: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phone, // Backend expects phoneNumber
        gender: formData.gender.charAt(0).toUpperCase() + formData.gender.slice(1), // Capitalize: Male/Female
        specialtyId: parseInt(formData.specialtyId),
        examinationFee: parseFloat(formData.examinationFee),
        consultationFee: parseFloat(formData.consultationFee),
        biography: formData.biography
      };

      if (editingDoctor) {
        // Update
        if (formData.password) {
          doctorData.password = formData.password;
        }
        await adminService.updateDoctor(editingDoctor.id, doctorData);
        alert("Doctor updated successfully");
      } else {
        // Create
        doctorData.password = formData.password;
        await adminService.createDoctor(doctorData);
        alert("Doctor created successfully");
      }

      setShowModal(false);
      setEditingDoctor(null);
      fetchData(); // Refresh list

    } catch (error) {
      console.error("Operation failed:", error);
      alert("Operation failed: " + (error.response?.data?.error || error.message));
    }
  };

  if (loading) return <div className="page"><p>Loading doctors...</p></div>;

  return (
    <div className="page">
      <header className="page-header">
        <h1>Manage Doctors</h1>
        <p>Add, edit, or remove doctor accounts.</p>
      </header>

      <div className="card">
        <div className="card-header">
          <h3>Doctors</h3>
          <button className="btn-primary" onClick={handleAdd}>
            + Add Doctor
          </button>
        </div>

        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "1rem"
          }}
        >
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
              <th style={{ textAlign: "left", padding: "0.75rem", color: "var(--text-soft)" }}>
                Email
              </th>
              <th style={{ textAlign: "left", padding: "0.75rem", color: "var(--text-soft)" }}>
                Name
              </th>
              <th style={{ textAlign: "left", padding: "0.75rem", color: "var(--text-soft)" }}>
                Specialty
              </th>
              <th style={{ textAlign: "left", padding: "0.75rem", color: "var(--text-soft)" }}>
                Fees
              </th>
              <th style={{ textAlign: "right", padding: "0.75rem", color: "var(--text-soft)" }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {doctors.map((doctor) => (
              <tr
                key={doctor.id}
                style={{
                  borderBottom: "1px solid var(--border-subtle)",
                  transition: "background var(--transition-fast)"
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-soft)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <td style={{ padding: "0.75rem" }}>{doctor.email}</td>
                <td style={{ padding: "0.75rem" }}>{doctor.fullName}</td>
                <td style={{ padding: "0.75rem" }}>{doctor.specialty}</td>
                <td style={{ padding: "0.75rem" }}>
                  Exam: {doctor.examinationFee} EGP · Consult: {doctor.consultationFee} EGP
                </td>
                <td style={{ padding: "0.75rem", textAlign: "right" }}>
                  <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                    <button
                      className="btn-secondary"
                      onClick={() => handleEdit(doctor)}
                      style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem" }}
                    >
                      Edit
                    </button>
                    <button
                      className="btn-primary"
                      onClick={() => handleDelete(doctor.id)}
                      style={{
                        padding: "0.4rem 0.8rem",
                        fontSize: "0.85rem",
                        background: "var(--danger)"
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {doctors.length === 0 && (
              <tr>
                <td colSpan="5" style={{ textAlign: "center", padding: "1rem" }}>No doctors found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal: Add/Edit Doctor */}
      {showModal && (
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
          onClick={() => setShowModal(false)}
        >
          <div
            className="card"
            style={{
              maxWidth: "600px",
              width: "100%",
              position: "relative",
              maxHeight: "90vh",
              overflowY: "auto"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <form className="form" onSubmit={handleSubmit}>
              <h2>{editingDoctor ? "Edit Doctor" : "Add Doctor"}</h2>
              <label className="field">
                <span>Full Name</span>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  placeholder="Dr. Full Name"
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
                  placeholder="doctor@clinic.com"
                />
              </label>
              <label className="field">
                <span>Phone</span>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  placeholder="+20 100 123 4567"
                />
              </label>
              <label className="field">
                <span>Password</span>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required={!editingDoctor}
                  placeholder={editingDoctor ? "Leave empty to keep current password" : "Enter password"}
                />
              </label>
              <label className="field">
                <span>Gender</span>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </label>
              <label className="field">
                <span>Specialty</span>
                <select
                  name="specialtyId"
                  value={formData.specialtyId}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Specialty</option>
                  {specialties.map((spec) => (
                    <option key={spec.id} value={spec.id}>
                      {spec.name}
                    </option>
                  ))}
                </select>
              </label>
              <div className="form-grid-2">
                <label className="field">
                  <span>Examination Fee (EGP)</span>
                  <input
                    type="number"
                    name="examinationFee"
                    value={formData.examinationFee}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.01"
                    placeholder="500"
                  />
                </label>
                <label className="field">
                  <span>Consultation Fee (EGP)</span>
                  <input
                    type="number"
                    name="consultationFee"
                    value={formData.consultationFee}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.01"
                    placeholder="300"
                  />
                </label>
              </div>
              <label className="field">
                <span>Biography</span>
                <textarea
                  name="biography"
                  value={formData.biography}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Doctor's biography and qualifications..."
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    background: "var(--bg-soft)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "var(--radius-md)",
                    color: "var(--text)",
                    fontFamily: "inherit",
                    fontSize: "0.95rem",
                    resize: "vertical"
                  }}
                />
              </label>
              <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem" }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowModal(false)}
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                  {editingDoctor ? "Update" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
