// /admin/pages/Login.jsx

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Lock, Mail, ArrowLeft } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setErr("");

    try {
      const { login } = await import("../admin/services/apiService");
      const data = await login(email, password);

      // Normalizar rol
      const normalizedRole = data.role?.toLowerCase() || "";

      const user = {
        ...data,
        role: normalizedRole,
      };

      localStorage.setItem("admin_token", data.token);
      localStorage.setItem("admin_user", JSON.stringify(user));

      navigate("/admin", { replace: true });
    } catch (error) {
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
            <p className="text-[#5A564E] mt-2">Inicia sesión</p>
          </div>

          {err && (
            <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm">
              <strong>Error:</strong> {err}
            </div>
          )}

          <form onSubmit={submit} className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block mb-2 font-semibold">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5A564E]" />
                <input
                  id="email"
                  type="email"
                  className="w-full pl-12 pr-4 py-3 border-2 rounded-xl"
                  placeholder="tu-email@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block mb-2 font-semibold">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5A564E]" />
                <input
                  id="password"
                  type="password"
                  className="w-full pl-12 pr-4 py-3 border-2 rounded-xl"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-[#F24C00] text-white rounded-xl font-bold hover:brightness-110"
            >
              Ingresar al Panel
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
