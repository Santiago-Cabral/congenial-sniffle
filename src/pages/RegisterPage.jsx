import { useState } from "react";
import { useUserAuth } from "../Context/UserAuthContext";
import { useNavigate } from "react-router-dom";

export default function RegisterPage() {
  const { register, loading } = useUserAuth();
  const navigate = useNavigate();

  const [data, setData] = useState({
    name: "",
    email: "",
    password: ""
  });

  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setOk("");

    try {
      await register(data);
      setOk("Registrado con éxito, ahora puedes iniciar sesión");
      setTimeout(() => navigate("/login"), 1500);
    } catch (error) {
      setErr(error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDF7EF] px-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center">Crear cuenta</h1>

        {err && <p className="text-red-600 text-sm mb-3">{err}</p>}
        {ok && <p className="text-green-600 text-sm mb-3">{ok}</p>}

        <form onSubmit={submit} className="space-y-4">
          <input
            className="border w-full px-4 py-2 rounded-lg"
            placeholder="Nombre completo"
            value={data.name}
            onChange={(e) => setData({ ...data, name: e.target.value })}
          />

          <input
            className="border w-full px-4 py-2 rounded-lg"
            placeholder="Email"
            value={data.email}
            onChange={(e) => setData({ ...data, email: e.target.value })}
          />

          <input
            type="password"
            className="border w-full px-4 py-2 rounded-lg"
            placeholder="Contraseña"
            value={data.password}
            onChange={(e) => setData({ ...data, password: e.target.value })}
          />

          <button
            className="bg-[#F24C00] text-white w-full py-3 rounded-lg font-bold hover:brightness-110"
            disabled={loading}
          >
            {loading ? "Registrando..." : "Registrarme"}
          </button>
        </form>
      </div>
    </div>
  );
}
