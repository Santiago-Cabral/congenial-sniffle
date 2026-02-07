// src/admin/pages/Branches.jsx
import { useEffect, useState } from "react";
import {
  listBranches,
  createBranch,
  updateBranch,
  deleteBranch,
  setBranchActive
} from "../services/apiService";

export default function Branches() {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    address: "",
    isActive: true
  });

  // =============================
  // LOAD
  // =============================
  async function load() {
    setLoading(true);
    try {
      const data = await listBranches();

      // 🔒 normalizar id y valores
      const normalized = data.map(b => ({
        id: b.id ?? b.Id,
        name: b.name ?? b.Name ?? "",
        address: b.address ?? b.Address ?? "",
        isActive: b.isActive ?? b.IsActive ?? true
      }));

      setBranches(normalized);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  // =============================
  // FORM ACTIONS
  // =============================
  const submit = async () => {
    if (!form.name.trim()) {
      alert("El nombre es obligatorio");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        Name: form.name.trim(),
        Address: form.address.trim(),
        IsActive: form.isActive
      };

      if (editing) {
        await updateBranch(editing.id, payload);
      } else {
        await createBranch(payload);
      }

      resetForm();
      await load();
    } finally {
      setSaving(false);
    }
  };

  const edit = (b) => {
    setEditing(b);
    setForm({
      name: b.name ?? "",
      address: b.address ?? "",
      isActive: b.isActive ?? true
    });
  };

  const resetForm = () => {
    setEditing(null);
    setForm({
      name: "",
      address: "",
      isActive: true
    });
  };

  const toggleActive = async (b) => {
    await setBranchActive(b.id, !b.isActive);
    load();
  };

  const remove = async (id) => {
    if (!confirm("¿Eliminar sucursal?")) return;
    await deleteBranch(id);
    load();
  };

  if (loading) return <div>Cargando sucursales...</div>;

  // =============================
  // RENDER
  // =============================
  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Sucursales</h1>

      {/* FORM */}
      <div className="bg-white rounded shadow p-6 mb-8">
        <h2 className="font-semibold mb-4">
          {editing ? "Editar sucursal" : "Nueva sucursal"}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            className="border p-3 rounded"
            placeholder="Nombre"
            value={form.name}
            onChange={e =>
              setForm({ ...form, name: e.target.value })
            }
          />

          <input
            className="border p-3 rounded"
            placeholder="Dirección"
            value={form.address}
            onChange={e =>
              setForm({ ...form, address: e.target.value })
            }
          />

          <button
            disabled={saving}
            onClick={submit}
            className="bg-black text-white rounded px-4 py-2 disabled:opacity-50"
          >
            {editing ? "Guardar" : "Crear"}
          </button>
        </div>

        {editing && (
          <button
            onClick={resetForm}
            className="mt-3 text-sm underline text-gray-600"
          >
            Cancelar edición
          </button>
        )}
      </div>

      {/* LIST */}
      <div className="space-y-3">
        {branches.map(b => (
          <div
            key={b.id}
            className="bg-white rounded shadow p-4 flex justify-between items-center"
          >
            <div>
              <p className="font-semibold">{b.name}</p>
              <p className="text-sm text-gray-500">
                {b.address || "Sin dirección"}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => toggleActive(b)}
                className={`px-3 py-1 rounded text-sm ${
                  b.isActive
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {b.isActive ? "Activa" : "Inactiva"}
              </button>

              <button
                onClick={() => edit(b)}
                className="border px-3 py-1 rounded"
              >
                Editar
              </button>

              <button
                onClick={() => remove(b.id)}
                className="border px-3 py-1 rounded text-red-600"
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
