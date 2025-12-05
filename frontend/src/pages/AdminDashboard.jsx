import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import StatCard from "../components/StatCard.jsx";
import { adminService } from "../api/adminService";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalDoctors: 0,
    totalAppointments: 0,
    totalSpecialties: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await adminService.getStats();
        // Backend returns: {success: true, data: {totalPatients, ...}}
        // adminService.getStats() returns result.data which is {success: true, data: {...}}
        setStats(response.data || response);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

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

  return (
    <div className="page">
      <header className="page-header">
        <h1>Admin Dashboard</h1>
        <p>Overview of system statistics and management options.</p>
      </header>

      {/* Summary Boxes */}
      <section className="grid-4" style={{ marginBottom: "2rem" }}>
        <StatCard label="Total Patients" value={stats.totalPatients.toString()} />
        <StatCard label="Total Doctors" value={stats.totalDoctors.toString()} />
        <StatCard label="Total Appointments" value={stats.totalAppointments.toString()} />
        <StatCard label="Total Specialties" value={stats.totalSpecialties.toString()} />
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
        <div className="admin-management-grid">
          {navigationItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="btn-primary admin-management-card"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "0.5rem",
                padding: "1.1rem 0.8rem",
                minHeight: "95px",
                fontSize: "0.95rem"
              }}
            >
              <span style={{ fontSize: "2rem" }}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
