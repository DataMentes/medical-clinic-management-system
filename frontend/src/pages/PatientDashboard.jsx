import { useEffect, useState } from "react";
import { patientService } from "../api/patientService";

export default function PatientDashboard() {
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [pastAppointments, setPastAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await patientService.getDashboard();

        // Format upcoming appointments
        const upcoming = data.upcomingAppointments.map(appt => ({
          id: appt.id,
          date: new Date(appt.appointmentDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
          }) + ' · ' + appt.appointmentTime,
          doctor: appt.doctor.user.fullName,
          type: appt.type === 'EXAMINATION' ? 'Examination' : 'Consultation',
          status: appt.status === 'CONFIRMED' ? 'Confirmed' : appt.status === 'PENDING' ? 'Pending' : 'Checked In'
        }));

        // Format past appointments
        const past = data.pastAppointments.map(appt => ({
          id: appt.id,
          date: new Date(appt.appointmentDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
          }),
          doctor: appt.doctor.user.fullName,
          type: appt.type === 'EXAMINATION' ? 'Examination' : 'Consultation',
          notes: appt.notes || 'Completed visit.'
        }));

        setUpcomingAppointments(upcoming);
        setPastAppointments(past);
      } catch (error) {
        console.error('Failed to fetch patient dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;

    try {
      await patientService.cancelAppointment(id);
      setUpcomingAppointments(prev => prev.filter(appt => appt.id !== id));
      alert('Appointment cancelled successfully');
    } catch (error) {
      console.error('Failed to cancel appointment:', error);
      alert(error.message || 'Failed to cancel appointment. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="page patient-dashboard">
        <header className="page-header">
          <h1>Patient Dashboard</h1>
          <p>Loading...</p>
        </header>
      </div>
    );
  }

  return (
    <div className="page patient-dashboard">
      <header className="page-header">
        <h1>Patient Dashboard</h1>
        <p>Keep track of upcoming visits and past appointments.</p>
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
                <button
                  className="btn-tertiary"
                  onClick={() => handleCancel(appt.id)}
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
                  {appt.date} · {appt.type}
                </div>
                <div className="list-subtitle">{appt.doctor}</div>
                <p className="muted">{appt.notes}</p>
              </li>
            ))}
            {pastAppointments.length === 0 && (
              <li className="list-empty">No past appointments.</li>
            )}
          </ul>
        </div>
      </section>
    </div>
  );
}

