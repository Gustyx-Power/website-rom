import { useEffect, useMemo, useState } from "react";
import { apiGet } from "../api.js";
import RomCard from "../components/RomCard.jsx";
import Loader, { ErrorBox } from "../components/Loader.jsx";

const SORTS = { newest: "NEWEST", oldest: "OLDEST", title: "ALPHABETICAL (A-Z)" };

export default function Roms() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [q, setQ] = useState("");
  const [android, setAndroid] = useState("all");
  const [sort, setSort] = useState("newest");

  useEffect(() => {
    let live = true;
    apiGet("/api/roms")
      .then((d) => live && setData(d))
      .catch((e) => live && setError(e));
    return () => {
      live = false;
    };
  }, []);

  const roms = data?.roms || [];

  const androids = useMemo(
    () =>
      Array.from(
        new Set(roms.map((r) => r.android_version).filter(Boolean))
      ).sort(),
    [roms]
  );

  const filtered = useMemo(() => {
    let list = roms.filter((r) => {
      const hay = `${r.title} ${r.version} ${r.source} ${r.description}`.toLowerCase();
      const matchQ = !q.trim() || hay.includes(q.toLowerCase());
      const matchA = android === "all" || r.android_version === android;
      return matchQ && matchA;
    });
    if (sort === "oldest") list = [...list].reverse();
    if (sort === "title") list = [...list].sort((a, b) => a.title.localeCompare(b.title));
    return list;
  }, [roms, q, android, sort]);

  const hasFilter = q.trim() !== "" || android !== "all" || sort !== "newest";
  const resetFilters = () => {
    setQ("");
    setAndroid("all");
    setSort("newest");
  };

  return (
    <div className="page container">
      <header className="page__head">
        <div>
          <h1 className="page__title">ALL PORTS</h1>
          <p className="mono-label page__subtitle">
            COMPLETE CUSTOM ROM CATALOG FOR POCO F5
          </p>
        </div>
        <div className="page__count-badge mono-label">
          {data ? `${filtered.length} OF ${roms.length} BUILDS` : "LOADING..."}
        </div>
      </header>

      <div className="filters">
        <div className="filters__search">
          <input
            className="input"
            placeholder="SEARCH TITLE, BASE, VERSION..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Search ROMs"
          />
        </div>
        <select
          className="select"
          value={android}
          onChange={(e) => setAndroid(e.target.value)}
          aria-label="Filter Android version"
        >
          <option value="all">ALL ANDROID VERSIONS</option>
          {androids.map((v) => (
            <option key={v} value={v}>
              ANDROID {v}
            </option>
          ))}
        </select>
        <select
          className="select"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          aria-label="Sort"
        >
          {Object.entries(SORTS).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
        {hasFilter && (
          <button
            type="button"
            className="btn btn--sm btn--outline filters__reset"
            onClick={resetFilters}
            aria-label="Reset all filters"
          >
            RESET ✕
          </button>
        )}
      </div>

      {error ? (
        <ErrorBox>API OFFLINE: RUN `npm run dev:cf` FOR FULL STACK</ErrorBox>
      ) : null}
      {!error && !data ? <Loader label="LOADING PORT CATALOG..." /> : null}
      {data && filtered.length === 0 ? (
        <div className="empty">
          NO PORTS MATCH YOUR SEARCH OR FILTER CRITERIA
        </div>
      ) : null}

      <div className="grid grid--2">
        {filtered.map((r, i) => (
          <RomCard key={r.id} rom={r} index={i} />
        ))}
      </div>
    </div>
  );
}
