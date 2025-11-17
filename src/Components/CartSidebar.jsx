// src/components/CartSidebar.jsx
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
import { useCart } from "../Context/CartContext";
import { useState, useEffect } from "react";

export default function CartSidebar({ open, onClose }) {
  const { cart, removeFromCart, updateQty, total, clearCart } = useCart();

  const [step, setStep] = useState(1);

  const [contact, setContact] = useState({ name: "", phone: "", email: "" });
  const [address, setAddress] = useState({ street: "", city: "", postal: "" });
  const [shipping, setShipping] = useState({ cost: 0, days: "—" });
  const [paymentMethod, setPaymentMethod] = useState("mercadopago");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      setStep(1);
      setContact({ name: "", phone: "", email: "" });
      setAddress({ street: "", city: "", postal: "" });
      setShipping({ cost: 0, days: "—" });
      setPaymentMethod("mercadopago");
      setLoading(false);
    }
  }, [open]);

  if (!open) return null;

  const calcShipping = () => {
    const postal = (address.postal || "").trim();
    if (!postal) {
      setShipping({ cost: 0, days: "—" });
      return;
    }
    if (/^(40|41|42|43|44|45|46|47|48|49)\d{2}$/.test(postal)) {
      setShipping({ cost: 1500, days: "1-2 días (Tucumán)" });
    } else {
      setShipping({ cost: 3000, days: "3-5 días" });
    }
  };

  const prevStep = () => {
    if (step === 1) onClose();
    else setStep((s) => Math.max(1, s - 1));
  };

  const validateStep = (s) => {
    if (s === 2) {
      if (!contact.name.trim() || !contact.phone.trim() || !contact.email.trim()) {
        alert("Por favor completa Nombre, Teléfono y Email.");
        return false;
      }
      const phoneDigits = contact.phone.replace(/\D/g, "");
      if (phoneDigits.length < 7) {
        alert("El número de teléfono debe tener al menos 7 dígitos (sin incluir 381).");
        return false;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) {
        alert("El email no es válido.");
        return false;
      }
    }
    if (s === 3) {
      if (!address.street.trim() || !address.city.trim() || !address.postal.trim()) {
        alert("Por favor completa Dirección, Localidad y Código Postal.");
        return false;
      }
      if (shipping.cost === 0) {
        alert("Calculá el costo de envío con tu Código Postal antes de continuar.");
        return false;
      }
    }
    if (s === 4 && !paymentMethod) {
      alert("Por favor seleccioná un método de pago.");
      return false;
    }
    return true;
  };

  const confirmOrder = async () => {
    if (cart.length === 0) {
      alert("El carrito está vacío.");
      return;
    }

    if (!validateStep(2) || !validateStep(3) || !validateStep(4)) {
      setStep(2);
      return;
    }

    const order = {
      contact,
      address,
      paymentMethod,
      items: cart.map((p) => ({
        id: p.id,
        title: p.name,
        price: p.costPrice,
        qty: p.qty || 1,
      })),
      subtotal: total,
      shippingCost: shipping.cost,
      total: Number(total || 0) + Number(shipping.cost || 0),
      createdAt: new Date().toISOString(),
    };

    setLoading(true);
    try {
      const resp = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(order),
      });

      if (!resp.ok)
        console.warn(
          "No se pudo guardar la orden en /api/orders (status " + resp.status + ")"
        );
      else console.log("Order saved:", await resp.json());

      alert("Pedido confirmado. Gracias por comprar en Forrajería Jovita.");
      clearCart();
      onClose();
    } catch (err) {
      console.warn("Error al enviar orden:", err);
      alert(
        "Pedido confirmado localmente. Cuando tu API esté lista, se podrá guardar automáticamente."
      );
      clearCart();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-60">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <aside className="cart-panel absolute right-0 top-0 h-full w-[420px] bg-white p-6 overflow-auto shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button onClick={prevStep} className="p-2 rounded hover:bg-gray-100">
              <ArrowLeft />
            </button>
            <h3 className="text-xl font-bold">
              {step === 1 && "Tu carrito"}
              {step === 2 && "Datos de contacto"}
              {step === 3 && "Datos de envío"}
              {step === 4 && "Método de pago"}
              {step === 5 && "Resumen del pedido"}
            </h3>
          </div>
          <button onClick={onClose} className="p-2 rounded hover:bg-gray-100">
            <X />
          </button>
        </div>

        {/* PASO 1: Carrito */}
        {step === 1 && (
          <>
            <div className="space-y-4">
              {cart.length === 0 && <p className="text-gray-500 text-sm">Tu carrito está vacío</p>}
              {cart.map((item) => (
                <div key={item.id} className="flex items-start gap-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold">{item.name}</h4>
                    <p className="text-gray-500 mt-1">
                      ${Number(item.costPrice || 0).toLocaleString("es-AR")}
                    </p>
                    <div className="mt-2 flex items-center gap-3">
                      <button
                        onClick={() => updateQty(item.id, Math.max(1, (item.qty || 1) - 1))}
                        className="p-2 rounded border hover:bg-gray-50"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="font-bold">{item.qty || 1}</span>
                      <button
                        onClick={() => updateQty(item.id, (item.qty || 1) + 1)}
                        className="p-2 rounded border hover:bg-gray-50"
                      >
                        <Plus size={16} />
                      </button>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="ml-2 text-gray-500 p-2 rounded hover:bg-gray-50"
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 border-t pt-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-600 font-medium">Total parcial</span>
                <span className="text-xl font-bold">${(total || 0).toLocaleString("es-AR")}</span>
              </div>
              {cart.length > 0 && (
                <>
                  <button className="btn-primary w-full mb-3" onClick={() => setStep(2)}>
                    Finalizar compra
                  </button>
                  <button onClick={clearCart} className="w-full border py-2 rounded">
                    Vaciar carrito
                  </button>
                </>
              )}
            </div>
          </>
        )}

        {/* PASO 2: Datos de contacto */}
        {step === 2 && (
          <div>
            <div className="mb-4 flex items-center gap-3">
              <User />
              <p className="text-sm text-gray-600">Tus datos</p>
            </div>

            <input
              className="input"
              placeholder="Nombre y apellido"
              value={contact.name}
              onChange={(e) => setContact((c) => ({ ...c, name: e.target.value }))}
            />

            <input
              className="input mt-3"
              placeholder="Teléfono (sin 381)"
              value={contact.phone}
              onChange={(e) => setContact((c) => ({ ...c, phone: e.target.value }))}
            />
            {contact.phone && contact.phone.replace(/\D/g, "").length < 7 && (
              <p className="text-red-500 text-sm mt-1">
                El número debe tener al menos 7 dígitos (sin incluir el código 381)
              </p>
            )}

            <input
              className="input mt-3"
              placeholder="Email"
              value={contact.email}
              onChange={(e) => setContact((c) => ({ ...c, email: e.target.value }))}
            />
            {contact.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email) && (
              <p className="text-red-500 text-sm mt-1">Email inválido. Debe contener "@" y un dominio.</p>
            )}

            <div className="mt-6 flex justify-between">
              <button className="btn-secondary" onClick={() => setStep(1)}>Atrás</button>
              <button
                className="btn-primary"
                onClick={() => {
                  if (!validateStep(2)) return;
                  setStep(3);
                }}
              >
                Siguiente
              </button>
            </div>
          </div>
        )}

        {/* Paso 3: Datos de envío */}
        {step === 3 && (
          <div>
            <div className="mb-4 flex items-center gap-3">
              <Truck />
              <p className="text-sm text-gray-600">Datos de envío</p>
            </div>
            <input className="input" placeholder="Dirección (Calle y número)" value={address.street} onChange={(e) => setAddress((a) => ({ ...a, street: e.target.value }))} />
            <input className="input mt-3" placeholder="Localidad" value={address.city} onChange={(e) => setAddress((a) => ({ ...a, city: e.target.value }))} />
            <div className="flex gap-2 mt-3">
              <input className="input flex-1" placeholder="Código Postal" value={address.postal} onChange={(e) => setAddress((a) => ({ ...a, postal: e.target.value }))} />
              <button className="btn-secondary" onClick={calcShipping}>Calcular</button>
            </div>
            {shipping.cost > 0 && <p className="mt-3 text-sm font-semibold text-[var(--accent)]">Envío: ${shipping.cost.toLocaleString("es-AR")} · {shipping.days}</p>}

            <div className="mt-6 flex justify-between">
              <button className="btn-secondary" onClick={() => setStep(2)}>Atrás</button>
              <button className="btn-primary" onClick={() => { if (!validateStep(3)) return; setStep(4); }}>Siguiente</button>
            </div>
          </div>
        )}

        {/* Paso 4: Método de pago */}
        {step === 4 && (
          <div>
            <div className="mb-4 flex items-center gap-3">
              <CreditCard />
              <p className="text-sm text-gray-600">Método de pago</p>
            </div>
            <div className="space-y-3">
              <label className={`p-3 rounded border ${paymentMethod === "mercadopago" ? "border-[var(--accent)]" : ""}`}>
                <input type="radio" name="payment" checked={paymentMethod === "mercadopago"} onChange={() => setPaymentMethod("mercadopago")} />
                <span className="ml-2">Mercado Pago</span>
              </label>
              <label className={`p-3 rounded border ${paymentMethod === "efectivo" ? "border-[var(--accent)]" : ""}`}>
                <input type="radio" name="payment" checked={paymentMethod === "efectivo"} onChange={() => setPaymentMethod("efectivo")} />
                <span className="ml-2">Efectivo</span>
              </label>
            </div>
            <div className="mt-6 flex justify-between">
              <button className="btn-secondary" onClick={() => setStep(3)}>Atrás</button>
              <button className="btn-primary" onClick={() => { if (!validateStep(4)) return; setStep(5); }}>Siguiente</button>
            </div>
          </div>
        )}

        {/* Paso 5: Resumen */}
        {step === 5 && (
          <div>
            <div className="mb-4 flex items-center gap-3">
              <ClipboardList />
              <p className="text-sm text-gray-600">Resumen del pedido</p>
            </div>
            <div className="space-y-3">
              {cart.map((p) => (
                <div key={p.id} className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{p.name}</div>
                    <div className="text-sm text-gray-500">x{p.qty || 1}</div>
                  </div>
                  <div className="font-semibold">${((p.costPrice || 0) * (p.qty || 1)).toLocaleString("es-AR")}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 border-t pt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600">Subtotal</span>
                <span>${(total || 0).toLocaleString("es-AR")}</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600">Envío</span>
                <span>${(shipping.cost || 0).toLocaleString("es-AR")}</span>
              </div>
              <div className="flex items-center justify-between font-bold text-lg">
                <span>Total</span>
                <span>${((Number(total || 0)) + Number(shipping.cost || 0)).toLocaleString("es-AR")}</span>
              </div>
              <div className="mt-6">
                <button className="btn-primary w-full" onClick={confirmOrder} disabled={loading}>
                  {loading ? "Procesando..." : "Confirmar pedido"}
                </button>
                <button className="btn-secondary w-full mt-3" onClick={() => setStep(4)}>Atrás</button>
              </div>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
