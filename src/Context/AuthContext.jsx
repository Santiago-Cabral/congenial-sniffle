import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Verificar si hay usuario en localStorage al cargar
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("user_jovita");
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
      }
    } catch (error) {
      console.error("Error al cargar usuario:", error);
      localStorage.removeItem("user_jovita");
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      // Login simulado - Reemplazar con API real
      if (email === "admin@jovita.com" && password === "admin123") {
        const userData = { 
          email, 
          role: "admin",
          name: "Administrador",
          loginTime: new Date().toISOString()
        };
        
        setUser(userData);
        localStorage.setItem("user_jovita", JSON.stringify(userData));
        
        // Navegar al dashboard
        navigate("/admin");
        return { success: true };
      } else {
        throw new Error("Credenciales incorrectas");
      }
    } catch (error) {
      alert(error.message);
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user_jovita");
    navigate("/");
    console.log("Sesión cerrada");
  };

  const updateUser = (userData) => {
    const updatedUser = { ...user, ...userData };
    setUser(updatedUser);
    localStorage.setItem("user_jovita", JSON.stringify(updatedUser));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDF7EF]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#F24C00] border-t-transparent mb-4"></div>
          <p className="text-[#5A564E]">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}