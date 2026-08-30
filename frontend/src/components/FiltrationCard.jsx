import ContaminationBadge from "./ContaminationBadge.jsx";

export default function FiltrationCard({ level, filtrationMode }) {
  return (
    <div className="filtration-card">
      <div className="eyebrow">Adaptive Filtration Response</div>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 10, flexWrap: "wrap" }}>
        <h3 style={{ fontSize: "1.3rem" }}>{filtrationMode}</h3>
        <ContaminationBadge level={level} />
      </div>
      <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", marginTop: 10 }}>
        This response is a <strong>Hardware Control Simulation</strong> — no physical
        pump or valve is being actuated in this MVP. It represents the decision
        FluoroFlow would send downstream once connected to filtration hardware.
      </p>
      <div className="filtration-flow">
        <span className="step">AI Decision</span>
        <span className="arrow">&rarr;</span>
        <span className="step">Raspberry Pi</span>
        <span className="arrow">&rarr;</span>
        <span className="step">ESP32</span>
        <span className="arrow">&rarr;</span>
        <span className="step">Pump / Solenoid Valve</span>
        <span className="arrow">&rarr;</span>
        <span className="step">Filtration System</span>
      </div>
    </div>
  );
}
