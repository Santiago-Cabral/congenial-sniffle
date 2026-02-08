// src/Components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const user = JSON.parse(localStorage.getItem("user"));

  // Si no hay usuario, redirige al login del admin
  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  // Verifica el rol
  const role = user.role?.toLowerCase?.() || "";
  const isAdmin =
    role.includes("admin") ||
    role.includes("administrador") ||
    role.includes("administrador/a");

  // Si no es admin, redirige al login
  if (!isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  // Si todo está bien, muestra el contenido
  return children;
}