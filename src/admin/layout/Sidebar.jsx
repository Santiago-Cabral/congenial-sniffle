import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Settings, 
  LogOut, 
  Building2
} from "lucide-react";

const menuItems = [
  { path: "/admin", icon: LayoutDashboard, label: "Dashboard", exact: true },
  { path: "/admin/productos", icon: Package, label: "Productos" },
  { path: "/admin/ordenes", icon: ShoppingCart, label: "Órdenes" },
  { path: "/admin/clientes", icon: Users, label: "Clientes" },
  { path: "/admin/sucursales", icon: Building2, label: "Sucursales" },
  { path: "/admin/configuracion", icon: Settings, label: "Configuración" }
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path, exact) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    if (window.confirm("¿Estás seguro de cerrar sesión?")) {
      localStorage.removeItem("admin_token");
      localStorage.removeItem("admin_user");
      localStorage.removeItem("user_jovita");
      navigate("/");
    }
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 flex flex-col z-40">
      {/* Logo */}
      <div className="h-20 flex items-center gap-3 px-6 border-b border-gray-200">
        <img src="/logo-jovita.png" alt="Jovita" className="w-10 h-10 rounded-full" />
        <div>
          <h2 className="font-bold text-lg text-[#1C1C1C]">Jovita Admin</h2>
          <p className="text-xs text-[#5A564E]">Panel de Control</p>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 py-6 px-4 overflow-y-auto">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path, item.exact);

            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    active
                      ? "bg-[#F24C00] text-white shadow-lg"
                      : "text-[#5A564E] hover:bg-gray-100"
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-semibold">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-gray-200">
        <div className="bg-red-50 rounded-xl p-4 mb-3">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-red-200 flex items-center justify-center">
              <span className="text-red-700 font-bold text-lg">A</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-[#1C1C1C] text-sm truncate">Administrador</p>
              <p className="text-xs text-[#5A564E] truncate">admin@jovita.com</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white text-red-600 rounded-lg font-semibold hover:bg-red-100 transition text-sm"
          >
            <LogOut size={16} />
            Cerrar Sesión
          </button>
        </div>
      </div>
    </aside>
  );
}