// src/Components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  // ✅ Cambiar de "user" a "admin_user"
  const adminUser = JSON.parse(localStorage.getItem("admin_user"));

  console.log("🔍 Usuario admin en localStorage:", adminUser);

  // Si no hay usuario, redirige al login del admin
  if (!adminUser) {
    console.log("❌ No hay usuario admin, redirigiendo a /admin/login");
    return <Navigate to="/admin/login" replace />;
  }

  // Verifica el rol
  const role = adminUser.role?.toLowerCase?.() || "";
  console.log("🔍 Rol del usuario:", role);

  const isAdmin =
    role.includes("admin") ||
    role.includes("administrador") ||
    role.includes("administrador/a");

  // Si no es admin, redirige al login
  if (!isAdmin) {
    console.log("❌ Usuario no es admin, redirigiendo a /admin/login");
    return <Navigate to="/admin/login" replace />;
  }

  console.log("✅ Usuario autenticado y es admin");
  return children;
}