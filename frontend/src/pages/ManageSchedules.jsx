import { useState, useEffect } from "react";
import { scheduleService, roomService } from "../api/supportingServices";
import { adminService } from "../api/adminService";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday"
];

export default function ManageSchedules() {
  const [schedules, setSchedules] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    doctorId: "",
    roomId: "",
    day: "",
    startTime: "",
    endTime: "",
    maxCapacity: ""
  });

  // Fetch data
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [schedulesData, doctorsData, roomsData] = await Promise.all([
        scheduleService.getAll(),
        adminService.getAllDoctors(),
        roomService.getAll()
      ]);

      setSchedules(schedulesData);

      const formattedDoctors = doctorsData.map(d => ({
        id: d.id,
        fullName: d.user.fullName
      }));
      setDoctors(formattedDoctors);

      setRooms(roomsData);

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
    setEditingSchedule(null);
    setFormData({
      doctorId: "",
      roomId: "",
      day: "",
      startTime: "",
      endTime: "",
      maxCapacity: ""
    });
    setShowModal(true);
  };

  const handleEdit = (schedule) => {
    setEditingSchedule(schedule);
    setFormData({
      doctorId: schedule.doctorId.toString(),
      roomId: schedule.roomId.toString(),
      day: schedule.dayOfWeek,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      maxCapacity: schedule.maxCapacity.toString()
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this schedule?")) {
      try {
        await scheduleService.delete(id);
        setSchedules(prev => prev.filter(s => s.id !== id));
      } catch (error) {
        console.error("Failed to delete schedule:", error);
        alert("Failed to delete schedule");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const scheduleData = {
        doctorId: parseInt(formData.doctorId),
        roomId: parseInt(formData.roomId),
        dayOfWeek: formData.day,
        startTime: formData.startTime,
        endTime: formData.endTime,
        maxCapacity: parseInt(formData.maxCapacity)
      };

      if (editingSchedule) {
        // Update
        await scheduleService.update(editingSchedule.id, scheduleData);
        alert("Schedule updated successfully");
      } else {
        // Create
        await scheduleService.create(scheduleData);
        alert("Schedule created successfully");
      }

      setShowModal(false);
      setEditingSchedule(null);
      fetchData(); // Refresh list

    } catch (error) {
      console.error("Operation failed:", error);
      alert("Operation failed: " + (error.response?.data?.error || error.message));
    }
  };

  const getDoctorName = (doctorId) => {
    const doctor = doctors.find((d) => d.id === doctorId);
    return doctor ? doctor.fullName : "Unknown";
  };

  const getRoomName = (roomId) => {
    const room = rooms.find((r) => r.id === roomId);
    return room ? room.name : "Unknown";
  };

  if (loading) return <div className="page"><p>Loading schedules...</p></div>;

  return (
    <div className="page">
      <header className="page-header">
        <h1>Manage Schedules</h1>
        <p>Add, edit, or remove doctor schedules.</p>
      </header>

      <div className="card">
        <div className="card-header">
          <h3>Schedules</h3>
          <button className="btn-primary" onClick={handleAdd}>
            + Add Schedule
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
                Doctor Name
              </th>
              <th style={{ textAlign: "left", padding: "0.75rem", color: "var(--text-soft)" }}>
                Room Name
              </th>
              <th style={{ textAlign: "left", padding: "0.75rem", color: "var(--text-soft)" }}>
                Day
              </th>
              <th style={{ textAlign: "left", padding: "0.75rem", color: "var(--text-soft)" }}>
                Start Time
              </th>
              <th style={{ textAlign: "left", padding: "0.75rem", color: "var(--text-soft)" }}>
                End Time
              </th>
              <th style={{ textAlign: "left", padding: "0.75rem", color: "var(--text-soft)" }}>
                Max Capacity
              </th>
              <th style={{ textAlign: "right", padding: "0.75rem", color: "var(--text-soft)" }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {schedules.map((schedule) => (
              <tr
                key={schedule.id}
                style={{
                  borderBottom: "1px solid var(--border-subtle)",
                  transition: "background var(--transition-fast)"
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-soft)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <td style={{ padding: "0.75rem" }}>{getDoctorName(schedule.doctorId)}</td>
                <td style={{ padding: "0.75rem" }}>{getRoomName(schedule.roomId)}</td>
                <td style={{ padding: "0.75rem" }}>{schedule.dayOfWeek}</td>
                <td style={{ padding: "0.75rem" }}>{schedule.startTime}</td>
                <td style={{ padding: "0.75rem" }}>{schedule.endTime}</td>
                <td style={{ padding: "0.75rem" }}>{schedule.maxCapacity}</td>
                <td style={{ padding: "0.75rem", textAlign: "right" }}>
                  <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                    <button
                      className="btn-secondary"
                      onClick={() => handleEdit(schedule)}
                      style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem" }}
                    >
                      Edit
                    </button>
                    <button
                      className="btn-primary"
                      onClick={() => handleDelete(schedule.id)}
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
            {schedules.length === 0 && (
              <tr>
                <td colSpan="7" style={{ textAlign: "center", padding: "1rem" }}>No schedules found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal: Add/Edit Schedule */}
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
              <h2>{editingSchedule ? "Edit Schedule" : "Add Schedule"}</h2>
              <label className="field">
                <span>Doctor</span>
                <select
                  name="doctorId"
                  value={formData.doctorId}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Doctor</option>
                  {doctors.map((doctor) => (
                    <option key={doctor.id} value={doctor.id}>
                      {doctor.fullName}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Room</span>
                <select
                  name="roomId"
                  value={formData.roomId}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Room</option>
                  {rooms.map((room) => (
                    <option key={room.id} value={room.id}>
                      {room.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Day</span>
                <select name="day" value={formData.day} onChange={handleChange} required>
                  <option value="">Select Day</option>
                  {DAYS.map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
              </label>
              <div className="form-grid-2">
                <label className="field">
                  <span>Start Time</span>
                  <input
                    type="time"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleChange}
                    required
                  />
                </label>
                <label className="field">
                  <span>End Time</span>
                  <input
                    type="time"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleChange}
                    required
                  />
                </label>
              </div>
              <label className="field">
                <span>Max Capacity</span>
                <input
                  type="number"
                  name="maxCapacity"
                  value={formData.maxCapacity}
                  onChange={handleChange}
                  required
                  min="1"
                  placeholder="10"
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
                  {editingSchedule ? "Update" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
