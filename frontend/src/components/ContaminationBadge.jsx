export default function ContaminationBadge({ level }) {
  const cls = {
    LOW: "badge-low",
    MEDIUM: "badge-medium",
    HIGH: "badge-high",
  }[level] || "badge-low";

  return (
    <span className={`badge ${cls}`}>
      <span className="dot" />
      {level} contamination
    </span>
  );
}
