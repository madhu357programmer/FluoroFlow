import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getHistory } from "../api.js";
import ContaminationBadge from "../components/ContaminationBadge.jsx";

export default function History() {
  const [samples, setSamples] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    getHistory()
      .then(setSamples)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page">
      <div className="page-title">Sample History</div>
      <div className="page-subtitle">Every analysis run so far, including Demo Mode runs.</div>

      <div className="card section-gap">
        {loading ? (
          <div className="empty-state"><span className="loader" /></div>
        ) : error ? (
          <div className="error-box">{error}</div>
        ) : samples.length === 0 ? (
          <div className="empty-state">No samples yet. Run a Demo from the Dashboard or analyze a real sample.</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Sample</th>
                <th>Location</th>
                <th>Date</th>
                <th>Particles</th>
                <th>Level</th>
                <th>Filtration</th>
              </tr>
            </thead>
            <tbody>
              {samples.map((s) => (
                <tr key={s.id} onClick={() => navigate(`/result/${s.id}`)}>
                  <td>#{s.id}</td>
                  <td>{s.sample_name} {s.is_demo ? <span style={{ color: "var(--excite)", fontSize: "0.75rem" }}> (demo)</span> : null}</td>
                  <td>{s.location}</td>
                  <td>{new Date(s.timestamp).toLocaleString()}</td>
                  <td>{s.particle_count}</td>
                  <td><ContaminationBadge level={s.contamination_level} /></td>
                  <td style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>{s.filtration_mode}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
