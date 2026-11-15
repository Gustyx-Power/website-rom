import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiGet, apiSend } from "../../api.js";
import Loader from "../../components/Loader.jsx";
import { formatDate } from "../../utils/format.js";

export default function Dashboard() {
  const [roms, setRoms] = useState(null);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(null);

  async function load() {
    try {
      setRoms((await apiGet("/api/roms")).roms);
    } catch (e) {
      setError(e.message);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function remove(rom) {
    if (!window.confirm(`Delete build "${rom.title}" permanently?`)) return;
    setDeleting(rom.slug);
    try {
      await apiSend("DELETE", `/api/roms/${rom.slug}`);
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div>
      <header className="page__head">
        <div>
          <h1 className="page__title">MANAGE ROMS</h1>
          <p className="mono-label page__subtitle">BUILD DISTRIBUTION CONTROL ROOM</p>
        </div>
        <Link to="/admin/roms/new" className="btn btn--primary btn--sm">
          + NEW ROM
        </Link>
      </header>

      {error ? <p className="error-box mono-label">{error}</p> : null}
      {!roms && !error ? <Loader label="LOADING BUILDS..." /> : null}
      {roms?.length === 0 ? (
        <div className="empty">NO BUILDS YET / CREATE YOUR FIRST ROM</div>
      ) : null}

      {roms?.length ? (
        <div className="table">
          {roms.map((r) => (
            <div className="table__row" key={r.id}>
              <div className="table__main">
                <strong className="table__title">{r.title}</strong>
                <span className="mono-label table__meta">
                  {r.maintainer ? `DEV: ${r.maintainer} · ` : ""}
                  ⬇ {r.downloads || 0} DL · {r.version || "N/A"} · A{r.android_version || "?"} ·{" "}
                  {formatDate(r.updated_at)}
                </span>
              </div>
              <div className="table__actions">
                <Link className="mono-label table__link" to={`/rom/${r.slug}`}>
                  VIEW ↗
                </Link>
                <Link
                  className="mono-label table__link table__link--edit"
                  to={`/admin/roms/${r.slug}/edit`}
                >
                  EDIT
                </Link>
                <button
                  type="button"
                  className="mono-label table__link table__link--danger"
                  disabled={deleting === r.slug}
                  onClick={() => remove(r)}
                >
                  {deleting === r.slug ? "DELETING..." : "DELETE"}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
