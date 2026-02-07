import { Search, User, ShoppingCart, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "../Context/CartContext";
import { useState } from "react";
import SearchOverlay from "./SearchOverlay";
import AllProducts from "./AllProducts";

export default function Navbar({ onOpenCart }) {
  const { cart } = useCart();
  const qty = cart.reduce((s, c) => s + (c.qty || 1), 0);

  const [openSearch, setOpenSearch] = useState(false);

  // Estado para el menú desplegable del usuario
  const [openUserMenu, setOpenUserMenu] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-20 relative">

          {/* LEFT */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-3">
              <img src="/logo-jovita.png" alt="Jovita" className="h-12" />
            </Link>

            <nav className="hidden md:flex gap-8">
              <Link to="/" className="text-base font-semibold text-[#1C1C1C] hover:text-[#F24C00] transition">
                Inicio
              </Link>
              <a href="/allproductos" className="text-base font-semibold text-[#1C1C1C] hover:text-[#F24C00] transition">
                Productos
              </a>
              <a href="/nosotros" className="text-base font-semibold text-[#1C1C1C] hover:text-[#F24C00] transition">
                Nosotros
              </a>
              
            </nav>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-2">

            {/* SEARCH */}
            <button
              onClick={() => setOpenSearch(true)}
              className="p-2 rounded-full hover:bg-gray-100 transition"
            >
              <Search size={20} />
            </button>

            {/* USER MENU */}
            <div className="relative">
              <button
                onClick={() => setOpenUserMenu((prev) => !prev)}
                className="p-2 rounded-full hover:bg-gray-100 transition flex items-center justify-center"
              >
                <User size={20} />
              </button>

              {/* DROPDOWN */}
              {openUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                  
                  {/* Iniciar sesión usuario
                  <Link
                    to="/login"
                    onClick={() => setOpenUserMenu(false)}
                    className="block px-4 py-2 text-sm text-[#1C1C1C] hover:bg-gray-100 transition"
                  >
                    Iniciar sesión
                  </Link> */}

                  {/* Administración */}
                  <Link
                    to="/admin/login"
                    onClick={() => setOpenUserMenu(false)}
                    className="block px-4 py-2 text-sm text-[#1C1C1C] hover:bg-gray-100 transition"
                  >
                    Administración
                  </Link>

                </div>
              )}
            </div>

            {/* CART */}
            <button
              onClick={onOpenCart}
              className="relative p-2 rounded-full hover:bg-gray-100 transition"
            >
              <ShoppingCart size={20} />
              {qty > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#F24C00] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {qty}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* OVERLAY DE BUSQUEDA */}
      <SearchOverlay open={openSearch} onClose={() => setOpenSearch(false)} />
    </>
  );
}
