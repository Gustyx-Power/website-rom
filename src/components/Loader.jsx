export default function Loader({ label = "LOADING" }) {
  return (
    <p className="loader mono-label">
      {label}
      <span className="loader__dots">...</span>
    </p>
  );
}

export function ErrorBox({ children }) {
  return <div className="error-box mono-label">{children}</div>;
}
