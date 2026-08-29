// src/Components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const adminUser = JSON.parse(localStorage.getItem("admin_user"));

  // Si no hay usuario logueado, redirige al login del admin
  if (!adminUser || !adminUser.token) {
    return <Navigate to="/admin/login" replace />;
  }

  // Ya no filtra por rol acá — cualquier usuario autenticado (admin o empleado)
  // entra al panel. RoleRoute se encarga de qué secciones puede ver cada uno,
  // y el backend (Authorize por Roles) de qué endpoints puede tocar.
  return children;
}