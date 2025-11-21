import { X } from "lucide-react";
import { useState } from "react";

export default function OrderDetailsModal({ order, onClose }) {
  const [status, setStatus] = useState(order?.status || "Completado");
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  const statusOptions = ["Pendiente", "En proceso", "Completado", "Cancelado"];

  const handleUpdateStatus = () => {
    // Aquí iría la lógica para actualizar el estado en la API
    console.log("Actualizando estado a:", status);
    alert(`Estado actualizado a: ${status}`);
  };

  if (!order) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[#1C1C1C]">
              Detalles de la Orden #{order.id}
            </h2>
            <p className="text-sm text-[#5A564E] mt-1">
              Información completa de la orden
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Estado de la Orden */}
          <div className="bg-red-500 rounded-xl p-6 relative">
            <label className="block text-white font-semibold mb-3">
              Estado de la Orden
            </label>
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <button
                  onClick={() => setShowStatusMenu(!showStatusMenu)}
                  className="w-full px-4 py-3 bg-white/20 border-2 border-white/30 rounded-xl text-white font-semibold text-left hover:bg-white/30 transition"
                >
                  {status}
                </button>
                
                {showStatusMenu && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl overflow-hidden z-10">
                    {statusOptions.map((option) => (
                      <button
                        key={option}
                        onClick={() => {
                          setStatus(option);
                          setShowStatusMenu(false);
                        }}
                        className={`w-full px-4 py-3 text-left hover:bg-gray-100 transition ${
                          status === option
                            ? "bg-red-500 text-white font-semibold"
                            : "text-[#1C1C1C]"
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              <button
                onClick={handleUpdateStatus}
                className="px-6 py-3 bg-[#F24C00] text-white font-bold rounded-xl hover:brightness-110 transition shadow-lg"
              >
                Actualizar Estado
              </button>
            </div>
          </div>

          {/* Información del Cliente */}
          <div>
            <h3 className="text-xl font-bold text-[#1C1C1C] mb-4">
              Información del Cliente
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-[#5A564E] mb-1">Nombre:</p>
                <p className="font-semibold text-[#1C1C1C]">
                  {order.clientName || "María González"}
                </p>
              </div>
              <div>
                <p className="text-sm text-[#5A564E] mb-1">Email:</p>
                <p className="font-semibold text-[#1C1C1C]">
                  {order.email || "maria@example.com"}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-[#5A564E] mb-1">Teléfono:</p>
                <p className="font-semibold text-[#1C1C1C]">
                  {order.phone || "+54 9 11 1234-5678"}
                </p>
              </div>
            </div>
          </div>

          {/* Dirección de Envío */}
          <div>
            <h3 className="text-xl font-bold text-[#1C1C1C] mb-4">
              Dirección de Envío
            </h3>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-[#1C1C1C]">Av. Principal 123</p>
              <p className="text-[#1C1C1C]">Villa Carmela, Buenos Aires</p>
              <p className="text-[#1C1C1C]">CP: 1234</p>
            </div>
          </div>

          {/* Productos */}
          <div>
            <h3 className="text-xl font-bold text-[#1C1C1C] mb-4">
              Productos
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-semibold text-[#1C1C1C]">
                    Proteína Whey Chocolate
                  </p>
                  <p className="text-sm text-[#5A564E]">Cantidad: 2</p>
                </div>
                <p className="font-bold text-[#1C1C1C]">$25.000</p>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-semibold text-[#1C1C1C]">
                    Vitamina C 1000mg
                  </p>
                  <p className="text-sm text-[#5A564E]">Cantidad: 1</p>
                </div>
                <p className="font-bold text-[#1C1C1C]">$2.300</p>
              </div>
            </div>

            {/* Totales */}
            <div className="mt-6 space-y-3 pt-4 border-t border-gray-200">
              <div className="flex justify-between text-[#5A564E]">
                <span>Subtotal:</span>
                <span className="font-semibold">$27.300</span>
              </div>
              <div className="flex justify-between text-[#5A564E]">
                <span>Envío:</span>
                <span className="font-semibold">$1.500</span>
              </div>
              <div className="flex justify-between text-2xl font-extrabold text-[#1C1C1C] pt-3 border-t border-gray-300">
                <span>Total:</span>
                <span>$28.800</span>
              </div>
            </div>
          </div>

          {/* Método de Pago */}
          <div className="bg-red-500 rounded-xl p-6">
            <p className="text-white/80 text-sm mb-2">Método de Pago</p>
            <p className="text-white font-bold text-xl">Tarjeta de Crédito</p>
          </div>
        </div>
      </div>
    </div>
  );
}