import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="page container notfound">
      <p className="mono-label">ERROR 404</p>
      <h1 className="notfound__title is-outline">NOT FOUND</h1>
      <Link to="/" className="btn btn--primary">
        ← BACK TO HOME
      </Link>
    </div>
  );
}
