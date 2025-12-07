import { 
  DollarSign, 
  ShoppingCart, 
  Package, 
  Users, 
  TrendingUp,
  Clock,
  AlertCircle
} from "lucide-react";

import { useEffect, useState } from "react";
import { listOrders, listProducts, listClients } from "../services/apiService";

export default function Dashboard() {
  const [stats, setStats] = useState({
    salesThisMonth: 0,
    salesChange: 0,
    totalOrders: 0,
    ordersChange: 0,
    totalProducts: 0,
    totalClients: 0,
    clientsChange: 0
  });

  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [extra, setExtra] = useState({
    topProducts: [],
    dailySales: {}
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [orders, products, clients] = await Promise.all([
          listOrders(),
          listProducts(),
          listClients()
        ]);

        const now = new Date();
        const month = now.getMonth();
        const year = now.getFullYear();

        const prevMonth = month === 0 ? 11 : month - 1;
        const prevMonthYear = month === 0 ? year - 1 : year;

        // ==========================================
        // 📌 1) VENTAS DEL MES
        // ==========================================
        const salesThisMonth = orders
          .filter(o => {
            const d = new Date(o.soldAt);
            return d.getMonth() === month && d.getFullYear() === year;
          })
          .reduce((acc, o) => acc + o.total, 0);

        // Ventas del mes anterior
        const salesPrevMonth = orders
          .filter(o => {
            const d = new Date(o.soldAt);
            return d.getMonth() === prevMonth && d.getFullYear() === prevMonthYear;
          })
          .reduce((acc, o) => acc + o.total, 0);

        const salesChange =
          salesPrevMonth > 0
            ? (((salesThisMonth - salesPrevMonth) / salesPrevMonth) * 100).toFixed(1)
            : 100;

        // ==========================================
        // 📌 2) ORDENES
        // ==========================================
        const totalOrders = orders.length;

        const ordersThisMonth = orders.filter(o => {
          const d = new Date(o.soldAt);
          return d.getMonth() === month && d.getFullYear() === year;
        });

        const ordersPrevMonth = orders.filter(o => {
          const d = new Date(o.soldAt);
          return d.getMonth() === prevMonth && d.getFullYear() === prevMonthYear;
        });

        const ordersChange =
          ordersPrevMonth.length > 0
            ? (((ordersThisMonth.length - ordersPrevMonth.length) /
                ordersPrevMonth.length) *
                100).toFixed(1)
            : 100;

        // ==========================================
        // 📌 3) PRODUCTOS
        // ==========================================
        const totalProducts = products.length;

        // ==========================================
        // 📌 4) CLIENTES
        // ==========================================
        const clientsThisMonth = clients.filter(c => {
          const d = new Date(c.createdAt ?? now);
          return d.getMonth() === month && d.getFullYear() === year;
        });

        const clientsPrevMonth = clients.filter(c => {
          const d = new Date(c.createdAt ?? now);
          return d.getMonth() === prevMonth && d.getFullYear() === prevMonthYear;
        });

        const clientsChange =
          clientsPrevMonth.length > 0
            ? (((clientsThisMonth.length - clientsPrevMonth.length) /
                clientsPrevMonth.length) *
                100).toFixed(1)
            : 100;

        // ==========================================
        // 📌 5) TOP 5 PRODUCTOS MÁS VENDIDOS
        // ==========================================
        const productCount = {};

        orders.forEach(o => {
          (o.items || []).forEach(i => {
            if (!productCount[i.productName]) productCount[i.productName] = 0;
            productCount[i.productName] += i.quantity;
          });
        });

        const topProducts = Object.entries(productCount)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([name, qty]) => ({ name, qty }));

        // ==========================================
        // 📌 6) VENTAS POR DÍA (para gráficos)
        // ==========================================
        const dailySales = {};

        orders.forEach(o => {
          const key = new Date(o.soldAt).toISOString().split("T")[0];
          if (!dailySales[key]) dailySales[key] = 0;
          dailySales[key] += o.total;
        });

        // ==========================================
        // 📌 SETEAR ESTADO
        // ==========================================
        setStats({
          salesThisMonth,
          salesChange,
          totalOrders,
          ordersChange,
          totalProducts,
          totalClients: clients.length,
          clientsChange
        });

        setRecentOrders(
          orders
            .sort((a, b) => new Date(b.soldAt) - new Date(a.soldAt))
            .slice(0, 5)
        );

        setLowStock(products.filter(p => p.stock < 10).slice(0, 3));

        setExtra({
          topProducts,
          dailySales
        });

      } catch (error) {
        console.error("Error loading dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // --------------------------
  // TARJETAS DE STATS
  // --------------------------
  const StatCard = ({ icon: Icon, title, value, change, color }) => (
    <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
          <Icon size={24} className="text-white" />
        </div>
        <div className={`flex items-center gap-1 text-sm font-semibold ${
          change > 0 ? "text-green-600" : "text-red-600"
        }`}>
          <TrendingUp size={16} />
          <span>{change}%</span>
        </div>
      </div>
      <h3 className="text-[#5A564E] text-sm font-medium mb-1">{title}</h3>
      <p className="text-3xl font-extrabold text-[#1C1C1C]">{value}</p>
      <p className="text-xs text-[#5A564E] mt-2">vs mes anterior</p>
    </div>
  );

  // --------------------------
  // LOADING
  // --------------------------
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#F24C00] border-t-transparent mb-4"></div>
          <p className="text-[#5A564E]">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  // --------------------------
  // RENDER UI
  // --------------------------
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-[#1C1C1C] mb-2">Dashboard</h1>
        <p className="text-[#5A564E]">Resumen general de tu negocio</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={DollarSign}
          title="Ventas del Mes"
          value={`$${stats.salesThisMonth.toLocaleString()}`}
          change={stats.salesChange}
          color="bg-green-500"
        />
        <StatCard
          icon={ShoppingCart}
          title="Órdenes Totales"
          value={stats.totalOrders}
          change={stats.ordersChange}
          color="bg-blue-500"
        />
        <StatCard
          icon={Package}
          title="Productos"
          value={stats.totalProducts}
          change={3}
          color="bg-[#F24C00]"
        />
        <StatCard
          icon={Users}
          title="Clientes"
          value={stats.totalClients}
          change={stats.clientsChange}
          color="bg-purple-500"
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Clock size={24} color="#F24C00" />
              <h2 className="text-xl font-bold text-[#1C1C1C]">
                Órdenes Recientes
              </h2>
            </div>
            <a href="/admin/ordenes" className="text-[#F24C00] font-semibold hover:underline">
              Ver todas
            </a>
          </div>

          <div className="space-y-4">
            {recentOrders.length === 0 ? (
              <p className="text-center text-[#5A564E] py-8">
                No hay órdenes recientes
              </p>
            ) : (
              recentOrders.map((order, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="font-bold text-blue-600">
                        #{order.id}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-[#1C1C1C]">
                        {order.clientName || "Cliente"}
                      </p>
                      <p className="text-sm text-[#5A564E]">Hace 2 horas</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[#1C1C1C]">
                      ${order.total.toLocaleString()}
                    </p>
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                      Completado
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Low Stock */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <AlertCircle size={24} color="#F24C00" />
            <h2 className="text-xl font-bold text-[#1C1C1C]">
              Productos con Bajo Stock
            </h2>
          </div>

          <div className="space-y-4">
            {lowStock.length === 0 ? (
              <p className="text-center text-[#5A564E] py-8">
                Todo en stock
              </p>
            ) : (
              lowStock.map(product => (
                <div
                  key={product.id}
                  className="p-4 bg-orange-50 rounded-xl border border-orange-200"
                >
                  <p className="font-bold text-[#1C1C1C] mb-1">
                    {product.name}
                  </p>
                  <p className="text-sm text-[#5A564E] mb-2">
                    {product.category}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-orange-600 font-bold">
                      {product.stock} unidades
                    </span>
                    <a
                      href={`/admin/productos`}
                      className="text-[#F24C00] text-sm font-semibold hover:underline"
                    >
                      Reabastecer
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>

          <button className="w-full mt-4 py-3 border-2 border-gray-200 rounded-xl font-semibold hover:bg-gray-50 transition">
            Ver inventario completo
          </button>
        </div>
      </div>
    </div>
  );
}
