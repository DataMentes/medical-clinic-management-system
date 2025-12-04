import { useState } from "react";

const initialAppointments = [
  {
    id: 1,
    date: "2025-12-01",
    time: "09:00",
    patient: "Sarah Ahmed",
    doctor: "Dr. Omar",
    reason: "General check-up",
    status: "Confirmed"
  },
  {
    id: 2,
    date: "2025-12-01",
    time: "10:30",
    patient: "Mohamed Ali",
    doctor: "Dr. Lina",
    reason: "Follow-up",
    status: "Pending"
  }
];

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState(initialAppointments);
  const [filter, setFilter] = useState("");
  const [form, setForm] = useState({
    date: "",
    time: "",
    patient: "",
    doctor: "",
    reason: ""
  });

  const handleBook = (e) => {
    e.preventDefault();
    const conflict = appointments.find(
      (a) => a.date === form.date && a.time === form.time && a.doctor === form.doctor
    );
    if (conflict) {
      alert("This doctor already has an appointment at that time.");
      return;
    }
    setAppointments((prev) => [
      ...prev,
      {
        id: Date.now(),
        ...form,
        status: "Confirmed"
      }
    ]);
    setForm({ date: "", time: "", patient: "", doctor: "", reason: "" });
  };

  const handleCancel = (id) => {
    setAppointments((prev) => prev.filter((a) => a.id !== id));
  };

  const filtered = appointments.filter(
    (a) =>
      a.patient.toLowerCase().includes(filter.toLowerCase()) ||
      a.doctor.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="page">
      <header className="page-header">
        <h1>Appointments</h1>
        <p>Book new appointments, cancel, and search the schedule.</p>
      </header>

      <section className="grid-2">
        <form className="card form" onSubmit={handleBook}>
          <h3>Book appointment</h3>
          <div className="form-grid-2">
            <label className="field">
              <span>Date</span>
              <input
                type="date"
                required
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </label>
            <label className="field">
              <span>Time</span>
              <input
                type="time"
                required
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
              />
            </label>
          </div>
          <label className="field">
            <span>Patient name</span>
            <input
              type="text"
              required
              value={form.patient}
              onChange={(e) => setForm({ ...form, patient: e.target.value })}
            />
          </label>
          <label className="field">
            <span>Doctor</span>
            <input
              type="text"
              required
              value={form.doctor}
              onChange={(e) => setForm({ ...form, doctor: e.target.value })}
            />
          </label>
          <label className="field">
            <span>Reason</span>
            <textarea
              rows={2}
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
            />
          </label>
          <button type="submit" className="btn-primary">
            Book appointment
          </button>
        </form>

        <div className="card">
          <div className="card-header">
            <h3>Scheduled appointments</h3>
            <input
              className="search-input"
              placeholder="Search by patient or doctor..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
          <ul className="list">
            {filtered.map((a) => (
              <li key={a.id} className="list-item">
                <div>
                  <div className="list-title">
                    {a.date} · {a.time} · {a.patient}
                  </div>
                  <div className="list-subtitle">
                    {a.doctor} · {a.reason}
                  </div>
                  <span className="pill">{a.status}</span>
                </div>
                <button
                  className="pill pill-danger"
                  onClick={() => handleCancel(a.id)}
                >
                  Cancel
                </button>
              </li>
            ))}
            {filtered.length === 0 && (
              <li className="list-empty">No appointments found.</li>
            )}
          </ul>
        </div>
      </section>
    </div>
  );
}


