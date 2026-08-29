import {
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  TrendingUp,
  Clock,
  AlertCircle,
  AlertTriangle,
  Wallet,
  Receipt,
  Award
} from "lucide-react";

import { useEffect, useState } from "react";
import {
  listOrders,
  listProducts,
  listClients,
} from "../services/apiService";

const PAYMENT_LABELS = {
  cash: "Efectivo",
  transfer: "Transferencia",
  card: "Tarjeta",
  mercadopago: "Mercado Pago",
};

export default function Dashboard() {
  const [stats, setStats] = useState({
    salesThisMonth: 0,
    salesChange: 0,
    salesToday: 0,
    ordersToday: 0,
    totalOrders: 0,
    ordersChange: 0,
    avgTicket: 0,
    totalProducts: 0,
    totalClients: 0,
    clientsChange: 0,
  });

  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [paymentBreakdown, setPaymentBreakdown] = useState([]);
  const [last7Days, setLast7Days] = useState([]);
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

  const isSameDay = (dateString, ref) => {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return false;
    return (
      d.getFullYear() === ref.getFullYear() &&
      d.getMonth() === ref.getMonth() &&
      d.getDate() === ref.getDate()
    );
  };

  const money = (n) => `$${Number(n || 0).toLocaleString("es-AR")}`;

  // ===============================
  // 🔄 Fetch Dashboard
  // ===============================
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [orders, products, clients] = await Promise.all([
          listOrders(),
          listProducts(),
          listClients(),
        ]);

        const now = new Date();
        const month = now.getMonth();
        const year = now.getFullYear();
        const prevMonth = month === 0 ? 11 : month - 1;
        const prevMonthYear = month === 0 ? year - 1 : year;

        const ordersThisMonth = orders.filter((o) => {
          const d = new Date(o.soldAt);
          return d.getMonth() === month && d.getFullYear() === year;
        });

        const ordersPrevMonth = orders.filter((o) => {
          const d = new Date(o.soldAt);
          return d.getMonth() === prevMonth && d.getFullYear() === prevMonthYear;
        });

        const ordersToday = orders.filter((o) => isSameDay(o.soldAt, now));

        // --- VENTAS ---
        const salesThisMonth = ordersThisMonth.reduce((acc, o) => acc + o.total, 0);
        const salesPrevMonth = ordersPrevMonth.reduce((acc, o) => acc + o.total, 0);
        const salesToday = ordersToday.reduce((acc, o) => acc + o.total, 0);

        const salesChange = salesPrevMonth > 0
          ? (((salesThisMonth - salesPrevMonth) / salesPrevMonth) * 100).toFixed(1)
          : 100;

        const ordersChange = ordersPrevMonth.length > 0
          ? (((ordersThisMonth.length - ordersPrevMonth.length) / ordersPrevMonth.length) * 100).toFixed(1)
          : 100;

        const avgTicket = ordersThisMonth.length > 0
          ? salesThisMonth / ordersThisMonth.length
          : 0;

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

        // --- STOCK BAJO ---
        // ⭐ Ya no se pide stock producto por producto: listProducts() lo trae incluido.
        const lowStockList = products
          .filter((p) => !p.isDeleted && p.stock <= 10)
          .sort((a, b) => a.stock - b.stock)
          .slice(0, 5);

        // --- PRODUCTOS MÁS VENDIDOS (este mes) ---
        const salesByProduct = {};
        ordersThisMonth.forEach((o) => {
          (o.items || []).forEach((it) => {
            const key = it.productName || "Producto";
            salesByProduct[key] = (salesByProduct[key] || 0) + it.quantity;
          });
        });
        const topProductsList = Object.entries(salesByProduct)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([name, qty]) => ({ name, qty }));

        // --- MÉTODOS DE PAGO (este mes) ---
        const byPayment = {};
        ordersThisMonth.forEach((o) => {
          const key = (o.paymentMethod || "otro").toLowerCase();
          byPayment[key] = (byPayment[key] || 0) + o.total;
        });
        const paymentList = Object.entries(byPayment)
          .sort((a, b) => b[1] - a[1])
          .map(([method, total]) => ({
            method,
            label: PAYMENT_LABELS[method] || method,
            total,
            pct: salesThisMonth > 0 ? Math.round((total / salesThisMonth) * 100) : 0,
          }));

        // --- ÚLTIMOS 7 DÍAS ---
        const days = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date(now);
          d.setDate(now.getDate() - i);
          const dayTotal = orders
            .filter((o) => isSameDay(o.soldAt, d))
            .reduce((acc, o) => acc + o.total, 0);
          days.push({
            label: d.toLocaleDateString("es-AR", { weekday: "short" }),
            total: dayTotal,
          });
        }
        const maxDayTotal = Math.max(...days.map((d) => d.total), 1);

        // --- SET STATE ---
        setStats({
          salesThisMonth,
          salesChange,
          salesToday,
          ordersToday: ordersToday.length,
          totalOrders: orders.length,
          ordersChange,
          avgTicket,
          totalProducts: products.filter((p) => !p.isDeleted).length,
          totalClients: clients.length,
          clientsChange,
        });

        setRecentOrders(
          [...orders]
            .sort((a, b) => new Date(b.soldAt) - new Date(a.soldAt))
            .slice(0, 5)
        );
        setLowStock(lowStockList);
        setTopProducts(topProductsList);
        setPaymentBreakdown(paymentList);
        setLast7Days(days.map((d) => ({ ...d, pct: (d.total / maxDayTotal) * 100 })));

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
  // 🧩 Stat Card
  // ===============================
  const StatCard = ({ icon: Icon, title, value, change, color, subtitle }) => (
    <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition border border-gray-100">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color} shadow-sm`}>
          <Icon size={24} className="text-white" />
        </div>
        {change !== null && (
          <div
            className={`flex items-center gap-1 text-sm font-semibold ${
              change >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            <TrendingUp size={16} className={change < 0 ? "rotate-180" : ""} />
            <span>{Math.abs(change)}%</span>
          </div>
        )}
      </div>
      <h3 className="text-gray-500 text-sm mb-1 font-medium">{title}</h3>
      <p className="text-3xl font-extrabold text-[#1C1C1C]">{value}</p>
      <p className="text-xs text-gray-400 mt-2 font-medium">
        {subtitle || "vs mes anterior"}
      </p>
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
        <h1 className="text-3xl font-extrabold text-[#1C1C1C] mb-2">Dashboard</h1>
        <p className="text-[#5A564E]">Resumen general del negocio</p>
      </div>

      {serverWarning && (
        <div className="bg-orange-50 border-l-4 border-orange-500 p-4 flex gap-3">
          <AlertTriangle className="text-orange-500" />
          <p className="text-orange-800 text-sm">
            Hubo un problema de conexión con algunos servicios. Los datos pueden estar incompletos.
          </p>
        </div>
      )}

      {/* Fila 1: hoy */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-[#F24C00] to-[#D94000] rounded-2xl p-6 shadow-sm text-white">
          <div className="flex items-center gap-2 mb-2 opacity-90">
            <DollarSign size={18} />
            <span className="text-sm font-semibold">Ventas de hoy</span>
          </div>
          <p className="text-4xl font-extrabold">{money(stats.salesToday)}</p>
          <p className="text-sm opacity-80 mt-2">{stats.ordersToday} órdenes hoy</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-2 text-gray-500">
            <Receipt size={18} />
            <span className="text-sm font-semibold">Ticket promedio (mes)</span>
          </div>
          <p className="text-4xl font-extrabold text-[#1C1C1C]">{money(stats.avgTicket)}</p>
          <p className="text-sm text-gray-400 mt-2">
            sobre {stats.totalOrders} órdenes totales
          </p>
        </div>
      </div>

      {/* Stats Grid mensual */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={DollarSign}
          title="Ventas del Mes"
          value={money(stats.salesThisMonth)}
          change={Number(stats.salesChange)}
          color="bg-emerald-500"
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
          change={null}
          color="bg-[#F24C00]"
          subtitle={`${lowStock.length} con stock bajo`}
        />
        <StatCard
          icon={Users}
          title="Clientes Registrados"
          value={stats.totalClients}
          change={Number(stats.clientsChange)}
          color="bg-purple-500"
        />
      </div>

      {/* Tendencia 7 días + Métodos de pago */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp size={24} className="text-[#F24C00]" />
            <h2 className="text-xl font-bold text-gray-800">Ventas — últimos 7 días</h2>
          </div>
          <div className="flex items-end justify-between gap-3 h-40">
            {last7Days.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                <span className="text-[10px] text-gray-500 font-semibold">
                  {d.total > 0 ? money(d.total) : ""}
                </span>
                <div
                  className="w-full bg-[#F24C00] rounded-t-lg transition-all"
                  style={{ height: `${Math.max(d.pct, 3)}%`, opacity: d.total > 0 ? 1 : 0.15 }}
                />
                <span className="text-xs text-gray-500 capitalize">{d.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <Wallet size={24} className="text-[#F24C00]" />
            <h2 className="text-xl font-bold text-gray-800">Métodos de pago</h2>
          </div>
          {paymentBreakdown.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">Sin ventas este mes</p>
          ) : (
            <div className="space-y-4">
              {paymentBreakdown.map((p) => (
                <div key={p.method}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-semibold text-gray-700 capitalize">{p.label}</span>
                    <span className="text-gray-500">{money(p.total)}</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#F24C00] rounded-full"
                      style={{ width: `${p.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
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
                        {formatTime(o.soldAt)} • {o.paymentStatusName || "Pendiente"}
                      </p>
                    </div>
                  </div>
                  <p className="font-bold text-[#F24C00]">{money(o.total)}</p>
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
                    <p className="text-xs text-orange-600 mt-1">{p.categoryName || "General"}</p>
                  </div>
                  <div className="text-right">
                    <span className="block text-xl font-bold text-orange-600 leading-none">
                      {p.stock}
                    </span>
                    <span className="text-[10px] text-orange-400 uppercase font-bold">Unid.</span>
                  </div>
                </div>
              ))}
              
                <a
                  href="/admin/productos"
                  className="block text-center text-sm text-[#F24C00] font-semibold mt-4 hover:underline"
                >
                  Ver inventario completo
                </a>
            </div>
          )}
        </div>
      </div>

      {/* Más vendidos */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <Award size={24} className="text-[#F24C00]" />
          <h2 className="text-xl font-bold text-gray-800">Más vendidos este mes</h2>
        </div>

        {topProducts.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">Sin ventas registradas este mes</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {topProducts.map((p, i) => (
              <div key={p.name} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-gray-400">#{i + 1}</span>
                  <span className="text-xs font-bold bg-[#F24C00] text-white rounded-full px-2 py-0.5">
                    {p.qty} vendidos
                  </span>
                </div>
                <p className="font-semibold text-gray-800 text-sm line-clamp-2">{p.name}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}