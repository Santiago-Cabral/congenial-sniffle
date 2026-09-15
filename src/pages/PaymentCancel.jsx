import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function PaymentCancel() {
  const navigate = useNavigate();

  useEffect(() => {
    // Limpiar datos de la sesión de pago (mp_* actuales + payway_* legacy)
    ["mp_tx_id", "mp_tx_timestamp", "mp_sale_id", "mp_amount",
     "mp_transactionId", "mp_checkoutId",
     "payway_tx_id", "payway_tx_timestamp", "payway_sale_id", "payway_amount",
     "payway_transactionId", "payway_checkoutId"].forEach((k) => sessionStorage.removeItem(k));

    console.log("🚫 [PAYMENT-CANCEL] Usuario canceló el pago");
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* Ícono de cancelación */}
        <div className="mb-6">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
            <svg
              className="w-12 h-12 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
        </div>

        <h2 className="text-3xl font-bold text-gray-900 mb-3">
          Pago cancelado
        </h2>

        <p className="text-gray-600 mb-6">
          Has cancelado el proceso de pago. No se realizó ningún cargo a tu tarjeta.
        </p>

        {/* Información del carrito */}
        <div className="bg-blue-50 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🛒</span>
            <div className="text-left">
              <p className="text-sm font-medium text-blue-900 mb-1">
                Tu carrito sigue disponible
              </p>
              <p className="text-xs text-blue-700">
                Los productos que agregaste están guardados. Podés volver a intentar el pago cuando quieras.
              </p>
            </div>
          </div>
        </div>

        {/* Opciones alternativas de pago */}
        <div className="bg-yellow-50 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💡</span>
            <div className="text-left">
              <p className="text-sm font-medium text-yellow-900 mb-1">
                Otras formas de pago
              </p>
              <p className="text-xs text-yellow-700">
                También podés pagar con transferencia bancaria o en efectivo al retirar
              </p>
            </div>
          </div>
        </div>

        {/* Razones comunes de cancelación */}
        <div className="text-left mb-6">
          <p className="text-sm font-semibold text-gray-700 mb-2">
            ¿Por qué cancelaste?
          </p>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• ¿Querés revisar tu pedido antes de pagar?</li>
            <li>• ¿Preferís otro método de pago?</li>
            <li>• ¿Tenés dudas sobre el proceso?</li>
          </ul>
          <p className="text-xs text-gray-500 mt-2">
            Contactanos y te ayudamos con cualquier consulta
          </p>
        </div>

        {/* Botones de acción */}
        <div className="space-y-3">
          <button
            onClick={() => {
              // Abrir el carrito (esto requiere que implementes una forma de comunicarte con el componente del carrito)
              // Por ahora solo navegamos al home
              navigate("/");
              // Podrías hacer: window.dispatchEvent(new Event('openCart'))
            }}
            className="w-full py-3 rounded-xl bg-[#F24C00] text-white font-bold hover:bg-[#D94000] transition-colors"
          >
            Volver al carrito
          </button>

          <button
            onClick={() => navigate("/")}
            className="w-full py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
          >
            Ir al inicio
          </button>

          <button
            onClick={() => navigate("/products")}
            className="w-full py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
          >
            Seguir comprando
          </button>
        </div>

        {/* Ayuda */}
        <div className="mt-6 pt-6 border-t">
          <p className="text-xs text-gray-500 mb-3">
            ¿Tenés alguna consulta o problema?
          </p>
          <button
            onClick={() => window.location.href = "https://wa.me/5493815000000"}
            className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center justify-center gap-2 mx-auto"
          >
            <span>📱</span>
            Contactanos por WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
}