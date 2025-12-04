const users = [
  { id: 1, name: "Dr. Omar", role: "Doctor" },
  { id: 2, name: "Dr. Lina", role: "Doctor" },
  { id: 3, name: "Clinic Admin", role: "Admin" }
];

export default function AdminPage() {
  return (
    <div className="page">
      <header className="page-header">
        <h1>Admin</h1>
        <p>Simple demo panel for managing system users and settings.</p>
      </header>

      <section className="grid-2">
        <div className="card">
          <h3>Users</h3>
          <ul className="list">
            {users.map((u) => (
              <li key={u.id} className="list-item">
                <div>
                  <div className="list-title">{u.name}</div>
                  <div className="list-subtitle">{u.role}</div>
                </div>
                <button className="pill pill-soft">Manage</button>
              </li>
            ))}
          </ul>
        </div>

        <div className="card">
          <h3>System settings (mock)</h3>
          <div className="field toggle-field">
            <span>Enable email notifications</span>
            <input type="checkbox" defaultChecked />
          </div>
          <div className="field toggle-field">
            <span>Enable SMS reminders</span>
            <input type="checkbox" />
          </div>
          <div className="field toggle-field">
            <span>Allow online cancellations</span>
            <input type="checkbox" defaultChecked />
          </div>
          <p className="muted">
            These switches are for UI demonstration only. In a real system, they
            would be connected to backend configuration.
          </p>
        </div>
      </section>
    </div>
  );
}


