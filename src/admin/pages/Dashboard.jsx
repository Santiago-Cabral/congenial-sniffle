import {
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  TrendingUp,
  Clock,
  AlertCircle,
  AlertTriangle
} from "lucide-react";

import { useEffect, useState } from "react";
import {
  listOrders,
  listProducts,
  listClients,
  getProductStock,
} from "../services/apiService";

export default function Dashboard() {
  const [stats, setStats] = useState({
    salesThisMonth: 0,
    salesChange: 0,
    totalOrders: 0,
    ordersChange: 0,
    totalProducts: 0,
    totalClients: 0,
    clientsChange: 0,
  });

  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [serverWarning, setServerWarning] = useState(false);

  // ===============================
  // ⏱ Utils
  // ===============================
  const formatTime = (dateString) => {
    if (!dateString) return "--:--";
    const d = new Date(dateString);
    return isNaN(d.getTime()) 
      ? "--:--" 
      : d.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
  };

  // ===============================
  // 🔄 Fetch Dashboard
  // ===============================
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Pedimos todo en paralelo
        const [orders, products, clients] = await Promise.all([
          listOrders(),
          listProducts(),
          listClients(),
        ]);

        // Si orders viene vacío pero products tiene datos, es posible que el server de ventas falló
        // (Aunque también puede ser que simplemente no haya ventas)
        if (orders.length === 0 && products.length > 0) {
           // Opcional: Podrías poner una bandera aquí si quisieras distinguir "0 ventas" de "error 500"
           // pero como el apiService ya hizo catch, lo tratamos como 0 ventas.
        }

        const now = new Date();
        const month = now.getMonth();
        const year = now.getFullYear();
        const prevMonth = month === 0 ? 11 : month - 1;
        const prevMonthYear = month === 0 ? year - 1 : year;

        // --- VENTAS ---
        const salesThisMonth = orders
          .filter((o) => {
            const d = new Date(o.soldAt);
            return d.getMonth() === month && d.getFullYear() === year;
          })
          .reduce((acc, o) => acc + o.total, 0);

        const salesPrevMonth = orders
          .filter((o) => {
            const d = new Date(o.soldAt);
            return d.getMonth() === prevMonth && d.getFullYear() === prevMonthYear;
          })
          .reduce((acc, o) => acc + o.total, 0);

        const salesChange = salesPrevMonth > 0
            ? (((salesThisMonth - salesPrevMonth) / salesPrevMonth) * 100).toFixed(1)
            : 100;

        // --- ÓRDENES ---
        const ordersThisMonth = orders.filter((o) => {
          const d = new Date(o.soldAt);
          return d.getMonth() === month && d.getFullYear() === year;
        });

        const ordersPrevMonth = orders.filter((o) => {
          const d = new Date(o.soldAt);
          return d.getMonth() === prevMonth && d.getFullYear() === prevMonthYear;
        });

        const ordersChange = ordersPrevMonth.length > 0
            ? (((ordersThisMonth.length - ordersPrevMonth.length) / ordersPrevMonth.length) * 100).toFixed(1)
            : 100;

        // --- CLIENTES ---
        const clientsThisMonth = clients.filter((c) => {
          const d = new Date(c.createdAt);
          return d.getMonth() === month && d.getFullYear() === year;
        });

        const clientsPrevMonth = clients.filter((c) => {
          const d = new Date(c.createdAt);
          return d.getMonth() === prevMonth && d.getFullYear() === prevMonthYear;
        });

        const clientsChange = clientsPrevMonth.length > 0
            ? (((clientsThisMonth.length - clientsPrevMonth.length) / clientsPrevMonth.length) * 100).toFixed(1)
            : 100;

        // --- STOCK ---
        // Nota: Hacer esto para muchos productos puede ser lento.
        // Lo ideal sería que el backend devuelva productos con stock ya calculado.
        // Limitamos a los primeros 20 para no saturar si hay muchos
        const productsToCheck = products.slice(0, 20); 
        
        const productsWithRealStock = await Promise.all(
          productsToCheck.map(async (p) => {
            try {
              const stockList = await getProductStock(p.id);
              const realStock = Array.isArray(stockList)
                ? stockList.reduce((acc, s) => acc + Number(s.quantity || 0), 0)
                : 0;
              return { ...p, stock: realStock };
            } catch {
              return { ...p, stock: 0 };
            }
          })
        );

        setLowStock(
          productsWithRealStock
            .filter((p) => p.stock <= 10)
            .sort((a, b) => a.stock - b.stock) // Ordenar por menor stock
            .slice(0, 5)
        );

        // --- SET STATE ---
        setStats({
          salesThisMonth,
          salesChange,
          totalOrders: orders.length,
          ordersChange,
          totalProducts: products.length,
          totalClients: clients.length,
          clientsChange,
        });

        setRecentOrders(
          orders
            .sort((a, b) => new Date(b.soldAt) - new Date(a.soldAt))
            .slice(0, 5)
        );

      } catch (e) {
        console.error("Error cargando dashboard:", e);
        setServerWarning(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ===============================
  // 🧩 Stat Card Component
  // ===============================
  const StatCard = ({ icon: Icon, title, value, change, color, isMoney }) => (
    <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition border border-gray-100">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color} shadow-sm`}>
          <Icon size={24} className="text-white" />
        </div>
        <div
          className={`flex items-center gap-1 text-sm font-semibold ${
            change >= 0 ? "text-green-600" : "text-red-600"
          }`}
        >
          <TrendingUp size={16} className={change < 0 ? "rotate-180" : ""} />
          <span>{Math.abs(change)}%</span>
        </div>
      </div>
      <h3 className="text-gray-500 text-sm mb-1 font-medium">{title}</h3>
      <p className="text-3xl font-extrabold text-[#1C1C1C]">
        {value}
      </p>
      <p className="text-xs text-gray-400 mt-2 font-medium">vs mes anterior</p>
    </div>
  );

  // ===============================
  // ⏳ Loading
  // ===============================
  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#F24C00] border-t-transparent mb-4 mx-auto" />
          <p className="text-[#5A564E] font-medium">Actualizando métricas...</p>
        </div>
      </div>
    );
  }

  // ===============================
  // 🧱 Render
  // ===============================
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-extrabold text-[#1C1C1C] mb-2">
          Dashboard
        </h1>
        <p className="text-[#5A564E]">Resumen general del negocio</p>
      </div>

      {serverWarning && (
        <div className="bg-orange-50 border-l-4 border-orange-500 p-4 flex gap-3">
          <AlertTriangle className="text-orange-500"/>
          <p className="text-orange-800 text-sm">Hubo un problema de conexión con algunos servicios. Los datos pueden estar incompletos.</p>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={DollarSign}
          title="Ventas del Mes"
          value={`$${stats.salesThisMonth.toLocaleString("es-AR")}`}
          change={Number(stats.salesChange)}
          color="bg-emerald-500"
          isMoney
        />
        <StatCard
          icon={ShoppingCart}
          title="Órdenes Totales"
          value={stats.totalOrders}
          change={Number(stats.ordersChange)}
          color="bg-blue-500"
        />
        <StatCard
          icon={Package}
          title="Productos Activos"
          value={stats.totalProducts}
          change={0} // No calculamos histórico de productos
          color="bg-[#F24C00]"
        />
        <StatCard
          icon={Users}
          title="Clientes Registrados"
          value={stats.totalClients}
          change={Number(stats.clientsChange)}
          color="bg-purple-500"
        />
      </div>

      {/* Grilla Inferior */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Órdenes recientes */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <Clock size={24} className="text-[#F24C00]" />
            <h2 className="text-xl font-bold text-gray-800">Órdenes Recientes</h2>
          </div>

          {recentOrders.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
               <ShoppingCart className="mx-auto text-gray-300 mb-2" size={32} />
               <p className="text-gray-500">No hay órdenes registradas recientemente.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((o) => (
                <div
                  key={o.id}
                  className="flex items-center justify-between p-4 bg-gray-50 hover:bg-white hover:shadow-md border border-transparent hover:border-gray-100 transition rounded-xl"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-[#F24C00] bg-opacity-10 w-10 h-10 rounded-full flex items-center justify-center text-[#F24C00] font-bold text-xs">
                        #{o.id}
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">{o.clientName || "Cliente"}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                         {formatTime(o.soldAt)} • {o.status}
                      </p>
                    </div>
                  </div>
                  <p className="font-bold text-[#F24C00]">
                    ${o.total.toLocaleString("es-AR")}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bajo stock */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <AlertCircle size={24} className="text-[#F24C00]" />
            <h2 className="text-xl font-bold text-gray-800">Alerta Stock</h2>
          </div>

          {lowStock.length === 0 ? (
            <div className="text-center py-10 bg-green-50 rounded-xl border border-green-100">
                <p className="text-green-700 font-medium">Todo el inventario OK ✅</p>
            </div>
          ) : (
            <div className="space-y-3">
              {lowStock.map((p) => (
                <div
                  key={p.id}
                  className="p-4 bg-orange-50 border border-orange-100 rounded-xl flex justify-between items-center"
                >
                  <div>
                      <p className="font-bold text-gray-800 text-sm line-clamp-1">{p.name}</p>
                      <p className="text-xs text-orange-600 mt-1">
                        {p.categoryName || "General"}
                      </p>
                  </div>
                  <div className="text-right">
                      <span className="block text-xl font-bold text-orange-600 leading-none">
                        {p.stock}
                      </span>
                      <span className="text-[10px] text-orange-400 uppercase font-bold">Unid.</span>
                  </div>
                </div>
              ))}
              <a href="/admin/productos" className="block text-center text-sm text-[#F24C00] font-semibold mt-4 hover:underline">
                  Ver inventario completo
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}