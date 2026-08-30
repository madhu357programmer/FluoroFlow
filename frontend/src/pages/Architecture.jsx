export default function Architecture() {
  const flow = [
    { label: "Water Sample", tag: "input" },
    { label: "Nile Red Staining", tag: "future hardware", future: true },
    { label: "UV / Blue Illumination", tag: "future hardware", future: true },
    { label: "Camera / Image Input", tag: "input" },
    { label: "OpenCV Image Processing", tag: "mvp" },
    { label: "AI / Particle Detection", tag: "mvp" },
    { label: "Particle Count + Approx. Size", tag: "mvp" },
    { label: "Contamination Classification", tag: "mvp" },
    { label: "FluoroFlow Dashboard", tag: "mvp" },
    { label: "Filtration Recommendation", tag: "mvp" },
    { label: "Hardware Control Simulation", tag: "mvp (simulated)" },
  ];

  return (
    <div className="page">
      <div className="page-title">System Architecture</div>
      <div className="page-subtitle">
        How a water sample flows through FluoroFlow, from image capture to filtration response.
      </div>

      <div className="card section-gap">
        <div className="flow-list">
          {flow.map((step, i) => (
            <div key={step.label}>
              <div className={"flow-step" + (step.future ? " future" : "")}>
                <span className="flow-tag">{step.tag}</span>
                <span style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}>{step.label}</span>
              </div>
              {i < flow.length - 1 && <div className="flow-connector" />}
            </div>
          ))}
        </div>
      </div>

      <div className="two-col">
        <div className="card">
          <div className="card-title">Current MVP</div>
          <p style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>
            Fully working in software today, no external hardware required.
          </p>
          <ul className="checklist current">
            <li>Image upload</li>
            <li>OpenCV processing</li>
            <li>Suspected particle detection</li>
            <li>Particle counting</li>
            <li>Contamination classification</li>
            <li>Dashboard</li>
            <li>History database</li>
            <li>Filtration response simulation</li>
          </ul>
        </div>

        <div className="card">
          <div className="card-title">Future Hardware</div>
          <p style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>
            Planned physical integration — not implemented in this MVP.
          </p>
          <ul className="checklist future">
            <li>Raspberry Pi</li>
            <li>ESP32</li>
            <li>UV / Blue LEDs</li>
            <li>Camera / USB microscope</li>
            <li>Pump</li>
            <li>Solenoid valves</li>
            <li>Physical filtration control</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
