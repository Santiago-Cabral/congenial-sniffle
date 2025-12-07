export default function OrderDetailsModal({ order, onClose }) {

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-10">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />

      <div className="relative bg-white w-full max-w-2xl rounded-xl p-6 z-10 overflow-y-auto max-h-[80vh]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">Orden #{order.id}</h3>
          <button onClick={onClose} className="text-gray-500">✕</button>
        </div>

        {/* FECHA */}
        <div className="text-sm text-gray-600 mb-4">
          Fecha: {new Date(order.soldAt).toLocaleString("es-AR")}
        </div>

        {/* VENDEDOR */}
        <div className="mb-4">
          <h4 className="font-semibold mb-1">Vendedor</h4>
          <div className="text-gray-700">{order.sellerName}</div>
        </div>

        {/* PRODUCTOS */}
        <h4 className="font-semibold mb-2">Productos</h4>
        <div className="space-y-3 mb-4">
          {order.items.map((it, idx) => (
            <div
              key={idx}
              className="p-3 border rounded flex items-center justify-between"
            >
              <div>
                <div className="font-semibold">{it.productName}</div>
                <div className="text-sm text-gray-600">Cantidad: {it.quantity}</div>
              </div>
              <div className="font-bold">
                ${it.total.toLocaleString("es-AR")}
              </div>
            </div>
          ))}
        </div>

        {/* PAGOS */}
        <h4 className="font-semibold mb-2">Pagos</h4>
        <div className="space-y-2 mb-4">
          {order.payments.map((p, i) => (
            <div key={i} className="flex justify-between p-2 border rounded">
              <span>{p.methodName}</span>
              <span>${p.amount.toLocaleString("es-AR")}</span>
            </div>
          ))}
        </div>

        {/* TOTAL */}
        <div className="border-t pt-4 mt-4">
          <div className="flex items-center justify-between text-lg font-bold">
            <span>Total</span>
            <span>${order.total.toLocaleString("es-AR")}</span>
          </div>
        </div>

      </div>
    </div>
  );
}
