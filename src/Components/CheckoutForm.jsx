import React, { useEffect, useState } from "react";
import { createPublicSale, createPaywayCheckout, validateCoupon } from "../admin/services/apiService";
import { useCart } from "../Context/CartContext";
import { useSettings } from "../Context/SettingContext";
import {
  CheckCircle2,
  AlertTriangle,
  ShoppingBag,
  Truck,
  Lightbulb,
  Banknote,
  Landmark,
  CreditCard,
  Lock,
  ShieldCheck
} from "lucide-react";

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

  // ⭐ Adaptado a Mercado Pago (antes era el flujo de Payway)
  const handleMercadoPagoPayment = async () => {
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

      const checkoutData = {
        saleId,
        amount: totalAmount,
        externalReference: String(saleId),
        returnUrl: `${window.location.origin}/payment/success?sale=${saleId}`,
        cancelUrl: `${window.location.origin}/payment/cancel?sale=${saleId}`,
        customer: {
          name: customer.name,
          email: customer.email,
          phone: customer.phone
        }
      };

      const checkout = await createPaywayCheckout(checkoutData);

      if (checkout?.transactionId) {
        sessionStorage.setItem("mp_tx_id", checkout.transactionId);
        sessionStorage.setItem("mp_tx_timestamp", Date.now().toString());
        sessionStorage.setItem("mp_sale_id", saleId.toString());
        sessionStorage.setItem("mp_amount", totalAmount.toString());
      }

      if (!checkout?.checkoutUrl) {
        throw new Error("No se recibió la URL de pago. Intente nuevamente.");
      }

      setTimeout(() => {
        window.location.href = checkout.checkoutUrl;
      }, 100);

    } catch (err) {
      console.error("❌ [MERCADOPAGO] Error en flujo de pago:", err);

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
      await handleMercadoPagoPayment();
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
      <div className="mt-4 p-6 rounded-2xl bg-green-50 border border-green-200">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-9 h-9 text-green-600" />
          </div>
          <h4 className="font-bold text-xl text-green-900 mb-2">¡Pedido registrado!</h4>
          <p className="text-sm text-green-800 mb-4">
            Tu pedido fue creado correctamente
          </p>
          {successData?.id && (
            <div className="bg-white p-4 rounded-xl border border-green-200 mb-4">
              <p className="text-xs text-[#5A564E] mb-1">Número de pedido</p>
              <p className="text-2xl font-extrabold text-[#F24C00]">#{successData.id}</p>
            </div>
          )}
          <p className="text-xs text-green-700 mb-4 flex items-center justify-center gap-1.5">
            <ShoppingBag className="w-4 h-4 shrink-0" />
            Te contactaremos pronto para coordinar la entrega
          </p>
        </div>

        <div className="flex gap-2 mt-2">
          <button
            className="flex-1 px-4 py-3.5 rounded-xl bg-[#F24C00] text-white font-semibold hover:bg-[#D94000] transition-colors focus-visible:ring-2 focus-visible:ring-[#F24C00] focus-visible:ring-offset-2 outline-none"
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

  const panelCls = "p-5 rounded-2xl bg-[#FFFAF3] border border-[#F2E4CF]";
  const panelTitleCls = "text-sm font-bold uppercase tracking-wider text-[#1C1C1C] mb-3";
  const labelCls = "block text-sm font-semibold text-[#1C1C1C] mb-1.5";
  const hintCls = "text-xs text-[#5A564E]";
  const requiredStar = <span className="text-[#F24C00]"> *</span>;
  const focusBtn = "focus-visible:ring-2 focus-visible:ring-offset-2 outline-none";

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-5">
      {error && (
        <div
          role="alert"
          className="text-sm text-red-800 bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-start gap-3"
        >
          <span className="mt-0.5 p-1.5 rounded-full bg-red-100 text-red-600 shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </span>
          <span className="flex-1">{error}</span>
        </div>
      )}

      {!hasPaymentMethods && (
        <div
          role="alert"
          className="text-sm text-yellow-800 bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 flex items-start gap-3"
        >
          <span className="mt-0.5 p-1.5 rounded-full bg-yellow-100 text-yellow-700 shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </span>
          <span className="flex-1">No hay métodos de pago habilitados. Contactá al administrador.</span>
        </div>
      )}

      {/* 🔤 Datos de contacto */}
      <section className={panelCls}>
        <h4 className={panelTitleCls}>Tus datos</h4>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label htmlFor="co-name" className={labelCls}>
              Nombre y apellido{requiredStar}
            </label>
            <input
              id="co-name"
              autoComplete="name"
              required
              type="text"
              placeholder="Juan Pérez"
              value={customer.name}
              onChange={(e) => setCustomer(prev => ({ ...prev, name: e.target.value }))}
              className="input"
            />
          </div>

          <div>
            <label htmlFor="co-email" className={labelCls}>
              Email
              {paymentMethod === "card" && (
                <span className="font-normal text-[#5A564E]"> (requerido para pagar con tarjeta)</span>
              )}
            </label>
            <input
              id="co-email"
              autoComplete="email"
              required={paymentMethod === "card"}
              type="email"
              placeholder="tucorreo@ejemplo.com"
              value={customer.email}
              onChange={(e) => setCustomer(prev => ({ ...prev, email: e.target.value }))}
              className="input"
            />
          </div>

          <div>
            <label htmlFor="co-phone" className={labelCls}>
              Teléfono{requiredStar}
            </label>
            <input
              id="co-phone"
              autoComplete="tel"
              required
              type="tel"
              placeholder="11 2345-6789"
              value={customer.phone}
              onChange={(e) => setCustomer(prev => ({ ...prev, phone: e.target.value }))}
              className="input"
            />
          </div>

          <div>
            <label htmlFor="co-address" className={labelCls}>
              Localidad / Barrio y dirección
              {fulfillmentMethod === "delivery" && requiredStar}
            </label>
            <input
              id="co-address"
              autoComplete="street-address"
              type="text"
              placeholder="Ej: Centro, Calle 32 1450"
              value={customer.address}
              onChange={(e) => setCustomer(prev => ({ ...prev, address: e.target.value }))}
              className="input"
              required={fulfillmentMethod === "delivery"}
            />
            <p className={`${hintCls} mt-1.5`}>
              {fulfillmentMethod === "pickup"
                ? "No es necesario si retirás en el local."
                : "Ingresá localidad o barrio para calcular el envío."}
            </p>
          </div>
        </div>
      </section>

      {/* 🚚 Retiro / Envío */}
      <section className={panelCls}>
        <h4 className={panelTitleCls}>Entrega</h4>
        <div className="grid grid-cols-1 min-[380px]:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => {
              setFulfillmentMethod("pickup");
              setShippingCost(0);
              setShippingInfo(null);
              setError("");
            }}
            aria-pressed={fulfillmentMethod === "pickup"}
            className={`min-h-[56px] py-3 px-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 border-2 ${focusBtn} ${
              fulfillmentMethod === "pickup"
                ? "bg-[#8BBF00] text-[#072000] border-[#6D8F00] shadow-md shadow-[#8BBF00]/25"
                : "bg-white text-[#5A564E] border-[#E5D5BF] hover:border-[#8BBF00] hover:text-[#3F5C00]"
            }`}
          >
            {fulfillmentMethod === "pickup" && <CheckCircle2 className="w-5 h-5 shrink-0" />}
            <ShoppingBag className="w-5 h-5 shrink-0" />
            Retirar en local
          </button>

          <button
            type="button"
            onClick={() => {
              setFulfillmentMethod("delivery");
              setError("");
            }}
            aria-pressed={fulfillmentMethod === "delivery"}
            className={`min-h-[56px] py-3 px-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 border-2 ${focusBtn} ${
              fulfillmentMethod === "delivery"
                ? "bg-[#F24C00] text-white border-[#D94000] shadow-md shadow-[#F24C00]/30"
                : "bg-white text-[#5A564E] border-[#E5D5BF] hover:border-[#F24C00] hover:text-[#F24C00]"
            }`}
          >
            <Truck className="w-5 h-5 shrink-0" />
            Envío a domicilio
          </button>
        </div>
        <p className={`${hintCls} mt-3 flex items-start gap-1.5`}>
          <Lightbulb className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            {fulfillmentMethod === "pickup"
              ? `Retiro gratis en ${settings?.storeLocation || "nuestro local"}`
              : "Ingresá tu localidad o barrio para calcular el costo de envío."}
          </span>
        </p>
      </section>

      {fulfillmentMethod === "delivery" && (
        <section className={`${panelCls} bg-white`}>
          <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
            <h4 className="text-sm font-bold uppercase tracking-wider text-[#1C1C1C]">
              Costo de envío
            </h4>
            {shippingInfo && (
              <span className="text-xs font-semibold text-[#3F5C00] bg-[#8BBF00]/15 rounded-full px-2.5 py-1 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                Calculado automáticamente
              </span>
            )}
          </div>

          {shippingInfo && shippingCost > 0 && (
            <div className="mt-2 p-3.5 rounded-xl bg-[#FFFAF3] border border-[#F2E4CF]">
              <div className="space-y-2">
                <div className="flex justify-between items-center gap-2">
                  <span className={`${hintCls}`}>
                    {shippingInfo.isDefault ? "Localidad no encontrada" : "Zona de envío"}
                  </span>
                  <span className="text-sm font-semibold text-[#1C1C1C] text-right">
                    {shippingInfo.message}
                  </span>
                </div>
                <div className="flex justify-between items-center gap-2 pt-2 border-t border-[#F2E4CF]">
                  <span className={`${hintCls}`}>Costo de envío</span>
                  <span className="text-lg font-bold text-[#F24C00]">
                    ${shippingCost.toLocaleString()}
                  </span>
                </div>
                {shippingInfo.isDefault && (
                  <p className="text-xs text-yellow-800 bg-yellow-50 p-2.5 rounded-lg border border-yellow-200 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>Tu localidad no está en nuestras zonas predefinidas. Se aplicó el precio por defecto.</span>
                  </p>
                )}
              </div>
            </div>
          )}

          {!shippingInfo && customer.address && (
            <div className="mt-2 p-3.5 rounded-xl bg-blue-50 border border-blue-200">
              <p className="text-xs text-blue-800 flex items-start gap-2">
                <Lightbulb className="w-4 h-4 shrink-0 mt-0.5" />
                <span>El costo se calculará automáticamente según tu localidad o barrio.</span>
              </p>
            </div>
          )}
        </section>
      )}

      {/* ⭐ Cupón de descuento */}
      <section className={panelCls}>
        <h4 className={panelTitleCls}>Cupón de descuento</h4>

        {!appliedCoupon ? (
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Ingresá tu código"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              disabled={couponLoading}
              className="input flex-1 min-w-0 disabled:bg-gray-100"
            />
            <button
              type="button"
              onClick={handleApplyCoupon}
              disabled={couponLoading || !couponCode.trim()}
              className="h-[48px] px-5 rounded-xl bg-[#1C1C1C] text-white font-semibold hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {couponLoading ? "Validando..." : "Aplicar"}
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-[#8BBF00]/15 border border-[#8BBF00]/40">
            <div className="min-w-0">
              <p className="text-sm font-bold text-[#3F5C00] flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                {appliedCoupon.code}
              </p>
              <p className="text-xs text-[#3F5C00]">
                Descuento aplicado: ${discountAmount.toLocaleString()}
              </p>
            </div>
            <button
              type="button"
              onClick={handleRemoveCoupon}
              className="text-xs font-semibold text-red-600 hover:text-red-800 underline shrink-0"
            >
              Quitar
            </button>
          </div>
        )}

        {couponError && (
          <p role="status" className="text-xs text-red-600 mt-2">{couponError}</p>
        )}
      </section>

      {hasPaymentMethods && (
        <section className={panelCls}>
          <h4 className={panelTitleCls}>Método de pago</h4>

          <div className="space-y-3">
            {settings.cash && (
              <button
                type="button"
                onClick={() => setPaymentMethod("cash")}
                aria-pressed={paymentMethod === "cash"}
                className={`w-full min-h-[56px] p-4 pl-4 rounded-xl flex items-center gap-3 text-left border-2 transition-all ${focusBtn} ${
                  paymentMethod === "cash"
                    ? "bg-[#F24C00] text-white border-[#D94000] shadow-md shadow-[#F24C00]/30"
                    : "bg-white text-[#1C1C1C] border-[#E5D5BF] hover:border-[#F24C00]"
                }`}
              >
                <Banknote className={`w-5 h-5 shrink-0 ${paymentMethod === "cash" ? "text-white" : "text-[#F24C00]"}`} />
                <span className="flex-1">
                  <span className="block font-semibold leading-tight">Efectivo</span>
                  <span className={`block text-xs ${paymentMethod === "cash" ? "text-white/80" : "text-[#5A564E]"}`}>
                    Abonás al recibir tu pedido
                  </span>
                </span>
                <RadioDot active={paymentMethod === "cash"} />
              </button>
            )}

            {settings.bankTransfer && (
              <button
                type="button"
                onClick={() => setPaymentMethod("transfer")}
                aria-pressed={paymentMethod === "transfer"}
                className={`w-full min-h-[56px] p-4 pl-4 rounded-xl flex items-center gap-3 text-left border-2 transition-all ${focusBtn} ${
                  paymentMethod === "transfer"
                    ? "bg-[#F24C00] text-white border-[#D94000] shadow-md shadow-[#F24C00]/30"
                    : "bg-white text-[#1C1C1C] border-[#E5D5BF] hover:border-[#F24C00]"
                }`}
              >
                <Landmark className={`w-5 h-5 shrink-0 ${paymentMethod === "transfer" ? "text-white" : "text-[#F24C00]"}`} />
                <span className="flex-1">
                  <span className="block font-semibold leading-tight">Transferencia bancaria</span>
                  <span className={`block text-xs ${paymentMethod === "transfer" ? "text-white/80" : "text-[#5A564E]"}`}>
                    Te enviamos el CBU / alias
                  </span>
                </span>
                <RadioDot active={paymentMethod === "transfer"} />
              </button>
            )}

            {settings.cards && (
              <button
                type="button"
                onClick={() => setPaymentMethod("card")}
                aria-pressed={paymentMethod === "card"}
                className={`w-full min-h-[56px] p-4 pl-4 rounded-xl flex items-center gap-3 text-left border-2 transition-all ${focusBtn} ${
                  paymentMethod === "card"
                    ? "bg-[#F24C00] text-white border-[#D94000] shadow-md shadow-[#F24C00]/30"
                    : "bg-white text-[#1C1C1C] border-[#E5D5BF] hover:border-[#F24C00]"
                }`}
              >
                <CreditCard className={`w-5 h-5 shrink-0 ${paymentMethod === "card" ? "text-white" : "text-[#F24C00]"}`} />
                <span className="flex-1">
                  <span className="block font-semibold leading-tight">Tarjeta de crédito / débito</span>
                  <span className={`block text-xs ${paymentMethod === "card" ? "text-white/80" : "text-[#5A564E]"}`}>
                    Pago seguro con Mercado Pago
                  </span>
                </span>
                <RadioDot active={paymentMethod === "card"} />
              </button>
            )}
          </div>

          {paymentMethod === "transfer" && settings.bankTransfer && (
            <div className="mt-3 p-4 rounded-xl bg-blue-50 border border-blue-200 space-y-2">
              <h4 className="font-bold text-blue-900 flex items-center gap-2">
                <Landmark className="w-5 h-5 shrink-0" />
                Datos para transferencia
              </h4>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between gap-3">
                  <span className="text-blue-900/70 shrink-0">Banco:</span>
                  <span className="font-semibold text-blue-950 text-right break-all">{config.bankName}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-blue-900/70 shrink-0">CBU:</span>
                  <span className="font-semibold text-blue-950 text-right break-all">{config.cbu}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-blue-900/70 shrink-0">Alias:</span>
                  <span className="font-semibold text-blue-950 text-right break-all">{config.alias}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-blue-900/70 shrink-0">Titular:</span>
                  <span className="font-semibold text-blue-950 text-right break-all">{config.accountHolder}</span>
                </div>
              </div>
              <p className="text-xs text-blue-800 mt-2 pt-2 border-t border-blue-200 flex items-start gap-2">
                <Lightbulb className="w-4 h-4 shrink-0 mt-0.5" />
                <span>Enviá el comprobante por WhatsApp al confirmar tu pedido.</span>
              </p>
            </div>
          )}

          {paymentMethod === "card" && settings.cards && (
            <div className="mt-3 p-4 rounded-xl bg-[#E8F6FD] border border-[#B5E0F3]">
              <h4 className="font-bold text-sky-900 mb-3 flex items-center gap-2">
                <CreditCard className="w-5 h-5 shrink-0" />
                Pago seguro con tarjeta
              </h4>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-sky-900">
                  <Lock className="w-5 h-5 shrink-0" />
                  <p>Procesado de forma segura por Mercado Pago</p>
                </div>
                <ul className="text-xs text-sky-900 space-y-1.5">
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 shrink-0" /> Todas las tarjetas de crédito y débito</li>
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 shrink-0" /> Pago en cuotas disponible</li>
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 shrink-0" /> Transacción 100% segura y encriptada</li>
                  <li className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 shrink-0" /> Certificado SSL y PCI Compliance</li>
                </ul>
                <div className="pt-2 border-t border-[#B5E0F3]">
                  <p className="text-xs text-sky-900 font-medium">
                    Serás redirigido a la plataforma segura de Mercado Pago para completar el pago.
                  </p>
                </div>
              </div>
            </div>
          )}

          {paymentMethod !== "card" && paymentMethod && (
            <div className="mt-4">
              <label htmlFor="payment-ref" className={labelCls}>
                Referencia de pago{" "}
                <span className="font-normal text-[#5A564E]">(opcional)</span>
              </label>
              <input
                id="payment-ref"
                type="text"
                placeholder="Ej: N° de comprobante, nombre del titular"
                value={paymentReference}
                onChange={(e) => setPaymentReference(e.target.value)}
                className="input"
              />
            </div>
          )}
        </section>
      )}

      {/* Resumen de totales */}
      <div className="border-t-2 border-[#F2E4CF] pt-4 space-y-2.5">
        <div className="flex justify-between items-center gap-2">
          <span className="text-[#5A564E]">Productos</span>
          <span className="font-bold text-[#1C1C1C] text-right">
            ${total.toLocaleString()}
          </span>
        </div>

        {appliedCoupon && discountAmount > 0 && (
          <div className="flex justify-between items-center gap-2 text-[#3F5C00]">
            <span>Descuento ({appliedCoupon.code})</span>
            <span className="font-bold text-right">
              -${discountAmount.toLocaleString()}
            </span>
          </div>
        )}

        <div className="flex justify-between items-center gap-2">
          <span className="text-[#5A564E]">Envío</span>
          <span className="font-bold text-[#1C1C1C] text-right">
            {shippingCost === 0 && fulfillmentMethod === "pickup"
              ? "Gratis"
              : `$${shippingCost.toLocaleString()}`}
          </span>
        </div>

        <div className="flex justify-between items-center pt-2.5 border-t border-[#F2E4CF]">
          <span className="text-lg font-bold text-[#1C1C1C]">Total</span>
          <span className="text-2xl font-extrabold text-[#F24C00]">
            ${finalTotal.toLocaleString()}
          </span>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || !hasPaymentMethods || couponLoading}
        className="w-full min-h-[52px] py-4 px-4 rounded-xl bg-[#F24C00] text-white font-bold text-lg shadow-lg shadow-[#F24C00]/25 hover:bg-[#D94000] active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 flex items-center justify-center gap-2 focus-visible:ring-4 focus-visible:ring-[#F24C00]/40 outline-none"
      >
        {loading ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            {paymentMethod === "card" ? "Redirigiendo a Mercado Pago..." : "Procesando..."}
          </>
        ) : (
          <>
            {paymentMethod === "card" && <Lock className="w-5 h-5 shrink-0" />}
            {paymentMethod === "card" ? "Pagar con tarjeta" : "Confirmar pedido"}
            {" - $"}
            {finalTotal.toLocaleString()}
          </>
        )}
      </button>

      {paymentMethod === "card" && (
        <p className="text-xs text-center text-[#5A564E] flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          Tus datos de pago son procesados de forma segura. No almacenamos información de tarjetas.
        </p>
      )}
    </form>
  );
}

function RadioDot({ active }) {
  return (
    <span
      aria-hidden="true"
      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
        active ? "border-white" : "border-[#C9BBA5]"
      }`}
    >
      <span className={`w-2.5 h-2.5 rounded-full transition-colors ${active ? "bg-white" : "bg-transparent"}`} />
    </span>
  );
}