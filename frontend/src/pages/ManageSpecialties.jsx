import { useState, useEffect } from "react";
import { adminService } from "../api/adminService";

export default function ManageSpecialties() {
  const [specialties, setSpecialties] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingSpecialty, setEditingSpecialty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: ""
  });

  // Fetch specialties
  useEffect(() => {
    fetchSpecialties();
  }, []);

  const fetchSpecialties = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAllSpecialties();
      // Backend returns: {success: true, data: {specialties: [...], pagination: {...}}}
      const specialtiesData = response.specialties || [];
      setSpecialties(specialtiesData);
    } catch (error) {
      console.error("Failed to fetch specialties:", error);
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
    setEditingSpecialty(null);
    setFormData({
      name: ""
    });
    setShowModal(true);
  };

  const handleEdit = (specialty) => {
    setEditingSpecialty(specialty);
    setFormData({
      name: specialty.name
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this specialty?")) {
      try {
        await adminService.deleteSpecialty(id);
        setSpecialties(prev => prev.filter(s => s.id !== id));
      } catch (error) {
        console.error("Failed to delete specialty:", error);
        alert("Failed to delete specialty: " + (error.response?.data?.error || error.message));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingSpecialty) {
        // Update
        await adminService.updateSpecialty(editingSpecialty.id, { name: formData.name });
        alert("Specialty updated successfully");
      } else {
        // Create
        await adminService.createSpecialty({ name: formData.name });
        alert("Specialty created successfully");
      }

      setShowModal(false);
      setEditingSpecialty(null);
      fetchSpecialties(); // Refresh list

    } catch (error) {
      console.error("Operation failed:", error);
      alert("Operation failed: " + (error.response?.data?.error || error.message));
    }
  };

  if (loading) return <div className="page"><p>Loading specialties...</p></div>;

  return (
    <div className="page">
      <header className="page-header">
        <h1>Manage Specialties</h1>
        <p>Add, edit, or remove medical specialties.</p>
      </header>

      <div className="card">
        <div className="card-header">
          <h3>Specialties</h3>
          <button className="btn-primary" onClick={handleAdd}>
            + Add Specialty
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
                Specialty ID
              </th>
              <th style={{ textAlign: "left", padding: "0.75rem", color: "var(--text-soft)" }}>
                Name
              </th>
              <th style={{ textAlign: "right", padding: "0.75rem", color: "var(--text-soft)" }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {specialties.map((specialty) => (
              <tr
                key={specialty.id}
                style={{
                  borderBottom: "1px solid var(--border-subtle)",
                  transition: "background var(--transition-fast)"
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-soft)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <td style={{ padding: "0.75rem" }}>#{specialty.id}</td>
                <td style={{ padding: "0.75rem" }}>{specialty.name}</td>
                <td style={{ padding: "0.75rem", textAlign: "right" }}>
                  <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                    <button
                      className="btn-secondary"
                      onClick={() => handleEdit(specialty)}
                      style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem" }}
                    >
                      Edit
                    </button>
                    <button
                      className="btn-primary"
                      onClick={() => handleDelete(specialty.id)}
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
            {specialties.length === 0 && (
              <tr>
                <td colSpan="3" style={{ textAlign: "center", padding: "1rem" }}>No specialties found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal: Add/Edit Specialty */}
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
              <h2>{editingSpecialty ? "Edit Specialty" : "Add Specialty"}</h2>
              <label className="field">
                <span>Name</span>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Cardiology"
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
                  {editingSpecialty ? "Update" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
