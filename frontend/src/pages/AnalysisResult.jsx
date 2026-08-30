import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getHistoryItem } from "../api.js";
import ImageCompare from "../components/ImageCompare.jsx";
import FiltrationCard from "../components/FiltrationCard.jsx";

export default function AnalysisResult() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    getHistoryItem(id)
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="page"><div className="empty-state"><span className="loader" /></div></div>;
  }

  if (error || !data) {
    return (
      <div className="page">
        <div className="error-box">{error || "Sample not found"}</div>
        <Link to="/history" className="btn">Back to History</Link>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-title">Analysis Result</div>
      <div className="page-subtitle">
        {data.sample_name} &middot; {data.location} &middot; {new Date(data.timestamp).toLocaleString()}
        {data.is_demo ? <span style={{ marginLeft: 10, color: "var(--excite)" }}>(Demo Mode)</span> : null}
      </div>

      <div className={`result-headline ${data.contamination_level} section-gap`}>
        <div className="eyebrow">{data.contamination_level} CONTAMINATION</div>
        <div className="result-count">{data.particle_count} suspected particles detected</div>
        <div style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
          Recommended Action: <strong style={{ color: "var(--text)" }}>{data.filtration_mode.toUpperCase()}</strong>
        </div>

        <div className="meta-grid">
          <div className="meta-item">
            <div className="label">Avg. Particle Size</div>
            <div className="value">{data.avg_particle_size} px</div>
          </div>
          <div className="meta-item">
            <div className="label">Detection Confidence</div>
            <div className="value">{data.confidence_score}%</div>
          </div>
          <div className="meta-item">
            <div className="label">Contamination Score</div>
            <div className="value">{data.contamination_score}/100</div>
          </div>
          <div className="meta-item">
            <div className="label">Sample ID</div>
            <div className="value">#{data.id}</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">Detection Imagery</div>
        <ImageCompare
          original={data.original_image_url}
          processed={data.processed_image_url}
          detected={data.detected_image_url}
        />
        <div className="hero-disclaimer">
          <span className="dot" />
          AI-assisted suspected microplastic screening — laboratory confirmation may be required.
        </div>
      </div>

      <div className="section-gap">
        <FiltrationCard level={data.contamination_level} filtrationMode={data.filtration_mode} />
      </div>
    </div>
  );
}
