import { X, Mail, Phone, MapPin, Package } from "lucide-react";

export default function ClientDetailsModal({ client, onClose }) {
  if (!client) return null;

  const orderHistory = [
    { id: 1234, date: "14/1/2024", amount: 3500, status: "Entregado" },
    { id: 1189, date: "7/1/2024", amount: 2800, status: "Entregado" },
    { id: 1145, date: "27/12/2023", amount: 4200, status: "Entregado" }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[#1C1C1C]">
              Detalles del Cliente
            </h2>
            <p className="text-sm text-[#5A564E] mt-1">
              Información completa y historial de compras
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
          {/* Información Personal */}
          <div>
            <h3 className="text-xl font-bold text-[#1C1C1C] mb-4">
              Información Personal
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail size={20} className="text-[#5A564E] mt-1" />
                <div>
                  <p className="text-sm text-[#5A564E] mb-1">Email</p>
                  <p className="font-semibold text-[#1C1C1C]">
                    {client.email || "maria.gonzalez@email.com"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone size={20} className="text-[#5A564E] mt-1" />
                <div>
                  <p className="text-sm text-[#5A564E] mb-1">Teléfono</p>
                  <p className="font-semibold text-[#1C1C1C]">
                    {client.phone || "+54 9 11 2345-6789"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin size={20} className="text-[#5A564E] mt-1" />
                <div>
                  <p className="text-sm text-[#5A564E] mb-1">Dirección</p>
                  <p className="font-semibold text-[#1C1C1C]">
                    {client.address || "Av. Corrientes 1234, Villa Carmela"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <p className="text-sm text-[#5A564E] mb-2">Total Compras</p>
              <p className="text-3xl font-extrabold text-[#1C1C1C]">15</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <p className="text-sm text-[#5A564E] mb-2">Total Gastado</p>
              <p className="text-3xl font-extrabold text-[#1C1C1C]">
                $45.000
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <p className="text-sm text-[#5A564E] mb-2">Promedio</p>
              <p className="text-3xl font-extrabold text-[#1C1C1C]">
                $3.000
              </p>
            </div>
          </div>

          {/* Historial de Órdenes */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Package size={24} className="text-[#1C1C1C]" />
              <h3 className="text-xl font-bold text-[#1C1C1C]">
                Historial de Órdenes
              </h3>
            </div>

            <div className="space-y-3">
              {orderHistory.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition"
                >
                  <div>
                    <p className="font-bold text-[#1C1C1C] mb-1">
                      #{order.id}
                    </p>
                    <p className="text-sm text-[#5A564E]">{order.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[#1C1C1C] mb-1">
                      ${order.amount.toLocaleString()}
                    </p>
                    <span className="inline-block px-3 py-1 bg-[#F24C00] text-white text-xs font-semibold rounded-full">
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}