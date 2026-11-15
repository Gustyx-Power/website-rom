import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <p className="footer__big">XMS PORT</p>
        <div className="footer__row">
          <nav className="footer__links">
            <Link to="/">HOME</Link>
            <Link to="/roms">ALL ROMS</Link>
            <Link to="/admin">ADMIN</Link>
          </nav>
          <p className="footer__note mono-label">
            © {new Date().getFullYear()} XTRA MANAGER SOFTWARE / UNOFFICIAL POCO
            F5 PORTS / NOT AFFILIATED WITH XIAOMI OR POCO
          </p>
        </div>
      </div>
    </footer>
  );
}
