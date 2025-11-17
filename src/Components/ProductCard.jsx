// src/components/ProductCard.jsx
import { ShoppingCart } from "lucide-react";
import { useCart } from "../Context/CartContext";

export default function ProductCard({ product }) {
  const { addToCart } = useCart();

  // Aseguramos que la imagen siempre apunte a public/
  const imageUrl = product.image ? `/${product.image}` : "/placeholder.png";

  return (
    <div className="product-card bg-white rounded-2xl shadow-md hover:shadow-xl transition overflow-hidden">
      <div className="relative">
        <img
          src={imageUrl}
          alt={product.name || "Producto"}
          className="card-img-top w-full h-56 object-cover"
        />
        <div className="absolute left-4 top-4 tag-green bg-green-600 text-white text-xs px-2 py-1 rounded">
          {product.category || "Sin categoría"}
        </div>
      </div>

      <div className="p-6 flex flex-col gap-3">
        <h3 className="text-xl font-semibold text-(--title)">
          {product.name || "Producto"}
        </h3>

        <p className="text-2xl font-extrabold text-(--accent) mt-4">
          ${Number(product.costPrice || 0).toLocaleString("es-AR", { minimumFractionDigits: 2 })}
        </p>

        <button
          onClick={() => addToCart(product)}
          className="mt-6 btn-primary w-full flex items-center justify-center gap-3"
          disabled={product.stock === false}
        >
          <ShoppingCart size={20} />
          {product.stock === false ? "Sin stock" : "Agregar al Carrito"}
        </button>
      </div>
    </div>
  );
}
