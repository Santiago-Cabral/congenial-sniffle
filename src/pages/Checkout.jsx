import React, { useEffect, useState } from "react";
import { useCart } from "../Context/CartContext";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ShoppingBag, Truck, User, CreditCard } from "lucide-react";
import { createPublicSale, createPaywayCheckout } from "../admin/services/apiService";

function formatMoney(v) {
  return Number(v || 0).toLocaleString("es-AR", { minimumFractionDigits: 0 });
}

export default function Checkout() {
  const { cart, total, clearCart } = useCart();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    postal: "",
  });

  const [shipping, setShipping] = useState({ cost: 0, days: "" });
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("transfer");
  const [error, setError] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const updateField = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const calculateShipping = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!form.postal) {
      setError("Ingresá el código postal para calcular envío.");
      return;
    }

    setError("");
    if (/^(40|41|42|43|44|45|46|47|48|49)\d{2}$/.test(form.postal)) {
      setShipping({ cost: 1500, days: "1-2 días (Tucumán)" });
    } else {
      setShipping({ cost: 3000, days: "3-5 días" });
    }
  };

  const buildPayload = () => {
    const items = (cart || []).map((it) => ({
      productId: Number(it.id),
      quantity: Number(it.qty ?? it.quantity ?? 1),
      unitPrice: Number(it.price ?? it.retailPrice ?? 0),
    }));

    const customerStr = `${form.name}${form.address ? " - " + form.address : ""} - ${form.phone}`;

    return {
      customer: customerStr,
      items,
      shippingCost: Number(shipping.cost || 0),
      paymentMethod: paymentMethod === "card" ? "card" : paymentMethod === "cash" ? "cash" : "transfer",
      paymentReference: paymentMethod === "transfer" ? `Transferencia - ${form.name}` : `Pedido Web`,
      fulfillmentMethod: "delivery",
      customerDetails: {
        name: form.name,
        phone: form.phone,
        email: form.email,
        address: form.address,
        city: form.city,
        postal: form.postal
      }
    };
  };

  const handlePaywayFlow = async (saleCreated) => {
    try {
      const saleId = saleCreated.id ?? saleCreated.Id ?? saleCreated.SaleId;
      const amount = Number(saleCreated.total ?? saleCreated.Total ?? saleCreated.amount ?? 0);

      if (!saleId || amount <= 0) {
        throw new Error("Venta creada inválida. Falta id o monto.");
      }

      const paywayPayload = {
        saleId,
        amount,
        description: `Pedido #${saleId} - Forrajería Jovita`,
        customer: {
          name: form.name,
          email: form.email || `${form.phone}@temp.com`,
          phone: form.phone,
        },
        returnUrl: `${window.location.origin}/payment/success?sale=${saleId}`,
        cancelUrl: `${window.location.origin}/payment/cancel?sale=${saleId}`
      };

      const checkout = await createPaywayCheckout(paywayPayload);

      const checkoutUrl = checkout?.checkoutUrl ?? checkout?.CheckoutUrl ?? checkout?.url ?? checkout?.raw?.checkoutUrl;

      // guardar transactionId antes de redirect
      if (checkout?.transactionId) {
        sessionStorage.setItem("payway_transactionId", String(checkout.transactionId));
      } else if (checkout?.checkoutId) {
        sessionStorage.setItem("payway_checkoutId", String(checkout.checkoutId));
      }

      if (!checkoutUrl) {
        console.error("No se recibió checkout URL:", checkout);
        throw new Error("No se recibió URL de checkout desde el backend de Payway.");
      }

      window.location.href = checkoutUrl;
    } catch (err) {
      console.error("❌ Error en flow Payway:", err);
      throw err;
    }
  };

  const finishOrder = async () => {
    setError("");
    if (!form.name || !form.phone || !form.email || !form.address || !form.city) {
      setError("Por favor completa todos los datos obligatorios (nombre, teléfono, email, dirección, localidad).");
      return;
    }

    if (cart.length === 0) {
      setError("El carrito está vacío.");
      return;
    }

    if (shipping.cost <= 0 && (!form.postal || form.postal.trim() === "")) {
      setError("Calculá el envío antes de confirmar (ingresá el código postal y presioná Calcular).");
      return;
    }

    setLoading(true);
    try {
      const payload = buildPayload();
      const sale = await createPublicSale(payload);

      const saleId = sale.id ?? sale.Id ?? sale.SaleId ?? (sale._raw && (sale._raw.SaleId ?? sale._raw.Id));
      const saleTotal = Number(sale.total ?? sale.Total ?? sale.amount ?? sale._raw?.Total ?? 0);

      if (paymentMethod === "card") {
        await handlePaywayFlow({ id: saleId, total: saleTotal, ...sale });
        return;
      }

      clearCart();
      alert(`¡Pedido confirmado! Número: ${saleId ?? "N/D"}. Total: $${formatMoney(saleTotal)}`);
      navigate("/");
    } catch (err) {
      console.error("❌ Error al finalizar pedido:", err);
      setError(err?.message || "Ocurrió un error al procesar el pedido.");
    } finally {
      setLoading(false);
    }
  };

  const totalFinal = total + shipping.cost;

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-4">Tu carrito está vacío</h2>
        <Link to="/" className="bg-[#F24C00] text-white px-6 py-3 rounded-xl font-bold">Volver a la tienda</Link>
      </div>
    );
  }

  return (
    <div className="bg-[#FDF7EF] min-h-screen py-12">
      <div className="max-w-5xl mx-auto px-6">
        <Link to="/" className="inline-flex items-center gap-2 text-[#5A564E] hover:text-[#F24C00] transition mb-6">
          <ArrowLeft size={20} /> Volver a productos
        </Link>

        <h1 className="text-4xl font-extrabold text-[#1C1C1C] mb-10">Finalizar Compra</h1>

        <div className="grid md:grid-cols-3 gap-10">
          <div className="md:col-span-2 space-y-8">
            <div className="bg-white p-6 rounded-2xl shadow">
              <div className="flex items-center gap-3 mb-4">
                <User className="text-[#F24C00]" size={26} />
                <h3 className="text-xl font-bold">Datos del cliente</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input className="input" name="name" placeholder="Nombre y apellido" onChange={updateField} value={form.name} />
                <input className="input" name="phone" placeholder="Teléfono" onChange={updateField} value={form.phone} />
                <input className="input md:col-span-2" name="email" placeholder="Email" onChange={updateField} value={form.email} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow">
              <div className="flex items-center gap-3 mb-4">
                <Truck className="text-[#F24C00]" size={26} />
                <h3 className="text-xl font-bold">Dirección de envío</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input className="input md:col-span-2" name="address" placeholder="Dirección" onChange={updateField} value={form.address} />
                <input className="input" name="city" placeholder="Localidad" onChange={updateField} value={form.city} />
                <input className="input" name="postal" placeholder="Código Postal" onChange={updateField} value={form.postal} />
                <button type="button" className="btn-secondary px-6 col-span-2" onClick={calculateShipping}>Calcular envío</button>
              </div>

              {shipping.cost > 0 && (
                <div className="mt-4 bg-[#FFE8D8] p-4 rounded-xl">
                  <p className="text-[#F24C00] font-bold">Envío: ${formatMoney(shipping.cost)}</p>
                  <p className="text-sm">{shipping.days}</p>
                </div>
              )}
            </div>

            <div className="bg-white p-6 rounded-2xl shadow">
              <div className="flex items-center gap-3 mb-4">
                <CreditCard className="text-[#F24C00]" size={26} />
                <h3 className="text-xl font-bold">Método de pago</h3>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <button type="button" onClick={() => setPaymentMethod("cash")} className={`py-3 rounded-lg font-semibold ${paymentMethod === "cash" ? "bg-[#F24C00] text-white" : "bg-white border"}`}>Efectivo</button>
                <button type="button" onClick={() => setPaymentMethod("transfer")} className={`py-3 rounded-lg font-semibold ${paymentMethod === "transfer" ? "bg-[#F24C00] text-white" : "bg-white border"}`}>Transferencia</button>
                <button type="button" onClick={() => setPaymentMethod("card")} className={`py-3 rounded-lg font-semibold ${paymentMethod === "card" ? "bg-[#F24C00] text-white col-span-3" : "bg-white border col-span-3"}`}>Crédito/Débito (Tarjeta)</button>
              </div>

              {paymentMethod === "transfer" && (
                <div className="mt-3 p-4 rounded-lg bg-blue-50 border border-blue-200 space-y-2">
                  <h4 className="font-bold text-blue-900">🏦 Datos para transferencia</h4>
                  <div className="text-sm">
                    <div className="flex justify-between"><span>Banco:</span><span className="font-semibold">Banco Macro</span></div>
                    <div className="flex justify-between"><span>CBU:</span><span className="font-semibold">0000003100010000000001</span></div>
                    <div className="flex justify-between"><span>Alias:</span><span className="font-semibold">JOVITA.DIETETICA</span></div>
                  </div>
                  <p className="text-xs text-blue-700 mt-2">💡 Enviá el comprobante por WhatsApp al confirmar tu pedido</p>
                </div>
              )}

              {paymentMethod === "card" && (
                <div className="mt-3 p-4 rounded-lg bg-purple-50 border border-purple-200">
                  <h4 className="font-bold text-purple-900 mb-3">💳 Pago con tarjeta</h4>
                  <p className="text-sm">Serás redirigido al servicio de pago seguro para completar la transacción.</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow h-fit">
            <div className="flex items-center gap-3 mb-4">
              <ShoppingBag className="text-[#F24C00]" size={26} />
              <h3 className="text-xl font-bold">Resumen del pedido</h3>
            </div>

            <div className="space-y-3 mb-4">
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>{item.name} × {item.qty}</span>
                  <span>${formatMoney(item.price * item.qty)}</span>
                </div>
              ))}
            </div>

            <div className="border-t pt-3 space-y-2">
              <div className="flex justify-between"><span>Subtotal</span><span>${formatMoney(total)}</span></div>
              <div className="flex justify-between"><span>Envío</span><span>${formatMoney(shipping.cost)}</span></div>
              <div className="flex justify-between text-xl font-bold pt-2"><span>Total</span><span className="text-[#F24C00]">${formatMoney(totalFinal)}</span></div>
            </div>

            {error && <div className="mt-3 text-sm text-red-700 bg-red-50 p-3 rounded">{error}</div>}

            <button onClick={finishOrder} disabled={loading} className="w-full bg-[#F24C00] text-white py-4 rounded-xl font-bold mt-6 hover:brightness-110 transition disabled:opacity-50">
              {loading ? "Procesando..." : paymentMethod === "card" ? `Pagar con tarjeta - $${formatMoney(totalFinal)}` : `Confirmar pedido - $${formatMoney(totalFinal)}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
