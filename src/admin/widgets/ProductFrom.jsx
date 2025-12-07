// src/admin/widgets/ProductForm.jsx

import { useEffect, useState } from "react";
import {
  createProduct,
  updateProduct,
  listCategories,
  getProductStock,
  setProductStock,
} from "../services/apiService";
import { uploadSingleImage } from "../../lib/uploadImage";

export default function ProductForm({ product, onClose }) {
  // -----------------------------
  // Estado del formulario
  // -----------------------------
  const [form, setForm] = useState({
    code: "",
    name: "",
    costPrice: "",
    retailPrice: "",
    wholesalePrice: "",
    baseUnit: 2,
    categoryId: "",
    isActived: true,
    stock: "", // 👈 NUEVO: campo de stock
  });

  const [categories, setCategories] = useState([]);
  const [images, setImages] = useState([]); // array de URLs
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingStock, setLoadingStock] = useState(false); // 👈 NUEVO
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  // -----------------------------
  // Cargar categorías y datos al editar
  // -----------------------------
  useEffect(() => {
    const loadCategories = async () => {
      setLoadingCategories(true);
      try {
        const data = await listCategories();
        setCategories(data || []);
      } catch (err) {
        console.error("Error cargando categorías:", err);
      } finally {
        setLoadingCategories(false);
      }
    };

    loadCategories();

    // Modo edición
    if (product) {
      setForm((prev) => ({
        ...prev,
        code: product.code || "",
        name: product.name || "",
        costPrice:
          product.costPrice !== undefined && product.costPrice !== null
            ? String(product.costPrice)
            : "",
        retailPrice:
          product.retailPrice !== undefined && product.retailPrice !== null
            ? String(product.retailPrice)
            : "",
        wholesalePrice:
          product.wholesalePrice !== undefined &&
          product.wholesalePrice !== null
            ? String(product.wholesalePrice)
            : "",
        baseUnit: product.baseUnitId || 2,
        categoryId: product.categoryId || "",
        isActived: product.isActived ?? true,
        stock:
          product.stock !== undefined && product.stock !== null
            ? String(product.stock)
            : "", // 👈 usamos el stock que viene del listado si existe
      }));

      setImages(product.image ? [product.image] : []);

      // Además, traemos stock desde el endpoint de stock por producto
      const loadStock = async () => {
        setLoadingStock(true);
        try {
          const stocks = await getProductStock(product.id);
          // stocks = [ { branchId, branchName, quantity, lastUpdated } ]

          if (Array.isArray(stocks) && stocks.length > 0) {
            // Podés sumar todo o tomar solo sucursal principal.
            // Acá sumamos todo:
            const total = stocks.reduce(
              (sum, s) => sum + Number(s.quantity || 0),
              0
            );
            setForm((prev) => ({
              ...prev,
              stock: String(total),
            }));
          }
        } catch (err) {
          console.error("Error cargando stock:", err);
        } finally {
          setLoadingStock(false);
        }
      };

      loadStock();
    } else {
      // modo creación: aseguramos default controlado
      setForm((prev) => ({
        ...prev,
        baseUnit: 2,
        isActived: true,
        stock: "", // vacio por defecto
      }));
      setImages([]);
    }
  }, [product]);

  // -----------------------------
  // Handlers genéricos
  // -----------------------------
  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // -----------------------------
  // Manejo de imágenes locales + Supabase
  // -----------------------------
  const handleFilesChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setUploading(true);
    setError("");

    try {
      const uploadedUrls = [];

      for (const file of files) {
        // Sube y comprime una por una
        const url = await uploadSingleImage(file, "products");
        if (url) {
          uploadedUrls.push(url);
        }
      }

      if (uploadedUrls.length === 0) {
        throw new Error("No se pudieron subir las imágenes");
      }

      // Agregamos al array de imágenes existente
      setImages((prev) => [...prev, ...uploadedUrls]);
    } catch (err) {
      console.error("Upload error:", err);
      setError(
        err.message ||
          "Error subiendo imágenes. Revisa las políticas de Supabase / RLS."
      );
    } finally {
      setUploading(false);
      // reseteamos input para poder volver a seleccionar las mismas imágenes si hace falta
      e.target.value = "";
    }
  };

  const handleRemoveImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // -----------------------------
  // Submit (crear / editar)
  // -----------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      if (!form.name.trim()) {
        throw new Error("El nombre del producto es obligatorio");
      }
      if (!form.retailPrice || Number(form.retailPrice) <= 0) {
        throw new Error("El precio de venta debe ser mayor a 0");
      }
      if (!form.categoryId) {
        throw new Error("Selecciona una categoría");
      }

      const mainImage = images[0] || null; // 👉 solo guardamos una en la API

      let productId = product?.id || null;

      if (product?.id) {
        // -------------------
        // MODO EDICIÓN (PUT)
        // -------------------
        const payload = {
          id: product.id,
          code: form.code.trim(),
          name: form.name.trim(),
          costPrice: Number(form.costPrice || 0),
          retailPrice: Number(form.retailPrice || 0),
          wholesalePrice: Number(form.wholesalePrice || 0),
          baseUnit: Number(form.baseUnit || 2),
          image: mainImage,
          categoryId: Number(form.categoryId),
          isActived: !!form.isActived,
          updateDate: new Date().toISOString(),
        };

        await updateProduct(product.id, payload);
        productId = product.id;
      } else {
        // -------------------
        // MODO CREACIÓN (POST)
        // -------------------
        const payload = {
          code: form.code.trim(),
          name: form.name.trim(),
          costPrice: Number(form.costPrice || 0),
          retailPrice: Number(form.retailPrice || 0),
          wholesalePrice: Number(form.wholesalePrice || 0),
          baseUnit: Number(form.baseUnit || 2),
          image: mainImage,
          categoryId: Number(form.categoryId),
          isActived: !!form.isActived,
        };

        const created = await createProduct(payload);
        // Aseguramos el id (por si viene con mayúscula/minúscula)
        productId = created?.id ?? created?.Id;
      }

      // -----------------------------
      // 💾 Guardar STOCK (SetStock)
      // -----------------------------
      const stockNumber =
        form.stock === "" ? null : Number(String(form.stock).replace(",", "."));

      if (productId && stockNumber !== null && !Number.isNaN(stockNumber)) {
        // Usamos sucursal principal = 1 (ajustalo según tu BD)
        const body = {
          branchId: 1,
          productId: productId,
          quantity: stockNumber,
        };

        await setProductStock(productId, body);
      }

      onClose();
    } catch (err) {
      console.error("Error guardando producto:", err);
      setError(err.message || "Error al guardar el producto");
    } finally {
      setSaving(false);
    }
  };

  // -----------------------------
  // Render
  // -----------------------------
  return (
    <div className="fixed inset-0 z-50">
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* modal */}
      <div className="absolute left-1/2 top-1/2 w-full max-w-3xl -translate-x-1/2 -translate-y-1/2">
        <div className="bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">
              {product ? "Editar producto" : "Nuevo producto"}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-4 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Código & Nombre */}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Código
                </label>
                <input
                  type="text"
                  className="w-full rounded-lg border px-3 py-2"
                  placeholder="Código del producto"
                  value={form.code}
                  onChange={(e) => handleChange("code", e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">
                  Nombre del producto
                </label>
                <input
                  type="text"
                  className="w-full rounded-lg border px-3 py-2"
                  placeholder="Nombre"
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Precios */}
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Costo
                </label>
                <input
                  type="number"
                  className="w-full rounded-lg border px-3 py-2"
                  placeholder="Costo"
                  value={form.costPrice}
                  onChange={(e) =>
                    handleChange("costPrice", e.target.value.replace(",", "."))
                  }
                />
              </div>
              <div>
                <label className="block text.sm font-semibold mb-1">
                  Precio venta
                </label>
                <input
                  type="number"
                  className="w-full rounded-lg border px-3 py-2"
                  placeholder="Precio venta"
                  value={form.retailPrice}
                  onChange={(e) =>
                    handleChange(
                      "retailPrice",
                      e.target.value.replace(",", ".")
                    )
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Mayorista
                </label>
                <input
                  type="number"
                  className="w-full rounded-lg border px-3 py-2"
                  placeholder="Mayorista"
                  value={form.wholesalePrice}
                  onChange={(e) =>
                    handleChange(
                      "wholesalePrice",
                      e.target.value.replace(",", ".")
                    )
                  }
                />
              </div>
            </div>

            {/* Unidad & Categoría */}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Unidad base
                </label>
                <select
                  className="w-full rounded-lg border px-3 py-2"
                  value={form.baseUnit}
                  onChange={(e) =>
                    handleChange("baseUnit", Number(e.target.value))
                  }
                >
                  <option value={1}>Kilogramo</option>
                  <option value={2}>Unidad</option>
                  <option value={3}>Litro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">
                  Categoría
                </label>
                <select
                  className="w-full rounded-lg border px-3 py-2"
                  value={form.categoryId}
                  onChange={(e) =>
                    handleChange("categoryId", Number(e.target.value))
                  }
                  disabled={loadingCategories}
                >
                  <option value="">
                    {loadingCategories
                      ? "Cargando categorías..."
                      : "Selecciona una categoría"}
                  </option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Stock */}
            <div>
              <label className="block text-sm font-semibold mb-1">
                Stock (sucursal principal)
              </label>
              <input
                type="number"
                className="w-full rounded-lg border px-3 py-2"
                placeholder="Cantidad en stock"
                value={form.stock}
                onChange={(e) =>
                  handleChange("stock", e.target.value.replace(",", "."))
                }
              />
              {loadingStock && (
                <p className="text-xs text-gray-500 mt-1">
                  Cargando stock actual...
                </p>
              )}
            </div>

            {/* Imágenes */}
            <div>
              <label className="block text-sm font-semibold mb-1">
                Imágenes del producto
              </label>
              <p className="text-xs text-gray-500 mb-2">
                Se pueden subir varias, pero{" "}
                <strong>solo se guardará una (la primera) en la API</strong>.
              </p>

              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFilesChange}
                className="mb-3"
              />

              {uploading && (
                <div className="text-sm text-blue-600 mb-2">
                  Subiendo imágenes...
                </div>
              )}

              {images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {images.map((url, idx) => (
                    <div
                      key={idx}
                      className="relative rounded-lg overflow-hidden border"
                    >
                      <img
                        src={url}
                        alt={`img-${idx}`}
                        className="h-24 w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute right-1 top-1 rounded-full bg-black/60 px-2 text-xs text-white"
                      >
                        ✕
                      </button>
                      {idx === 0 && (
                        <span className="absolute left-1 bottom-1 rounded bg-green-600/80 px-2 text-[10px] text-white">
                          Principal
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Activo */}
            <div className="flex items-center gap-2">
              <input
                id="isActived"
                type="checkbox"
                checked={!!form.isActived}
                onChange={(e) => handleChange("isActived", e.target.checked)}
              />
              <label htmlFor="isActived" className="text-sm font-semibold">
                Producto activo
              </label>
            </div>

            {/* Botones */}
            <div className="mt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border px-4 py-2 text-sm"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="btn-primary rounded-lg px-5 py-2 text-sm font-semibold disabled:opacity-60"
              >
                {saving
                  ? product
                    ? "Guardando cambios..."
                    : "Creando producto..."
                  : product
                  ? "Guardar cambios"
                  : "Crear producto"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
