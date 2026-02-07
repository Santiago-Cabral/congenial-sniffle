// src/components/CartSidebar.jsx
import React from "react";
import { X, Trash, Plus, Minus } from "lucide-react";
import { useCart } from "../Context/CartContext";
import CheckoutForm from "./CheckoutForm";

export default function CartSidebar({ open, onClose }) {
  const { cart, updateQty, removeFromCart, clearCart, total, itemCount } = useCart();

  if (!open) return null;

  function formatMoney(v) {
    const n = Number(v) || 0;
    return n.toLocaleString("es-AR", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  }

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <aside className="absolute right-0 top-0 h-full w-full sm:w-[440px] bg-white shadow-2xl overflow-auto flex flex-col">
        <div className="flex items-center justify-between p-6 border-b bg-white sticky top-0 z-10">
          <h3 className="text-xl font-bold text-[#1C1C1C]">Carrito ({itemCount})</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {cart.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[#5A564E] text-lg mb-4">Tu carrito está vacío</p>
              <p className="text-sm text-[#5A564E]">Agrega productos para comenzar</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="flex gap-4 bg-gray-50 p-4 rounded-xl items-center">
                  <img src={item.image || "/sin-foto.png"} alt={item.name} className="w-20 h-20 object-cover rounded-lg" />

                  <div className="flex-1">
                    <h4 className="font-bold text-[#1C1C1C] mb-1">{item.name}</h4>
                    <p className="text-[#F24C00] font-bold text-lg mb-2">${formatMoney(item.price)}</p>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => updateQty(item.id, Math.max(1, item.qty - 1))}
                        className="w-8 h-8 rounded-lg border flex items-center justify-center hover:border-[#F24C00]"
                      >
                        <Minus size={14} />
                      </button>

                      <span className="font-bold text-lg w-8 text-center">{item.qty}</span>

                      <button
                        onClick={() => updateQty(item.id, Math.min(item.stock || 999, item.qty + 1))}
                        className="w-8 h-8 rounded-lg border flex items-center justify-center hover:border-[#F24C00]"
                      >
                        <Plus size={14} />
                      </button>

                      <button onClick={() => removeFromCart(item.id)} className="ml-auto text-red-600">
                        <Trash size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              <div className="mt-4 text-right">
                <div className="text-sm text-[#5A564E]">Subtotal</div>
                <div className="text-2xl font-extrabold text-[#F24C00]">${formatMoney(total)}</div>
              </div>

              <div className="pt-4 border-t">
                <button
                  onClick={() => clearCart()}
                  className="w-full border-2 border-gray-300 py-3 rounded-xl font-semibold hover:bg-gray-50"
                >
                  Vaciar carrito
                </button>
              </div>

              <div className="mt-4">
                <CheckoutForm onClose={onClose} />
                
              </div>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}