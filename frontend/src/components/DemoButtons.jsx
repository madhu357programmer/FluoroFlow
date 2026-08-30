import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { runDemo } from "../api.js";

export default function DemoButtons() {
  const [loadingLevel, setLoadingLevel] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const options = [
    { level: "low", title: "Run Low Contamination Demo", className: "low" },
    { level: "medium", title: "Run Medium Contamination Demo", className: "medium" },
    { level: "high", title: "Run High Contamination Demo", className: "high" },
  ];

  async function handleRun(level) {
    setError("");
    setLoadingLevel(level);
    try {
      const result = await runDemo(level);
      navigate(`/result/${result.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingLevel(null);
    }
  }

  return (
    <div>
      {error ? <div className="error-box">{error}</div> : null}
      <div className="demo-grid">
        {options.map((opt) => (
          <button
            key={opt.level}
            className={`demo-btn ${opt.className}`}
            onClick={() => handleRun(opt.level)}
            disabled={loadingLevel !== null}
          >
            <div className="demo-btn-label">Demo Mode</div>
            <div className="demo-btn-title">
              {loadingLevel === opt.level ? "Running..." : opt.title}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
