export default function StatCard({ label, value, trend }) {
  return (
    <div className="stat-card card fade-in-up">
      <div className="stat-main">
        <span className="stat-label">{label}</span>
        <span className="stat-value">{value}</span>
      </div>
      {trend && (
        <span className={"stat-trend " + (trend > 0 ? "up" : "down")}>
          {trend > 0 ? "▲" : "▼"} {Math.abs(trend)}%
        </span>
      )}
    </div>
  );
}


