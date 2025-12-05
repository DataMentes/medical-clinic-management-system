import { useState, useEffect } from "react";
import { adminService } from "../api/adminService";

export default function ManageReceptionists() {
  const [receptionists, setReceptionists] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingReceptionist, setEditingReceptionist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    gender: "Male"
  });

  // Fetch receptionists
  useEffect(() => {
    fetchReceptionists();
  }, []);

  const fetchReceptionists = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAllReceptionists();
      // Backend returns: {success: true, data: {receptionists: [...], pagination: {...}}}
      const receptionistsData = response.receptionists || [];
      
      const formattedReceptionists = receptionistsData.map(r => ({
        userId: r.userId,
        fullName: r.fullName,
        email: r.email,
        phone: r.phoneNumber,
        gender: r.gender
      }));
      setReceptionists(formattedReceptionists);
    } catch (error) {
      console.error("Failed to fetch receptionists:", error);
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
    setEditingReceptionist(null);
    setFormData({
      fullName: "",
      email: "",
      phone: "",
      password: "",
      gender: "Male"
    });
    setShowModal(true);
  };

  const handleEdit = (receptionist) => {
    setEditingReceptionist(receptionist);
    setFormData({
      fullName: receptionist.fullName,
      email: receptionist.email,
      phone: receptionist.phone || "",
      password: "",
      gender: receptionist.gender || "Male"
    });
    setShowModal(true);
  };

  const handleDelete = async (userId) => {
    if (window.confirm("Are you sure you want to delete this receptionist?")) {
      try {
        await adminService.deleteReceptionist(userId);
        setReceptionists(prev => prev.filter(r => r.userId !== userId));
      } catch (error) {
        console.error("Failed to delete receptionist:", error);
        alert("Failed to delete receptionist: " + (error.response?.data?.error || error.message));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const receptionistData = {
        fullName: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phone,
        gender: formData.gender.charAt(0).toUpperCase() + formData.gender.slice(1) // Capitalize: Male/Female
      };

      if (editingReceptionist) {
        // Update
        if (formData.password) {
          receptionistData.password = formData.password;
        }
        await adminService.updateReceptionist(editingReceptionist.userId, receptionistData);
        alert("Receptionist updated successfully");
      } else {
        // Create
        receptionistData.password = formData.password;
        await adminService.createReceptionist(receptionistData);
        alert("Receptionist created successfully");
      }

      setShowModal(false);
      setEditingReceptionist(null);
      fetchReceptionists(); // Refresh list

    } catch (error) {
      console.error("Operation failed:", error);
      alert("Operation failed: " + (error.response?.data?.error || error.message));
    }
  };

  if (loading) return <div className="page"><p>Loading receptionists...</p></div>;

  return (
    <div className="page">
      <header className="page-header">
        <h1>Manage Receptionists</h1>
        <p>Add, edit, or remove receptionist accounts.</p>
      </header>

      <div className="card">
        <div className="card-header">
          <h3>Receptionists</h3>
          <button className="btn-primary" onClick={handleAdd}>
            + Add Receptionist
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
                Full Name
              </th>
              <th style={{ textAlign: "left", padding: "0.75rem", color: "var(--text-soft)" }}>
                Email
              </th>
              <th style={{ textAlign: "left", padding: "0.75rem", color: "var(--text-soft)" }}>
                Phone
              </th>
              <th style={{ textAlign: "right", padding: "0.75rem", color: "var(--text-soft)" }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {receptionists.map((receptionist) => (
              <tr
                key={receptionist.userId}
                style={{
                  borderBottom: "1px solid var(--border-subtle)",
                  transition: "background var(--transition-fast)"
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-soft)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <td style={{ padding: "0.75rem" }}>{receptionist.fullName}</td>
                <td style={{ padding: "0.75rem" }}>{receptionist.email}</td>
                <td style={{ padding: "0.75rem" }}>{receptionist.phone}</td>
                <td style={{ padding: "0.75rem", textAlign: "right" }}>
                  <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                    <button
                      className="btn-secondary"
                      onClick={() => handleEdit(receptionist)}
                      style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem" }}
                    >
                      Edit
                    </button>
                    <button
                      className="btn-primary"
                      onClick={() => handleDelete(receptionist.userId)}
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
            {receptionists.length === 0 && (
              <tr>
                <td colSpan="4" style={{ textAlign: "center", padding: "1rem" }}>No receptionists found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal: Add/Edit Receptionist */}
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
              <h2>{editingReceptionist ? "Edit Receptionist" : "Add Receptionist"}</h2>
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
                  placeholder="receptionist@clinic.com"
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
                  required={!editingReceptionist}
                  placeholder={editingReceptionist ? "Leave empty to keep current password" : "Enter password"}
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
                  {editingReceptionist ? "Update" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
