import { useEffect, useState } from "react";
import { ShoppingCart, Tag } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "../Context/CartContext";
import { getProduct } from "../admin/services/apiService";
import { getProductUnits } from "../admin/services/productUnitService";
import fotoDefault from "../../public/sin-foto.png";

const SUPABASE_PUBLIC_URL = import.meta.env.VITE_SUPABASE_PUBLIC_URL;

function getProductImageUrl(image) {
  if (!image) return fotoDefault;
  if (image.startsWith("http")) return image;
  return SUPABASE_PUBLIC_URL ? `${SUPABASE_PUBLIC_URL}/${image.replace(/^\/+/, "")}` : fotoDefault;
}

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const [fullProduct, setFullProduct] = useState(null);
  const [addedToCart, setAddedToCart] = useState(false);
  const [hasUnits, setHasUnits] = useState(false);

  useEffect(() => {
    if (!product?.id) return;

    // Cargar detalle del producto
    getProduct(product.id)
      .then(setFullProduct)
      .catch(() => {});

    // Verificar si tiene unidades con precio > 0
    getProductUnits(product.id)
      .then(data => setHasUnits((data.units ?? []).length > 0))
      .catch(() => setHasUnits(false));
  }, [product?.id]);

  const p = fullProduct || product || {};

  const id          = p.id;
  const name        = p.name || "Producto";
  const price       = Number(p.retailPrice ?? 0);
  const stock       = Number(p.stock ?? 0);
  const category    = p.categoryName;
  const isAvailable = p.isActived && stock > 0;
  const imageUrl    = getProductImageUrl(p.image);

  const handleAdd = () => {
    if (!isAvailable) return;
    addToCart(p, 1);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 1500);
  };

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all group">
      <Link to={`/product/${id}`} className="block relative">
        {category && (
          <span className="absolute top-3 left-3 bg-[#8BBF00] text-white px-3 py-1 rounded-full text-xs font-bold z-10">
            {category}
          </span>
        )}
        {!isAvailable && (
          <span className="absolute top-3 right-3 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold z-10">
            Agotado
          </span>
        )}
        <div className="aspect-square overflow-hidden">
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          />
        </div>
      </Link>

      <div className="p-5">
        <Link
          to={`/product/${id}`}
          className="block font-bold text-lg mb-2 line-clamp-1 hover:text-[#F24C00]"
        >
          {name}
        </Link>

        {/* Precio o badge de presentaciones */}
        {hasUnits ? (
          <div className="flex items-center gap-2 mb-4">
            <Tag size={15} className="text-[#F24C00]" />
            <span className="text-sm font-semibold text-[#F24C00]">
              Ver presentaciones
            </span>
          </div>
        ) : (
          <p className="text-2xl font-black text-[#F24C00] mb-4">
            ${price.toLocaleString("es-AR")}
          </p>
        )}

        {/* Botón */}
        {hasUnits ? (
          <Link
            to={`/product/${id}`}
            className="w-full py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 bg-[#F24C00] hover:brightness-110 transition"
          >
            <ShoppingCart size={20} />
            Elegir presentación
          </Link>
        ) : (
          <button
            disabled={!isAvailable}
            onClick={handleAdd}
            className={`w-full py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition ${
              !isAvailable ? "bg-gray-300" : addedToCart ? "bg-green-600" : "bg-[#F24C00]"
            }`}
          >
            <ShoppingCart size={20} />
            {!isAvailable ? "Sin Stock" : addedToCart ? "¡Agregado!" : "Agregar"}
          </button>
        )}
      </div>
    </div>
  );
}