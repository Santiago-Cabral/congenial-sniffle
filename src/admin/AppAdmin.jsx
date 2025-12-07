// /admin/AppAdmin.jsx

import { Routes, Route } from "react-router-dom";

import Login from "../pages/Login.jsx";
import AdminLayout from "./layout/AdminLayout";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Orders from "./pages/Orders";
import Clients from "./pages/Clients";
import Branches from "./pages/Branches";
import Categories from "./pages/Categories";
import SettingPage from "./pages/SettingPage";

import ProtectedRoute from "../Components/ProtectedRoute.jsx";  // ✅ RUTA CORRECTA

export default function AppAdmin() {
  return (
    <Routes>
      {/* Login admin */}
      <Route path="login" element={<Login />} />

      {/* RUTAS PROTEGIDAS */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="productos" element={<Products />} />
                <Route path="ordenes" element={<Orders />} />
                <Route path="clientes" element={<Clients />} />
                <Route path="sucursales" element={<Branches />} />
                <Route path="categorias" element={<Categories />} />
                <Route path="configuracion" element={<SettingPage />} />
              </Routes>
            </AdminLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
