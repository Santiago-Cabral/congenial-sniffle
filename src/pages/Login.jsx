import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Lock, Mail, ArrowLeft } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [mode, setMode] = useState("api"); // "api" o "bypass"
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setErr("");

    if (mode === "bypass") {
      // Login temporal sin verificar BD
      if (password === "admin123") {
        const userData = { email, role: "admin", name: "Admin Temporal" };
        localStorage.setItem("admin_token", btoa(`temp:${Date.now()}`));
        localStorage.setItem("admin_user", JSON.stringify(userData));
        localStorage.setItem("user_jovita", JSON.stringify(userData));
        navigate("/admin");
      } else {
        setErr("Contraseña incorrecta. Usa: admin123");
      }
      return;
    }

    // Login normal con API
    try {
      const { login } = await import("../admin/services/apiService");
      const result = await login(email, password);
      
      localStorage.setItem("user_jovita", JSON.stringify({
        email: result.user.email || email,
        role: "admin",
        name: result.user.name || "Administrador"
      }));
      
      navigate("/admin", { replace: true });
    } catch (e) {
      setErr(e.message || "Error al iniciar sesión");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDF7EF] px-4">
      <div className="w-full max-w-md">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-[#5A564E] hover:text-[#F24C00] mb-6 transition"
        >
          <ArrowLeft size={20} />
          <span>Volver al inicio</span>
        </Link>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-[#FFE8D8] rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock size={40} color="#F24C00" />
            </div>
            <h2 className="text-3xl font-extrabold text-[#1C1C1C] mb-2">
              Panel de Administración
            </h2>
            
            {/* Toggle mode */}
            <div className="mt-4 flex gap-2 justify-center">
              <button
                type="button"
                onClick={() => setMode("api")}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                  mode === "api"
                    ? "bg-[#F24C00] text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                Con BD
              </button>
              <button
                type="button"
                onClick={() => setMode("bypass")}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                  mode === "bypass"
                    ? "bg-[#F24C00] text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                Modo Dev
              </button>
            </div>
          </div>

          {err && (
            <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm">
              <strong>Error:</strong> {err}
            </div>
          )}

          <form onSubmit={submit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-[#1C1C1C] mb-2">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail 
                  size={20} 
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5A564E]" 
                />
                <input
                  type="email"
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#F24C00] focus:ring-4 focus:ring-[#F24C00]/10 transition outline-none"
                  placeholder={mode === "bypass" ? "cualquier@email.com" : "tu-email@ejemplo.com"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1C1C1C] mb-2">
                Contraseña
              </label>
              <div className="relative">
                <Lock 
                  size={20} 
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5A564E]" 
                />
                <input
                  type="password"
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#F24C00] focus:ring-4 focus:ring-[#F24C00]/10 transition outline-none"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 rounded-xl font-bold text-white bg-[#F24C00] hover:brightness-110 transition shadow-lg"
            >
              Ingresar al Panel
            </button>
          </form>
        </div>

        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800">
          <p className="font-semibold mb-2">
            {mode === "api" ? "🔐 Login con BD" : "⚠️ Modo Desarrollo"}
          </p>
          {mode === "api" ? (
            <p>Usa un email registrado en tu base de datos</p>
          ) : (
            <p>Contraseña temporal: <strong>admin123</strong></p>
          )}
        </div>
      </div>
    </div>
  );
}