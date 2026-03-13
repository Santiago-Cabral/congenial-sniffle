import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getProduct } from "../admin/services/apiService";
import { useCart } from "../Context/CartContext";
import { ShoppingCart, ArrowLeft, Package, Truck, Shield } from "lucide-react";
import foto from "../../public/sin-foto.png";
import UnitPickerModal from "../Components/UnitPickerModal";

export default function ProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addedToCart, setAddedToCart] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [buyNowMode, setBuyNowMode] = useState(false);

  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    getProduct(id)
      .then(setProduct)
      .catch((e) => console.error("Error cargando producto:", e))
      .finally(() => setLoading(false));
  }, [id]);

  function handleOpenPicker(isBuyNow = false) {
    setBuyNowMode(isBuyNow);
    setShowPicker(true);
  }

  /**
   * Recibe { product, unit, quantity } desde el UnitPickerModal.
   * Llama addToCart(product, qty, unit) — el contexto construye el cartKey.
   */
  function handleConfirmUnit({ product: prod, unit, quantity }) {
    addToCart(prod, quantity, unit);

    if (buyNowMode) {
      navigate("/checkout");
    } else {
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 1800);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDF7EF]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#F24C00] border-t-transparent mb-4" />
          <p className="text-[#5A564E]">Cargando producto...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDF7EF] px-4">
        <div className="text-center">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package size={48} className="text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-[#1C1C1C] mb-4">Producto no encontrado</h2>
          <Link to="/" className="bg-[#F24C00] text-white px-6 py-3 rounded-xl font-bold">
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  const name        = product.name || "Producto";
  const stock       = Number(product.stock ?? 0);
  const category    = product.categoryName || "Sin categoría";
  const isAvailable = stock > 0;
  const finalImage  = product.image?.trim() ? product.image : foto;

  return (
    <div className="bg-[#FDF7EF] min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-6">
          <Link to="/" className="inline-flex items-center gap-2 text-[#5A564E] hover:text-[#F24C00]">
            <ArrowLeft size={20} />
            <span>Volver a productos</span>
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-12 bg-white rounded-2xl shadow-xl p-8">
          {/* Imagen */}
          <div className="relative overflow-hidden rounded-2xl bg-gray-100">
            <img src={finalImage} alt={name} className="w-full h-[500px] object-cover" />
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {category && (
                <span className="bg-[#8BBF00] text-[#072000] px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                  {category}
                </span>
              )}
              {!isAvailable && (
                <span className="bg-red-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                  No disponible
                </span>
              )}
            </div>
          </div>

          {/* Info */}
          <div>
            <h1 className="text-4xl font-extrabold text-[#1C1C1C] mb-4">{name}</h1>

            <p className="text-base text-[#5A564E] mb-6">
              Elegí la presentación para ver el precio
            </p>

            <div className="mb-8">
              {isAvailable ? (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                  <span className="text-[#1C1C1C] font-semibold">En stock ({stock})</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full" />
                  <span className="text-red-600 font-semibold">Sin stock</span>
                </div>
              )}
            </div>

            <div className="space-y-3 mb-8">
              <button
                type="button"
                onClick={() => handleOpenPicker(false)}
                disabled={!isAvailable}
                className={`w-full py-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition ${
                  !isAvailable
                    ? "bg-gray-300 cursor-not-allowed"
                    : addedToCart
                    ? "bg-green-600"
                    : "bg-[#F24C00] hover:brightness-110"
                }`}
              >
                <ShoppingCart size={24} />
                {addedToCart ? "¡Agregado al carrito!" : "Agregar al carrito"}
              </button>

              <button
                type="button"
                onClick={() => handleOpenPicker(true)}
                disabled={!isAvailable}
                className={`w-full py-4 rounded-xl font-bold border-2 transition ${
                  !isAvailable
                    ? "border-gray-300 text-gray-400 cursor-not-allowed"
                    : "border-[#F24C00] text-[#F24C00] hover:bg-[#F24C00] hover:text-white"
                }`}
              >
                Comprar ahora
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4 py-6 border-y border-gray-200">
              <Feature icon={Truck} text="Envío rápido" />
              <Feature icon={Shield} text="Pago seguro" />
              <Feature icon={Package} text="Calidad garantizada" />
            </div>
          </div>
        </div>
      </div>

      {showPicker && (
        <UnitPickerModal
          product={product}
          onConfirm={handleConfirmUnit}
          onClose={() => setShowPicker(false)}
        />
      )}
    </div>
  );
}

function Feature({ icon: Icon, text }) {
  return (
    <div className="text-center">
      <div className="w-12 h-12 bg-[#FFE8D8] rounded-full flex items-center justify-center mx-auto mb-2">
        <Icon size={24} color="#F24C00" />
      </div>
      <p className="text-xs text-[#5A564E]">{text}</p>
    </div>
  );
}