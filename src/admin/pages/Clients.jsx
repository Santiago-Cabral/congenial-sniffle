import { useState, useEffect } from "react";
import { Search, Eye, Phone, Mail, MapPin } from "lucide-react";
import { listClients } from "../services/apiService";
import ClientDetailsModal from "./ClientDetailsModal";

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClient, setSelectedClient] = useState(null);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const data = await listClients();
        setClients(data || []);
      } catch (error) {
        console.error("Error loading clients:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  const filteredClients = clients.filter((client) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      (client.name || "").toLowerCase().includes(searchLower) ||
      (client.email || "").toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#F24C00] border-t-transparent mb-4"></div>
          <p className="text-[#5A564E]">Cargando clientes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-[#1C1C1C] mb-2">
          Clientes
        </h1>
        <p className="text-[#5A564E]">
          Gestiona la información de tus clientes
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-[#5A564E] mb-2">
            Total Clientes
          </h3>
          <p className="text-4xl font-extrabold text-[#1C1C1C] mb-1">4</p>
          <p className="text-xs text-[#5A564E]">Clientes registrados</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-[#5A564E] mb-2">
            Compras Totales
          </h3>
          <p className="text-4xl font-extrabold text-[#1C1C1C] mb-1">50</p>
          <p className="text-xs text-[#5A564E]">Órdenes realizadas</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-[#5A564E] mb-2">
            Ingresos Totales
          </h3>
          <p className="text-4xl font-extrabold text-[#1C1C1C] mb-1">
            $155.000
          </p>
          <p className="text-xs text-[#5A564E]">De todos los clientes</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="relative">
          <Search
            size={20}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5A564E]"
          />
          <input
            type="search"
            placeholder="Buscar por nombre o email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#F24C00] focus:ring-4 focus:ring-[#F24C00]/10 transition outline-none"
          />
        </div>
      </div>

      {/* Clients Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-[#1C1C1C]">
            Lista de Clientes
          </h2>
          <p className="text-sm text-[#5A564E] mt-1">
            {filteredClients.length} clientes encontrados
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#1C1C1C]">
                  Cliente
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#1C1C1C]">
                  Contacto
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#1C1C1C]">
                  Compras
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#1C1C1C]">
                  Total Gastado
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#1C1C1C]">
                  Última Compra
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#1C1C1C]">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredClients.map((client) => (
                <tr
                  key={client.id}
                  className="hover:bg-gray-50 transition"
                >
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-semibold text-[#1C1C1C]">
                        {client.name || "María González"}
                      </p>
                      <p className="text-sm text-[#5A564E]">
                        {client.email || "maria.gonzalez@email.com"}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-[#5A564E]">
                      <Phone size={16} />
                      <span className="text-sm">
                        {client.phone || "+54 9 11 2345-6789"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-block px-3 py-1 bg-[#8BBF00] text-white text-xs font-bold rounded-full">
                      {client.orders || 15} órdenes
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-[#1C1C1C]">
                      ${(client.totalSpent || 45000).toLocaleString()}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-[#5A564E]">14/1/2024</p>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => setSelectedClient(client)}
                      className="flex items-center gap-2 text-[#F24C00] font-semibold hover:underline"
                    >
                      <Eye size={18} />
                      Ver Detalles
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {selectedClient && (
        <ClientDetailsModal
          client={selectedClient}
          onClose={() => setSelectedClient(null)}
        />
      )}
    </div>
  );
}