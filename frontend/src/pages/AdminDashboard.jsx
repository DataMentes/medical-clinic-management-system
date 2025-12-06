import { useNavigate } from "react-router-dom";
import PageHeader from "../components/PageHeader.jsx";
import StatCard from "../components/StatCard.jsx";
import NavigationGrid from "../components/NavigationGrid.jsx";

export default function AdminDashboard() {
  const navigate = useNavigate();

  // Mock data - من API في التطبيق الحقيقي
  const stats = {
    totalPatients: 1247,
    totalDoctors: 24,
    totalAppointments: 3421,
    totalSpecialties: 12
  };

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
      <PageHeader
        title="Admin Dashboard"
        description="Overview of system statistics and management options."
      />

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
        <NavigationGrid
          items={navigationItems}
          onNavigate={(path) => navigate(path)}
        />
      </div>
    </div>
  );
}
