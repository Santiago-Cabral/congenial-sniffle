// src/admin/pages/Clients.jsx
import { useState, useEffect } from "react";
import {
  Search,
  Eye,
  Phone,
  Mail,
  MapPin,
  Plus,
  Trash2,
} from "lucide-react";
import { listClients, deleteClient } from "../services/apiService";
import ClientDetailsModal from "./ClientDetailsModal";
import ClientFormModal from "./ClientFormModal";

function formatMoney(value) {
  const n = Number(value) || 0;
  return n.toLocaleString("es-AR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("es-AR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClient, setSelectedClient] = useState(null);
  const [filterType, setFilterType] = useState("ALL"); // ALL | HAS_ORDERS | NO_ORDERS
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");

  // ==========================
  // Cargar clientes
  // ==========================
  const fetchClients = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await listClients();
      setClients(data || []);
    } catch (error) {
      console.error("Error loading clients:", error);
      setError(error.message || "Error al cargar clientes-usuarios");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  // ==========================
  // Stats calculados
  // ==========================
  const totalClients = clients.length;

  const totalOrders = clients.reduce((acc, c) => {
    const amount = Number(c.amount ?? 0);
    const ordersFromApi = Number(c.ordersCount ?? c.orders ?? 0);
    if (!isNaN(ordersFromApi) && ordersFromApi > 0) {
      return acc + ordersFromApi;
    }
    // Si no viene ordersCount pero tiene Amount > 0, al menos 1 compra
    return acc + (amount > 0 ? 1 : 0);
  }, 0);

  const totalRevenue = clients.reduce(
    (acc, c) => acc + Number(c.totalSpent ?? c.amount ?? 0),
    0
  );

  // ==========================
  // Filtrado por búsqueda + tipo
  // ==========================
  const filteredClients = clients.filter((client) => {
    const name =
      client.fullName || client.name || "Persona sin nombre";
    const email = client.email || "";
    const searchLower = searchQuery.toLowerCase();

    const matchesSearch =
      name.toLowerCase().includes(searchLower) ||
      email.toLowerCase().includes(searchLower);

    // Compras
    const amount = Number(client.amount ?? 0);
    const ordersFromApi = Number(client.ordersCount ?? client.orders ?? 0);
    const ordersCount =
      !isNaN(ordersFromApi) && ordersFromApi > 0
        ? ordersFromApi
        : amount > 0
        ? 1
        : 0;

    let matchesFilter = true;
    if (filterType === "HAS_ORDERS") {
      matchesFilter = ordersCount > 0;
    } else if (filterType === "NO_ORDERS") {
      matchesFilter = ordersCount === 0;
    }

    return matchesSearch && matchesFilter;
  });

  // ==========================
  // Eliminar cliente
  // ==========================
  const handleDeleteClient = async (id) => {
    const client = clients.find((c) => c.id === id);
    const name = client?.fullName || client?.name || "este cliente-usuario";

    const ok = window.confirm(
      `¿Seguro que quieres eliminar a ${name}? Esta acción no se puede deshacer.`
    );
    if (!ok) return;

    try {
      setDeletingId(id);
      setError("");
      await deleteClient(id);
      await fetchClients();
    } catch (err) {
      console.error("Error eliminando cliente:", err);
      setError(err.message || "Error al eliminar el cliente-usuario");
    } finally {
      setDeletingId(null);
    }
  };

  // ==========================
  // Cuando se crea un nuevo cliente
  // ==========================
  const handleClientCreated = async () => {
    await fetchClients();
    setShowCreateModal(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#F24C00] border-t-transparent mb-4"></div>
          <p className="text-[#5A564E]">Cargando clientes-usuarios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#1C1C1C] mb-2">
            Clientes & Usuarios
          </h1>
          <p className="text-[#5A564E]">
            Gestiona la información de las personas que compran o usan el
            sistema
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#F24C00] text-white font-semibold shadow hover:brightness-110 transition text-sm"
        >
          <Plus size={18} />
          Nuevo cliente / usuario
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-[#5A564E] mb-2">
            Total Personas
          </h3>
          <p className="text-4xl font-extrabold text-[#1C1C1C] mb-1">
            {totalClients}
          </p>
          <p className="text-xs text-[#5A564E]">
            Clientes / usuarios registrados
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-[#5A564E] mb-2">
            Compras Totales
          </h3>
          <p className="text-4xl font-extrabold text-[#1C1C1C] mb-1">
            {totalOrders}
          </p>
          <p className="text-xs text-[#5A564E]">
            Órdenes realizadas por estas personas
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-[#5A564E] mb-2">
            Ingresos Totales
          </h3>
          <p className="text-4xl font-extrabold text-[#1C1C1C] mb-1">
            ${formatMoney(totalRevenue)}
          </p>
          <p className="text-xs text-[#5A564E]">
            Sumando todas las compras registradas
          </p>
        </div>
      </div>

      {/* Error global */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-2xl">
          {error}
        </div>
      )}

      {/* Search + Filtros */}
      <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
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

        <div className="flex flex-wrap gap-2">
          {[
            { code: "ALL", label: "Todos" },
            { code: "HAS_ORDERS", label: "Con compras" },
            { code: "NO_ORDERS", label: "Sin compras" },
          ].map((f) => {
            const active = filterType === f.code;
            return (
              <button
                key={f.code}
                type="button"
                onClick={() => setFilterType(f.code)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
                  active
                    ? "bg-[#F24C00] text-white border-[#F24C00]"
                    : "bg-white text-[#1C1C1C] border-gray-300 hover:border-[#F24C00]"
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Clients Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-[#1C1C1C]">
            Lista de Clientes-Usuarios
          </h2>
          <p className="text-sm text-[#5A564E] mt-1">
            {filteredClients.length} personas encontradas
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#1C1C1C]">
                  Cliente / Usuario
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
              {filteredClients.map((client) => {
                const name =
                  client.fullName || client.name || "Persona sin nombre";
                const email = client.email || "Sin email";
                const phone = client.phone || "Sin teléfono";

                const amount = Number(client.amount ?? 0);
                const ordersFromApi = Number(
                  client.ordersCount ?? client.orders ?? 0
                );
                const ordersCount =
                  !isNaN(ordersFromApi) && ordersFromApi > 0
                    ? ordersFromApi
                    : amount > 0
                    ? 1
                    : 0;

                const totalSpent = Number(
                  client.totalSpent ?? client.amount ?? 0
                );

                const lastPurchase = formatDate(
                  client.lastPurchaseAt ||
                    client.lastSaleAt ||
                    client.creationDate
                );

                return (
                  <tr
                    key={client.id}
                    className="hover:bg-gray-50 transition"
                  >
                    {/* Cliente / Usuario */}
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-[#1C1C1C]">
                          {name}
                        </p>
                        <p className="text-sm text-[#5A564E] flex items-center gap-1">
                          <Mail size={14} />
                          <span>{email}</span>
                        </p>
                      </div>
                    </td>

                    {/* Contacto */}
                    <td className="px-6 py-4">
                      <div className="space-y-1 text-sm text-[#5A564E]">
                        <div className="flex items-center gap-2">
                          <Phone size={16} />
                          <span>{phone}</span>
                        </div>
                        {client.address && (
                          <div className="flex items-center gap-2">
                            <MapPin size={16} />
                            <span className="truncate max-w-[220px]">
                              {client.address}
                            </span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Compras */}
                    <td className="px-6 py-4">
                      <span className="inline-block px-3 py-1 bg-[#8BBF00] text-white text-xs font-bold rounded-full">
                        {ordersCount} orden
                        {ordersCount === 1 ? "" : "es"}
                      </span>
                    </td>

                    {/* Total gastado */}
                    <td className="px-6 py-4">
                      <p className="font-bold text-[#1C1C1C]">
                        ${formatMoney(totalSpent)}
                      </p>
                    </td>

                    {/* Última compra */}
                    <td className="px-6 py-4">
                      <p className="text-sm text-[#5A564E]">
                        {lastPurchase}
                      </p>
                    </td>

                    {/* Acciones */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setSelectedClient(client)}
                          className="flex items-center gap-2 text-[#F24C00] font-semibold hover:underline text-sm"
                        >
                          <Eye size={18} />
                          Ver Detalles
                        </button>

                        <button
                          onClick={() => handleDeleteClient(client.id)}
                          disabled={deletingId === client.id}
                          className="flex items-center gap-1 text-xs text-red-600 hover:text-red-700"
                        >
                          <Trash2 size={16} />
                          {deletingId === client.id
                            ? "Eliminando..."
                            : "Eliminar"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredClients.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-8 text-center text-sm text-[#5A564E]"
                  >
                    No se encontraron clientes-usuarios con ese criterio.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Detalles */}
      {selectedClient && (
        <ClientDetailsModal
          client={selectedClient}
          onClose={() => setSelectedClient(null)}
        />
      )}

      {/* Modal Nuevo Cliente */}
      {showCreateModal && (
        <ClientFormModal
          onClose={() => setShowCreateModal(false)}
          onCreated={handleClientCreated}
        />
      )}
    </div>
  );
}
