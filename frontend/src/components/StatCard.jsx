export default function StatCard({ label, value, icon }) {
  return (
    <div className="stat-card">
      <div className="stat-label">
        {icon ? <span className="stat-icon">{icon}</span> : null} {label}
      </div>
      <div className="stat-value">{value}</div>
    </div>
  );
}
