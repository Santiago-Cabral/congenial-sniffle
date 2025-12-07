import { useEffect, useState } from "react";
import { listOrders } from "../services/apiService";
import OrderDetailsModal from "../widgets/OrderDetailsModal";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const data = await listOrders();
      setOrders(data);
    } catch (err) {
      console.error("Error cargando órdenes", err);
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  if (loading) return <div>Cargando órdenes...</div>;

  return (
    <div>
      <h2 className="text-3xl font-bold mb-4">Órdenes</h2>

      {orders.map(o => (
        <div
          key={o.id}
          className="bg-white shadow p-4 rounded mb-2 flex justify-between"
        >
          <span>#{o.id}</span>
          <span>${o.total.toLocaleString("es-AR")}</span>
          <button className="text-blue-600" onClick={() => setSelected(o)}>
            Detalles
          </button>
        </div>
      ))}

      {selected && (
        <OrderDetailsModal
          order={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
