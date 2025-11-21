import { useState } from "react";

export default function OrderDetailsModal({ order, onClose, onUpdate }) {
  const [status, setStatus] = useState(order.estado || order.status || "Pendiente");

  const handleSave = () => {
    onUpdate(order.id, { ...order, estado: status });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-10">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white w-full max-w-2xl rounded-xl p-6 z-10 overflow-y-auto max-h-[80vh]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">Detalles de la Orden #{order.id}</h3>
          <button onClick={onClose} className="text-gray-500">✕</button>
        </div>

        <div className="mb-4 p-4 bg-red-50 rounded">
          <label className="block mb-2">Estado de la Orden</label>
          <select value={status} onChange={(e)=>setStatus(e.target.value)} className="p-2 border rounded w-full">
            <option>Pendiente</option>
            <option>En proceso</option>
            <option>Completado</option>
            <option>Cancelado</option>
          </select>
          <div className="mt-3 flex gap-3">
            <button onClick={handleSave} className="btn-primary">Actualizar Estado</button>
            <button onClick={onClose} className="border px-4 py-2 rounded">Cerrar</button>
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-2">Información del Cliente</h4>
          <div className="text-sm text-gray-600 mb-4">
            <div>{order.clienteNombre || order.clientName || order.customer}</div>
            <div>{order.email}</div>
            <div>{order.telefono}</div>
          </div>

          <h4 className="font-semibold mb-2">Dirección de Envío</h4>
          <div className="text-sm text-gray-600 mb-4">
            <div>{order.direccion || order.address}</div>
            <div>CP: {order.cp || order.postal}</div>
          </div>

          <h4 className="font-semibold mb-2">Productos</h4>
          <div className="space-y-3">
            {(order.items||order.productos||[]).map((it, idx) => (
              <div key={idx} className="p-3 border rounded flex items-center justify-between">
                <div>
                  <div className="font-semibold">{it.nombre || it.title || it.name}</div>
                  <div className="text-sm text-gray-600">Cantidad: {it.cantidad || it.qty || 1}</div>
                </div>
                <div className="font-bold">${(it.precio || it.price || 0).toLocaleString("es-AR")}</div>
              </div>
            ))}
          </div>

          <div className="mt-6 border-t pt-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">Subtotal</div>
              <div className="font-bold">${(order.subtotal || order.total || 0).toLocaleString("es-AR")}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
