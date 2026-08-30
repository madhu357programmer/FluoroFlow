import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { analyzeSample } from "../api.js";

const LOCATIONS = [
  "River Intake Point",
  "Lake Sampling Station",
  "Municipal Water Tank",
  "Coastal Sampling Site",
  "Borewell / Groundwater",
  "Laboratory Test Sample",
];

export default function AnalyzeSample() {
  const [sampleName, setSampleName] = useState("");
  const [location, setLocation] = useState(LOCATIONS[0]);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);
  const navigate = useNavigate();

  function handleFile(f) {
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!file) {
      setError("Please upload a water sample image.");
      return;
    }
    if (!sampleName.trim()) {
      setError("Please enter a sample name or ID.");
      return;
    }

    setLoading(true);
    try {
      const result = await analyzeSample({ sampleName, location, file });
      navigate(`/result/${result.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <div className="page-title">Analyze Sample</div>
      <div className="page-subtitle">
        Upload a water sample image for AI-assisted suspected microplastic screening.
      </div>

      <form className="card section-gap" onSubmit={handleSubmit} style={{ maxWidth: 620 }}>
        {error ? <div className="error-box">{error}</div> : null}

        <div className="form-group">
          <label className="form-label">Sample Name / ID</label>
          <input
            className="form-input"
            type="text"
            placeholder="e.g. Sample-014"
            value={sampleName}
            onChange={(e) => setSampleName(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Sample Location</label>
          <select
            className="form-select"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          >
            {LOCATIONS.map((loc) => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Water Sample Image</label>
          <div
            className={"dropzone" + (dragging ? " active" : "")}
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              handleFile(e.dataTransfer.files?.[0]);
            }}
          >
            {preview ? (
              <img src={preview} alt="preview" className="dropzone-preview" />
            ) : (
              <>
                <div style={{ fontSize: "1.6rem" }}>📁</div>
                <div>Click to browse or drag an image here</div>
                <div style={{ fontSize: "0.78rem", marginTop: 4, color: "var(--text-faint)" }}>
                  JPG or PNG of a water sample under a microscope / light source
                </div>
              </>
            )}
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
          </div>
        </div>

        <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: "100%" }}>
          {loading ? <span className="loader" /> : null}
          {loading ? "Analyzing sample..." : "Analyze Sample"}
        </button>

        <div className="hero-disclaimer" style={{ marginTop: 18 }}>
          <span className="dot" />
          AI-assisted suspected microplastic screening — laboratory confirmation may be required.
        </div>
      </form>
    </div>
  );
}
