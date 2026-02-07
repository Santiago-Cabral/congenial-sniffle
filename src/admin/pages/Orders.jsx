import { useEffect, useState } from "react";
import { listOrders, deleteOrder } from "../services/apiService";
import OrderDetailsModal from "../widgets/OrderDetailsModal";
import { RefreshCw, Search } from "lucide-react";

function formatMoney(value) {
  const n = Number(value) || 0;
  return n.toLocaleString("es-AR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

function formatDate(value) {
  if (!value) return "-";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleString("es-AR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusInfo(order) {
  const status = Number(order?.paymentStatus ?? 0);
  switch (status) {
    case 1:
      return { label: "Pagado", className: "bg-green-100 text-green-800", code: 1 };
    case 2:
      return { label: "Entregado", className: "bg-blue-100 text-blue-800", code: 2 };
    default:
      return { label: "Pendiente", className: "bg-yellow-100 text-yellow-800", code: 0 };
  }
}

function extractDisplayName(order) {
  if (!order) return "Orden";

  // 1. customerDetails.name
  if (order.customerDetails && order.customerDetails.name && order.customerDetails.name.trim()) return order.customerDetails.name.trim();

  // 2. common fields
  const tryFields = ["clientName", "client_name", "Customer", "customerName", "CustomerName", "fullName", "FullName", "name", "Name"];
  for (const f of tryFields) {
    if (order[f] && typeof order[f] === "string" && order[f].trim()) return order[f].trim();
  }

  // 3. delivery / shipping fields
  const tryAddress = ["deliveryAddress", "DeliveryAddress", "address", "Address", "shippingAddress", "shipping_address"];
  for (const f of tryAddress) {
    const v = order[f];
    if (v && typeof v === "string" && v.trim()) return v.trim();
    // si viene objeto con street/line1
    if (v && typeof v === "object") {
      const composed = (v.line1 || v.street || v.address || v.addressLine || v.streetAddress || "") + " " + (v.line2 || v.number || "");
      if (composed.trim()) return composed.trim();
    }
  }

  // 4. externalData (JSON)
  const rawExt = order.externalData || order.ExternalData || order.external_data || null;
  if (rawExt) {
    try {
      const parsed = typeof rawExt === "string" ? JSON.parse(rawExt) : rawExt;
      if (parsed) {
        if (parsed.name && parsed.name.trim()) return parsed.name.trim();
        if (parsed.customerName && parsed.customerName.trim()) return parsed.customerName.trim();
        if (parsed.fullName && parsed.fullName.trim()) return parsed.fullName.trim();
        if (parsed.address && parsed.address.trim()) return parsed.address.trim();
      }
    } catch (e) {
      // ignorar
    }
  }

  // intentar mostrar email o teléfono antes que "Cliente"
  const tryEmail = (order.customerDetails?.email || order.email || order.clientEmail || order.client_email) ?? null;
  const tryPhone = (order.customerDetails?.phone || order.phone || order.mobile || order.phoneNumber || order.phone_number) ?? null;

  if (tryEmail && typeof tryEmail === "string" && tryEmail.trim()) return tryEmail.trim();
  if (tryPhone && typeof tryPhone === "string" && tryPhone.trim()) return tryPhone.trim();

  // fallback más informativo
  return order.customerName?.trim() || order.clientName?.trim() || `Orden #${order.id}`;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingReload, setLoadingReload] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  async function load(showReloadSpinner = false) {
    showReloadSpinner ? setLoadingReload(true) : setLoading(true);
    setError("");

    try {
      const data = await listOrders();
      const ordered = [...data].sort((a, b) => new Date(b.soldAt || b.createdAt) - new Date(a.soldAt || a.createdAt));
      setOrders(ordered);
      setFiltered(ordered);
    } catch (err) {
      console.error("❌ Error cargando órdenes:", err);
      setError(err.message || "Error al cargar las órdenes");
    } finally {
      showReloadSpinner ? setLoadingReload(false) : setLoading(false);
    }
  }

  useEffect(() => {
    load(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let result = [...orders];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((o) => {
        const idMatch = String(o.id).includes(q);
        const name = (o.customerDetails?.name || o.clientName || o.deliveryAddress || "") + "";
        const display = name.toLowerCase();
        return idMatch || display.includes(q) || (String(o.email || "").toLowerCase().includes(q)) || (String(o.phone || "").toLowerCase().includes(q));
      });
    }

    if (statusFilter !== "ALL") {
      result = result.filter((o) => getStatusInfo(o).code === Number(statusFilter));
    }

    setFiltered(result);
  }, [search, statusFilter, orders]);

  // Actualiza el estado local cuando el modal cambia el estado de la orden
  const handleStatusChange = (id, newStatusCode, updatedFromApi) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === id
          ? {
              ...o,
              ...(updatedFromApi || {}),
              paymentStatus: newStatusCode,
            }
          : o
      )
    );

    setSelected((prev) =>
      prev && prev.id === id
        ? {
            ...prev,
            ...(updatedFromApi || {}),
            paymentStatus: newStatusCode,
          }
        : prev
    );
  };

  const handleDeleteOrder = async (id) => {
    const confirm = window.confirm("¿Eliminar esta orden?\n\nNo se borrará definitivamente, solo dejará de mostrarse.");
    if (!confirm) return;

    try {
      await deleteOrder(id);
      setOrders((prev) => prev.filter((o) => o.id !== id));
      setFiltered((prev) => prev.filter((o) => o.id !== id));
    } catch (err) {
      console.error("❌ Error eliminando orden:", err);
      alert(err.message || "No se pudo eliminar la orden");
    }
  };

  if (loading && !loadingReload) {
    return (
      <div className="p-6">
        <h2 className="text-3xl font-bold mb-4">Órdenes</h2>
        <div className="bg-white rounded-xl shadow p-6">
          <p>Cargando órdenes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold">Órdenes</h2>
          <p className="text-gray-500">Historial de ventas</p>
        </div>

        <button onClick={() => load(true)} className="flex items-center gap-2 px-4 py-2 border rounded-xl bg-white shadow-sm">
          <RefreshCw size={18} className={loadingReload ? "animate-spin" : ""} />
          Actualizar
        </button>
      </div>

      <div className="flex gap-3 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="w-full pl-9 py-2 border rounded-xl" placeholder="Buscar por orden o cliente" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        {[{ code: "ALL", label: "Todos" }, { code: "0", label: "Pendiente" }, { code: "1", label: "Pagado" }, { code: "2", label: "Entregado" }].map((f) => (
          <button key={f.code} onClick={() => setStatusFilter(f.code)} className={`px-3 py-1 rounded-full border text-sm ${statusFilter === f.code ? "bg-[#F24C00] text-white" : "bg-white"}`}>
            {f.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No hay órdenes</div>
        ) : (
          filtered.map((o) => {
            const status = getStatusInfo(o);
            const displayName = extractDisplayName(o);
            return (
              <div key={o.id} className="grid grid-cols-5 gap-4 px-6 py-4 border-b">
                <div>
                  <div className="font-semibold">#{o.id}</div>
                  <span className={`text-xs px-2 rounded ${status.className}`}>{status.label}</span>
                </div>

                <div>{formatDate(o.soldAt || o.createdAt)}</div>
                <div>{displayName}</div>
                <div className="text-right font-bold text-[#F24C00]">${formatMoney(o.total)}</div>

                <div className="text-right">
                  <button className="text-blue-600 text-sm" onClick={() => setSelected(o)}>Ver</button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {selected && (
        <OrderDetailsModal order={selected} onClose={() => setSelected(null)} onDelete={handleDeleteOrder} onStatusChange={handleStatusChange} />
      )}
    </div>
  );
}
