import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiGet } from "../api.js";
import Marquee from "../components/Marquee.jsx";
import RomCard from "../components/RomCard.jsx";
import Loader, { ErrorBox } from "../components/Loader.jsx";
import PocoHologram from "../components/PocoHologram.jsx";

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
        <div className="hero__content">
          <h1 className="hero__title">
            <span className="hero__title-row">XTRA MANAGER</span>
            <span className="hero__title-row">
              <span className="is-outline">SOFTWARE</span> ROM
            </span>
          </h1>

          <p className="hero__subtitle">
            Curated custom ROMs and source builds engineered specifically for <strong>POCO F5 (Marble)</strong>.
            Delivered with verified flash instructions and transparent per-feature status
            documentation before you flash.
          </p>

          <div className="hero__actions">
            <Link to="/roms" className="btn btn--primary">
              EXPLORE ALL ROMS ↓
            </Link>
            <a href="#about" className="btn btn--outline">
              ABOUT PROJECT →
            </a>
          </div>

          <div className="hero__meta">
            <div>
              <span className="mono-label">TARGET DEVICE</span>
              <strong>POCO F5 (MARBLE)</strong>
            </div>
            <div>
              <span className="mono-label">CHIPSET / SOC</span>
              <strong>SD 7+ GEN 2 (4nm)</strong>
            </div>
            <div>
              <span className="mono-label">DOCUMENTATION</span>
              <strong>100% TRANSPARENT</strong>
            </div>
          </div>
        </div>

        <div className="hero__visual">
          <PocoHologram />
        </div>
      </section>

      <Marquee
        items={[
          "POCO F5",
          "MARBLE",
          "CUSTOM ROMS",
          "SERVER BUILDS & PORTS",
          "FLASH SAFE / ALWAYS BACK UP FIRST",
          "TESTED BUILD STATUS DOCUMENTATION",
          `XMS ROM ${new Date().getFullYear()}`,
        ]}
      />

      <section className="section container" id="latest-roms">
        <div className="section__head">
          <div>
            <h2 className="section__title">LATEST ROMS</h2>
            <p className="mono-label section__subtitle">LATEST RELEASES FOR POCO F5</p>
          </div>
          <Link to="/roms" className="section__link mono-label">
            VIEW ALL ROMS →
          </Link>
        </div>

        {error ? (
          <ErrorBox>API OFFLINE: RUN `npm run dev:cf` FOR FULL STACK</ErrorBox>
        ) : null}
        {!error && !data ? <Loader label="LOADING ROM CATALOG..." /> : null}
        {data && roms.length === 0 ? (
          <div className="empty">NO ROMS PUBLISHED YET / CHECK BACK SOON</div>
        ) : null}

        <div className="grid grid--2">
          {roms.slice(0, 4).map((r, i) => (
            <RomCard key={r.id} rom={r} index={i} />
          ))}
        </div>
      </section>

      <section className="section container" id="about">
        <div className="about">
          <div className="about__head">
            <span className="mono-label about__tag">ABOUT PROJECT</span>
            <h2 className="section__title">ABOUT XMS ROM</h2>
          </div>
          <div className="about__cols">
            <p className="about__text">
              <strong>Xtra Manager Software ROM</strong> is the dedicated distribution hub for
              custom ROMs, server builds, and ports engineered specifically for the <strong>POCO F5 (Marble)</strong>.
              Every release is accompanied by clean flashing guides and honest status documentation
              for every hardware feature, so you know exactly what works before you flash.
            </p>
            <dl className="specs">
              <div>
                <dt className="mono-label">DEVICE CODENAME</dt>
                <dd>MARBLE (POCO F5 / REDMI NOTE 12 TURBO)</dd>
              </div>
              <div>
                <dt className="mono-label">MAINTAINER</dt>
                <dd>XTRA MANAGER SOFTWARE</dd>
              </div>
              <div>
                <dt className="mono-label">DISTRIBUTION</dt>
                <dd>FAST MIRRORS & DIRECT DOWNLOAD</dd>
              </div>
              <div>
                <dt className="mono-label">GOLDEN RULE</dt>
                <dd className="specs__highlight">ALWAYS BACK UP DATA BEFORE FLASHING</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>
    </div>
  );
}
