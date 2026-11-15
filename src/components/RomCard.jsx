import { Link } from "react-router-dom";
import { formatDate } from "../utils/format.js";
import { firstLine } from "../utils/text.js";

export default function RomCard({ rom, index = 0 }) {
  return (
    <Link to={`/rom/${rom.slug}`} className="card">
      <div className="card__top">
        <span className="mono-label">#{String(index + 1).padStart(2, "0")}</span>
        <span className="mono-label">{formatDate(rom.created_at)}</span>
      </div>
      <h3 className="card__title">{rom.title}</h3>
      {(rom.version || rom.android_version) && (
        <div className="card__chips">
          {rom.version ? <span className="chip">{rom.version}</span> : null}
          {rom.android_version ? (
            <span className="chip">ANDROID {rom.android_version}</span>
          ) : null}
        </div>
      )}
      {rom.description ? <p className="card__desc">{firstLine(rom.description)}</p> : null}
      <div className="card__bottom">
        <span className="mono-label">OPEN PORT</span>
        <span className="card__arrow">→</span>
      </div>
    </Link>
  );
}
