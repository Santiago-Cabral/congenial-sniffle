import { createContext, useContext, useState, useEffect } from "react";
import { userLoginRequest, userRegisterRequest } from "../admin/services/userApi";

const UserAuthContext = createContext(null);

export function useUserAuth() {
  const ctx = useContext(UserAuthContext);
  if (!ctx) throw new Error("useUserAuth debe usarse dentro de UserAuthProvider");
  return ctx;
}

export function UserAuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("jovita_client_user");
    return saved ? JSON.parse(saved) : null;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem("jovita_client_token") || null;
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) localStorage.setItem("jovita_client_user", JSON.stringify(user));
    if (token) localStorage.setItem("jovita_client_token", token);
  }, [user, token]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await userLoginRequest(email, password);

      setUser(res.user);
      setToken(res.token);

      return res.user;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data) => {
    setLoading(true);
    try {
      return await userRegisterRequest(data);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("jovita_client_user");
    localStorage.removeItem("jovita_client_token");
  };

  return (
    <UserAuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout
      }}
    >
      {children}
    </UserAuthContext.Provider>
  );
}
