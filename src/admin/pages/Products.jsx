import { useEffect, useState } from "react";
import { listProducts, deleteProduct } from "../services/apiService";
import ProductForm from "../widgets/ProductFrom";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // ===============================
  // 🔄 Cargar productos
  // ===============================
  const load = async () => {
    setLoading(true);
    try {
      const data = await listProducts();

      // Ordenar por nombre
      data.sort((a, b) => a.name.localeCompare(b.name));

      setProducts(data);
      setFiltered(data);
    } catch (e) {
      console.error("Error cargando productos:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // ===============================
  // 🔍 Filtros y búsqueda
  // ===============================
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
          p.categoryName.toLowerCase().includes(q)
      );
    }

    setFiltered(result);
  }, [search, categoryFilter, products]);

  // ===============================
  // 🗑 Eliminar
  // ===============================
  const onDelete = async (id) => {
    if (!confirm("¿Eliminar producto?")) return;
    try {
      await deleteProduct(id);
      load();
    } catch (e) {
      console.error("Error al eliminar:", e);
    }
  };

  // ===============================
  // 📌 Categorías únicas
  // ===============================
  const categories = [
    "all",
    ...new Set(
      products
        .map((p) => p.categoryName)
        .filter((c) => c && c.trim() !== "")
    ),
  ];

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Productos</h2>
          <p className="text-gray-500">Gestiona el catálogo</p>
        </div>

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

      {/* Filtros */}
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

      {/* Listado */}
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
                  src={p.image ? p.image : "/placeholder.png"}
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

              <div className="flex items-center gap-4">
                <div className="font-bold">
                  ${(p.retailPrice ?? 0).toLocaleString("es-AR")}
                </div>

                <div className="text-sm text-gray-600">
                  Stock: {p.stock ?? 0}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditing(p);
                      setOpenForm(true);
                    }}
                    className="p-2 border rounded"
                  >
                    ✎
                  </button>

                  <button
                    onClick={() => onDelete(p.id)}
                    className="p-2 border rounded text-red-600"
                  >
                    🗑
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Formulario */}
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
