import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Lock, Mail, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { login as loginService } from "../admin/services/apiService";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setErr("");

    try {
      const data = await loginService(email, password);

      const token = data.Token || data.token;
      const rawRole = data.Role || data.role || "";
      const fullName = data.FullName || data.fullName || "";
      const userId = data.UserId || data.userId;

      if (!token) {
        throw new Error("No se recibió un token válido del servidor.");
      }

      const user = {
        token,
        role: rawRole.toLowerCase(),
        name: fullName,
        email: data.Email || data.email || email,
        id: userId
      };

      localStorage.setItem("admin_token", token);
      localStorage.setItem("admin_user", JSON.stringify(user));

      navigate("/admin", { replace: true });
    } catch (error) {
      console.error("Login error:", error);
      setErr(error.message || "Error al iniciar sesión");
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
          Volver al inicio
        </Link>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-[#FFE8D8] rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock size={40} color="#F24C00" />
            </div>
            <h2 className="text-3xl font-bold text-[#1C1C1C]">Admin Panel</h2>
            <p className="text-[#5A564E] mt-2">
              Inicia sesión con tus credenciales
            </p>
          </div>

          {err && (
            <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm">
              <strong>Error:</strong> {err}
            </div>
          )}

          <form onSubmit={submit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block mb-2 font-semibold text-[#1C1C1C]"
              >
                Correo electrónico
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5A564E]"
                  size={20}
                />
                <input
                  id="email"
                  type="email"
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-100 rounded-xl focus:border-[#F24C00] outline-none transition"
                  placeholder="usuario@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block mb-2 font-semibold text-[#1C1C1C]"
              >
                Contraseña
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5A564E]"
                  size={20}
                />

                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="w-full pl-12 pr-12 py-3 border-2 border-gray-100 rounded-xl focus:border-[#F24C00] outline-none transition"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#5A564E] hover:text-[#F24C00] transition"
                  aria-label="Mostrar contraseña"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-[#F24C00] text-white rounded-xl font-bold hover:brightness-110 shadow-lg shadow-[#F24C00]/20 transition-all active:scale-[0.98]"
            >
              Ingresar al Panel
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}