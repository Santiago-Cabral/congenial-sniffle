import { useState } from "react";
import { useAuth } from "../Context/AuthContext.jsx";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    login(email, password);
  };

  return (
    <div className="h-screen flex justify-center items-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-6 shadow-md rounded-md w-80">
        <h2 className="text-xl font-semibold mb-4 text-center">Admin Login</h2>

        <input 
          type="email" placeholder="Email"
          className="border p-2 mb-3 w-full"
          value={email} onChange={(e) => setEmail(e.target.value)}
        />

        <input 
          type="password" placeholder="Contraseña"
          className="border p-2 mb-3 w-full"
          value={password} onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit" className="bg-blue-600 text-white w-full py-2 rounded-md">
          Ingresar
        </button>
      </form>
    </div>
  );
}
