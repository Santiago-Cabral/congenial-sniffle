import { X, Mail, Phone, MapPin, Package } from "lucide-react";

function formatMoney(v) {
  const n = Number(v) || 0;
  return n.toLocaleString("es-AR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

function formatDate(value) {
  if (!value) return "-";
  const d = new Date(value);
  if (isNaN(d.getTime())) return value; // por si viene ya formateado
  return d.toLocaleDateString("es-AR");
}

export default function ClientDetailsModal({ client, onClose }) {
  if (!client) return null;

  // 🔹 Historial de órdenes: si viene del backend lo usamos,
  // si no, dejamos los mocks que tenías antes.
  const orderHistory = Array.isArray(client.orderHistory)
    ? client.orderHistory
    : [
        { id: 1234, date: "14/1/2024", amount: 3500, status: "Entregado" },
        { id: 1189, date: "7/1/2024", amount: 2800, status: "Entregado" },
        { id: 1145, date: "27/12/2023", amount: 4200, status: "Entregado" },
      ];

  const realName = client.name || client.fullName || "Cliente / Usuario";

  // 🔹 Stats dinámicas:
  const totalOrdersFromHistory = orderHistory.length;
  const totalAmountFromHistory = orderHistory.reduce(
    (acc, o) => acc + (Number(o.amount) || 0),
    0
  );

  const totalCompras =
    client.ordersCount ??
    client.orders ??
    totalOrdersFromHistory;

  const totalGastado =
    client.totalSpent ??
    totalAmountFromHistory;

  const promedioTicket =
    client.averageTicket ??
    (totalCompras > 0 ? totalGastado / totalCompras : 0);

  // Última compra: desde client o desde el historial
  const lastOrderDate =
    client.lastOrderDate ??
    (orderHistory[0]?.date || null);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[#1C1C1C]">
              Detalles del Cliente-Usuario
            </h2>
            <p className="text-sm text-[#5A564E] mt-1">
              Información completa y historial de compras
            </p>
            <p className="text-sm font-semibold text-[#1C1C1C] mt-2">
              {realName}
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
                    {client.email || "sin-email@correo.com"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone size={20} className="text-[#5A564E] mt-1" />
                <div>
                  <p className="text-sm text-[#5A564E] mb-1">Teléfono</p>
                  <p className="font-semibold text-[#1C1C1C]">
                    {client.phone || "Sin teléfono registrado"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin size={20} className="text-[#5A564E] mt-1" />
                <div>
                  <p className="text-sm text-[#5A564E] mb-1">Dirección</p>
                  <p className="font-semibold text-[#1C1C1C]">
                    {client.address || "Sin dirección registrada"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <p className="text-sm text-[#5A564E] mb-2">Total Compras</p>
              <p className="text-3xl font-extrabold text-[#1C1C1C]">
                {totalCompras || 0}
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <p className="text-sm text-[#5A564E] mb-2">Total Gastado</p>
              <p className="text-3xl font-extrabold text-[#1C1C1C]">
                ${formatMoney(totalGastado || 0)}
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <p className="text-sm text-[#5A564E] mb-2">Promedio</p>
              <p className="text-3xl font-extrabold text-[#1C1C1C]">
                ${formatMoney(promedioTicket || 0)}
              </p>
            </div>
          </div>

          {/* Última compra (pequeño extra info) */}
          {lastOrderDate && (
            <p className="text-sm text-[#5A564E]">
              Última compra:{" "}
              <span className="font-semibold text-[#1C1C1C]">
                {formatDate(lastOrderDate)}
              </span>
            </p>
          )}

          {/* Historial de Órdenes */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Package size={24} className="text-[#1C1C1C]" />
              <h3 className="text-xl font-bold text-[#1C1C1C]">
                Historial de Órdenes
              </h3>
            </div>

            {orderHistory.length === 0 ? (
              <p className="text-sm text-[#5A564E]">
                Este cliente-usuario aún no tiene órdenes registradas.
              </p>
            ) : (
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
                      <p className="text-sm text-[#5A564E]">
                        {formatDate(order.date)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-[#1C1C1C] mb-1">
                        ${formatMoney(order.amount)}
                      </p>
                      <span className="inline-block px-3 py-1 bg-[#F24C00] text-white text-xs font-semibold rounded-full">
                        {order.status || "Entregado"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
