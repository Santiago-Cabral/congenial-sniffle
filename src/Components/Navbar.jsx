import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";

export default function Navbar() {
  return (
    <header className="bg-(--color-primary) text-white shadow-lg fixed top-0 w-full z-50">
      <nav className="container mx-auto flex justify-between items-center py-4 px-6">
        <Link to="/" className="text-2xl font-bold">
          Jovita 🐶🌾
        </Link>

        <ul className="flex gap-6 text-lg font-medium">
          <li>
            <Link to="/" className="hover:text-(--color-secondary) transition">Inicio</Link>
          </li>
          <li>
            <Link to="/productos" className="hover:text-(--color-secondary) transition">Productos</Link>
          </li>
        </ul>

        <div className="flex items-center gap-5">
          <Link to="/login" className="hover:text-(--color-secondary) transition">
            Admin
          </Link>

          <button className="relative">
            <ShoppingCart size={26} />
            <span className="absolute -top-2 -right-2 bg-white text-(--color-primary) text-xs font-bold rounded-full px-1">
              0
            </span>
          </button>
        </div>
      </nav>
    </header>
  );
}
