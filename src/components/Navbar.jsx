import { useState } from "react";
import { Link, NavLink } from "react-router-dom";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <header className="nav">
      <div className="nav__inner">
        <Link to="/" className="nav__brand" onClick={close}>
          <span className="nav__mark">XMS</span>
          <span className="nav__wordmark">
            XTRA MANAGER
            <br />
            SOFTWARE PORT
          </span>
        </Link>
        <button
          type="button"
          className={`nav__burger${open ? " is-open" : ""}`}
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          <span />
          <span />
          <span />
        </button>
        <nav className={`nav__links${open ? " is-open" : ""}`}>
          <NavLink to="/" end onClick={close}>
            HOME
          </NavLink>
          <NavLink to="/roms" onClick={close}>
            ROMS
          </NavLink>
          <div className="nav__device">
            <span className="mono-label">DEVICE</span>
            <strong>POCO F5</strong>
          </div>
        </nav>
      </div>
    </header>
  );
}
