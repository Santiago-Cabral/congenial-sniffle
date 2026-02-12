import {
  X,
  Package,
  CalendarClock,
  User as UserIcon,
  MapPin,
  Truck,
  CreditCard,
  Phone,
  Mail,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { updateOrderStatus } from "../services/apiService";

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

function getStatusInfo(status) {
  const s = status === null || status === undefined ? 0 : Number(status);

  switch (s) {
    case 1:
      return { label: "Pagado", className: "bg-green-100 text-green-800", code: 1 };
    case 2:
      return { label: "Entregado", className: "bg-blue-100 text-blue-800", code: 2 };
    default:
      return { label: "Pendiente", className: "bg-yellow-100 text-yellow-800", code: 0 };
  }
}

function getPaymentMethodLabel(method) {
  if (!method) return "No especificado";
  const normalized = String(method).toLowerCase();
  if (normalized === "cash" || normalized === "efectivo") return "💵 Efectivo";
  if (normalized === "transfer" || normalized === "transferencia") return "🏦 Transferencia bancaria";
  if (normalized === "card" || normalized === "tarjeta") return "💳 Tarjeta de crédito/débito";
  return method;
}

function getFulfillmentMethodLabel(method) {
  if (method === null || method === undefined) return "No especificado";
  // aceptar string o número
  const normalized = String(method).toLowerCase().trim();
  if (normalized === "pickup" || normalized === "retiro") return "🛍️ Retiro en local";
  if (normalized === "delivery" || normalized === "envio" || normalized === "envío") return "🚚 Envío a domicilio";
  // manejar códigos numéricos comunes: 1=delivery, 2=pickup
  if (normalized === "1") return "🚚 Envío a domicilio";
  if (normalized === "2") return "🛍️ Retiro en local";
  return method;
}

// Extrae información de cliente desde distintos posibles campos de la orden.
// Devuelve { name, phone, email, address }
function extractCustomerInfo(order) {
  if (!order) return { name: null, phone: null, email: null, address: null };

  // 1) Si ya viene customerDetails normalizado, usarlo.
  const cd = order.customerDetails;
  if (cd && (cd.name || cd.phone || cd.email || cd.address)) {
    return {
      name: (cd.name || "").trim() || null,
      phone: (cd.phone || "").trim() || null,
      email: (cd.email || "").trim() || null,
      address: (cd.address || "").trim() || null,
    };
  }

  // 2) Campos comunes directos (varias variantes / mayúsculas)
  const candidates = {
    name: [
      "customerName",
      "Customer",
      "CustomerName",
      "customer_name",
      "clientName",
      "ClientName",
      "client",
      "client_name",
      "fullName",
      "FullName",
      "name",
      "Name",
    ],
    phone: [
      "customerPhone",
      "phone",
      "Phone",
      "mobile",
      "Mobile",
      "phoneNumber",
      "phone_number",
      "deliveryPhone",
    ],
    email: ["customerEmail", "email", "Email", "clientEmail", "client_email"],
    address: [
      "deliveryAddress",
      "DeliveryAddress",
      "address",
      "Address",
      "shippingAddress",
      "shipping_address",
      "shipping_address_line",
      "delivery_address",
    ],
  };

  const pickFirstNonEmpty = (keys) => {
    for (const k of keys) {
      const v = order[k];
      if (typeof v === "string" && v.trim() !== "") return v.trim();
      if (v && typeof v === "object") {
        // si viene como objeto con campos
        const possible = v.address || v.name || v.fullName || v.line1 || v.street;
        if (typeof possible === "string" && possible.trim() !== "") return possible.trim();
      }
    }
    return null;
  };

  // 3) Intentar extraer desde externalData / ExternalData (JSON o string)
  let parsedExternal = null;
  const extRaw = order.externalData ?? order.ExternalData ?? order.external_data ?? null;
  if (extRaw) {
    try {
      parsedExternal = typeof extRaw === "string" ? JSON.parse(extRaw) : extRaw;
    } catch (e) {
      parsedExternal = null;
    }
  }

  const extPick = (fields) => {
    if (!parsedExternal) return null;
    for (const f of fields) {
      const v = parsedExternal[f];
      if (typeof v === "string" && v.trim() !== "") return v.trim();
    }
    return null;
  };

  const name =
    pickFirstNonEmpty(candidates.name) ||
    extPick(["name", "customerName", "customer_name", "fullName", "full_name"]) ||
    (order.PaymentReference && String(order.PaymentReference).trim()) ||
    null;

  const phone =
    pickFirstNonEmpty(candidates.phone) ||
    extPick(["phone", "phoneNumber", "phone_number", "mobile", "telefono"]) ||
    null;

  const email =
    pickFirstNonEmpty(candidates.email) || extPick(["email", "mail"]) || null;

  const address =
    pickFirstNonEmpty(candidates.address) ||
    extPick(["address", "shippingAddress", "shipping_address", "shipping"]) ||
    null;

  // Si el "name" está vacío pero existe address, usar parte de la dirección como nombre (fallback)
  const fallbackName = name || (address ? (address.length > 0 ? address : null) : null);

  return {
    name: fallbackName,
    phone,
    email,
    address,
  };
}

export default function OrderDetailsModal({ order, onClose, onStatusChange, onDelete }) {
  if (!order) return null;

  const items = Array.isArray(order.items) ? order.items : Array.isArray(order.Items) ? order.Items : [];
  const [savingStatus, setSavingStatus] = useState(false);
  const [statusError, setStatusError] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const statusInfo = getStatusInfo(order.paymentStatus);

  const customer = extractCustomerInfo(order);

  // Mostrar: nombre real > email > teléfono > campo cliente de la orden > "Orden #id"
  const customerName =
    customer.name?.trim() ||
    customer.email?.trim() ||
    customer.phone?.trim() ||
    (order.customerName && String(order.customerName).trim()) ||
    (order.clientName && String(order.clientName).trim()) ||
    `Orden #${order.id}`;

  const customerPhone = customer.phone || "";
  const customerEmail = customer.email || "";
  const customerAddress = customer.address || "";

  // Normalizar fulfillmentMethod: prioriza fulfillmentMethod (string), acepta números o deliveryType como fallback
  const fulfillmentMethod = (() => {
    const fm = order?.fulfillmentMethod;
    if (typeof fm === "string" && fm.trim() !== "") return fm.toLowerCase();
    if (typeof fm === "number") return fm === 2 ? "pickup" : "delivery";
    // deliveryType fallback (número o string)
    const dt = order?.deliveryType;
    if (typeof dt === "number") return dt === 2 ? "pickup" : "delivery";
    if (typeof dt === "string" && /^\d+$/.test(dt)) {
      const num = Number(dt);
      return num === 2 ? "pickup" : "delivery";
    }
    return "delivery";
  })();

  const paymentMethod = order.paymentMethod || order.paymentType || "";
  const shippingCost = Number(order.shippingCost || order.DeliveryCost || order.deliveryCost || 0);
  const subtotal = Number(order.total || order.Total || 0) - shippingCost;

  const handleChangeStatus = async (newCode) => {
    if (savingStatus) return;
    if (statusInfo.code === newCode) return;
    setSavingStatus(true);
    setStatusError("");

    try {
      const updated = await updateOrderStatus(order.id, newCode);
      if (onStatusChange) onStatusChange(order.id, newCode, updated);
    } catch (err) {
      console.error("Error actualizando estado:", err);
      setStatusError(err?.message || "No se pudo actualizar el estado de la orden");
    } finally {
      setSavingStatus(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    setDeleting(true);
    try {
      await onDelete(order.id);
      onClose();
    } catch (err) {
      console.error("Error eliminando orden:", err);
      setStatusError(err?.message || "No se pudo eliminar la orden");
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const statusButtons = [
    { code: 0, label: "Pendiente" },
    { code: 1, label: "Pagado" },
    { code: 2, label: "Entregado" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-10">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white w-full max-w-2xl rounded-2xl p-6 z-10 overflow-y-auto max-h-[80vh] shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-[#1C1C1C]">Orden #{order.id}</h3>
            <p className="text-xs text-gray-500">Creada el {formatDate(order.soldAt || order.createdAt)}</p>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => setShowDeleteConfirm(true)} className="p-2 rounded-full hover:bg-red-50 text-red-600" title="Eliminar orden">
              <Trash2 size={18} />
            </button>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 text-gray-500">
              <X size={18} />
            </button>
          </div>
        </div>

        {showDeleteConfirm && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm font-semibold text-red-900 mb-3">⚠️ ¿Estás seguro de eliminar esta orden?</p>
            <p className="text-xs text-red-700 mb-3">Esta acción no se puede deshacer.</p>
            <div className="flex gap-2">
              <button onClick={handleDelete} disabled={deleting} className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-semibold disabled:opacity-50">
                {deleting ? "Eliminando..." : "Sí, eliminar"}
              </button>
              <button onClick={() => setShowDeleteConfirm(false)} disabled={deleting} className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm font-semibold disabled:opacity-50">
                Cancelar
              </button>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Estado:</span>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusInfo.className}`}>{statusInfo.label}</span>
          </div>

          <div className="flex gap-1">
            {statusButtons.map((btn) => {
              const active = statusInfo.code === btn.code;
              return (
                <button key={btn.code} onClick={() => handleChangeStatus(btn.code)} disabled={savingStatus} className={`px-3 py-1 rounded-full text-xs border transition ${active ? "bg-[#F24C00] text-white border-[#F24C00]" : "bg-white border-gray-300 hover:border-[#F24C00]"}`}>
                  {btn.label}
                </button>
              );
            })}
          </div>
        </div>

        {statusError && <div className="mb-4 text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded">{statusError}</div>}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
            <div className="w-9 h-9 rounded-full bg-[#FFE8D8] flex items-center justify-center"><CalendarClock size={18} color="#F24C00" /></div>
            <div>
              <p className="text-xs text-gray-500">Fecha</p>
              <p className="text-sm font-semibold">{formatDate(order.soldAt || order.createdAt)}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
            <div className="w-9 h-9 rounded-full bg-[#E5F9E5] flex items-center justify-center"><UserIcon size={18} className="text-green-700" /></div>
            <div>
              <p className="text-xs text-gray-500">Canal</p>
              <p className="text-sm font-semibold">E-commerce</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
            <div className="w-9 h-9 rounded-full bg-[#FFE8D8] flex items-center justify-center"><Package size={18} color="#F24C00" /></div>
            <div>
              <p className="text-xs text-gray-500">Ítems</p>
              <p className="text-sm font-semibold">{items.length} producto{items.length === 1 ? "" : "s"}</p>
            </div>
          </div>
        </div>

        <div className="mb-6 p-4 rounded-xl bg-blue-50 border border-blue-200">
          <h4 className="font-semibold mb-3 flex items-center gap-2 text-blue-900"><UserIcon size={18} /> Información del Cliente</h4>

          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <UserIcon size={16} className="text-blue-700 mt-0.5" />
              <div>
                <p className="text-xs text-blue-700 font-medium">Nombre:</p>
                <p className="text-gray-900">{customerName || "No especificado"}</p>
              </div>
            </div>

            {customerPhone && (
              <div className="flex items-start gap-2">
                <Phone size={16} className="text-blue-700 mt-0.5" />
                <div>
                  <p className="text-xs text-blue-700 font-medium">Teléfono:</p>
                  <p className="text-gray-900">{customerPhone}</p>
                </div>
              </div>
            )}

            {customerEmail && (
              <div className="flex items-start gap-2">
                <Mail size={16} className="text-blue-700 mt-0.5" />
                <div>
                  <p className="text-xs text-blue-700 font-medium">Email:</p>
                  <p className="text-gray-900">{customerEmail}</p>
                </div>
              </div>
            )}

            {customerAddress && (
              <div className="flex items-start gap-2">
                <MapPin size={16} className="text-blue-700 mt-0.5" />
                <div>
                  <p className="text-xs text-blue-700 font-medium">Dirección:</p>
                  <p className="text-gray-900">{customerAddress}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mb-6 p-4 rounded-xl bg-purple-50 border border-purple-200">
          <h4 className="font-semibold mb-3 flex items-center gap-2 text-purple-900"><Truck size={18} /> Entrega y Pago</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <Truck size={16} className="text-purple-700 mt-0.5" />
              <div>
                <p className="text-xs text-purple-700 font-medium">Método de entrega:</p>
                <p className="text-gray-900">{getFulfillmentMethodLabel(fulfillmentMethod)}</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <CreditCard size={16} className="text-purple-700 mt-0.5" />
              <div>
                <p className="text-xs text-purple-700 font-medium">Método de pago:</p>
                <p className="text-gray-900">{getPaymentMethodLabel(paymentMethod)}</p>
              </div>
            </div>

            {shippingCost > 0 && (
              <div className="flex items-start gap-2">
                <Package size={16} className="text-purple-700 mt-0.5" />
                <div>
                  <p className="text-xs text-purple-700 font-medium">Costo de envío:</p>
                  <p className="text-gray-900 font-semibold">${formatMoney(shippingCost)}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <h4 className="font-semibold mb-2">Productos</h4>
        <div className="space-y-3 mb-6">
          {items.map((it, idx) => (
            <div key={idx} className="p-3 border rounded-xl flex justify-between bg-gray-50">
              <div>
                <div className="font-semibold">{it.productName || it.name}</div>
                <div className="text-xs text-gray-500">Cantidad: {it.quantity} · Precio: ${formatMoney(it.unitPrice || it.price)}</div>
              </div>
              <div className="font-bold text-[#F24C00]">${formatMoney((it.quantity || 1) * (it.unitPrice || it.price || 0))}</div>
            </div>
          ))}
        </div>

        <div className="border-t pt-4 space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Subtotal</span>
            <span>${formatMoney(subtotal)}</span>
          </div>

          {shippingCost > 0 && (
            <div className="flex justify-between text-sm text-gray-600">
              <span>Envío</span>
              <span>${formatMoney(shippingCost)}</span>
            </div>
          )}

          <div className="flex justify-between text-xl font-bold pt-2 border-t">
            <span>Total</span>
            <span className="text-[#F24C00]">${formatMoney(order.total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
