import React, { createContext, useContext, useState, useEffect } from "react";

const AdminContext = createContext();

export function AdminProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("admin_token") || null);

  useEffect(() => {
    if (token) localStorage.setItem("admin_token", token);
    else localStorage.removeItem("admin_token");
  }, [token]);

  const login = async (creds) => {
    // Implementa login si tu API tiene auth (POST /admin/login)
    // temporal:
    setUser({ name: "Administrador", email: "admin@jovita.com" });
    setToken("demo-token");
  };

  const logout = () => {
    setUser(null);
    setToken(null);
  };

  return (
    <AdminContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AdminContext.Provider>
  );
}

export const useAdmin = () => useContext(AdminContext);
