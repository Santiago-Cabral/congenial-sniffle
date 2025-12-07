import {
  X,
  Trash,
  Plus,
  Minus,
  User,
  Truck,
  CreditCard,
  ClipboardList,
  ArrowLeft,
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { useState } from "react";

function formatMoney(v) {
  const n = Number(v) || 0;
  return n.toLocaleString("es-AR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

function safeImage(img) {
  if (
    !img ||
    img.includes("via.placeholder.com") ||
    img.includes("300x300") ||
    img.includes("?text")
  ) {
    return "/placeholder.png";
  }
  return img;
}

export default function CartSidebar({ open, onClose }) {
  const { cart, updateQty, removeFromCart, clearCart, total } = useCart();

  const [step, setStep] = useState(1);
  const [postal, setPostal] = useState("");
  const [shipping, setShipping] = useState({ cost: 0, days: "—" });

  if (!open) return null;

  const calcShipping = () => {
    if (!postal) return;

    const isTucuman = /^(40|41|42|43|44|45|46|47|48|49)\d{2}$/.test(postal);
    setShipping({
      cost: isTucuman ? 1500 : 3000,
      days: isTucuman ? "1-2 días (Tucumán)" : "3-5 días",
    });
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <aside className="cart-panel absolute right-0 top-0 h-full w-full sm:w-[440px] bg-white shadow-2xl overflow-auto flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-white sticky top-0 z-10">
          <div className="flex items-center gap-3">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="p-2 rounded-full hover:bg-gray-100 transition"
              >
                <ArrowLeft size={20} />
              </button>
            )}

            <h3 className="text-xl font-bold text-[#1C1C1C]">
              {step === 1 && "Carrito de Compras"}
              {step === 2 && "Datos de contacto"}
              {step === 3 && "Datos de envío"}
              {step === 4 && "Método de pago"}
              {step === 5 && "Resumen del pedido"}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {/* Paso 1: Carrito */}
          {step === 1 && (
            <>
              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-[#5A564E] text-lg mb-4">
                    Tu carrito está vacío
                  </p>
                  <p className="text-sm text-[#5A564E]">
                    Agrega productos para comenzar
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => {
                    const qty = item.qty;
                    const stock = item.stock;

                    return (
                      <div
                        key={item.id}
                        className="flex gap-4 bg-gray-50 p-4 rounded-xl"
                      >
                        <img
                          src={safeImage(item.image)}
                          alt={item.name}
                          className="w-24 h-24 object-cover rounded-lg"
                        />

                        <div className="flex-1">
                          <h4 className="font-bold text-[#1C1C1C] mb-1">
                            {item.name}
                          </h4>

                          <p className="text-[#F24C00] font-bold text-lg mb-3">
                            ${formatMoney(item.price)}
                          </p>

                          {/* Controles de cantidad */}
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() =>
                                updateQty(item.id, Math.max(1, qty - 1))
                              }
                              className="w-8 h-8 rounded-lg border-2 border-gray-300 flex items-center justify-center hover:border-[#F24C00] transition"
                            >
                              <Minus size={16} />
                            </button>

                            <span className="font-bold text-lg w-8 text-center">
                              {qty}
                            </span>

                            <button
                              onClick={() =>
                                updateQty(item.id, Math.min(stock, qty + 1))
                              }
                              className="w-8 h-8 rounded-lg border-2 border-gray-300 flex items-center justify-center hover:border-[#F24C00] transition"
                            >
                              <Plus size={16} />
                            </button>

                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="ml-auto text-red-600 hover:text-red-700 transition"
                            >
                              <Trash size={20} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* Paso 2: Contacto */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-[#FFE8D8] flex items-center justify-center">
                  <User size={24} color="#F24C00" />
                </div>
                <div>
                  <h4 className="font-bold text-[#1C1C1C]">Información personal</h4>
                  <p className="text-sm text-[#5A564E]">Completa tus datos</p>
                </div>
              </div>

              <input className="input" placeholder="Nombre y apellido" />
              <input className="input" placeholder="Teléfono" type="tel" />
              <input className="input" placeholder="Email" type="email" />
            </div>
          )}

          {/* Paso 3: Envío */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-[#FFE8D8] flex items-center justify-center">
                  <Truck size={24} color="#F24C00" />
                </div>
                <div>
                  <h4 className="font-bold text-[#1C1C1C]">Dirección de envío</h4>
                  <p className="text-sm text-[#5A564E]">¿Dónde lo enviamos?</p>
                </div>
              </div>

              <input className="input" placeholder="Dirección" />
              <input className="input" placeholder="Localidad" />

              <div className="flex gap-2">
                <input
                  className="input flex-1"
                  placeholder="Código Postal"
                  value={postal}
                  onChange={(e) => setPostal(e.target.value)}
                />

                <button className="btn-secondary px-6" onClick={calcShipping}>
                  Calcular
                </button>
              </div>

              {shipping.cost > 0 && (
                <div className="bg-[#FFE8D8] p-4 rounded-xl">
                  <p className="font-bold text-[#F24C00]">
                    Envío: ${formatMoney(shipping.cost)}
                  </p>
                  <p className="text-sm text-[#5A564E] mt-1">{shipping.days}</p>
                </div>
              )}
            </div>
          )}

          {/* Paso 4: Pago */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-[#FFE8D8] flex items-center justify-center">
                  <CreditCard size={24} color="#F24C00" />
                </div>
                <div>
                  <h4 className="font-bold text-[#1C1C1C]">Método de pago</h4>
                  <p className="text-sm text-[#5A564E]">Elige cómo pagar</p>
                </div>
              </div>

              <button className="w-full bg-[#00B0FF] text-white py-4 rounded-xl font-bold hover:brightness-110 transition">
                💳 Mercado Pago
              </button>

              <button className="w-full bg-green-600 text-white py-4 rounded-xl font-bold hover:brightness-110 transition">
                💵 Efectivo / Transferencia
              </button>
            </div>
          )}

          {/* Paso 5: Resumen */}
          {step === 5 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-[#FFE8D8] flex items-center justify-center">
                  <ClipboardList size={24} color="#F24C00" />
                </div>

                <div>
                  <h4 className="font-bold text-[#1C1C1C]">Resumen del pedido</h4>
                  <p className="text-sm text-[#5A564E]">
                    Revisa antes de confirmar
                  </p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-[#5A564E]">
                    Productos ({cart.length})
                  </span>
                  <span className="font-bold">${formatMoney(total)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-[#5A564E]">Envío</span>
                  <span className="font-bold">
                    ${formatMoney(shipping.cost)}
                  </span>
                </div>

                <div className="border-t pt-3 flex justify-between">
                  <span className="text-xl font-bold text-[#1C1C1C]">Total</span>
                  <span className="text-2xl font-extrabold text-[#F24C00]">
                    ${formatMoney(total + shipping.cost)}
                  </span>
                </div>
              </div>

              <button className="w-full bg-[#F24C00] text-white py-4 rounded-xl font-bold hover:brightness-110 transition shadow-lg">
                Confirmar Pedido
              </button>
            </div>
          )}
        </div>

        {/* Footer con botones */}
        {step === 1 && cart.length > 0 && (
          <div className="border-t p-6 bg-white">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[#5A564E] font-semibold">Total</span>
              <span className="text-2xl font-extrabold text-[#F24C00]">
                ${formatMoney(total)}
              </span>
            </div>

            <button
              className="w-full bg-[#F24C00] text-white py-4 rounded-xl font-bold hover:brightness-110 transition shadow-lg mb-3"
              onClick={() => setStep(2)}
            >
              Finalizar Compra
            </button>

            <button
              onClick={clearCart}
              className="w-full border-2 border-gray-300 py-3 rounded-xl font-semibold hover:bg-gray-50 transition"
            >
              Vaciar Carrito
            </button>
          </div>
        )}

        {step >= 2 && step <= 4 && (
          <div className="border-t p-6 bg-white flex gap-3">
            <button
              className="flex-1 border-2 border-gray-300 py-3 rounded-xl font-semibold hover:bg-gray-50 transition"
              onClick={() => setStep(step - 1)}
            >
              Atrás
            </button>

            <button
              className="flex-1 bg-[#F24C00] text-white py-3 rounded-xl font-bold hover:brightness-110 transition"
              onClick={() => setStep(step + 1)}
            >
              Siguiente
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}
