import { Search, User, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function Navbar({ onOpenCart }) {
  const { cart } = useCart();
  const qty = cart.reduce((s, c) => s + (c.qty || 1), 0);

  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-20">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-3">
            <img src="/logo-jovita.png" alt="Jovita" className="h-12" />
          </Link>

          <nav className="hidden md:flex gap-8">
            <Link to="/" className="text-base font-semibold text-[#1C1C1C] hover:text-[#F24C00] transition">
              Inicio
            </Link>
            <a href="#productos" className="text-base font-semibold text-[#1C1C1C] hover:text-[#F24C00] transition">
              Productos
            </a>
            <a href="#nosotros" className="text-base font-semibold text-[#1C1C1C] hover:text-[#F24C00] transition">
              Nosotros
            </a>
            <Link to="/contacto" className="text-base font-semibold text-[#1C1C1C] hover:text-[#F24C00] transition">
              Contacto
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <button className="p-2 rounded-full hover:bg-gray-100 transition">
            <Search size={20} />
          </button>
          
          <Link to="/admin/login" className="p-2 rounded-full hover:bg-gray-100 transition">
            <User size={20} />
          </Link>
          
          <button onClick={onOpenCart} className="relative p-2 rounded-full hover:bg-gray-100 transition">
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
  );
}