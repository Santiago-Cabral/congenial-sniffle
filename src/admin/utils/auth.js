// /admin/utils/auth.js

// Validar si el usuario está autenticado y es administrador
export function isAuthenticated() {
  const token = localStorage.getItem("admin_token");
  const user = getAdminUser();

  if (!token || !user) return false;

  const role = user.role?.toLowerCase?.() || "";

  // Acepta: admin, administrador, administrador/a
  const isAdmin =
    role.includes("admin") ||
    role.includes("administrador") ||
    role.includes("administrador/a");

  return isAdmin;
}

// Obtener datos del usuario admin almacenado
export function getAdminUser() {
  try {
    return JSON.parse(localStorage.getItem("admin_user"));
  } catch {
    return null;
  }
}

// Cerrar sesión correctamente
export function logout() {
  localStorage.removeItem("admin_token");
  localStorage.removeItem("admin_user");
}
