import { Link, NavLink } from "react-router-dom";
import { Search, User, ShoppingCart } from "lucide-react";
import { useCart } from "../Context/CartContext.jsx";

export default function Navbar({ onOpenCart }) {
  const { cart } = useCart();

  return (
    <header className="fixed top-0 left-0 right-0 bg-white border-b border-black/5 z-50">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-20">
        
        {/* Logo + Links */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-3">
            <img src="/logo-jovita.png" alt="Jovita" className="w-12 h-12 rounded-full bg-white p-1" />
          </Link>

          <nav className="hidden lg:flex gap-8 items-center">
            <NavLink to="/" className="nav-link">Inicio</NavLink>
            <NavLink to="/products" className="nav-link">Productos</NavLink>
            <NavLink to="/nosotros" className="nav-link">Nosotros</NavLink>
            <NavLink to="/contacto" className="nav-link">Contacto</NavLink>
          </nav>
        </div>

        {/* Icons */}
        <div className="flex items-center gap-6">
          <button className="icon-btn">
            <Search size={18} />
          </button>
          <Link to="/login" className="icon-btn">
            <User size={18} />
          </Link>

          {/* Carrito */}
          <button onClick={onOpenCart} className="relative icon-btn">
            <ShoppingCart size={20} />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-[var(--accent)] text-white text-xs font-bold rounded-full px-1">
                {cart.reduce((sum, p) => sum + (p.qty || 1), 0)}
              </span>
            )}
          </button>
        </div>

      </div>
    </header>
  );
}
