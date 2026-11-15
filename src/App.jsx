import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import Home from "./pages/Home.jsx";
import Roms from "./pages/Roms.jsx";
import RomDetail from "./pages/RomDetail.jsx";
import NotFound from "./pages/NotFound.jsx";
import AdminLayout from "./pages/admin/AdminLayout.jsx";
import Dashboard from "./pages/admin/Dashboard.jsx";
import RomForm from "./pages/admin/RomForm.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Publik */}
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/roms" element={<Roms />} />
          <Route path="/rom/:slug" element={<RomDetail />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* Admin */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="roms/new" element={<RomForm key="new" mode="create" />} />
          <Route
            path="roms/:slug/edit"
            element={<RomForm key="edit" mode="edit" />}
          />
          <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
