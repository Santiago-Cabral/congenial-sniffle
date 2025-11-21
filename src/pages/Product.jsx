import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getProduct } from "../admin/services/apiService";
import { useCart } from "../context/CartContext";
import { ShoppingCart, ArrowLeft, Package, Truck, Shield, Heart } from "lucide-react";

export default function ProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const p = await getProduct(id);
        setProduct(p);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDF7EF]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#F24C00] border-t-transparent mb-4"></div>
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
          <h2 className="text-2xl font-bold text-[#1C1C1C] mb-4">
            Producto no encontrado
          </h2>
          <p className="text-[#5A564E] mb-6">
            El producto que buscas no existe o fue eliminado
          </p>
          <Link
            to="/"
            className="inline-block bg-[#F24C00] text-white px-8 py-3 rounded-xl font-bold hover:brightness-110 transition"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  const isAvailable = product.isActived && product.stock > 0;
  const price = product.retailPrice || product.precio || product.price || 0;

  return (
    <div className="bg-[#FDF7EF] min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-6">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-[#5A564E] hover:text-[#F24C00] transition"
          >
            <ArrowLeft size={20} />
            <span>Volver a productos</span>
          </Link>
        </div>

        {/* Grid principal */}
        <div className="grid md:grid-cols-2 gap-12 bg-white rounded-2xl shadow-xl p-8">
          {/* Imagen */}
          <div className="relative">
            <div className="sticky top-24">
              <div className="relative overflow-hidden rounded-2xl bg-gray-100">
                <img
                  src={product.image || product.imagen || "/placeholder.png"}
                  alt={product.name || product.nombre}
                  className="w-full h-[500px] object-cover"
                />
                
                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {product.category && (
                    <span className="bg-[#8BBF00] text-[#072000] px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                      {product.category}
                    </span>
                  )}
                  {!isAvailable && (
                    <span className="bg-red-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                      No disponible
                    </span>
                  )}
                </div>

                {/* Wishlist button */}
                <button className="absolute top-4 right-4 w-12 h-12 bg-white rounded-full flex items-center justify-center hover:bg-red-50 transition shadow-lg">
                  <Heart size={24} className="text-red-500" />
                </button>
              </div>
            </div>
          </div>

          {/* Información del producto */}
          <div>
            <h1 className="text-4xl font-extrabold text-[#1C1C1C] mb-4 leading-tight">
              {product.name || product.nombre || "Producto"}
            </h1>

            {/* Precio */}
            <div className="mb-6">
              <p className="text-5xl font-extrabold text-[#F24C00]">
                ${price.toLocaleString("es-AR")}
              </p>
              <p className="text-sm text-[#5A564E] mt-1">
                IVA incluido • Envío calculado al finalizar
              </p>
            </div>

            {/* Stock */}
            <div className="mb-8">
              {product.stock > 0 ? (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-[#1C1C1C] font-semibold">
                    En stock ({product.stock} disponibles)
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-red-600 font-semibold">Sin stock</span>
                </div>
              )}
            </div>

            {/* Selector de cantidad */}
            {isAvailable && (
              <div className="mb-6">
                <label className="block text-sm font-semibold text-[#1C1C1C] mb-3">
                  Cantidad
                </label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-12 h-12 rounded-xl border-2 border-gray-300 flex items-center justify-center hover:border-[#F24C00] transition font-bold text-xl"
                  >
                    −
                  </button>
                  <span className="text-2xl font-bold w-16 text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="w-12 h-12 rounded-xl border-2 border-gray-300 flex items-center justify-center hover:border-[#F24C00] transition font-bold text-xl"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Botones de acción */}
            <div className="space-y-3 mb-8">
              <button
                onClick={handleAddToCart}
                disabled={!isAvailable}
                className={`w-full py-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition shadow-lg ${
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
                onClick={() => {
                  handleAddToCart();
                  navigate("/checkout");
                }}
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

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 py-6 border-y border-gray-200">
              <div className="text-center">
                <div className="w-12 h-12 bg-[#FFE8D8] rounded-full flex items-center justify-center mx-auto mb-2">
                  <Truck size={24} color="#F24C00" />
                </div>
                <p className="text-xs text-[#5A564E]">Envío rápido</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-[#FFE8D8] rounded-full flex items-center justify-center mx-auto mb-2">
                  <Shield size={24} color="#F24C00" />
                </div>
                <p className="text-xs text-[#5A564E]">Pago seguro</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-[#FFE8D8] rounded-full flex items-center justify-center mx-auto mb-2">
                  <Package size={24} color="#F24C00" />
                </div>
                <p className="text-xs text-[#5A564E]">Calidad garantizada</p>
              </div>
            </div>

            {/* Descripción */}
            <div className="mt-8">
              <h3 className="text-xl font-bold text-[#1C1C1C] mb-4">
                Descripción del producto
              </h3>
              <p className="text-[#5A564E] leading-relaxed">
                {product.description ||
                  "Producto natural de alta calidad, cuidadosamente seleccionado para tu bienestar y salud. Ideal para complementar una dieta equilibrada y un estilo de vida saludable."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}