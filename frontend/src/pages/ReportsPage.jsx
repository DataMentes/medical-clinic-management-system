const dailyData = [
  { label: "Mon", value: 16 },
  { label: "Tue", value: 20 },
  { label: "Wed", value: 18 },
  { label: "Thu", value: 22 },
  { label: "Fri", value: 15 }
];

export default function ReportsPage() {
  const max = Math.max(...dailyData.map((d) => d.value));

  return (
    <div className="page">
      <header className="page-header">
        <h1>Reports</h1>
        <p>Simple daily and weekly appointment insights.</p>
      </header>

      <section className="grid-2">
        <div className="card">
          <h3>Appointments per day</h3>
          <div className="bar-chart">
            {dailyData.map((d) => (
              <div key={d.label} className="bar-wrapper">
                <div
                  className="bar"
                  style={{ height: `${(d.value / max) * 100}%` }}
                >
                  <span className="bar-value">{d.value}</span>
                </div>
                <span className="bar-label">{d.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3>Summary</h3>
          <ul className="bullets">
            <li>Peak day: Thursday</li>
            <li>Average daily appointments: 18</li>
            <li>Most common reason: General check-ups</li>
          </ul>
          <p className="muted">
            In a real system this section would be generated from real-time
            analytics coming from the backend.
          </p>
        </div>
      </section>
    </div>
  );
}


