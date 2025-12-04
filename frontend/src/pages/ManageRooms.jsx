import { useState, useEffect } from "react";
import { roomService } from "../api/supportingServices";

export default function ManageRooms() {
  const [rooms, setRooms] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    roomName: ""
  });

  // Fetch rooms
  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const data = await roomService.getAll();
      const formattedRooms = data.map(r => ({
        id: r.id,
        roomName: r.name
      }));
      setRooms(formattedRooms);
    } catch (error) {
      console.error("Failed to fetch rooms:", error);
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
    setEditingRoom(null);
    setFormData({
      roomName: ""
    });
    setShowModal(true);
  };

  const handleEdit = (room) => {
    setEditingRoom(room);
    setFormData({
      roomName: room.roomName
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this room?")) {
      try {
        await roomService.delete(id);
        setRooms(prev => prev.filter(r => r.id !== id));
      } catch (error) {
        console.error("Failed to delete room:", error);
        alert("Failed to delete room");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const roomData = {
        name: formData.roomName
      };

      if (editingRoom) {
        // Update
        await roomService.update(editingRoom.id, roomData);
        alert("Room updated successfully");
      } else {
        // Create
        await roomService.create(roomData);
        alert("Room created successfully");
      }

      setShowModal(false);
      setEditingRoom(null);
      fetchRooms(); // Refresh list

    } catch (error) {
      console.error("Operation failed:", error);
      alert("Operation failed: " + (error.response?.data?.error || error.message));
    }
  };

  if (loading) return <div className="page"><p>Loading rooms...</p></div>;

  return (
    <div className="page">
      <header className="page-header">
        <h1>Manage Rooms</h1>
        <p>Add, edit, or remove clinic rooms.</p>
      </header>

      <div className="card">
        <div className="card-header">
          <h3>Rooms</h3>
          <button className="btn-primary" onClick={handleAdd}>
            + Add Room
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
                Room ID
              </th>
              <th style={{ textAlign: "left", padding: "0.75rem", color: "var(--text-soft)" }}>
                Room Name
              </th>
              <th style={{ textAlign: "right", padding: "0.75rem", color: "var(--text-soft)" }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {rooms.map((room) => (
              <tr
                key={room.id}
                style={{
                  borderBottom: "1px solid var(--border-subtle)",
                  transition: "background var(--transition-fast)"
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-soft)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <td style={{ padding: "0.75rem" }}>#{room.id}</td>
                <td style={{ padding: "0.75rem" }}>{room.roomName}</td>
                <td style={{ padding: "0.75rem", textAlign: "right" }}>
                  <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                    <button
                      className="btn-secondary"
                      onClick={() => handleEdit(room)}
                      style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem" }}
                    >
                      Edit
                    </button>
                    <button
                      className="btn-primary"
                      onClick={() => handleDelete(room.id)}
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
            {rooms.length === 0 && (
              <tr>
                <td colSpan="3" style={{ textAlign: "center", padding: "1rem" }}>No rooms found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal: Add/Edit Room */}
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
              <h2>{editingRoom ? "Edit Room" : "Add Room"}</h2>
              <label className="field">
                <span>Room Name</span>
                <input
                  type="text"
                  name="roomName"
                  value={formData.roomName}
                  onChange={handleChange}
                  required
                  placeholder="Room 101"
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
                  {editingRoom ? "Update" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
