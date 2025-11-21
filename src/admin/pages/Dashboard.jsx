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
    salesThisMonth: 45231,
    salesChange: 20.1,
    totalOrders: 234,
    ordersChange: 12.5,
    totalProducts: 156,
    productsChange: 3,
    totalClients: 892,
    clientsChange: 48
  });

  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [orders, products] = await Promise.all([
          listOrders(),
          listProducts()
        ]);

        // Recent orders (últimas 5)
        setRecentOrders((orders || []).slice(0, 5));

        // Low stock products
        setLowStock(
          (products || [])
            .filter(p => p.stock < 10)
            .slice(0, 3)
        );
      } catch (error) {
        console.error("Error loading dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
          <span>+{change}%</span>
        </div>
      </div>
      <h3 className="text-[#5A564E] text-sm font-medium mb-1">{title}</h3>
      <p className="text-3xl font-extrabold text-[#1C1C1C]">{value}</p>
      <p className="text-xs text-[#5A564E] mt-2">vs mes anterior</p>
    </div>
  );

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
          change={stats.productsChange}
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
              <h2 className="text-xl font-bold text-[#1C1C1C]">Órdenes Recientes</h2>
            </div>
            <a href="/admin/ordenes" className="text-[#F24C00] font-semibold hover:underline">
              Ver todas
            </a>
          </div>

          <div className="space-y-4">
            {recentOrders.length === 0 ? (
              <p className="text-center text-[#5A564E] py-8">No hay órdenes recientes</p>
            ) : (
              recentOrders.map((order, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="font-bold text-blue-600">#{order.id || idx + 1234}</span>
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
                      ${(order.total || 1250).toLocaleString()}
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

        {/* Low Stock Alert */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <AlertCircle size={24} color="#F24C00" />
            <h2 className="text-xl font-bold text-[#1C1C1C]">Productos con Bajo Stock</h2>
          </div>

          <div className="space-y-4">
            {lowStock.length === 0 ? (
              <p className="text-center text-[#5A564E] py-8">Todo en stock</p>
            ) : (
              lowStock.map((product) => (
                <div key={product.id} className="p-4 bg-orange-50 rounded-xl border border-orange-200">
                  <p className="font-bold text-[#1C1C1C] mb-1">{product.name}</p>
                  <p className="text-sm text-[#5A564E] mb-2">{product.category}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-orange-600 font-bold">{product.stock} unidades</span>
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