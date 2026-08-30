import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getHistory } from "../api.js";
import StatCard from "../components/StatCard.jsx";
import ContaminationBadge from "../components/ContaminationBadge.jsx";
import DemoButtons from "../components/DemoButtons.jsx";

export default function Dashboard() {
  const [samples, setSamples] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getHistory()
      .then(setSamples)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const totalSamples = samples.length;
  const totalParticles = samples.reduce((sum, s) => sum + s.particle_count, 0);
  const latestLevel = samples[0]?.contamination_level || "—";
  const avgParticles = totalSamples ? Math.round(totalParticles / totalSamples) : 0;

  return (
    <div className="page">
      <div className="hero">
        <div className="hero-content">
          <div className="eyebrow">AI + Environmental Monitoring Platform</div>
          <h1 className="hero-title">FluoroFlow</h1>
          <p className="hero-subtitle">
            AI-Assisted Microplastic Detection &amp; Adaptive Water Filtration.
            Upload a water sample image, let the OpenCV detection pipeline
            screen it for suspected fluorescent particles, and drive an
            adaptive filtration response.
          </p>
          <div className="hero-disclaimer">
            <span className="dot" />
            AI-assisted suspected microplastic screening — laboratory confirmation may be required.
          </div>
        </div>
      </div>

      <div className="stat-grid">
        <StatCard icon="🧪" label="Samples Analyzed" value={totalSamples} />
        <StatCard icon="🔵" label="Suspected Particles Detected" value={totalParticles} />
        <StatCard icon="⚠️" label="Latest Contamination Level" value={latestLevel} />
        <StatCard icon="📊" label="Average Particle Count" value={avgParticles} />
      </div>

      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div>
            <div className="card-title">Demo Mode</div>
            <div style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>
              No sample on hand? Generate a synthetic sample and run it through the real detection pipeline.
            </div>
          </div>
        </div>
        <DemoButtons />
      </div>

      <div className="card section-gap">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div className="card-title">Recent Sample History</div>
          <Link to="/history" className="btn btn-ghost">View all</Link>
        </div>

        {loading ? (
          <div className="empty-state"><span className="loader" /></div>
        ) : error ? (
          <div className="error-box">{error}</div>
        ) : samples.length === 0 ? (
          <div className="empty-state">No samples analyzed yet. Try Demo Mode above or analyze a real sample.</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Sample</th>
                <th>Location</th>
                <th>Date</th>
                <th>Particles</th>
                <th>Level</th>
              </tr>
            </thead>
            <tbody>
              {samples.slice(0, 6).map((s) => (
                <SampleRow key={s.id} sample={s} />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function SampleRow({ sample }) {
  const navigate = useNavigate();
  return (
    <tr onClick={() => navigate(`/result/${sample.id}`)}>
      <td>{sample.sample_name}</td>
      <td>{sample.location}</td>
      <td>{new Date(sample.timestamp).toLocaleString()}</td>
      <td>{sample.particle_count}</td>
      <td><ContaminationBadge level={sample.contamination_level} /></td>
    </tr>
  );
}
