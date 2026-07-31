import { useEffect, useState } from "react";
import { deleteProduct, mapProduct } from "../services/apiService";
import { sendLowStockNotification, sendMultipleLowStockNotification } from "../services/whatsappService";
import ProductForm from "../widgets/ProductFrom";

const API_URL = "https://forrajeria-jovita-api.onrender.com/api";
const PAGE_SIZE = 50;

export default function Products() {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [pricesMap, setPricesMap] = useState({});
  const [allCategories, setAllCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  // ==================================================
  // 🔄 Cargar página de productos (ya trae Stock incluido)
  // ==================================================
  const loadPage = async (pageToLoad) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/Products?page=${pageToLoad}&pageSize=${PAGE_SIZE}`);
      const raw = await res.json();
      const total = Number(res.headers.get("X-Total-Count")) || 0;

      const data = (Array.isArray(raw) ? raw : []).map(mapProduct);
      const sorted = [...data].sort((a, b) => (a.name || "").localeCompare(b.name || ""));
      setProducts(sorted);
      setFiltered(sorted);
      setTotalCount(total);
      setPage(pageToLoad);
    } catch (e) {
      console.error("Error cargando productos:", e);
    } finally {
      setLoading(false);
    }
  };

  // ==================================================
  // 💲 Precios + categorías: UNA sola llamada para todo el catálogo
  // (en vez de un fetch de unidades por producto)
  // ==================================================
  const loadPricesAndCategories = async () => {
    try {
      const res = await fetch(`${API_URL}/Products/all-with-units`);
      const data = await res.json();

      const prices = {};
      const cats = new Set();
      data.forEach((p) => {
        prices[p.id ?? p.Id] = p.baseRetailPrice ?? p.BaseRetailPrice ?? null;
        const catName = p.categoryName ?? p.CategoryName;
        if (catName) cats.add(catName);
      });

      setPricesMap(prices);
      setAllCategories(["all", ...Array.from(cats)]);
    } catch (e) {
      console.error("Error cargando precios/categorías:", e);
    }
  };

  useEffect(() => {
    loadPage(1);
    loadPricesAndCategories();
  }, []);

  // ==================================================
  // 📱 Monitoreo de stock bajo (sobre la página cargada)
  // ==================================================
  useEffect(() => {
    const checkLowStock = () => {
      const settings = JSON.parse(localStorage.getItem("jovita_settings_v1") || "{}");
      if (!settings.whatsappNewOrder || products.length === 0) return;

      const lowStockProducts = products.filter((p) => {
        const minStock = p.minStock || 10;
        return p.stock > 0 && p.stock <= minStock;
      });
      const outOfStockProducts = products.filter((p) => p.stock === 0);

      if (lowStockProducts.length > 0 || outOfStockProducts.length > 0) {
        const lastNotification = localStorage.getItem("last_stock_notification");
        const now = Date.now();
        if (!lastNotification || now - parseInt(lastNotification) > 24 * 60 * 60 * 1000) {
          localStorage.setItem("last_stock_notification", now.toString());
        }
      }
    };
    checkLowStock();
  }, [products]);

  // ==================================================
  // 🔍 Filtros y búsqueda (sobre la página cargada)
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
      loadPage(page);
    } catch (e) {
      console.error("Error al eliminar:", e);
    }
  };

  const lowStockCount = filtered.filter((p) => {
    const minStock = p.minStock || 10;
    return p.stock <= minStock;
  }).length;

  return (
    <>
      {/* ================= HEADER ================= */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Productos</h2>
          <p className="text-gray-500">Gestiona el catálogo ({totalCount} en total)</p>
        </div>

        <div className="flex gap-2">
          {lowStockCount > 0 && (
            <button
              onClick={() => {
                const lowStock = filtered.filter((p) => (p.minStock || 10) >= p.stock && p.stock > 0);
                const noStock = filtered.filter((p) => p.stock === 0);
                const all = [...lowStock, ...noStock];
                if (all.length === 1) sendLowStockNotification(all[0]);
                else if (all.length > 1) sendMultipleLowStockNotification(all);
              }}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition flex items-center gap-2"
            >
              <span>⚠️</span>
              <span>Avisar Stock Bajo ({lowStockCount})</span>
            </button>
          )}

          <button
            onClick={() => { setEditing(null); setOpenForm(true); }}
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
          placeholder="Buscar producto (en esta página)..."
          className="border rounded px-3 py-2 w-64"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="border rounded px-3 py-2"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          {allCategories.map((c) => (
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
          <div className="text-center py-6 text-gray-500">No se encontraron productos</div>
        ) : (
          filtered.map((p) => (
            <div key={p.id} className="bg-white p-4 rounded flex items-center justify-between shadow">
              <div className="flex items-center gap-4">
                <img src={p.image || "/sin-foto.png"} className="w-14 h-14 object-cover rounded" alt={p.name} />
                <div>
                  <div className="font-semibold">{p.name}</div>
                  <div className="text-sm text-gray-500">{p.categoryName || "Sin categoría"} · {p.baseUnit}</div>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="font-bold">
                  {pricesMap[p.id] != null ? `$${Number(pricesMap[p.id]).toLocaleString("es-AR")}` : "$0"}
                </div>

                <div className={`text-sm font-semibold ${p.stock <= 5 ? "text-red-600" : "text-gray-700"}`}>
                  Stock: {p.stock}
                </div>

                <div className="flex gap-2">
                  <button onClick={() => { setEditing(p); setOpenForm(true); }} className="p-2 border rounded hover:bg-gray-50">✎</button>
                  <button onClick={() => onDelete(p.id)} className="p-2 border rounded text-red-600 hover:bg-red-50">🗑</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ================= PAGINACIÓN ================= */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            onClick={() => loadPage(page - 1)}
            disabled={page <= 1}
            className="px-4 py-2 border rounded disabled:opacity-40"
          >
            ← Anterior
          </button>
          <span className="text-sm text-gray-600">Página {page} de {totalPages}</span>
          <button
            onClick={() => loadPage(page + 1)}
            disabled={page >= totalPages}
            className="px-4 py-2 border rounded disabled:opacity-40"
          >
            Siguiente →
          </button>
        </div>
      )}

      {/* ================= MODAL ================= */}
      {openForm && (
        <ProductForm
          product={editing}
          onClose={() => { setOpenForm(false); setEditing(null); loadPage(page); }}
        />
      )}
    </>
  );
}