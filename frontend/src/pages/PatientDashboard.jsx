import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { patientService } from "../api/patientService";

export default function PatientDashboard() {
  const navigate = useNavigate();
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [pastAppointments, setPastAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [dashboardData, pastData] = await Promise.all([
            patientService.getDashboard(),
            patientService.getPastAppointments()
        ]);

        // Format upcoming appointments
        if (dashboardData && dashboardData.upcomingAppointments) {
            const upcoming = dashboardData.upcomingAppointments.map(appt => ({
            id: appt.id,
            date: new Date(appt.appointmentDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            }) + ' · ' + (appt.schedule?.startTime ? new Date(appt.schedule.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : appt.appointmentTime || 'N/A'),
            doctor: appt.doctor?.person?.fullName || 'Unknown Doctor',
            specialty: appt.doctor?.specialty?.name || 'General',
            type: appt.appointmentType,
            status: appt.status // Status is already Title Case from Enum (Pending, Confirmed)
            }));
            setUpcomingAppointments(upcoming);
        }

        // Format past appointments
        if (pastData && Array.isArray(pastData)) {
            const past = pastData.map(appt => ({
            id: appt.id,
            date: new Date(appt.appointmentDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            }),
            doctor: appt.doctor?.person?.fullName || 'Unknown Doctor',
            specialty: appt.doctor?.specialty?.name || 'General',
            type: appt.appointmentType,
            status: appt.status,
            notes: appt.medicalRecord?.length > 0 ? appt.medicalRecord[0].diagnosis : (appt.notes || 'No notes available')
            }));
            setPastAppointments(past);
        }

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
        {/* Card 1: Upcoming Appointments */}
        <div className="card">
          <h3>Upcoming Appointments</h3>
          <ul className="list">
            {upcomingAppointments.map((appt) => (
              <li key={appt.id} className="list-item">
                <div className="list-title">{appt.date}</div>
                <div className="list-subtitle">
                  {appt.doctor} · {appt.specialty} · {appt.type}
                </div>
                <div className="badge" style={{ 
                  backgroundColor: appt.status === 'Confirmed' ? '#dcfce7' : '#fef9c3', 
                  color: appt.status === 'Confirmed' ? '#166534' : '#854d0e',
                  display: 'inline-block', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', marginTop: '0.25rem'
                }}>
                  {appt.status}
                </div>
                {appt.status !== 'Confirmed' && appt.status !== 'Completed' && (
                  <button
                    className="btn-tertiary"
                    onClick={() => handleCancel(appt.id)}
                    style={{ marginTop: '0.5rem', width: '100%', textAlign: 'center' }}
                  >
                    Cancel
                  </button>
                )}
                 {appt.status === 'Confirmed' && (
                  <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.5rem', fontStyle: 'italic' }}>
                    Contact clinic to cancel
                  </div>
                )}
              </li>
            ))}
            {upcomingAppointments.length === 0 && (
              <li className="list-empty">No upcoming appointments.</li>
            )}
          </ul>
        </div>

        {/* Card 2: Past Appointments */}
        <div className="card">
          <h3>Past Appointments</h3>
          <ul className="list">
            {pastAppointments.map((appt) => (
              <li key={appt.id} className="list-item">
                <div className="list-title">
                  {appt.date} · {appt.specialty}
                </div>
                <div className="list-subtitle">{appt.doctor}</div>
                <p className="muted" style={{ fontSize: '0.9rem', marginTop: '0.25rem' }}>Notes: {appt.notes}</p>
              </li>
            ))}
            {pastAppointments.length === 0 && (
              <li className="list-empty">No past appointments.</li>
            )}
          </ul>
        </div>

        {/* Card 3: Quick Actions - Book Appointment */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '2rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📅</div>
          <h3>Book New Appointment</h3>
          <p style={{ color: 'var(--text-soft)', marginBottom: '1.5rem' }}>Schedule a new visit with one of our specialists.</p>
          <button 
            className="btn-primary" 
            onClick={() => navigate('/book-appointment')}
            style={{ width: '100%' }}
          >
            Book Now
          </button>
        </div>

         {/* Card 4: Quick Actions - Medical Records */}
         <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '2rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📋</div>
          <h3>Medical History</h3>
          <p style={{ color: 'var(--text-soft)', marginBottom: '1.5rem' }}>View your complete medical records and prescriptions.</p>
          <button 
            className="btn-secondary" 
            onClick={() => navigate('/medical-history')}
            style={{ width: '100%' }}
          >
            View Records
          </button>
        </div>

      </section>
    </div>
  );
}

