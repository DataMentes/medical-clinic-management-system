import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { logout } from "../api/auth.api.js";

const allNavItems = {
  Patient: [
    { to: "/patient-dashboard", label: "Patient Dashboard" },
    { to: "/book-appointment", label: "Book Appointment" },
    { to: "/medical-history", label: "Medical History" },
    { to: "/patient-settings", label: "Settings" }
  ],
  patient: [
    { to: "/patient-dashboard", label: "Patient Dashboard" },
    { to: "/book-appointment", label: "Book Appointment" },
    { to: "/medical-history", label: "Medical History" },
    { to: "/patient-settings", label: "Settings" }
  ],
  Doctor: [
    { to: "/doctor-dashboard", label: "Doctor Dashboard" },
    { to: "/doctor-settings", label: "Settings" }
  ],
  doctor: [
    { to: "/doctor-dashboard", label: "Doctor Dashboard" },
    { to: "/doctor-settings", label: "Settings" }
  ],
  Admin: [
    { to: "/admin-dashboard", label: "Admin Dashboard" },
    { to: "/admin-manage-admins", label: "Manage Admins" },
    { to: "/admin-manage-doctors", label: "Manage Doctors" },
    { to: "/admin-manage-patients", label: "Manage Patients" },
    { to: "/admin-manage-receptionists", label: "Manage Receptionists" },
    { to: "/admin-manage-schedules", label: "Manage Schedules" },
    { to: "/admin-manage-appointments", label: "Manage Appointments" },
    { to: "/admin-manage-rooms", label: "Manage Rooms" },
    { to: "/admin-manage-specialties", label: "Manage Specialties" },
    { to: "/admin-reports", label: "Reports" },
    { to: "/admin-settings", label: "Settings" }
  ],
  admin: [
    { to: "/admin-dashboard", label: "Admin Dashboard" },
    { to: "/admin-manage-admins", label: "Manage Admins" },
    { to: "/admin-manage-doctors", label: "Manage Doctors" },
    { to: "/admin-manage-patients", label: "Manage Patients" },
    { to: "/admin-manage-receptionists", label: "Manage Receptionists" },
    { to: "/admin-manage-schedules", label: "Manage Schedules" },
    { to: "/admin-manage-appointments", label: "Manage Appointments" },
    { to: "/admin-manage-rooms", label: "Manage Rooms" },
    { to: "/admin-manage-specialties", label: "Manage Specialties" },
    { to: "/admin-reports", label: "Reports" },
    { to: "/admin-settings", label: "Settings" }
  ],
  Receptionist: [
    { to: "/receptionist-dashboard", label: "Dashboard" },
    { to: "/receptionist-settings", label: "Settings" }
  ],
  receptionist: [
    { to: "/receptionist-dashboard", label: "Dashboard" },
    { to: "/receptionist-settings", label: "Settings" }
  ]
};

export default function DashboardLayout() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userRole, setUserRole] = useState(() => {
    return localStorage.getItem("userRole") || "Patient";
  });

  useEffect(() => {
    // Function to update role from localStorage
    const updateRole = () => {
      const role = localStorage.getItem("userRole") || "Patient";
      console.log('🔐 User role updated:', role);
      setUserRole(role);
    };

    // Listen for storage events (when localStorage changes from other tabs)
    window.addEventListener('storage', updateRole);

    // Listen for custom event (when localStorage changes in same tab after login)
    window.addEventListener('roleChange', updateRole);

    // Check role on mount
    updateRole();

    return () => {
      window.removeEventListener('storage', updateRole);
      window.removeEventListener('roleChange', updateRole);
    };
  }, []);

  const navItems = allNavItems[userRole] || allNavItems.Patient;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="app dashboard-layout">
      <aside className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-brand" style={{ justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span className="logo-dot" />
            CarePoint
          </div>
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setSidebarOpen(false)}
            style={{
              background: "none",
              border: "1px solid rgba(148, 163, 184, 0.6)",
              borderRadius: "999px",
              color: "var(--text-soft)",
              width: "26px",
              height: "26px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              fontSize: "0.9rem"
            }}
          >
            ×
          </button>
        </div>
        <nav>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                "nav-item" + (isActive ? " nav-item-active" : "")
              }
              onClick={() => setSidebarOpen(false)}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </aside>

      <div className="content">
        <header className="topbar">
          <button
            className="menu-toggle"
            onClick={() => setSidebarOpen((v) => !v)}
          >
            ☰
          </button>
          <div className="topbar-info">
            <span className="role-pill">
              {userRole.charAt(0).toUpperCase() + userRole.slice(1)} · Demo
            </span>
          </div>
        </header>
        <main className="main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
