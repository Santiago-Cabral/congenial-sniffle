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

const API_URL = "https://forrajeria-jovita-api.onrender.com/api";

function getToken() {
  return localStorage.getItem("admin_token") || "";
}

// ── API helpers para unidades ──────────────────────────────────────
async function fetchUnits(productId) {
  const res = await fetch(`${API_URL}/Products/${productId}/units`);
  if (!res.ok) throw new Error("Error al cargar unidades");
  const data = await res.json();
  // La API devuelve PascalCase → normalizar a camelCase
  return (data.Units ?? data.units ?? []).map(u => ({
    id: u.Id ?? u.id,
    displayName: u.DisplayName ?? u.displayName,
    unitLabel: u.UnitLabel ?? u.unitLabel,
    conversionToBase: u.ConversionToBase ?? u.conversionToBase,
    retailPrice: u.RetailPrice ?? u.retailPrice ?? null,
    minSellStep: u.MinSellStep ?? u.minSellStep,
    stockDecimals: u.StockDecimals ?? u.stockDecimals,
    allowFractionalQuantity: u.AllowFractionalQuantity ?? u.allowFractionalQuantity,
    barcode: u.Barcode ?? u.barcode ?? "",
  }));
}

async function saveUnit(productId, unit, isEdit) {
  const url = isEdit
    ? `${API_URL}/Products/${productId}/units/${unit.id}`
    : `${API_URL}/Products/${productId}/units`;

  const res = await fetch(url, {
    method: isEdit ? "PUT" : "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(unit),
  });
  if (!res.ok) throw new Error("Error al guardar unidad");
  return res.json();
}

