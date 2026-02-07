import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { getPaymentStatus } from "../admin/services/apiService";
import { useCart } from "../Context/CartContext";

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { clearCart } = useCart();

  const [status, setStatus] = useState("validating"); // validating, success, error, expired
  const [paymentData, setPaymentData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    validatePayment();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const validatePayment = async () => {
    try {
      console.log("🔍 [PAYMENT-SUCCESS] Validando pago...");

      // ===== 1. OBTENER DATOS DE SESSIONSTORAGE =====
      const storedTxId = sessionStorage.getItem("payway_tx_id");
      const storedTimestamp = sessionStorage.getItem("payway_tx_timestamp");
      const storedSaleId = sessionStorage.getItem("payway_sale_id");
      const storedAmount = sessionStorage.getItem("payway_amount");

      console.log("📦 [PAYMENT-SUCCESS] Datos almacenados:", {
        storedTxId,
        storedSaleId,
        storedAmount,
        timestamp: storedTimestamp
      });

      // ===== 2. VALIDAR QUE EXISTAN LOS DATOS =====
      if (!storedTxId) {
        console.error("❌ [PAYMENT-SUCCESS] No se encontró transactionId en sessionStorage");
        setStatus("error");
        setError("No se pudo verificar el pago. Por favor contacte a soporte.");
        return;
      }

      // ===== 3. VALIDAR TIEMPO DE EXPIRACIÓN (30 minutos) =====
      const timestamp = parseInt(storedTimestamp || "0");
      const age = Date.now() - timestamp;
      const maxAge = 30 * 60 * 1000; // 30 minutos

      if (age > maxAge) {
        console.warn("⏰ [PAYMENT-SUCCESS] Sesión expirada");
        setStatus("expired");
        setError("La sesión de pago ha expirado. Por favor contacte a soporte.");
        return;
      }

      // ===== 4. CONSULTAR ESTADO REAL A LA API =====
      console.log("🌐 [PAYMENT-SUCCESS] Consultando estado a la API...");
      
      let paymentStatus;
      let attempts = 0;
      const maxAttempts = 3;

      // Reintentar hasta 3 veces con delay (por si el webhook aún no llegó)
      while (attempts < maxAttempts) {
        try {
          paymentStatus = await getPaymentStatus(storedTxId);
          
          if (paymentStatus && paymentStatus.status) {
            break; // Éxito, salir del loop
          }

          // Si no hay status, esperar y reintentar
          attempts++;
          if (attempts < maxAttempts) {
            console.log(`⏳ [PAYMENT-SUCCESS] Reintentando... (${attempts}/${maxAttempts})`);
            await new Promise(resolve => setTimeout(resolve, 2000)); // Esperar 2 segundos
          }
        } catch (err) {
          attempts++;
          if (attempts >= maxAttempts) {
            throw err;
          }
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      if (!paymentStatus) {
        throw new Error("No se pudo obtener el estado del pago");
      }

      console.log("✅ [PAYMENT-SUCCESS] Estado recibido:", paymentStatus);

      // ===== 5. VERIFICAR ESTADO DEL PAGO =====
      const normalizedStatus = (paymentStatus.status || "").toLowerCase();

      if (normalizedStatus === "approved") {
        // ✅ PAGO APROBADO
        setStatus("success");
        setPaymentData({
          transactionId: storedTxId,
          saleId: storedSaleId,
          amount: storedAmount,
          status: paymentStatus.status,
          statusDetail: paymentStatus.statusDetail,
          completedAt: paymentStatus.completedAt
        });

        // Limpiar carrito y sessionStorage
        clearCart();
        sessionStorage.removeItem("payway_tx_id");
        sessionStorage.removeItem("payway_tx_timestamp");
        sessionStorage.removeItem("payway_sale_id");
        sessionStorage.removeItem("payway_amount");

        console.log("✅ [PAYMENT-SUCCESS] Pago aprobado exitosamente");

      } else if (normalizedStatus === "pending") {
        // ⏳ PAGO PENDIENTE (raro en este punto, pero posible)
        setStatus("validating");
        setError("Tu pago está siendo procesado. Por favor espera unos momentos...");
        
        // Reintentar después de 3 segundos
        setTimeout(() => {
          validatePayment();
        }, 3000);

      } else {
        // ❌ PAGO RECHAZADO O ERROR
        setStatus("error");
        setError(paymentStatus.statusDetail || "El pago no pudo ser procesado");
        console.error("❌ [PAYMENT-SUCCESS] Pago no aprobado:", normalizedStatus);
      }

    } catch (err) {
      console.error("❌ [PAYMENT-SUCCESS] Error validando pago:", err);
      setStatus("error");
      setError(err.message || "Error al verificar el pago. Por favor contacte a soporte.");
    }
  };

  // ===== PANTALLA DE VALIDACIÓN =====
  if (status === "validating") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Spinner animado */}
          <div className="mb-6">
            <div className="w-20 h-20 border-4 border-[#F24C00] border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Validando tu pago...
          </h2>
          
          <p className="text-gray-600 mb-4">
            Por favor espera mientras confirmamos tu transacción
          </p>

          {error && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">{error}</p>
            </div>
          )}

          <div className="mt-6 pt-6 border-t">
            <p className="text-xs text-gray-500">
              Este proceso puede tomar unos segundos...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ===== PANTALLA DE ÉXITO =====
  if (status === "success") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Ícono de éxito */}
          <div className="mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <svg
                className="w-12 h-12 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            ¡Pago exitoso!
          </h2>

          <p className="text-gray-600 mb-6">
            Tu pago ha sido procesado correctamente
          </p>

          {/* Información del pago */}
          {paymentData && (
            <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-3">
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-sm text-gray-600">N° de Pedido</span>
                <span className="font-bold text-[#F24C00] text-lg">
                  #{paymentData.saleId}
                </span>
              </div>

              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-sm text-gray-600">Monto</span>
                <span className="font-bold text-gray-900 text-lg">
                  ${Number(paymentData.amount).toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Transacción</span>
                <span className="font-mono text-xs text-gray-700">
                  {paymentData.transactionId?.substring(0, 20)}...
                </span>
              </div>
            </div>
          )}

          {/* Información adicional */}
          <div className="bg-blue-50 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <span className="text-2xl">📧</span>
              <div className="text-left">
                <p className="text-sm font-medium text-blue-900 mb-1">
                  Confirmación enviada
                </p>
                <p className="text-xs text-blue-700">
                  Recibirás un email con los detalles de tu pedido y el comprobante de pago
                </p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <span className="text-2xl">📦</span>
              <div className="text-left">
                <p className="text-sm font-medium text-green-900 mb-1">
                  Próximos pasos
                </p>
                <p className="text-xs text-green-700">
                  Nos contactaremos contigo pronto para coordinar la entrega de tu pedido
                </p>
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="space-y-3">
            <button
              onClick={() => navigate("/")}
              className="w-full py-3 rounded-xl bg-[#F24C00] text-white font-bold hover:bg-[#D94000] transition-colors"
            >
              Volver al inicio
            </button>

            <button
              onClick={() => navigate("/products")}
              className="w-full py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
            >
              Seguir comprando
            </button>
          </div>

          {/* Footer */}
          <div className="mt-6 pt-6 border-t">
            <p className="text-xs text-gray-500">
              ¿Tenés alguna consulta? Contactanos por WhatsApp
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ===== PANTALLA DE ERROR O EXPIRACIÓN =====
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* Ícono de error */}
        <div className="mb-6">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <svg
              className="w-12 h-12 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
        </div>

        <h2 className="text-3xl font-bold text-gray-900 mb-3">
          {status === "expired" ? "Sesión expirada" : "No se pudo verificar el pago"}
        </h2>

        <p className="text-gray-600 mb-6">
          {error || "Por favor contacta a nuestro equipo de soporte con el código de tu transacción"}
        </p>

        {/* Información de contacto */}
        <div className="bg-yellow-50 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💬</span>
            <div className="text-left">
              <p className="text-sm font-medium text-yellow-900 mb-1">
                Necesitás ayuda?
              </p>
              <p className="text-xs text-yellow-700">
                Contactanos por WhatsApp y te ayudaremos a verificar tu pago
              </p>
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="space-y-3">
          <button
            onClick={() => navigate("/")}
            className="w-full py-3 rounded-xl bg-[#F24C00] text-white font-bold hover:bg-[#D94000] transition-colors"
          >
            Volver al inicio
          </button>

          <button
            onClick={() => window.location.href = "https://wa.me/5493815000000"}
            className="w-full py-3 rounded-xl border-2 border-green-500 text-green-700 font-semibold hover:bg-green-50 transition-colors flex items-center justify-center gap-2"
          >
            <span>📱</span>
            Contactar por WhatsApp
          </button>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-6 border-t">
          <p className="text-xs text-gray-500">
            Guardá el número de tu transacción para consultas
          </p>
        </div>
      </div>
    </div>
  );
}