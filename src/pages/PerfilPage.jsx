import { useUserAuth } from "../Context/UserAuthContext";

export default function PerfilPage() {
  const { user, logout } = useUserAuth();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDF7EF]">
        <p className="text-[#5A564E]">No hay usuario logueado.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDF7EF] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-[#1C1C1C] mb-4">
          Hola, {user.name || "cliente"}
        </h1>
        <p className="text-sm text-[#5A564E] mb-1">
          Email: <span className="font-semibold">{user.email}</span>
        </p>
        <p className="text-sm text-[#5A564E] mb-6">
          Rol: <span className="font-semibold">{user.role || "cliente"}</span>
        </p>

        <button
          onClick={logout}
          className="bg-[#F24C00] text-white w-full py-3 rounded-lg font-bold hover:brightness-110"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
