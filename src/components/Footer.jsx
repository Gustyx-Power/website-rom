import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__brand-block">
          <div className="footer__brand-head">
            <img
              src="/xms-logo.png"
              alt="XMS Logo"
              className="footer__logo"
              width="56"
              height="56"
            />
            <p className="footer__big">XMS ROM</p>
          </div>
          <p className="mono-label footer__community">
            BY XTRA MANAGER SOFTWARE COMMUNITY
          </p>
        </div>
        <div className="footer__row">
          <nav className="footer__links">
            <Link to="/">HOME</Link>
            <Link to="/roms">ALL ROMS</Link>
            <Link to="/admin">ADMIN</Link>
          </nav>
          <p className="footer__note mono-label">
            © {new Date().getFullYear()} XTRA MANAGER SOFTWARE COMMUNITY / UNOFFICIAL POCO
            F5 BUILDS / NOT AFFILIATED WITH XIAOMI OR POCO
          </p>
        </div>
      </div>
    </footer>
  );
}
