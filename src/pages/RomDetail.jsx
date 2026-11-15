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
        <Loader label="LOADING BUILD DATA..." />
      </div>
    );
  }
  if (state.error?.status === 404) return <NotFound />;
  if (!state.rom) {
    return (
      <div className="page container">
        <ErrorBox>{state.error?.message || "FAILED TO LOAD ROM DETAILS"}</ErrorBox>
      </div>
    );
  }

  const rom = state.rom;
  const steps = parseSteps(rom.flash_guide);

  return (
    <div className="page container">
      <nav className="crumbs">
        <Link to="/roms" className="crumbs__link mono-label">
          ← ALL PORTS
        </Link>
      </nav>

      <header className="detail__head">
        <div className="detail__id mono-label">
          <span className="detail__id-pill">BUILD #{rom.slug.toUpperCase()}</span>
          <span className="detail__date">RELEASED: {formatDate(rom.created_at)}</span>
        </div>
        <h1 className="detail__title">{rom.title}</h1>
        {(rom.version || rom.android_version || rom.source) && (
          <div className="detail__chips">
            {rom.android_version ? (
              <span className="chip chip--cyan">ANDROID {rom.android_version}</span>
            ) : null}
            {rom.version ? <span className="chip">{rom.version}</span> : null}
            {rom.source ? (
              <span className="chip chip--yellow">BASE: {rom.source}</span>
            ) : null}
            <span className="chip">DEVICE: POCO F5</span>
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
              aria-label="Zoom image preview"
            >
              <img
                src={`/images/${im.object_key}`}
                alt={`${rom.title} screenshot`}
                loading="lazy"
              />
              <span className="gallery__overlay mono-label">ZOOM ↗</span>
            </button>
          ))}
        </section>
      ) : null}

      <div className="detail__grid">
        <div className="detail__main">
          {rom.description ? (
            <section className="block">
              <h2 className="block__title">BUILD OVERVIEW</h2>
              <div className="block__content">
                {rom.description
                  .split(/\r?\n/)
                  .filter((l) => l.trim())
                  .map((p, i) => (
                    <p className="block__body" key={i}>
                      {p}
                    </p>
                  ))}
              </div>
            </section>
          ) : null}

          {rom.changelog ? (
            <section className="block">
              <h2 className="block__title">CHANGELOG / RELEASE NOTES</h2>
              <ul className="changelog">
                {parseSteps(rom.changelog).map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </section>
          ) : null}

          {steps.length ? (
            <section className="block">
              <h2 className="block__title">FLASHING INSTRUCTIONS (STEP BY STEP)</h2>
              <ol className="steps">
                {steps.map((s, i) => (
                  <li key={i}>
                    <span className="steps__num">{String(i + 1).padStart(2, "0")}</span>
                    <span className="steps__text">{s}</span>
                  </li>
                ))}
              </ol>
              <div className="steps__warn-box">
                <span className="mono-label steps__warn">
                  CAUTION: FLASHING CARRIES INHERENT RISKS. ALWAYS BACK UP COMPLETE DATA TO EXTERNAL STORAGE FIRST.
                </span>
              </div>
            </section>
          ) : null}

          <section className="block">
            <div className="block__head">
              <div>
                <h2 className="block__title">FEATURE STATUS DOCUMENTATION</h2>
                <p className="mono-label block__subtitle">
                  TRANSPARENT FEATURE READINESS MATRIX FOR THIS BUILD
                </p>
              </div>
              <div className="legend">
                <StatusBadge status="works" />
                <StatusBadge status="partial" />
                <StatusBadge status="broken" />
              </div>
            </div>
            <FeatureTable features={rom.features} />
          </section>
        </div>

        <aside className="detail__aside">
          <div className="download-card">
            <span className="mono-label download-card__kicker">MIRROR DOWNLOAD</span>
            {rom.download_url ? (
              <a
                className="btn btn--primary btn--block download-card__btn"
                href={rom.download_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                DOWNLOAD ROM ZIP ↓
              </a>
            ) : (
              <div className="empty">DOWNLOAD MIRROR NOT AVAILABLE YET</div>
            )}

            <dl className="info-list">
              <div>
                <dt className="mono-label">VERSION</dt>
                <dd>{rom.version || "N/A"}</dd>
              </div>
              <div>
                <dt className="mono-label">ANDROID</dt>
                <dd>{rom.android_version ? `Android ${rom.android_version}` : "N/A"}</dd>
              </div>
              <div>
                <dt className="mono-label">KERNEL</dt>
                <dd>{rom.kernel || "N/A"}</dd>
              </div>
              <div>
                <dt className="mono-label">SOURCE / BASE</dt>
                <dd>{rom.source || "N/A"}</dd>
              </div>
              <div>
                <dt className="mono-label">LAST UPDATED</dt>
                <dd>{formatDate(rom.updated_at)}</dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>

      {zoom ? (
        <div
          className="lightbox"
          onClick={() => setZoom(null)}
          role="dialog"
          aria-label="Close image preview"
        >
          <img src={zoom} alt="Screenshot preview" />
        </div>
      ) : null}
    </div>
  );
}
