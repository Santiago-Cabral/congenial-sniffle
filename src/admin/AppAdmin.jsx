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

import ProtectedRoute from "../Components/ProtectedRoute.jsx";
import RoleRoute, { ROLE_ADMIN, ROLE_EMPLEADO } from "../Components/RoleRoute.jsx";

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
                {/* Dashboard y Órdenes: admin + empleado (cajero) */}
                <Route
                  path="/"
                  element={
                    <RoleRoute allowedRoles={[ROLE_ADMIN, ROLE_EMPLEADO]}>
                      <Dashboard />
                    </RoleRoute>
                  }
                />
                <Route
                  path="ordenes"
                  element={
                    <RoleRoute allowedRoles={[ROLE_ADMIN, ROLE_EMPLEADO]}>
                      <Orders />
                    </RoleRoute>
                  }
                />

                {/* Resto: solo admin */}
                <Route
                  path="productos"
                  element={
                    <RoleRoute allowedRoles={[ROLE_ADMIN]}>
                      <Products />
                    </RoleRoute>
                  }
                />
                <Route
                  path="clientes"
                  element={
                    <RoleRoute allowedRoles={[ROLE_ADMIN]}>
                      <Clients />
                    </RoleRoute>
                  }
                />
                <Route
                  path="sucursales"
                  element={
                    <RoleRoute allowedRoles={[ROLE_ADMIN]}>
                      <Branches />
                    </RoleRoute>
                  }
                />
                <Route
                  path="categorias"
                  element={
                    <RoleRoute allowedRoles={[ROLE_ADMIN]}>
                      <Categories />
                    </RoleRoute>
                  }
                />
                <Route
                  path="configuracion"
                  element={
                    <RoleRoute allowedRoles={[ROLE_ADMIN]}>
                      <SettingPage />
                    </RoleRoute>
                  }
                />
              </Routes>
            </AdminLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}