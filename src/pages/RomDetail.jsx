import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiGet } from "../api.js";
import StatusBadge from "../components/StatusBadge.jsx";
import FeatureTable from "../components/FeatureTable.jsx";
import Loader, { ErrorBox } from "../components/Loader.jsx";
import NotFound from "./NotFound.jsx";
import { formatDate } from "../utils/format.js";
import { parseSteps } from "../utils/text.js";

export default function RomDetail() {
  const { slug } = useParams();
  const [state, setState] = useState({ loading: true, rom: null, error: null });
  const [zoom, setZoom] = useState(null);

  useEffect(() => {
    let live = true;
    setState({ loading: true, rom: null, error: null });
    apiGet(`/api/roms/${slug}`)
      .then((d) => live && setState({ loading: false, rom: d.rom, error: null }))
      .catch((e) => live && setState({ loading: false, rom: null, error: e }));
    return () => {
      live = false;
    };
  }, [slug]);

  if (state.loading) {
    return (
      <div className="page container">
        <Loader />
      </div>
    );
  }
  if (state.error?.status === 404) return <NotFound />;
  if (!state.rom) {
    return (
      <div className="page container">
        <ErrorBox>{state.error?.message || "FAILED TO LOAD ROM"}</ErrorBox>
      </div>
    );
  }

  const rom = state.rom;
  const steps = parseSteps(rom.flash_guide);

  return (
    <div className="page container">
      <nav className="crumbs">
        <Link to="/roms" className="mono-label">
          ← ALL PORTS
        </Link>
      </nav>

      <header className="detail__head">
        <div className="detail__id mono-label">
          #{rom.slug.toUpperCase()} — {formatDate(rom.created_at)}
        </div>
        <h1 className="detail__title">{rom.title}</h1>
        {(rom.version || rom.android_version || rom.source) && (
          <div className="detail__chips">
            {rom.version ? <span className="chip">{rom.version}</span> : null}
            {rom.android_version ? (
              <span className="chip">ANDROID {rom.android_version}</span>
            ) : null}
            {rom.source ? <span className="chip">SOURCE: {rom.source}</span> : null}
          </div>
        )}
      </header>

      {rom.images?.length ? (
        <section className="detail__gallery">
          {rom.images.map((im) => (
            <button
              key={im.id}
              type="button"
              className="gallery__cell"
              onClick={() => setZoom(`/images/${im.object_key}`)}
              aria-label="Zoom image"
            >
              <img
                src={`/images/${im.object_key}`}
                alt={`${rom.title} screenshot`}
                loading="lazy"
              />
            </button>
          ))}
        </section>
      ) : null}

      <div className="detail__grid">
        <div className="detail__main">
          {rom.description ? (
            <section className="block">
              <h2 className="block__title">OVERVIEW</h2>
              {rom.description
                .split(/\r?\n/)
                .filter((l) => l.trim())
                .map((p, i) => (
                  <p className="block__body" key={i}>
                    {p}
                  </p>
                ))}
            </section>
          ) : null}

          {rom.changelog ? (
            <section className="block">
              <h2 className="block__title">CHANGELOG</h2>
              <ul className="changelog">
                {parseSteps(rom.changelog).map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>

        <aside className="detail__aside">
          {rom.download_url ? (
            <a
              className="btn btn--block"
              href={rom.download_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              DOWNLOAD ROM ↓
            </a>
          ) : (
            <div className="empty">NO MIRROR LINK YET</div>
          )}
          <dl className="info-list">
            <div>
              <dt className="mono-label">VERSION</dt>
              <dd>{rom.version || "—"}</dd>
            </div>
            <div>
              <dt className="mono-label">ANDROID</dt>
              <dd>{rom.android_version || "—"}</dd>
            </div>
            <div>
              <dt className="mono-label">KERNEL</dt>
              <dd>{rom.kernel || "—"}</dd>
            </div>
            <div>
              <dt className="mono-label">SOURCE</dt>
              <dd>{rom.source || "—"}</dd>
            </div>
            <div>
              <dt className="mono-label">UPDATED</dt>
              <dd>{formatDate(rom.updated_at)}</dd>
            </div>
          </dl>
        </aside>
      </div>

      {steps.length ? (
        <section className="block">
          <h2 className="block__title">FLASH INSTRUCTIONS</h2>
          <ol className="steps">
            {steps.map((s, i) => (
              <li key={i}>
                <span className="steps__num">{String(i + 1).padStart(2, "0")}</span>
                <span>{s}</span>
              </li>
            ))}
          </ol>
          <p className="mono-label steps__warn">
            ⚠ FLASH AT YOUR OWN RISK — BACK UP DATA FIRST
          </p>
        </section>
      ) : null}

      <section className="block">
        <div className="block__head">
          <h2 className="block__title">STATUS DOCUMENTATION</h2>
          <div className="legend">
            <StatusBadge status="works" />
            <StatusBadge status="partial" />
            <StatusBadge status="broken" />
          </div>
        </div>
        <FeatureTable features={rom.features} />
      </section>

      {zoom ? (
        <div
          className="lightbox"
          onClick={() => setZoom(null)}
          role="dialog"
          aria-label="Image preview"
        >
          <img src={zoom} alt="Screenshot preview" />
        </div>
      ) : null}
    </div>
  );
}
