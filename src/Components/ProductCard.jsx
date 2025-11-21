import { ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function ProductCard({ product }) {
  const { addToCart } = useCart();

  const name = product.name || product.nombre || "Producto";
  const price = product.retailPrice || product.precio || product.price || 0;
  const stock = product.stock ?? 0;
  const image = product.image || product.imagen || "/placeholder.png";
  const category = product.category || product.categoria || "";

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all hover:-translate-y-1 group">
      <Link to={`/product/${product.id}`} className="block relative">
        {category && (
          <span className="absolute top-3 left-3 bg-[#8BBF00] text-[#072000] px-4 py-1 rounded-full text-xs font-bold z-10 shadow-md">
            {category}
          </span>
        )}
        
        {stock <= 0 && (
          <span className="absolute top-3 right-3 bg-red-600 text-white px-4 py-1 rounded-full text-xs font-bold z-10 shadow-md">
            Agotado
          </span>
        )}

        <div className="relative overflow-hidden aspect-[4/3]">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500"
          />
        </div>
      </Link>

      <div className="p-5">
        <Link 
          to={`/product/${product.id}`} 
          className="block font-bold text-[#1C1C1C] text-lg hover:text-[#F24C00] transition mb-2 line-clamp-2"
        >
          {name}
        </Link>

        <p className="text-2xl font-extrabold text-[#F24C00] mb-4">
          ${price.toLocaleString("es-AR")}
        </p>

        <button
          disabled={stock <= 0}
          onClick={() => addToCart(product)}
          className={`w-full py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all ${
            stock <= 0 
              ? "bg-gray-300 cursor-not-allowed" 
              : "bg-[#F24C00] hover:brightness-110 shadow-md hover:shadow-lg"
          }`}
        >
          <ShoppingCart size={20} />
          {stock <= 0 ? "Sin Stock" : "Agregar al Carrito"}
        </button>
      </div>
    </div>
  );
}