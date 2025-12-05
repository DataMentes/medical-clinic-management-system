import { useState, useEffect } from "react";
import { adminService } from "../api/adminService";

export default function ManagePatients() {
  const [patients, setPatients] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    gender: "male",
    yearOfBirth: ""
  });

  // Fetch patients
  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
  try {
    setLoading(true);
    const response = await adminService.getAllPatients();
    const patientsArray = response.data?.patients || response.patients || [];
    setPatients(patientsArray);
    } catch (error) {
      console.error("Failed to fetch patients:", error);
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
    setEditingPatient(null);
    setFormData({
      fullName: "",
      email: "",
      phone: "",
      password: "",
      gender: "male",
      yearOfBirth: ""
    });
    setShowModal(true);
  };

  const handleEdit = (patient) => {
    setEditingPatient(patient);
    setFormData({
      fullName: patient.fullName,
      email: patient.email,
      phone: patient.phone || "",
      password: "",
      gender: patient.gender || "male",
      yearOfBirth: patient.yearOfBirth || ""
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this patient?")) {
      try {
        await adminService.deletePatient(id);
        setPatients(prev => prev.filter(p => p.id !== id));
      } catch (error) {
        console.error("Failed to delete patient:", error);
        alert("Failed to delete patient");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Convert year of birth to date string (YYYY-01-01)
      const dateOfBirth = formData.yearOfBirth ? `${formData.yearOfBirth}-01-01` : null;

      const patientData = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        gender: formData.gender,
        dateOfBirth: dateOfBirth
      };

      if (editingPatient) {
        // Update
        if (formData.password) {
          patientData.password = formData.password;
        }
        await adminService.updatePatient(editingPatient.id, patientData);
        alert("Patient updated successfully");
      } else {
        // Create
        patientData.password = formData.password;
        await adminService.createPatient(patientData);
        alert("Patient created successfully");
      }

      setShowModal(false);
      setEditingPatient(null);
      fetchPatients(); // Refresh list

    } catch (error) {
      console.error("Operation failed:", error);
      alert("Operation failed: " + (error.response?.data?.error || error.message));
    }
  };

  if (loading) return <div className="page"><p>Loading patients...</p></div>;

  return (
    <div className="page">
      <header className="page-header">
        <h1>Manage Patients</h1>
        <p>Add, edit, or remove patient accounts.</p>
      </header>

      <div className="card">
        <div className="card-header">
          <h3>Patients</h3>
          <button className="btn-primary" onClick={handleAdd}>
            + Add Patient
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
                Mail
              </th>
              <th style={{ textAlign: "left", padding: "0.75rem", color: "var(--text-soft)" }}>
                Name
              </th>
              <th style={{ textAlign: "left", padding: "0.75rem", color: "var(--text-soft)" }}>
                Year of Birth
              </th>
              <th style={{ textAlign: "right", padding: "0.75rem", color: "var(--text-soft)" }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {patients.map((patient) => (
              <tr
                key={patient.id}
                style={{
                  borderBottom: "1px solid var(--border-subtle)",
                  transition: "background var(--transition-fast)"
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-soft)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <td style={{ padding: "0.75rem" }}>{patient.email}</td>
                <td style={{ padding: "0.75rem" }}>{patient.fullName}</td>
                <td style={{ padding: "0.75rem" }}>
                  {patient.yearOfBirth || "N/A"}
                </td>
                <td style={{ padding: "0.75rem", textAlign: "right" }}>
                  <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                    <button
                      className="btn-secondary"
                      onClick={() => handleEdit(patient)}
                      style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem" }}
                    >
                      Edit
                    </button>
                    <button
                      className="btn-primary"
                      onClick={() => handleDelete(patient.id)}
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
            {patients.length === 0 && (
              <tr>
                <td colSpan="4" style={{ textAlign: "center", padding: "1rem" }}>No patients found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal: Add/Edit Patient */}
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
              maxWidth: "500px",
              width: "100%",
              position: "relative"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <form className="form" onSubmit={handleSubmit}>
              <h2>{editingPatient ? "Edit Patient" : "Add Patient"}</h2>
              <label className="field">
                <span>Full Name</span>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  placeholder="Enter full name"
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
                  placeholder="patient@example.com"
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
                  required={!editingPatient}
                  placeholder={editingPatient ? "Leave empty to keep current password" : "Enter password"}
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
                  {editingPatient ? "Update" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
