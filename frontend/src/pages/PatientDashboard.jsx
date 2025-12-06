import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUpcomingAppointments, getPastAppointments, cancelAppointment } from "../api/patient.api.js";

export default function PatientDashboard() {
  const navigate = useNavigate();
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [pastAppointments, setPastAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // تحميل المواعيد من API
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        setError("");

        // جلب upcoming و past appointments معاً
        const [upcomingRes, pastRes] = await Promise.all([
          getUpcomingAppointments(),
          getPastAppointments()
        ]);

        console.log('✅ Appointments loaded successfully');

        if (upcomingRes.success && upcomingRes.data) {
          setUpcomingAppointments(upcomingRes.data);
        }

        if (pastRes.success && pastRes.data) {
          setPastAppointments(pastRes.data);
        }
      } catch (err) {
        console.error('❌ Error loading appointments:', err);
        setError(err.message || "Failed to load appointments");
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  const handleCancel = async (id) => {
    if (!confirm("Are you sure you want to cancel this appointment?")) {
      return;
    }

    try {
      const response = await cancelAppointment(id);
      
      if (response.success) {
        // تحديث القائمة بعد الإلغاء
        setUpcomingAppointments(prev => prev.filter(appt => appt.id !== id));
        alert("Appointment cancelled successfully");
      }
    } catch (err) {
      alert(err.message || "Failed to cancel appointment");
    }
  };

  // Helper function to format date and time
  const formatDateTime = (dateString, time) => {
    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString('en-GB', { 
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    
    // Extract time from ISO timestamp or time string
    let formattedTime = 'Time TBD';
    if (time) {
      if (time.includes('T')) {
        // ISO timestamp like "1970-01-01T09:00:00.000Z"
        const timeDate = new Date(time);
        formattedTime = timeDate.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true 
        });
      } else {
        // Time string like "09:00:00"
        const [hours, minutes] = time.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        formattedTime = `${hour12}:${minutes} ${ampm}`;
      }
    }
    
    return `${formattedDate} - ${formattedTime}`;
  };

  return (
    <div className="page patient-dashboard">
      <header className="page-header">
        <div>
          <h1>Patient Dashboard</h1>
          <p>Keep track of upcoming visits and past appointments.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignSelf: 'flex-start' }}>
          <button
            className="btn-primary"
            onClick={() => navigate('/book-appointment')}
          >
            📅 Book Appointment
          </button>
          <button
            className="btn-primary"
            onClick={() => navigate('/medical-history')}
          >
            🩺 Medical History
          </button>
        </div>
      </header>

      {error && (
        <div style={{
          padding: "1rem",
          backgroundColor: "rgba(239, 68, 68, 0.1)",
          border: "1px solid rgba(239, 68, 68, 0.3)",
          borderRadius: "var(--radius-md)",
          color: "#dc2626",
          marginBottom: "1rem"
        }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-soft)" }}>
          Loading appointments...
        </div>
      ) : (
        <section className="grid-2">
          <div className="card">
            <h3>Upcoming Appointments</h3>
            <ul className="list">
              {upcomingAppointments.map((appt) => (
                <li key={appt.id} className="list-item">
                  <div className="list-title">
                    {formatDateTime(appt.appointmentDate, appt.schedule?.startTime)}
                  </div>
                  <div className="list-subtitle">
                    {appt.doctor?.person?.fullName} · {appt.appointmentType}
                  </div>
                  <div className="muted" style={{ fontSize: "0.85rem", marginTop: "0.25rem" }}>
                    {appt.doctor?.specialty?.name} · {appt.schedule?.room?.roomName}
                  </div>
                  <div className="badge">{appt.status}</div>
                  <button
                    className="btn-tertiary"
                    onClick={() => handleCancel(appt.id)}
                    disabled={appt.status === "Completed" || appt.status === "Cancelled"}
                  >
                    Cancel
                  </button>
                </li>
              ))}
              {upcomingAppointments.length === 0 && (
                <li className="list-empty">No upcoming appointments.</li>
              )}
            </ul>
          </div>

          <div className="card">
            <h3>Past Appointments</h3>
            <ul className="list">
              {pastAppointments.map((appt) => (
                <li key={appt.id} className="list-item">
                  <div className="list-title">
                    {formatDateTime(appt.appointmentDate, appt.schedule?.startTime)} · {appt.appointmentType}
                  </div>
                  <div className="list-subtitle">{appt.doctor?.person?.fullName}</div>
                  {appt.medicalRecord && appt.medicalRecord.length > 0 && (
                    <p className="muted">
                      {appt.medicalRecord[0].diagnosis} - {appt.medicalRecord[0].notes}
                    </p>
                  )}
                </li>
              ))}
              {pastAppointments.length === 0 && (
                <li className="list-empty">No past appointments.</li>
              )}
            </ul>
          </div>
        </section>
      )}
    </div>
  );
}
