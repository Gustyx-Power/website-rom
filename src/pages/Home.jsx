import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiGet } from "../api.js";
import Marquee from "../components/Marquee.jsx";
import RomCard from "../components/RomCard.jsx";
import Loader, { ErrorBox } from "../components/Loader.jsx";

export default function Home() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

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

  return (
    <div className="page page--flush">
      <section className="hero container">
        <p className="mono-label hero__kicker">
          CUSTOM ROM DISTRIBUTION — {new Date().getFullYear()}
        </p>
        <h1 className="hero__title">
          <span>XTRA</span>
          <span>MANAGER</span>
          <span className="is-outline">SOFTWARE</span>
          <span>PORT</span>
        </h1>
        <div className="hero__meta">
          <div>
            <span className="mono-label">DEVICE</span>
            <strong>POCO F5 — MARBLE</strong>
          </div>
          <div>
            <span className="mono-label">FOCUS</span>
            <strong>REBASED / PORTED ROMS</strong>
          </div>
          <div>
            <span className="mono-label">DOC</span>
            <strong>WORKS · PARTIAL · BROKEN</strong>
          </div>
        </div>
      </section>

      <Marquee
        items={[
          "POCO F5",
          "MARBLE",
          "CUSTOM ROM PORTS",
          "FLASH SAFE — FOLLOW THE INSTRUCTIONS",
          "STATUS DOCUMENTED PER BUILD",
          `XMS ${new Date().getFullYear()}`,
        ]}
      />

      <section className="section container">
        <div className="section__head">
          <h2 className="section__title">LATEST PORTS</h2>
          <Link to="/roms" className="section__link mono-label">
            VIEW ALL →
          </Link>
        </div>
        {error ? (
          <ErrorBox>API OFFLINE — JALANKAN `npm run dev:cf` UNTUK FULL STACK</ErrorBox>
        ) : null}
        {!error && !data ? <Loader /> : null}
        {data && roms.length === 0 ? (
          <div className="empty">NO ROMS PUBLISHED YET — CHECK BACK SOON</div>
        ) : null}
        <div className="grid grid--2">
          {roms.slice(0, 4).map((r, i) => (
            <RomCard key={r.id} rom={r} index={i} />
          ))}
        </div>
      </section>

      <section className="section container">
        <div className="about">
          <h2 className="section__title">ABOUT XMS PORT</h2>
          <div className="about__cols">
            <p>
              Xtra Manager Software Port adalah rumah untuk custom ROM ports yang
              dibangun dan dirawat khusus untuk POCO F5. Setiap rilis selalu
              disertai instruksi flash dan dokumentasi status yang jujur per
              fitur — jadi kamu tahu persis apa yang jalan dan apa yang belum,
              sebelum kamu flash.
            </p>
            <dl className="specs">
              <div>
                <dt className="mono-label">DEVICE</dt>
                <dd>POCO F5 (MARBLE)</dd>
              </div>
              <div>
                <dt className="mono-label">MAINTAINER</dt>
                <dd>XTRA MANAGER SOFTWARE</dd>
              </div>
              <div>
                <dt className="mono-label">DISTRIBUTION</dt>
                <dd>ROM ZIP VIA EXTERNAL MIRROR</dd>
              </div>
              <div>
                <dt className="mono-label">RULE 01</dt>
                <dd>ALWAYS BACK UP BEFORE FLASHING</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>
    </div>
  );
}
