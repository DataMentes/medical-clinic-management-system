import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../components/PageHeader.jsx";
import StatCard from "../components/StatCard.jsx";
import NavigationGrid from "../components/NavigationGrid.jsx";
import { getStats } from "../api/admin.api.js";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch stats from API
  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        setError(null);
        const response = await getStats();
        setStats(response.data);
      } catch (err) {
        console.error('Failed to fetch stats:', err);
        setError(err.message || 'Failed to load dashboard stats');
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  const navigationItems = [
    { path: "/admin-manage-admins", label: "Manage Admins", icon: "👥" },
    { path: "/admin-manage-doctors", label: "Manage Doctors", icon: "👨‍⚕️" },
    { path: "/admin-manage-patients", label: "Manage Patients", icon: "🏥" },
    { path: "/admin-manage-receptionists", label: "Manage Receptionists", icon: "📋" },
    { path: "/admin-manage-schedules", label: "Manage Schedules", icon: "📅" },
    { path: "/admin-manage-appointments", label: "Manage Appointments", icon: "📝" },
    { path: "/admin-manage-rooms", label: "Manage Rooms", icon: "🏢" },
    { path: "/admin-manage-specialties", label: "Manage Specialties", icon: "🔬" },
    { path: "/admin-reports", label: "Reports", icon: "📊" }
  ];

  // Show loading state
  if (loading) {
    return (
      <div className="page">
        <PageHeader
          title="Admin Dashboard"
          description="Overview of system statistics and management options."
        />
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <p>Loading dashboard stats...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="page">
        <PageHeader
          title="Admin Dashboard"
          description="Overview of system statistics and management options."
        />
        <div className="card" style={{ padding: '2rem', textAlign: 'center', color: '#e74c3c' }}>
          <p>⚠️ {error}</p>
          <button 
            className="btn btn-primary" 
            onClick={() => window.location.reload()}
            style={{ marginTop: '1rem' }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <PageHeader
        title="Admin Dashboard"
        description="Overview of system statistics and management options."
      />

      {/* Summary Boxes */}
      <section className="grid-4" style={{ marginBottom: "2rem" }}>
        <StatCard label="Total Patients" value={stats?.totalPatients?.toString() || '0'} />
        <StatCard label="Total Doctors" value={stats?.totalDoctors?.toString() || '0'} />
        <StatCard label="Total Appointments" value={stats?.totalAppointments?.toString() || '0'} />
        <StatCard label="Total Specialties" value={stats?.totalSpecialties?.toString() || '0'} />
      </section>

      {/* Navigation Grid */}
      <div className="card">
        <h3
          style={{
            marginBottom: "1.5rem",
            fontSize: "1.2rem",
            letterSpacing: "0.02em"
          }}
        >
          Management
        </h3>
        <NavigationGrid
          items={navigationItems}
          onNavigate={(path) => navigate(path)}
        />
      </div>
    </div>
  );
}
