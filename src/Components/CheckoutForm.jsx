import React, { useEffect, useState } from "react";
import { createPublicSale, createPaywayCheckout, validateCoupon } from "../admin/services/apiService";
import { useCart } from "../Context/CartContext";
import { useSettings } from "../Context/SettingContext";

export default function CheckoutForm({ onClose }) {
  const { cart, total, clearCart } = useCart();
  const { settings, calculateShippingCost } = useSettings();

  const [config, setConfig] = useState({
    storeName: "",
    bankName: "",
    cbu: "",
    alias: "",
    accountHolder: ""
  });

  const [customer, setCustomer] = useState({
    name: "",
    email: "",
    phone: "",
    address: ""
  });

  const [shippingCost, setShippingCost] = useState(0);
  const [shippingInfo, setShippingInfo] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentReference, setPaymentReference] = useState("Pedido Web");
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [error, setError] = useState("");
  const [fulfillmentMethod, setFulfillmentMethod] = useState("delivery");

  // ⭐ Estado del cupón
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null); // { code, discountAmount }
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");

  useEffect(() => {
    if (!settings) return;
    setConfig({
      storeName: settings.storeName || "Forrajería Jovita",
      bankName: settings.bankName || "Banco Macro",
      cbu: settings.cbu || "0000003100010000000001",
      alias: settings.alias || "JOVITA.DIETETICA",
      accountHolder: settings.accountHolder || "Forrajería Jovita S.R.L."
    });

    if (!paymentMethod) {
      if (settings.bankTransfer) {
        setPaymentMethod("transfer");
      } else if (settings.cash) {
        setPaymentMethod("cash");
      } else if (settings.cards) {
        setPaymentMethod("card");
      }
    }
  }, [settings, paymentMethod]);

  useEffect(() => {
    if (fulfillmentMethod === "pickup") {
      setShippingCost(0);
      setShippingInfo(null);
      setError("");
      return;
    }

    if (!customer.address || customer.address.trim() === "") {
      setShippingCost(0);
      setShippingInfo(null);
      return;
    }

    const result = calculateShippingCost(customer.address);

    if (result.error) {
      setError(result.error);
      setShippingCost(0);
      setShippingInfo(null);
    } else {
      setShippingCost(result.cost);
      setShippingInfo(result);
      setError("");
    }
  }, [customer.address, fulfillmentMethod, calculateShippingCost]);

  useEffect(() => {
    if (appliedCoupon) {
      setAppliedCoupon(null);
      setCouponError("El carrito cambió, volvé a aplicar el cupón.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [total]);

  const discountAmount = appliedCoupon?.discountAmount ? Number(appliedCoupon.discountAmount) : 0;

  const handleApplyCoupon = async () => {
    setCouponError("");

    if (!couponCode || !couponCode.trim()) {
      setCouponError("Ingresá un código de cupón.");
      return;
    }

    if (!cart || cart.length === 0) {
      setCouponError("El carrito está vacío.");
      return;
    }

    setCouponLoading(true);
    try {
      // ⭐ FIX: validateCoupon(code, cartTotal) recibe argumentos posicionales, no un objeto
      const result = await validateCoupon(couponCode.trim().toUpperCase(), Number(total));

      if (!result || result.valid === false) {
        throw new Error(result?.message || "Cupón inválido o vencido.");
      }

      setAppliedCoupon({
        code: result.couponCode || couponCode.trim().toUpperCase(),
        discountAmount: Number(result.discountAmount ?? 0)
      });
    } catch (err) {
      console.error("❌ Error al validar cupón:", err);
      setAppliedCoupon(null);
      setCouponError(err?.message || "No se pudo validar el cupón.");
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");
  };

  const buildPayload = () => {
    const items = (cart || []).map(it => ({
      productId: Number(it.id),
      quantity: Number(it.qty ?? it.quantity ?? 1),
      unitPrice: Number(it.price ?? it.retailPrice ?? 0)
    }));

    return {
      customer: `${customer.name}${customer.address ? " - " + customer.address : ""} - ${customer.phone}`,
      items,
      shippingCost: Number(shippingCost),
      paymentMethod: String(paymentMethod),
      paymentReference: String(paymentReference || "Pedido Web"),
      fulfillmentMethod: fulfillmentMethod,
      couponCode: appliedCoupon?.code || null,
      customerDetails: {
        name: customer.name,
        phone: customer.phone,
        address: customer.address,
        email: customer.email
      }
    };
  };

  const handlePaywayPayment = async () => {
    setError("");
    setLoading(true);

    try {
      if (!customer.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) {
        throw new Error("Ingresá un email válido para el pago con tarjeta");
      }

      const payload = buildPayload();
      const sale = await createPublicSale(payload);

      const saleId = sale?.id ?? sale?.Id ?? sale?.saleId ?? null;
      const totalAmount = Number(sale?.total ?? sale?.Total ?? sale?.amount ?? 0);

      if (!saleId || totalAmount <= 0) {
        throw new Error("Error al crear la venta. Intente nuevamente.");
      }

      const paywayData = {
        saleId,
        amount: totalAmount,
        customer: {
          name: customer.name,
          email: customer.email,
          phone: customer.phone
        }
      };

      const checkout = await createPaywayCheckout(paywayData);

      if (checkout?.transactionId) {
        sessionStorage.setItem("payway_tx_id", checkout.transactionId);
        sessionStorage.setItem("payway_tx_timestamp", Date.now().toString());
        sessionStorage.setItem("payway_sale_id", saleId.toString());
        sessionStorage.setItem("payway_amount", totalAmount.toString());
      }

      if (!checkout?.checkoutUrl) {
        throw new Error("No se recibió la URL de pago. Intente nuevamente.");
      }

      setTimeout(() => {
        window.location.href = checkout.checkoutUrl;
      }, 100);

    } catch (err) {
      console.error("❌ [PAYWAY] Error en flujo de pago:", err);

      let errorMessage = "Error al procesar el pago. ";

      if (err.message.includes("Venta")) {
        errorMessage += "No se pudo registrar la venta.";
      } else if (err.message.includes("checkout")) {
        errorMessage += "No se pudo generar el formulario de pago.";
      } else if (err.message.includes("email")) {
        errorMessage += err.message;
      } else {
        errorMessage += err.message || "Intente nuevamente.";
      }

      setError(errorMessage);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!cart || cart.length === 0) {
      setError("El carrito está vacío.");
      return;
    }

    if (!customer.name || !customer.phone) {
      setError("Completá nombre y teléfono.");
      return;
    }

    if (!paymentMethod) {
      setError("Seleccioná un método de pago.");
      return;
    }

    if (paymentMethod === "card") {
      if (!customer.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) {
        setError("Ingresá un email válido para el pago con tarjeta.");
        return;
      }
    }

    if (fulfillmentMethod === "delivery") {
      if (!customer.address) {
        setError("Completá la localidad o barrio para envío a domicilio.");
        return;
      }
      if (!shippingCost || shippingCost <= 0) {
        setError("No se pudo calcular el costo de envío. Verificá la localidad.");
        return;
      }
    } else {
      setShippingCost(0);
    }

    if (paymentMethod === "card") {
      await handlePaywayPayment();
      return;
    }

    setLoading(true);
    try {
      const payload = buildPayload();
      const sale = await createPublicSale(payload);
      setSuccessData(sale);
      clearCart();
    } catch (err) {
      console.error("❌ Error al crear venta:", err);
      setError(err?.message || "Error al procesar el pedido");
    } finally {
      setLoading(false);
    }
  };

  if (successData) {
    return (
      <div className="mt-4 p-5 rounded-xl bg-green-50 border border-green-200">
        <div className="text-center">
          <div className="text-5xl mb-3">✓</div>
          <h4 className="font-bold text-xl text-green-800 mb-2">¡Pedido registrado!</h4>
          <p className="text-sm text-green-700 mb-3">
            Tu pedido fue creado correctamente
          </p>
          {successData?.id && (
            <div className="bg-white p-3 rounded-lg mb-4">
              <p className="text-xs text-gray-600 mb-1">Número de pedido</p>
              <p className="text-2xl font-bold text-[#F24C00]">#{successData.id}</p>
            </div>
          )}
          <p className="text-xs text-green-600 mb-4">
            Te contactaremos pronto para coordinar la entrega
          </p>
        </div>

        <div className="flex gap-2 mt-4">
          <button
            className="flex-1 px-4 py-3 rounded-lg bg-[#F24C00] text-white font-semibold hover:bg-[#D94000]"
            onClick={() => {
              setSuccessData(null);
              onClose?.();
            }}
          >
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  const hasPaymentMethods = settings?.cash || settings?.bankTransfer || settings?.cards;
  const finalTotal = Math.max(0, total - discountAmount) + shippingCost;

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
      {error && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2 flex items-start gap-2">
          <span className="text-lg">⚠️</span>
          <span className="flex-1">{error}</span>
        </div>
      )}

      {!hasPaymentMethods && (
        <div className="text-sm text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2 flex items-start gap-2">
          <span className="text-lg">⚠️</span>
          <span className="flex-1">No hay métodos de pago habilitados. Contactá al administrador.</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3">
        <input
          required
          type="text"
          placeholder="Nombre y apellido *"
          value={customer.name}
          onChange={(e) => setCustomer(prev => ({ ...prev, name: e.target.value }))}
          className="p-3 rounded-lg border focus:ring-2 focus:ring-[#F24C00] focus:border-[#F24C00] outline-none"
        />

        <input
          required={paymentMethod === "card"}
          type="email"
          placeholder={paymentMethod === "card" ? "Email * (requerido para pago con tarjeta)" : "Email"}
          value={customer.email}
          onChange={(e) => setCustomer(prev => ({ ...prev, email: e.target.value }))}
          className="p-3 rounded-lg border focus:ring-2 focus:ring-[#F24C00] focus:border-[#F24C00] outline-none"
        />

        <input
          required
          type="tel"
          placeholder="Teléfono *"
          value={customer.phone}
          onChange={(e) => setCustomer(prev => ({ ...prev, phone: e.target.value }))}
          className="p-3 rounded-lg border focus:ring-2 focus:ring-[#F24C00] focus:border-[#F24C00] outline-none"
        />

        <input
          placeholder="Localidad o barrio + Direccion de envío *"
          value={customer.address}
          onChange={(e) => setCustomer(prev => ({ ...prev, address: e.target.value }))}
          className="p-3 rounded-lg border focus:ring-2 focus:ring-[#F24C00] focus:border-[#F24C00] outline-none"
          required={fulfillmentMethod === "delivery"}
        />
      </div>

      <div className="p-4 rounded-lg bg-gray-50 border">
        <label className="text-sm font-semibold text-gray-700 mb-3 block">
          Retiro / Envío
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => {
              setFulfillmentMethod("pickup");
              setShippingCost(0);
              setShippingInfo(null);
              setError("");
            }}
            className={`py-3 rounded-lg font-semibold transition-all ${
              fulfillmentMethod === "pickup"
                ? "bg-green-600 text-white shadow-lg"
                : "bg-white border border-gray-300 hover:border-green-600"
            }`}
          >
            🛍️ Retirar en local
          </button>

          <button
            type="button"
            onClick={() => {
              setFulfillmentMethod("delivery");
              setError("");
            }}
            className={`py-3 rounded-lg font-semibold transition-all ${
              fulfillmentMethod === "delivery"
                ? "bg-[#F24C00] text-white shadow-lg"
                : "bg-white border border-gray-300 hover:border-[#F24C00]"
            }`}
          >
            🚚 Envío a domicilio
          </button>
        </div>
        <p className="text-xs text-gray-600 mt-2">
          {fulfillmentMethod === "pickup"
            ? `✓ Retiro gratis en ${settings?.storeLocation || "nuestro local"}`
            : "Ingresá tu localidad o barrio para calcular el costo de envío"}
        </p>
      </div>

      {fulfillmentMethod === "delivery" && (
        <div className="p-4 rounded-lg bg-gray-50 border">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold text-gray-700">
              Costo de envío
            </label>
            {shippingInfo && (
              <span className="text-xs text-green-600 font-medium">
                ✓ Calculado automáticamente
              </span>
            )}
          </div>

          {shippingInfo && shippingCost > 0 && (
            <div className="mt-2 p-3 rounded-lg bg-white border border-green-200">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    {shippingInfo.isDefault ? "Localidad no encontrada" : "Zona de envío"}
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    {shippingInfo.message}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-sm text-gray-600">Costo de envío</span>
                  <span className="text-lg font-bold text-[#F24C00]">
                    ${shippingCost.toLocaleString()}
                  </span>
                </div>
                {shippingInfo.isDefault && (
                  <p className="text-xs text-yellow-700 bg-yellow-50 p-2 rounded border border-yellow-200">
                    ⚠️ Tu localidad no está en nuestras zonas predefinidas. Se aplicó el precio por defecto.
                  </p>
                )}
              </div>
            </div>
          )}

          {!shippingInfo && customer.address && (
            <div className="mt-2 p-3 rounded-lg bg-blue-50 border border-blue-200">
              <p className="text-xs text-blue-700">
                💡 El costo se calculará automáticamente según tu localidad o barrio
              </p>
            </div>
          )}
        </div>
      )}

      {/* ⭐ CUPÓN DE DESCUENTO */}
      <div className="p-4 rounded-lg bg-gray-50 border">
        <label className="text-sm font-semibold text-gray-700 mb-3 block">
          Cupón de descuento
        </label>

        {!appliedCoupon ? (
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Ingresá tu código"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              disabled={couponLoading}
              className="flex-1 p-3 rounded-lg border focus:ring-2 focus:ring-[#F24C00] focus:border-[#F24C00] outline-none disabled:bg-gray-100"
            />
            <button
              type="button"
              onClick={handleApplyCoupon}
              disabled={couponLoading || !couponCode.trim()}
              className="px-4 py-3 rounded-lg bg-[#1C1C1C] text-white font-semibold hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {couponLoading ? "Validando..." : "Aplicar"}
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 border border-green-200">
            <div>
              <p className="text-sm font-bold text-green-800">✓ {appliedCoupon.code}</p>
              <p className="text-xs text-green-700">
                Descuento aplicado: ${discountAmount.toLocaleString()}
              </p>
            </div>
            <button
              type="button"
              onClick={handleRemoveCoupon}
              className="text-xs font-semibold text-red-600 hover:text-red-800 underline"
            >
              Quitar
            </button>
          </div>
        )}

        {couponError && (
          <p className="text-xs text-red-600 mt-2">{couponError}</p>
        )}
      </div>

      {hasPaymentMethods && (
        <div className="space-y-3">
          <label className="text-sm font-semibold text-gray-700 block">
            Método de pago
          </label>
          <div className="grid grid-cols-2 gap-2">
            {settings.cash && (
              <button
                type="button"
                onClick={() => setPaymentMethod("cash")}
                className={`py-3 rounded-lg font-semibold transition-all ${
                  paymentMethod === "cash"
                    ? "bg-[#F24C00] text-white shadow-lg"
                    : "bg-white border border-gray-300 hover:border-[#F24C00]"
                }`}
              >
                💵 Efectivo
              </button>
            )}

            {settings.bankTransfer && (
              <button
                type="button"
                onClick={() => setPaymentMethod("transfer")}
                className={`py-3 rounded-lg font-semibold transition-all ${
                  paymentMethod === "transfer"
                    ? "bg-[#F24C00] text-white shadow-lg"
                    : "bg-white border border-gray-300 hover:border-[#F24C00]"
                }`}
              >
                🏦 Transferencia
              </button>
            )}

            {settings.cards && (
              <button
                type="button"
                onClick={() => setPaymentMethod("card")}
                className={`py-3 rounded-lg font-semibold transition-all ${
                  (settings.cash || settings.bankTransfer) ? "" : "col-span-2"
                } ${
                  paymentMethod === "card"
                    ? "bg-[#F24C00] text-white shadow-lg"
                    : "bg-white border border-gray-300 hover:border-[#F24C00]"
                }`}
              >
                💳 Tarjeta de Crédito/Débito
              </button>
            )}
          </div>

          {paymentMethod === "transfer" && settings.bankTransfer && (
            <div className="mt-3 p-4 rounded-lg bg-blue-50 border border-blue-200 space-y-2">
              <h4 className="font-bold text-blue-900 flex items-center gap-2">
                🏦 Datos para transferencia
              </h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Banco:</span>
                  <span className="font-semibold text-gray-900">{config.bankName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">CBU:</span>
                  <span className="font-semibold text-gray-900">{config.cbu}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Alias:</span>
                  <span className="font-semibold text-gray-900">{config.alias}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Titular:</span>
                  <span className="font-semibold text-gray-900">{config.accountHolder}</span>
                </div>
              </div>
              <p className="text-xs text-blue-700 mt-2 pt-2 border-t border-blue-200">
                💡 Enviá el comprobante por WhatsApp al confirmar tu pedido
              </p>
            </div>
          )}

          {paymentMethod === "card" && settings.cards && (
            <div className="mt-3 p-4 rounded-lg bg-purple-50 border border-purple-200">
              <h4 className="font-bold text-purple-900 mb-3 flex items-center gap-2">
                💳 Pago seguro con tarjeta
              </h4>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-purple-800">
                  <span className="text-2xl">🔒</span>
                  <p>Procesado de forma segura por Payway (Decidir)</p>
                </div>
                <ul className="text-xs text-purple-700 space-y-1 ml-8">
                  <li>✓ Todas las tarjetas de crédito y débito</li>
                  <li>✓ Pago en cuotas disponible</li>
                  <li>✓ Transacción 100% segura y encriptada</li>
                  <li>✓ Certificado SSL y PCI Compliance</li>
                </ul>
                <div className="pt-2 border-t border-purple-200">
                  <p className="text-xs text-purple-600 font-medium">
                    ℹ️ Serás redirigido a la plataforma segura de Payway para completar el pago
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {paymentMethod !== "card" && paymentMethod && (
        <input
          placeholder="Referencia de pago (opcional)"
          value={paymentReference}
          onChange={(e) => setPaymentReference(e.target.value)}
          className="p-3 rounded-lg border w-full focus:ring-2 focus:ring-[#F24C00] focus:border-[#F24C00] outline-none"
        />
      )}

      {/* Resumen de totales */}
      <div className="border-t pt-4 space-y-2">
        <div className="flex justify-between items-center text-gray-600">
          <span>Productos</span>
          <span className="font-bold text-gray-900">
            ${total.toLocaleString()}
          </span>
        </div>

        {appliedCoupon && discountAmount > 0 && (
          <div className="flex justify-between items-center text-green-700">
            <span>Descuento ({appliedCoupon.code})</span>
            <span className="font-bold">
              -${discountAmount.toLocaleString()}
            </span>
          </div>
        )}

        <div className="flex justify-between items-center text-gray-600">
          <span>Envío</span>
          <span className="font-bold text-gray-900">
            {shippingCost === 0 && fulfillmentMethod === "pickup"
              ? "Gratis"
              : `$${shippingCost.toLocaleString()}`}
          </span>
        </div>

        <div className="flex justify-between items-center pt-2 border-t">
          <span className="text-xl font-bold text-gray-900">Total</span>
          <span className="text-2xl font-extrabold text-[#F24C00]">
            ${finalTotal.toLocaleString()}
          </span>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || !hasPaymentMethods || couponLoading}
        className="w-full py-4 rounded-xl bg-[#F24C00] text-white font-bold text-lg shadow-lg hover:bg-[#D94000] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            {paymentMethod === "card" ? "Redirigiendo a Payway..." : "Procesando..."}
          </>
        ) : (
          <>
            {paymentMethod === "card" ? "🔒 Pagar con tarjeta" : "Confirmar pedido"}
            {" - $"}
            {finalTotal.toLocaleString()}
          </>
        )}
      </button>

      {paymentMethod === "card" && (
        <p className="text-xs text-center text-gray-500">
          🔐 Tus datos de pago son procesados de forma segura. No almacenamos información de tarjetas.
        </p>
      )}
    </form>
  );
}