const LABELS = {
  works: "✓ WORKS",
  partial: "△ PARTIAL",
  broken: "✕ BROKEN",
};

export default function StatusBadge({ status }) {
  const key = LABELS[status] ? status : "works";
  return <span className={`badge badge--${key}`}>{LABELS[key]}</span>;
}

export { LABELS };
