import { useState, useEffect } from "react";
import { adminService } from "../api/adminService";

export default function ManageAdmins() {
  const [admins, setAdmins] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    gender: "Male"
  });

  // Fetch admins from API
  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAllAdmins();
      // Backend returns: {success: true, data: {admins: [...], pagination: {...}}}
      const adminsData = response.admins || [];
      
      const formattedAdmins = adminsData.map(admin => ({
        userId: admin.userId,
        fullName: admin.fullName,
        email: admin.email,
        phone: admin.phoneNumber,
        gender: admin.gender
      }));
      setAdmins(formattedAdmins);
    } catch (error) {
      console.error("Failed to fetch admins:", error);
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
    setEditingAdmin(null);
    setFormData({ fullName: "", email: "", phone: "", password: "", gender: "Male" });
    setShowModal(true);
  };

  const handleEdit = (admin) => {
    setEditingAdmin(admin);
    setFormData({
      fullName: admin.fullName,
      email: admin.email,
      phone: admin.phone,
      password: "",
      gender: admin.gender || "Male"
    });
    setShowModal(true);
  };

  const handleDelete = async (userId) => {
    if (window.confirm("Are you sure you want to delete this admin?")) {
      try {
        await adminService.deleteAdmin(userId);
        setAdmins(prev => prev.filter(a => a.userId !== userId));
      } catch (error) {
        console.error("Failed to delete admin:", error);
        alert("Failed to delete admin: " + (error.response?.data?.error || error.message));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const adminData = {
        fullName: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phone,
        gender: formData.gender.charAt(0).toUpperCase() + formData.gender.slice(1) // Capitalize: Male/Female
      };

      if (editingAdmin) {
        // Update
        if (formData.password) {
          adminData.password = formData.password;
        }
        await adminService.updateAdmin(editingAdmin.userId, adminData);
        alert("Admin updated successfully");
      } else {
        // Create
        adminData.password = formData.password;
        await adminService.createAdmin(adminData);
        alert("Admin created successfully");
      }

      setShowModal(false);
      setFormData({ fullName: "", email: "", phone: "", password: "", gender: "Male" });
      setEditingAdmin(null);
      fetchAdmins(); // Refresh list

    } catch (error) {
      console.error("Operation failed:", error);
      alert("Operation failed: " + (error.response?.data?.error || error.message));
    }
  };

  if (loading) return <div className="page"><p>Loading admins...</p></div>;

  return (
    <div className="page">
      <header className="page-header">
        <h1>Manage Admins</h1>
        <p>Add, edit, or remove admin accounts.</p>
      </header>

      <div className="card">
        <div className="card-header">
          <h3>Admins</h3>
          <button className="btn-primary" onClick={handleAdd}>
            + Add Admin
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
            {admins.map((admin) => (
              <tr
                key={admin.userId}
                style={{
                  borderBottom: "1px solid var(--border-subtle)",
                  transition: "background var(--transition-fast)"
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-soft)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <td style={{ padding: "0.75rem" }}>{admin.fullName}</td>
                <td style={{ padding: "0.75rem" }}>{admin.email}</td>
                <td style={{ padding: "0.75rem" }}>{admin.phone}</td>
                <td style={{ padding: "0.75rem", textAlign: "right" }}>
                  <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                    <button
                      className="btn-secondary"
                      onClick={() => handleEdit(admin)}
                      style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem" }}
                    >
                      Edit
                    </button>
                    <button
                      className="btn-primary"
                      onClick={() => handleDelete(admin.userId)}
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
            {admins.length === 0 && (
              <tr>
                <td colSpan="4" style={{ textAlign: "center", padding: "1rem" }}>No admins found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal: Add/Edit Admin */}
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
              <h2>{editingAdmin ? "Edit Admin" : "Add Admin"}</h2>
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
                  placeholder="admin@clinic.com"
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
                  required={!editingAdmin}
                  placeholder={editingAdmin ? "Leave empty to keep current password" : "Enter password"}
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
                  {editingAdmin ? "Update" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
