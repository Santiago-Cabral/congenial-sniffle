import { useState } from "react";
import { useUserAuth } from "../Context/UserAuthContext";
import { useNavigate } from "react-router-dom";

export default function UserLoginPage() {
  const { login, loading } = useUserAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setErr("");

    try {
      await login(email, password);
      navigate("/perfil");
    } catch (error) {
      setErr(error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDF7EF] px-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center">Ingresar</h1>

        {err && <p className="text-red-600 text-sm mb-3">{err}</p>}

        <form onSubmit={submit} className="space-y-4">
          <input
            className="border w-full px-4 py-2 rounded-lg"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            className="border w-full px-4 py-2 rounded-lg"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            className="bg-[#F24C00] text-white w-full py-3 rounded-lg font-bold hover:brightness-110"
            disabled={loading}
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>
      </div>
    </div>
  );
}
