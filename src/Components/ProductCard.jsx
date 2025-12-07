// src/components/ProductCard.jsx
import { useEffect, useState } from "react";
import { ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { getProduct } from "../admin/services/apiService";
import producto1 from "../../public/images/producto1.jpg";

const SUPABASE_PUBLIC_URL = import.meta.env.VITE_SUPABASE_PUBLIC_URL;

// ===============================
// 🔍 Resolver URL de imagen
// ===============================
function getProductImageUrl(image) {
  if (!image || image.trim() === "") return producto1;

  const trimmed = image.trim();

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  if (SUPABASE_PUBLIC_URL) {
    return `${SUPABASE_PUBLIC_URL}/${trimmed.replace(/^\/+/, "")}`;
  }

  return producto1;
}

export default function ProductCard({ product }) {
  const { addToCart } = useCart();

  // Producto “completo” tomado de GET /Products/{id}
  const [fullProduct, setFullProduct] = useState(null);
  const [loadingExtra, setLoadingExtra] = useState(false);

  // Feedback “agregado”
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadFull = async () => {
      try {
        setLoadingExtra(true);
        const p = await getProduct(product.id);
        if (isMounted) setFullProduct(p);
      } catch (err) {
        console.error("Error cargando detalle de producto en card:", err);
      } finally {
        if (isMounted) setLoadingExtra(false);
      }
    };

    if (product?.id) loadFull();

    return () => {
      isMounted = false;
    };
  }, [product?.id]);

  const p = fullProduct || product || {};

  // ===============================
  // CAMPOS NORMALIZADOS
  // ===============================
  const id = p.id;
  const name = p.name || "Producto";
  const price = Number(p.retailPrice ?? p.price ?? 0);

  const rawStock =
    p.stock === null || p.stock === undefined ? 0 : Number(p.stock);
  const stock = Number.isNaN(rawStock) ? 0 : rawStock;

  const category = p.categoryName || "Sin categoría";
  const isActived =
    p.isActived === undefined || p.isActived === null ? true : !!p.isActived;

  const isAvailable = isActived && stock > 0;
  const imageUrl = getProductImageUrl(p.image);

  // ===============================
  // HANDLER AGREGAR AL CARRITO
  // ===============================
  const handleAdd = () => {
    if (!p || !isAvailable) return;

    addToCart(p, 1);

    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 1500);
  };

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all hover:-translate-y-1 group">
      <Link to={`/product/${id}`} className="block relative">
        {/* Categoría */}
        {category && (
          <span className="absolute top-3 left-3 bg-[#8BBF00] text-[#072000] px-4 py-1 rounded-full text-xs font-bold z-10 shadow-md">
            {category}
          </span>
        )}

        {/* Agotado */}
        {!isAvailable && (
          <span className="absolute top-3 right-3 bg-red-600 text-white px-4 py-1 rounded-full text-xs font-bold z-10 shadow-md">
            Agotado
          </span>
        )}

        {/* Imagen */}
        <div className="relative overflow-hidden aspect-[4/3]">
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500"
          />
        </div>
      </Link>

      {/* CONTENIDO */}
      <div className="p-5">
        <Link
          to={`/product/${id}`}
          className="block font-bold text-[#1C1C1C] text-lg hover:text-[#F24C00] transition mb-2 line-clamp-2"
        >
          {name}
        </Link>

        <p className="text-2xl font-extrabold text-[#F24C00] mb-4">
          ${price.toLocaleString("es-AR")}
        </p>

        {/* Botón */}
        <button
          disabled={!isAvailable}
          onClick={handleAdd}
          className={`w-full py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all ${
            !isAvailable
              ? "bg-gray-300 cursor-not-allowed"
              : addedToCart
              ? "bg-green-600"
              : "bg-[#F24C00] hover:brightness-110 shadow-md hover:shadow-lg"
          }`}
        >
          <ShoppingCart size={20} />
          {!isAvailable
            ? "Sin Stock"
            : addedToCart
            ? "¡Agregado al carrito!"
            : loadingExtra
            ? "Cargando..."
            : "Agregar al Carrito"}
        </button>
      </div>
    </div>
  );
}
