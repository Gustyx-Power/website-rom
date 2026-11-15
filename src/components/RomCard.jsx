import { Link } from "react-router-dom";
import { formatDate } from "../utils/format.js";
import { firstLine } from "../utils/text.js";

export default function RomCard({ rom, index = 0 }) {
  return (
    <Link to={`/rom/${rom.slug}`} className="card" aria-label={`ROM Details for ${rom.title}`}>
      <div className="card__top">
        <span className="card__index mono-label">
          BUILD #{String(index + 1).padStart(2, "0")}
        </span>
        <span className="card__dl-pill mono-label">
          ⬇ {rom.downloads || 0}
        </span>
        <span className="card__date mono-label">{formatDate(rom.created_at)}</span>
      </div>

      <div className="card__main">
        <h3 className="card__title">{rom.title}</h3>
        {(rom.version || rom.android_version || rom.source || rom.maintainer) && (
          <div className="card__chips">
            {rom.maintainer ? (
              <span className="chip chip--dev">DEV: {rom.maintainer}</span>
            ) : null}
            {rom.android_version ? (
              <span className="chip chip--cyan">A{rom.android_version}</span>
            ) : null}
            {rom.version ? <span className="chip">{rom.version}</span> : null}
            {rom.source ? (
              <span className="chip chip--yellow">SRC: {rom.source}</span>
            ) : null}
          </div>
        )}
        {rom.description ? (
          <p className="card__desc">{firstLine(rom.description)}</p>
        ) : null}
      </div>

      <div className="card__bottom">
        <span className="card__cta">
          VIEW ROM <span className="card__arrow">→</span>
        </span>
      </div>
    </Link>
  );
}
