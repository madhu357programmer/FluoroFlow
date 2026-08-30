import { imageUrl } from "../api.js";

export default function ImageCompare({ original, processed, detected }) {
  const items = [
    { label: "Original sample", src: original },
    { label: "Processed (threshold mask)", src: processed },
    { label: "Detected particles", src: detected },
  ];

  return (
    <div className="image-grid">
      {items.map((item) => (
        <div className="image-card" key={item.label}>
          {item.src ? (
            <img src={imageUrl(item.src)} alt={item.label} />
          ) : (
            <div style={{ aspectRatio: "4/3", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-faint)" }}>
              No image
            </div>
          )}
          <div className="image-card-label">{item.label}</div>
        </div>
      ))}
    </div>
  );
}
