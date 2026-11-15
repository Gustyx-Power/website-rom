import StatusBadge from "./StatusBadge.jsx";

export default function FeatureTable({ features }) {
  if (!features?.length) {
    return (
      <div className="empty">NO STATUS DATA DOCUMENTED FOR THIS ROM YET</div>
    );
  }
  return (
    <div className="feature-table">
      {features.map((f) => (
        <div className="feature-row" key={f.id}>
          <span className="feature-row__name">{f.name}</span>
          <span className="feature-row__notes">{f.notes || "N/A"}</span>
          <StatusBadge status={f.status} />
        </div>
      ))}
    </div>
  );
}