async function deleteUnit(productId, unitId) {
  const res = await fetch(`${API_URL}/Products/${productId}/units/${unitId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!res.ok) throw new Error("Error al eliminar unidad");
}

// ── Formulario vacío de unidad ─────────────────────────────────────
const emptyUnit = () => ({
  id: null,
  displayName: "",
  unitLabel: "",
  conversionToBase: 1,
  retailPrice: "",
  minSellStep: 1,
  stockDecimals: 0,
  allowFractionalQuantity: false,
  barcode: "",
});

// ══════════════════════════════════════════════════════════════════
export default function ProductForm({ product, onClose }) {
  const [activeTab, setActiveTab] = useState("general");

  // ── General ───────────────────────────────────────────────────
  const [form, setForm] = useState({
    code: "",
    name: "",
    costPrice: "",
    retailPrice: "",
    wholesalePrice: "",
    baseUnit: 2,
    categoryId: "",
    isActived: true,
    isFeatured: false,
    stock: "",
  });

  const [categories, setCategories]           = useState([]);
  const [images, setImages]                   = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingStock, setLoadingStock]       = useState(false);
  const [saving, setSaving]                   = useState(false);
  const [uploading, setUploading]             = useState(false);
  const [error, setError]                     = useState("");

  // ── Unidades ──────────────────────────────────────────────────
  const [units, setUnits]                     = useState([]);
  const [loadingUnits, setLoadingUnits]       = useState(false);
  const [unitForm, setUnitForm]               = useState(emptyUnit());
  const [editingUnit, setEditingUnit]         = useState(false);
  const [savingUnit, setSavingUnit]           = useState(false);
  const [unitError, setUnitError]             = useState("");
  const [showUnitForm, setShowUnitForm]       = useState(false);

  // ── Cargar datos iniciales ─────────────────────────────────────
  useEffect(() => {
    const loadCategories = async () => {
      setLoadingCategories(true);
      try {
        const data = await listCategories();
        setCategories(data || []);
      } catch { /* silent */ }
      finally { setLoadingCategories(false); }
    };
    loadCategories();

    if (product) {
      setForm({
        code:           product.code || "",
        name:           product.name || "",
        costPrice:      product.costPrice != null ? String(product.costPrice) : "",
        retailPrice:    product.retailPrice != null ? String(product.retailPrice) : "",
        wholesalePrice: product.wholesalePrice != null ? String(product.wholesalePrice) : "",
        baseUnit:       product.baseUnitId || 2,
        categoryId:     product.categoryId || "",
        isActived:      product.isActived ?? true,
        isFeatured:     product.isFeatured ?? false,
        stock:          product.stock != null ? String(product.stock) : "",
      });
      setImages(product.image ? [product.image] : []);

      // Stock
      const loadStock = async () => {
        setLoadingStock(true);
        try {
          const stocks = await getProductStock(product.id);
          if (Array.isArray(stocks) && stocks.length > 0) {
            const total = stocks.reduce((sum, s) => sum + Number(s.quantity || 0), 0);
            setForm(prev => ({ ...prev, stock: String(total) }));
          }
        } catch { /* silent */ }
        finally { setLoadingStock(false); }
      };
      loadStock();

      // Unidades
      loadUnits(product.id);
    } else {
      setForm(prev => ({ ...prev, baseUnit: 2, isActived: true, isFeatured: false, stock: "" }));
      setImages([]);
    }
  }, [product]);

  async function loadUnits(productId) {
    setLoadingUnits(true);
    try {
      const data = await fetchUnits(productId);
      setUnits(data);
    } catch { setUnits([]); }
    finally { setLoadingUnits(false); }
  }

  // ── Handlers generales ────────────────────────────────────────
  const handleChange = (field, value) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const handleFilesChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    setError("");
    try {
      const urls = [];
      for (const file of files) {
        const url = await uploadSingleImage(file, "products");
        if (url) urls.push(url);
      }
      if (!urls.length) throw new Error("No se pudieron subir las imágenes");
      setImages(prev => [...prev, ...urls]);
    } catch (err) {
      setError(err.message || "Error subiendo imágenes");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleRemoveImage = (index) =>
    setImages(prev => prev.filter((_, i) => i !== index));

  // ── Submit general ────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (!form.name.trim()) throw new Error("El nombre del producto es obligatorio");
      if (!form.retailPrice || Number(form.retailPrice) <= 0)
        throw new Error("El precio de venta debe ser mayor a 0");
      if (!form.categoryId) throw new Error("Selecciona una categoría");

      const mainImage = images[0] || null;
      let productId = product?.id || null;

      const payload = {
        ...(product ? { id: product.id } : {}),
        code:           form.code.trim(),
        name:           form.name.trim(),
        costPrice:      Number(form.costPrice || 0),
        retailPrice:    Number(form.retailPrice || 0),
        wholesalePrice: Number(form.wholesalePrice || 0),
        baseUnit:       Number(form.baseUnit || 2),
        image:          mainImage,
        categoryId:     Number(form.categoryId),
        isActived:      !!form.isActived,
        isFeatured:     !!form.isFeatured,
        ...(product ? { updateDate: new Date().toISOString() } : {}),
      };

      if (product?.id) {
        await updateProduct(product.id, payload);
      } else {
        const created = await createProduct(payload);
        productId = created?.id ?? created?.Id;
      }

      const stockNumber = form.stock === "" ? null : Number(String(form.stock).replace(",", "."));
      if (productId && stockNumber !== null && !Number.isNaN(stockNumber)) {
        await setProductStock(productId, { branchId: 1, productId, quantity: stockNumber });
      }

      onClose();
    } catch (err) {
      setError(err.message || "Error al guardar el producto");
    } finally {
      setSaving(false);
    }
  };

  // ── Handlers de unidades ──────────────────────────────────────
  function openNewUnit() {
    setUnitForm(emptyUnit());
    setEditingUnit(false);
    setUnitError("");
    setShowUnitForm(true);
  }

  function openEditUnit(unit) {
    setUnitForm({
      id:                     unit.id,
      displayName:            unit.displayName,
      unitLabel:              unit.unitLabel,
      conversionToBase:       unit.conversionToBase,
      retailPrice:            unit.retailPrice != null ? String(unit.retailPrice) : "",
      minSellStep:            unit.minSellStep,
      stockDecimals:          unit.stockDecimals,
      allowFractionalQuantity: unit.allowFractionalQuantity,
      barcode:                unit.barcode || "",
    });
    setEditingUnit(true);
    setUnitError("");
    setShowUnitForm(true);
  }

  async function handleSaveUnit(e) {
    e.preventDefault();
    if (!product?.id) return;
    setSavingUnit(true);
    setUnitError("");
    try {
      if (!unitForm.displayName.trim()) throw new Error("El nombre es obligatorio");
      if (!unitForm.retailPrice || Number(unitForm.retailPrice) <= 0)
        throw new Error("El precio debe ser mayor a 0");

      const payload = {
        ...(editingUnit ? { id: unitForm.id } : {}),
        displayName:            unitForm.displayName.trim(),
        unitLabel:              unitForm.unitLabel.trim() || unitForm.displayName.trim(),
        conversionToBase:       Number(unitForm.conversionToBase || 1),
        retailPrice:            Number(unitForm.retailPrice),
        minSellStep:            Number(unitForm.minSellStep || 1),
        stockDecimals:          Number(unitForm.stockDecimals || 0),
        allowFractionalQuantity: !!unitForm.allowFractionalQuantity,
        barcode:                unitForm.barcode || null,
      };

      await saveUnit(product.id, payload, editingUnit);
      await loadUnits(product.id);
      setShowUnitForm(false);
    } catch (err) {
      setUnitError(err.message || "Error al guardar la unidad");
    } finally {
      setSavingUnit(false);
    }
  }

  async function handleDeleteUnit(unitId) {
    if (!confirm("¿Eliminar esta presentación?")) return;
    try {
      await deleteUnit(product.id, unitId);
      await loadUnits(product.id);
    } catch { alert("Error al eliminar la unidad"); }
  }

  // ── Render ────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute left-1/2 top-1/2 w-full max-w-3xl -translate-x-1/2 -translate-y-1/2">
        <div className="bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto p-6">

          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">
              {product ? "Editar producto" : "Nuevo producto"}
            </h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
            <button
              type="button"
              onClick={() => setActiveTab("general")}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                activeTab === "general"
                  ? "bg-white shadow text-[#F24C00]"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              General
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("units")}
              disabled={!product?.id}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                activeTab === "units"
                  ? "bg-white shadow text-[#F24C00]"
                  : "text-gray-500 hover:text-gray-700"
              } disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              Presentaciones {units.length > 0 && `(${units.length})`}
            </button>
          </div>

          {/* ── TAB GENERAL ── */}
          {activeTab === "general" && (
            <>
              {error && (
                <div className="mb-4 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-semibold mb-1">Código</label>
                    <input type="text" className="w-full rounded-lg border px-3 py-2" placeholder="Código" value={form.code} onChange={e => handleChange("code", e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1">Nombre del producto</label>
                    <input type="text" className="w-full rounded-lg border px-3 py-2" placeholder="Nombre" value={form.name} onChange={e => handleChange("name", e.target.value)} required />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <label className="block text-sm font-semibold mb-1">Costo</label>
                    <input type="number" className="w-full rounded-lg border px-3 py-2" placeholder="Costo" value={form.costPrice} onChange={e => handleChange("costPrice", e.target.value.replace(",", "."))} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1">Precio venta</label>
                    <input type="number" className="w-full rounded-lg border px-3 py-2" placeholder="Precio venta" value={form.retailPrice} onChange={e => handleChange("retailPrice", e.target.value.replace(",", "."))} required />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1">Mayorista</label>
                    <input type="number" className="w-full rounded-lg border px-3 py-2" placeholder="Mayorista" value={form.wholesalePrice} onChange={e => handleChange("wholesalePrice", e.target.value.replace(",", "."))} />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-semibold mb-1">Unidad base</label>
                    <select className="w-full rounded-lg border px-3 py-2" value={form.baseUnit} onChange={e => handleChange("baseUnit", Number(e.target.value))}>
                      <option value={1}>Kilogramo</option>
                      <option value={2}>Unidad</option>
                      <option value={3}>Litro</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1">Categoría</label>
                    <select className="w-full rounded-lg border px-3 py-2" value={form.categoryId} onChange={e => handleChange("categoryId", Number(e.target.value))} disabled={loadingCategories}>
                      <option value="">{loadingCategories ? "Cargando..." : "Selecciona una categoría"}</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1">Stock (sucursal principal)</label>
                  <input type="number" className="w-full rounded-lg border px-3 py-2" placeholder="Cantidad en stock" value={form.stock} onChange={e => handleChange("stock", e.target.value.replace(",", "."))} />
                  {loadingStock && <p className="text-xs text-gray-500 mt-1">Cargando stock actual...</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1">Imágenes del producto</label>
                  <p className="text-xs text-gray-500 mb-2">Se pueden subir varias, pero <strong>solo se guardará una (la primera) en la API</strong>.</p>
                  <input type="file" accept="image/*" multiple onChange={handleFilesChange} className="mb-3" />
                  {uploading && <div className="text-sm text-blue-600 mb-2">Subiendo imágenes...</div>}
                  {images.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {images.map((url, idx) => (
                        <div key={idx} className="relative rounded-lg overflow-hidden border">
                          <img src={url} alt={`img-${idx}`} className="h-24 w-full object-cover" />
                          <button type="button" onClick={() => handleRemoveImage(idx)} className="absolute right-1 top-1 rounded-full bg-black/60 px-2 text-xs text-white">✕</button>
                          {idx === 0 && <span className="absolute left-1 bottom-1 rounded bg-green-600/80 px-2 text-[10px] text-white">Principal</span>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-3 border-t pt-4">
                  <div className="flex items-center gap-2">
                    <input id="isActived" type="checkbox" checked={!!form.isActived} onChange={e => handleChange("isActived", e.target.checked)} className="w-4 h-4 text-green-600 rounded" />
                    <label htmlFor="isActived" className="text-sm font-semibold">✅ Producto activo</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input id="isFeatured" type="checkbox" checked={!!form.isFeatured} onChange={e => handleChange("isFeatured", e.target.checked)} className="w-4 h-4 text-yellow-600 rounded" />
                    <label htmlFor="isFeatured" className="text-sm font-semibold">⭐ Producto destacado</label>
                    <span className="text-xs text-gray-500">(aparecerá en la sección destacados del home)</span>
                  </div>
                </div>

                <div className="mt-4 flex justify-end gap-3">
                  <button type="button" onClick={onClose} className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50">Cancelar</button>
                  <button type="submit" disabled={saving} className="rounded-lg px-5 py-2 text-sm font-semibold bg-green-600 text-white hover:bg-green-700 disabled:opacity-60">
                    {saving ? (product ? "Guardando..." : "Creando...") : (product ? "Guardar cambios" : "Crear producto")}
                  </button>
                </div>
              </form>
            </>
          )}

          {/* ── TAB UNIDADES ── */}
          {activeTab === "units" && (
            <div className="space-y-4">
              {/* Aviso si es producto nuevo */}
              {!product?.id && (
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm p-3 rounded-lg">
                  Guardá el producto primero para poder agregar presentaciones.
                </div>
              )}

              {/* Lista de unidades */}
              {loadingUnits ? (
                <div className="text-center py-8 text-gray-500">Cargando presentaciones...</div>
              ) : units.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <p className="text-lg mb-1">Sin presentaciones</p>
                  <p className="text-sm">Agregá presentaciones para habilitar la compra por unidad.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {units.map(unit => (
                    <div key={unit.id} className="flex items-center justify-between bg-gray-50 rounded-xl p-4">
                      <div>
                        <p className="font-bold text-[#1C1C1C]">{unit.displayName}</p>
                        <p className="text-sm text-gray-500">{unit.unitLabel} · {unit.conversionToBase} kg</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="font-bold text-[#F24C00] text-lg">
                          {unit.retailPrice != null
                            ? `$${Number(unit.retailPrice).toLocaleString("es-AR")}`
                            : <span className="text-gray-400 text-sm">Sin precio</span>
                          }
                        </p>
                        <button onClick={() => openEditUnit(unit)} className="p-2 border rounded hover:bg-white transition">✎</button>
                        <button onClick={() => handleDeleteUnit(unit.id)} className="p-2 border rounded text-red-600 hover:bg-red-50 transition">🗑</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Botón agregar */}
              {product?.id && !showUnitForm && (
                <button
                  type="button"
                  onClick={openNewUnit}
                  className="w-full py-3 border-2 border-dashed border-[#F24C00] text-[#F24C00] font-semibold rounded-xl hover:bg-[#FFF4EF] transition"
                >
                  + Agregar presentación
                </button>
              )}

              {/* Formulario de unidad */}
              {showUnitForm && (
                <form onSubmit={handleSaveUnit} className="bg-[#FFF4EF] border border-[#F24C00]/30 rounded-xl p-5 space-y-4">
                  <h4 className="font-bold text-[#1C1C1C]">
                    {editingUnit ? "Editar presentación" : "Nueva presentación"}
                  </h4>

                  {unitError && (
                    <div className="text-sm text-red-700 bg-red-50 border border-red-200 p-3 rounded-lg">
                      {unitError}
                    </div>
                  )}

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="block text-sm font-semibold mb-1">Nombre <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        className="w-full rounded-lg border px-3 py-2"
                        placeholder="Ej: Bolsa 20kg, 1 Kilogramo, 100g"
                        value={unitForm.displayName}
                        onChange={e => setUnitForm(p => ({ ...p, displayName: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1">Etiqueta</label>
                      <input
                        type="text"
                        className="w-full rounded-lg border px-3 py-2"
                        placeholder="Ej: Kilogramos (kg)"
                        value={unitForm.unitLabel}
                        onChange={e => setUnitForm(p => ({ ...p, unitLabel: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="block text-sm font-semibold mb-1">Precio minorista <span className="text-red-500">*</span></label>
                      <input
                        type="number"
                        className="w-full rounded-lg border px-3 py-2"
                        placeholder="Ej: 2000"
                        value={unitForm.retailPrice}
                        onChange={e => setUnitForm(p => ({ ...p, retailPrice: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1">Conversión a base (kg)</label>
                      <input
                        type="number"
                        step="0.001"
                        className="w-full rounded-lg border px-3 py-2"
                        placeholder="Ej: 20 para bolsa de 20kg, 1 para 1kg, 0.1 para 100g"
                        value={unitForm.conversionToBase}
                        onChange={e => setUnitForm(p => ({ ...p, conversionToBase: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowUnitForm(false)}
                      className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-100"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={savingUnit}
                      className="rounded-lg px-5 py-2 text-sm font-semibold bg-[#F24C00] text-white hover:brightness-110 disabled:opacity-60"
                    >
                      {savingUnit ? "Guardando..." : editingUnit ? "Guardar cambios" : "Agregar"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}