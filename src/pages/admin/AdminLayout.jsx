import { useEffect, useState } from "react";
import { Link, NavLink, Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { apiGet, apiSend } from "../../api.js";
import Loader from "../../components/Loader.jsx";
import Login from "./Login.jsx";

export default function AdminLayout() {
  const [authed, setAuthed] = useState(null); // null = sedang cek
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    let live = true;
    apiGet("/api/me")
      .then(() => live && setAuthed(true))
      .catch(() => live && setAuthed(false));
    return () => {
      live = false;
    };
  }, [location.pathname]);

  async function logout() {
    try {
      await apiSend("POST", "/api/logout");
    } catch {
      // cookie tetap dihapus di server-side Expired; lanjut redirect.
    }
    setAuthed(false);
    navigate("/admin");
  }

  if (authed === null) {
    return (
      <div className="page container">
        <Loader />
      </div>
    );
  }

  const atRoot = location.pathname === "/admin" || location.pathname === "/admin/";

  if (!authed) return <Login onAuth={() => setAuthed(true)} />;
  if (atRoot) return <Navigate to="/admin/dashboard" replace />;

  return (
    <div className="admin">
      <header className="admin__bar">
        <div className="admin__bar-inner">
          <Link to="/admin/dashboard" className="admin__brand mono-label">
            XMS // CONTROL ROOM
          </Link>
          <nav className="admin__nav">
            <NavLink to="/admin/dashboard">DASHBOARD</NavLink>
            <NavLink to="/admin/roms/new">+ NEW ROM</NavLink>
            <Link to="/">VIEW SITE</Link>
            <button type="button" className="admin__logout" onClick={logout}>
              LOG OUT
            </button>
          </nav>
        </div>
      </header>
      <main className="admin__main container">
        <Outlet />
      </main>
    </div>
  );
}
