import { useEffect, useState } from "react";
import {
  listProducts,
  deleteProduct,
  getProductStock,
} from "../services/apiService";
import { sendLowStockNotification, sendMultipleLowStockNotification } from '../services/whatsappService';
import ProductForm from "../widgets/ProductFrom";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // ==================================================
  // 🔄 Cargar productos + stock REAL por sucursal
  // ==================================================
  const load = async () => {
    setLoading(true);
    try {
      const data = await listProducts();

      // 🔥 Traer stock real por producto
      const productsWithStock = await Promise.all(
        data.map(async (p) => {
          try {
            const stockList = await getProductStock(p.id);

            // stockList = [{ branchId, quantity, lastUpdated }]
            const totalStock = Array.isArray(stockList)
              ? stockList.reduce(
                  (acc, s) => acc + Number(s.quantity || 0),
                  0
                )
              : 0;

            return {
              ...p,
              stock: totalStock,
            };
          } catch (e) {
            console.error("Error stock producto:", p.id, e);
            return {
              ...p,
              stock: 0,
            };
          }
        })
      );

      // Ordenar por nombre
      productsWithStock.sort((a, b) => a.name.localeCompare(b.name));

      setProducts(productsWithStock);
      setFiltered(productsWithStock);
    } catch (e) {
      console.error("Error cargando productos:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // ==================================================
  // 📱 Monitoreo de stock bajo
  // ==================================================
  useEffect(() => {
    const checkLowStock = () => {
      const settings = JSON.parse(localStorage.getItem('jovita_settings_v1') || '{}');
      
      if (!settings.whatsappNewOrder || products.length === 0) return;

      const lowStockProducts = products.filter(p => {
        const minStock = p.minStock || 10;
        return p.stock > 0 && p.stock <= minStock;
      });

      const outOfStockProducts = products.filter(p => p.stock === 0);

      if (lowStockProducts.length > 0 || outOfStockProducts.length > 0) {
        const lastNotification = localStorage.getItem('last_stock_notification');
        const now = Date.now();
        
        // Solo notificar una vez cada 24 horas
        if (!lastNotification || (now - parseInt(lastNotification)) > 24 * 60 * 60 * 1000) {
          const allProblematic = [...lowStockProducts, ...outOfStockProducts];
          
          console.log(`📱 ${allProblematic.length} productos con problemas de stock detectados`);
          // No enviar automáticamente, solo loguear
          // La notificación se enviará manualmente con el botón
          
          localStorage.setItem('last_stock_notification', now.toString());
        }
      }
    };

    checkLowStock();
  }, [products]);

  // ==================================================
  // 🔍 Filtros y búsqueda
  // ==================================================
  useEffect(() => {
    let result = [...products];

    if (categoryFilter !== "all") {
      result = result.filter((p) => p.categoryName === categoryFilter);
    }

    if (search.trim() !== "") {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.categoryName || "").toLowerCase().includes(q)
      );
    }

    setFiltered(result);
  }, [search, categoryFilter, products]);

  // ==================================================
  // 🗑 Eliminar producto
  // ==================================================
  const onDelete = async (id) => {
    if (!confirm("¿Eliminar producto?")) return;
    try {
      await deleteProduct(id);
      load();
    } catch (e) {
      console.error("Error al eliminar:", e);
    }
  };

  // ==================================================
  // 📌 Categorías únicas
  // ==================================================
  const categories = [
    "all",
    ...new Set(
      products
        .map((p) => p.categoryName)
        .filter((c) => c && c.trim() !== "")
    ),
  ];

  // ==================================================
  // 📊 Contar productos con stock bajo
  // ==================================================
  const lowStockCount = filtered.filter(p => {
    const minStock = p.minStock || 10;
    return p.stock <= minStock;
  }).length;

  return (
    <>
      {/* ================= HEADER ================= */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Productos</h2>
          <p className="text-gray-500">Gestiona el catálogo</p>
        </div>

        <div className="flex gap-2">
          {/* ⭐ Botón de alerta de stock */}
          {lowStockCount > 0 && (
            <button
              onClick={() => {
                const minStockDefault = 10;
                const lowStock = filtered.filter(p => {
                  const minStock = p.minStock || minStockDefault;
                  return p.stock <= minStock && p.stock > 0;
                });
                const noStock = filtered.filter(p => p.stock === 0);
                const all = [...lowStock, ...noStock];
                
                if (all.length === 1) {
                  sendLowStockNotification(all[0]);
                } else if (all.length > 1) {
                  sendMultipleLowStockNotification(all);
                }
              }}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition flex items-center gap-2"
            >
              <span>⚠️</span>
              <span>Avisar Stock Bajo ({lowStockCount})</span>
            </button>
          )}
          
          <button
            onClick={() => {
              setEditing(null);
              setOpenForm(true);
            }}
            className="btn-primary"
          >
            + Nuevo
          </button>
        </div>
      </div>

      {/* ================= FILTROS ================= */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <input
          type="text"
          placeholder="Buscar producto..."
          className="border rounded px-3 py-2 w-64"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="border rounded px-3 py-2"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c === "all" ? "Todas las categorías" : c}
            </option>
          ))}
        </select>
      </div>

      {/* ================= LISTADO ================= */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-6">Cargando productos...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            No se encontraron productos
          </div>
        ) : (
          filtered.map((p) => (
            <div
              key={p.id}
              className="bg-white p-4 rounded flex items-center justify-between shadow"
            >
              <div className="flex items-center gap-4">
                <img
                  src={p.image || "/sin-foto.png"}
                  className="w-14 h-14 object-cover rounded"
                  alt={p.name}
                />

                <div>
                  <div className="font-semibold">{p.name}</div>
                  <div className="text-sm text-gray-500">
                    {p.categoryName || "Sin categoría"} · {p.baseUnit}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="font-bold">
                  ${(p.retailPrice ?? 0).toLocaleString("es-AR")}
                </div>

                {/* 🔥 STOCK REAL */}
                <div
                  className={`text-sm font-semibold ${
                    p.stock <= 5 ? "text-red-600" : "text-gray-700"
                  }`}
                >
                  Stock: {p.stock}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditing(p);
                      setOpenForm(true);
                    }}
                    className="p-2 border rounded hover:bg-gray-50"
                  >
                    ✎
                  </button>

                  <button
                    onClick={() => onDelete(p.id)}
                    className="p-2 border rounded text-red-600 hover:bg-red-50"
                  >
                    🗑
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ================= MODAL ================= */}
      {openForm && (
        <ProductForm
          product={editing}
          onClose={() => {
            setOpenForm(false);
            setEditing(null);
            load();
          }}
        />
      )}
    </>
  );
}