// /admin/components/ProtectedAdminRoute.jsx

import { Navigate } from "react-router-dom";
import { isAuthenticated } from "../admin/utils/auth.js";

export default function ProtectedAdminRoute({ children }) {
  return isAuthenticated()
    ? children
    : <Navigate to="/admin/login" replace />;
}
