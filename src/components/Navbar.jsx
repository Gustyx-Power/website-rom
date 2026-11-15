import { useState } from "react";
import { Link, NavLink } from "react-router-dom";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <header className="nav">
      <div className="nav__inner">
        <Link to="/" className="nav__brand" onClick={close} aria-label="XMS ROM Home">
          <span className="nav__mark">XMS</span>
          <span className="nav__wordmark">
            XTRA MANAGER
            <br />
            SOFTWARE ROM
          </span>
        </Link>

        <button
          type="button"
          className={`nav__burger${open ? " is-open" : ""}`}
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Close menu" : "Open navigation menu"}
          aria-expanded={open}
        >
          <span />
          <span />
          <span />
        </button>

        {open && <div className="nav__backdrop" onClick={close} aria-hidden="true" />}

        <nav className={`nav__links${open ? " is-open" : ""}`}>
          <NavLink
            to="/"
            end
            onClick={close}
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            HOME
          </NavLink>
          <NavLink
            to="/roms"
            onClick={close}
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            ALL ROMS
          </NavLink>
          <div className="nav__device">
            <span className="mono-label">TARGET DEVICE</span>
            <strong className="nav__device-name">
              <span className="nav__device-dot" /> POCO F5 (MARBLE)
            </strong>
          </div>
        </nav>
      </div>
    </header>
  );
}
