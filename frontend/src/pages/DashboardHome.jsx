import { useState } from "react";
import StatCard from "../components/StatCard.jsx";
import Calendar from "../components/Calendar.jsx";

const sampleAppointments = [
  { id: 1, time: "09:00", patient: "Sarah Ahmed", type: "Check-up" },
  { id: 2, time: "10:30", patient: "Mohamed Ali", type: "Follow-up" },
  { id: 3, time: "12:00", patient: "John Smith", type: "Consultation" }
];

export default function DashboardHome() {
  const [selectedDate, setSelectedDate] = useState(new Date());

  return (
    <div className="page">
      <header className="page-header">
        <h1>Today&apos;s overview</h1>
        <p>Quick snapshot of today’s appointments and workload.</p>
      </header>

      <section className="grid-3">
        <StatCard label="Appointments today" value="18" trend={8} />
        <StatCard label="New patients" value="4" trend={12} />
        <StatCard label="Cancellation rate" value="3%" trend={-2} />
      </section>

      <section className="grid-2">
        <Calendar selectedDate={selectedDate} onSelect={setSelectedDate} />
        <div className="card fade-in-up">
          <div className="card-header">
            <h3>Upcoming appointments</h3>
            <span className="muted">
              {selectedDate.toLocaleDateString()}
            </span>
          </div>
          <ul className="list">
            {sampleAppointments.map((appt) => (
              <li key={appt.id} className="list-item">
                <div>
                  <div className="list-title">
                    {appt.time} · {appt.patient}
                  </div>
                  <div className="list-subtitle">{appt.type}</div>
                </div>
                <button className="pill pill-soft">Details</button>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}


