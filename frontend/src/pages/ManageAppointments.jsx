import { useState, useEffect } from "react";
import { appointmentService } from "../api/appointmentService";
import { adminService } from "../api/adminService";
import { scheduleService } from "../api/supportingServices";

export default function ManageAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    patientId: "",
    doctorId: "",
    scheduleId: "",
    type: "",
    status: "",
    feePaid: "",
    bookingTime: ""
  });

  // Fetch data
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [appointmentsData, patientsData, doctorsData, schedulesData] = await Promise.all([
        appointmentService.getAll(),
        adminService.getAllPatients(),
        adminService.getAllDoctors(),
        scheduleService.getAll()
      ]);

      setAppointments(appointmentsData);

      const formattedPatients = patientsData.map(p => ({
        id: p.id,
        fullName: p.user.fullName
      }));
      setPatients(formattedPatients);

      const formattedDoctors = doctorsData.map(d => ({
        id: d.id,
        fullName: d.user.fullName
      }));
      setDoctors(formattedDoctors);

      setSchedules(schedulesData);

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

  const handleEdit = (appointment) => {
    setEditingAppointment(appointment);
    setFormData({
      patientId: appointment.patientId.toString(),
      doctorId: appointment.doctorId.toString(),
      scheduleId: appointment.scheduleId ? appointment.scheduleId.toString() : "",
      type: appointment.type,
      status: appointment.status,
      feePaid: appointment.feePaid ? appointment.feePaid.toString() : "0",
      bookingTime: appointment.bookingTime
        ? new Date(appointment.bookingTime).toISOString().slice(0, 16)
        : ""
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this appointment?")) {
      try {
        await appointmentService.cancel(id);
        // Refresh or filter out
        setAppointments(prev => prev.filter(a => a.id !== id));
      } catch (error) {
        console.error("Failed to delete appointment:", error);
        alert("Failed to delete appointment");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (editingAppointment) {
      try {
        const updateData = {
          patientId: parseInt(formData.patientId),
          doctorId: parseInt(formData.doctorId),
          scheduleId: parseInt(formData.scheduleId),
          type: formData.type,
          status: formData.status,
          feePaid: parseFloat(formData.feePaid),
          bookingTime: new Date(formData.bookingTime).toISOString()
        };

        await appointmentService.update(editingAppointment.id, updateData);
        alert("Appointment updated successfully");
        setShowModal(false);
        setEditingAppointment(null);
        fetchData();
      } catch (error) {
        console.error("Failed to update appointment:", error);
        alert("Failed to update appointment: " + (error.response?.data?.error || error.message));
      }
    }
  };

  const getPatientName = (patientId) => {
    const patient = patients.find((p) => p.id === patientId);
    return patient ? patient.fullName : "Unknown";
  };

  const getDoctorName = (doctorId) => {
    const doctor = doctors.find((d) => d.id === doctorId);
    return doctor ? doctor.fullName : "Unknown";
  };

  const getScheduleInfo = (scheduleId) => {
    const schedule = schedules.find((s) => s.id === scheduleId);
    if (schedule) {
      return `${schedule.dayOfWeek} · ${schedule.startTime} - ${schedule.endTime}`;
    }
    return "Unknown";
  };

  if (loading) return <div className="page"><p>Loading appointments...</p></div>;

  return (
    <div className="page">
      <header className="page-header">
        <h1>Manage Appointments</h1>
        <p>View, edit, or remove appointments.</p>
      </header>

      <div className="card">
        <div className="card-header">
          <h3>Appointments</h3>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginTop: "1rem",
              minWidth: "1000px"
            }}
          >
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                <th style={{ textAlign: "left", padding: "0.75rem", color: "var(--text-soft)" }}>
                  Appointment ID
                </th>
                <th style={{ textAlign: "left", padding: "0.75rem", color: "var(--text-soft)" }}>
                  Patient
                </th>
                <th style={{ textAlign: "left", padding: "0.75rem", color: "var(--text-soft)" }}>
                  Doctor
                </th>
                <th style={{ textAlign: "left", padding: "0.75rem", color: "var(--text-soft)" }}>
                  Schedule
                </th>
                <th style={{ textAlign: "left", padding: "0.75rem", color: "var(--text-soft)" }}>
                  Type
                </th>
                <th style={{ textAlign: "left", padding: "0.75rem", color: "var(--text-soft)" }}>
                  Status
                </th>
                <th style={{ textAlign: "left", padding: "0.75rem", color: "var(--text-soft)" }}>
                  Fee Paid
                </th>
                <th style={{ textAlign: "left", padding: "0.75rem", color: "var(--text-soft)" }}>
                  Booking Time
                </th>
                <th style={{ textAlign: "right", padding: "0.75rem", color: "var(--text-soft)" }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appointment) => (
                <tr
                  key={appointment.id}
                  style={{
                    borderBottom: "1px solid var(--border-subtle)",
                    transition: "background var(--transition-fast)"
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-soft)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <td style={{ padding: "0.75rem" }}>#{appointment.id}</td>
                  <td style={{ padding: "0.75rem" }}>
                    {getPatientName(appointment.patientId)}
                  </td>
                  <td style={{ padding: "0.75rem" }}>
                    {getDoctorName(appointment.doctorId)}
                  </td>
                  <td style={{ padding: "0.75rem" }}>
                    {getScheduleInfo(appointment.scheduleId)}
                  </td>
                  <td style={{ padding: "0.75rem" }}>{appointment.type}</td>
                  <td style={{ padding: "0.75rem" }}>
                    <span
                      className="pill"
                      style={{
                        background:
                          appointment.status === "Confirmed"
                            ? "var(--accent-soft)"
                            : appointment.status === "Pending"
                              ? "rgba(255, 193, 7, 0.2)"
                              : "rgba(239, 68, 68, 0.2)",
                        color:
                          appointment.status === "Confirmed"
                            ? "#e0edff"
                            : appointment.status === "Pending"
                              ? "#ffc107"
                              : "#ef4444"
                      }}
                    >
                      {appointment.status}
                    </span>
                  </td>
                  <td style={{ padding: "0.75rem" }}>{appointment.feePaid} EGP</td>
                  <td style={{ padding: "0.75rem" }}>
                    {appointment.bookingTime
                      ? new Date(appointment.bookingTime).toLocaleString()
                      : "N/A"}
                  </td>
                  <td style={{ padding: "0.75rem", textAlign: "right" }}>
                    <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                      <button
                        className="btn-secondary"
                        onClick={() => handleEdit(appointment)}
                        style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem" }}
                      >
                        Edit
                      </button>
                      <button
                        className="btn-primary"
                        onClick={() => handleDelete(appointment.id)}
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
              {appointments.length === 0 && (
                <tr>
                  <td colSpan="9" style={{ textAlign: "center", padding: "1rem" }}>No appointments found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Edit Appointment */}
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
              <h2>Edit Appointment</h2>
              <label className="field">
                <span>Patient</span>
                <select
                  name="patientId"
                  value={formData.patientId}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Patient</option>
                  {patients.map((patient) => (
                    <option key={patient.id} value={patient.id}>
                      {patient.fullName}
                    </option>
                  ))}
                </select>
              </label>
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
                <span>Schedule</span>
                <select
                  name="scheduleId"
                  value={formData.scheduleId}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Schedule</option>
                  {schedules.map((schedule) => (
                    <option key={schedule.id} value={schedule.id}>
                      {getScheduleInfo(schedule.id)} - {getDoctorName(schedule.doctorId)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Type</span>
                <select name="type" value={formData.type} onChange={handleChange} required>
                  <option value="">Select Type</option>
                  <option value="Examination">Examination</option>
                  <option value="Consultation">Consultation</option>
                </select>
              </label>
              <label className="field">
                <span>Status</span>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Status</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Pending">Pending</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="Completed">Completed</option>
                  <option value="Checked-In">Checked-In</option>
                  <option value="In-Progress">In-Progress</option>
                </select>
              </label>
              <label className="field">
                <span>Fee Paid (EGP)</span>
                <input
                  type="number"
                  name="feePaid"
                  value={formData.feePaid}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  placeholder="500"
                />
              </label>
              <label className="field">
                <span>Booking Time</span>
                <input
                  type="datetime-local"
                  name="bookingTime"
                  value={formData.bookingTime}
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
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
