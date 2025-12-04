import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const allNavItems = {
  patient: [
    { to: "/patient-settings", label: "Settings" }
  ],
  doctor: [
    { to: "/doctor-settings", label: "Settings" }
  ],
  Admin: [
    { to: "/admin-settings", label: "Settings" }
  ],
  admin: [
    { to: "/admin-settings", label: "Settings" }
  ],
  Receptionist: [
    { to: "/receptionist-settings", label: "Settings" }
  ],
  receptionist: [
    { to: "/receptionist-settings", label: "Settings" }
  ]
};

export default function DashboardLayout() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userRole, setUserRole] = useState("doctor"); // default

  useEffect(() => {
    const role = localStorage.getItem("userRole") || "doctor";
    setUserRole(role);
  }, []);

  const navItems = allNavItems[userRole] || allNavItems.doctor;

  const handleLogout = () => {
    // مسح الـ role من localStorage
    localStorage.removeItem("userRole");
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


