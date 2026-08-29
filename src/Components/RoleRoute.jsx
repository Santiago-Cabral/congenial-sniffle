import { Navigate } from "react-router-dom";

const ROLE_ADMIN = "administrador/a";
const ROLE_EMPLEADO = "empleado";

function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem("admin_user") || "{}");
  } catch {
    return {};
  }
}

export default function RoleRoute({ allowedRoles, children }) {
  const user = getCurrentUser();
  const role = (user.role || "").toLowerCase();

  if (!allowedRoles.includes(role)) {
    return <Navigate to="/admin" replace />;
  }

  return children;
}

export { ROLE_ADMIN, ROLE_EMPLEADO };