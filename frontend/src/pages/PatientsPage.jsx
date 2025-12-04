import { useMemo, useRef, useState } from "react";

const upcomingAppointments = [
  {
    id: 1,
    date: "2025-12-05 · 10:00 AM",
    doctor: "Dr. Hana Farouk",
    type: "Consultation",
    status: "Confirmed"
  },
  {
    id: 2,
    date: "2025-12-18 · 03:30 PM",
    doctor: "Dr. Karim Nassar",
    type: "Examination",
    status: "Pending"
  }
];

const pastAppointments = [
  {
    id: 3,
    date: "2025-11-21",
    doctor: "Dr. Hana Farouk",
    type: "Consultation",
    notes: "Follow-up in 3 months."
  },
  {
    id: 4,
    date: "2025-10-10",
    doctor: "Dr. Ayman Said",
    type: "Examination",
    notes: "Complete blood work. Results normal."
  }
];

const medicalHistory = [
  {
    id: "mh-1",
    diagnosis: "Seasonal influenza",
    prescription: "Tamiflu 75mg · 5 days",
    notes: "Rest and hydrate well",
    date: "2025-11-14"
  },
  {
    id: "mh-2",
    diagnosis: "Lower back pain",
    prescription: "Physiotherapy + Ibuprofen",
    notes: "Improve posture. Re-evaluate in 6 weeks.",
    date: "2025-09-10"
  }
];

export default function PatientsPage() {
  const [appointmentType, setAppointmentType] = useState("examination");
  const [appointmentDate, setAppointmentDate] = useState("");
  const bookSectionRef = useRef(null);
  const historySectionRef = useRef(null);

  const today = useMemo(() => new Date().toISOString().split("T")[0], []);

  const handleBookSubmit = (e) => {
    e.preventDefault();
    alert(
      `Appointment requested for ${appointmentDate || today} · ${
        appointmentType === "examination" ? "Examination" : "Consultation"
      }`
    );
    setAppointmentDate("");
    setAppointmentType("examination");
  };

  const scrollToSection = (ref) => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="page patient-dashboard">
      <header className="page-header">
        <h1>Patient Dashboard</h1>
        <p>Keep track of upcoming visits, book appointments, and view history.</p>
      </header>

      <section className="grid-2">
        <div className="card">
          <h3>Upcoming Appointments</h3>
          <ul className="list">
            {upcomingAppointments.map((appt) => (
              <li key={appt.id} className="list-item">
                <div className="list-title">{appt.date}</div>
                <div className="list-subtitle">
                  {appt.doctor} · {appt.type}
                </div>
                <div className="badge">{appt.status}</div>
                <button className="btn-tertiary">Cancel</button>
              </li>
            ))}
          </ul>
        </div>

        <div className="card">
          <h3>Past Appointments</h3>
          <ul className="list">
            {pastAppointments.map((appt) => (
              <li key={appt.id} className="list-item">
                <div className="list-title">
                  {appt.date} · {appt.type}
                </div>
                <div className="list-subtitle">{appt.doctor}</div>
                <p className="muted">{appt.notes}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <div className="card actions-card">
        <h3>Actions</h3>
        <div className="actions-buttons">
          <button
            className="btn-primary"
            type="button"
            onClick={() => scrollToSection(bookSectionRef)}
          >
            Book New Appointment
          </button>
          <button
            className="btn-secondary"
            type="button"
            onClick={() => scrollToSection(historySectionRef)}
          >
            View Medical History
          </button>
        </div>
      </div>

      <section className="grid-2" ref={bookSectionRef}>
        <div className="card">
          <h3>Book Appointment</h3>
          <form className="form" onSubmit={handleBookSubmit}>
            <div className="field">
              <span>Appointment type</span>
              <div className="radio-group">
                <label className="radio">
                  <input
                    type="radio"
                    name="appointment-type"
                    value="examination"
                    checked={appointmentType === "examination"}
                    onChange={(e) => setAppointmentType(e.target.value)}
                  />
                  Examination
                </label>
                <label className="radio">
                  <input
                    type="radio"
                    name="appointment-type"
                    value="consultation"
                    checked={appointmentType === "consultation"}
                    onChange={(e) => setAppointmentType(e.target.value)}
                  />
                  Consultation
                </label>
              </div>
            </div>
            <label className="field">
              <span>Select date</span>
              <input
                type="date"
                min={today}
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
                required
              />
            </label>
            <button type="submit" className="btn-primary">
              Confirm appointment
            </button>
          </form>
        </div>

        <div className="card" ref={historySectionRef}>
          <h3>Medical History</h3>
          <ul className="list">
            {medicalHistory.map((record) => (
              <li key={record.id} className="list-item">
                <div className="list-title">
                  {record.diagnosis} · {record.date}
                </div>
                <div className="list-subtitle">
                  Prescription: {record.prescription}
                </div>
                <p className="muted">{record.notes}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}


