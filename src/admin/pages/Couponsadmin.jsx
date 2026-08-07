import { useEffect, useState } from "react";
import { listCoupons, createCoupon, updateCoupon, deleteCoupon } from "../services/apiService";

const emptyForm = () => ({
  id: null,
  code: "",
  type: 0, // 0 = Porcentaje, 1 = Monto fijo
  value: "",
  minPurchase: "",
  maxUses: "",
  expirationDate: "",
  isActive: true,
});

export default function CouponsAdmin() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    const data = await listCoupons();
    setCoupons(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openNew = () => {
    setForm(emptyForm());
    setEditing(false);
    setError("");
    setOpenForm(true);
  };

  const openEdit = (c) => {
    setForm({
      id: c.id,
      code: c.code,
      type: c.type,
      value: String(c.value),
      minPurchase: c.minPurchase != null ? String(c.minPurchase) : "",
      maxUses: c.maxUses != null ? String(c.maxUses) : "",
      expirationDate: c.expirationDate ? c.expirationDate.substring(0, 10) : "",
      isActive: c.isActive,
    });
    setEditing(true);
    setError("");
    setOpenForm(true);
  };

  const handleChange = (field, val) => setForm((p) => ({ ...p, [field]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (!form.code.trim()) throw new Error("El código es obligatorio");
      if (!form.value || Number(form.value) <= 0) throw new Error("El valor debe ser mayor a 0");

      const payload = {
        code: form.code.trim().toUpperCase(),
        type: Number(form.type),
        value: Number(form.value),
        minPurchase: form.minPurchase ? Number(form.minPurchase) : null,
        maxUses: form.maxUses ? Number(form.maxUses) : null,
        expirationDate: form.expirationDate ? new Date(form.expirationDate).toISOString() : null,
        isActive: !!form.isActive,
      };

      if (editing) {
        await updateCoupon(form.id, payload);
      } else {
        await createCoupon(payload);
      }

      setOpenForm(false);
      load();
    } catch (err) {
      setError(err.message || "Error al guardar el cupón");
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (id) => {
    if (!confirm("¿Eliminar este cupón?")) return;
    await deleteCoupon(id);
    load();
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Cupones</h2>
          <p className="text-gray-500">Códigos de descuento para el checkout</p>
        </div>
        <button onClick={openNew} className="btn-primary">+ Nuevo cupón</button>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-6">Cargando cupones...</div>
        ) : coupons.length === 0 ? (
          <div className="text-center py-6 text-gray-500">No hay cupones creados</div>
        ) : (
          coupons.map((c) => (
            <div key={c.id} className="bg-white p-4 rounded flex items-center justify-between shadow">
              <div>
                <div className="font-mono font-bold text-lg">{c.code}</div>
                <div className="text-sm text-gray-500">
                  {c.type === 0 ? `${c.value}% de descuento` : `$${Number(c.value).toLocaleString("es-AR")} de descuento`}
                  {c.minPurchase != null && ` · Mín. $${Number(c.minPurchase).toLocaleString("es-AR")}`}
                  {c.maxUses != null && ` · ${c.usedCount}/${c.maxUses} usos`}
                  {c.maxUses == null && ` · ${c.usedCount} usos`}
                  {c.expirationDate && ` · Vence ${new Date(c.expirationDate).toLocaleDateString("es-AR")}`}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                  c.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                }`}>
                  {c.isActive ? "Activo" : "Inactivo"}
                </span>
                <button onClick={() => openEdit(c)} className="p-2 border rounded hover:bg-gray-50">✎</button>
                <button onClick={() => onDelete(c.id)} className="p-2 border rounded text-red-600 hover:bg-red-50">🗑</button>
              </div>
            </div>
          ))
        )}
      </div>

      {openForm && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpenForm(false)} />
          <div className="absolute left-1/2 top-1/2 w-full max-w-lg -translate-x-1/2 -translate-y-1/2">
            <div className="bg-white rounded-2xl shadow-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">{editing ? "Editar cupón" : "Nuevo cupón"}</h3>
                <button onClick={() => setOpenForm(false)} className="text-gray-500 hover:text-gray-700">✕</button>
              </div>

              {error && (
                <div className="mb-4 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Código</label>
                  <input
                    type="text"
                    className="w-full rounded-lg border px-3 py-2 font-mono uppercase"
                    placeholder="BIENVENIDA10"
                    value={form.code}
                    onChange={(e) => handleChange("code", e.target.value)}
                    required
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-semibold mb-1">Tipo</label>
                    <select
                      className="w-full rounded-lg border px-3 py-2"
                      value={form.type}
                      onChange={(e) => handleChange("type", Number(e.target.value))}
                    >
                      <option value={0}>Porcentaje (%)</option>
                      <option value={1}>Monto fijo ($)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1">Valor</label>
                    <input
                      type="number"
                      className="w-full rounded-lg border px-3 py-2"
                      placeholder={form.type === 0 ? "Ej: 10" : "Ej: 1500"}
                      value={form.value}
                      onChange={(e) => handleChange("value", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-semibold mb-1">Compra mínima</label>
                    <input
                      type="number"
                      className="w-full rounded-lg border px-3 py-2"
                      placeholder="Opcional"
                      value={form.minPurchase}
                      onChange={(e) => handleChange("minPurchase", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1">Usos máximos</label>
                    <input
                      type="number"
                      className="w-full rounded-lg border px-3 py-2"
                      placeholder="Vacío = ilimitado"
                      value={form.maxUses}
                      onChange={(e) => handleChange("maxUses", e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1">Fecha de vencimiento</label>
                  <input
                    type="date"
                    className="w-full rounded-lg border px-3 py-2"
                    value={form.expirationDate}
                    onChange={(e) => handleChange("expirationDate", e.target.value)}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    id="isActive"
                    type="checkbox"
                    checked={!!form.isActive}
                    onChange={(e) => handleChange("isActive", e.target.checked)}
                    className="w-4 h-4 text-green-600 rounded"
                  />
                  <label htmlFor="isActive" className="text-sm font-semibold">Cupón activo</label>
                </div>

                <div className="mt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setOpenForm(false)}
                    className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-lg px-5 py-2 text-sm font-semibold bg-green-600 text-white hover:bg-green-700 disabled:opacity-60"
                  >
                    {saving ? "Guardando..." : editing ? "Guardar cambios" : "Crear cupón"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}