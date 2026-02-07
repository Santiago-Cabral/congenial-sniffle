// src/admin/pages/ClientFormModal.jsx  (o donde tengas ClientsPage)
import { useState } from "react";
import { X, Mail, Phone, MapPin, User } from "lucide-react";
import { createClient } from "../services/apiService";

export default function ClientFormModal({ onClose, onCreated }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;

    setError("");

    if (!name.trim()) {
      setError("El nombre es obligatorio.");
      return;
    }

    try {
      setSaving(true);

      // Adaptá si tu API usa otros nombres de campos
      await createClient({
        name,
        email,
        phone,
        address,
      });

      if (onCreated) {
        await onCreated();
      } else {
        onClose();
      }
    } catch (err) {
      console.error("Error creando cliente:", err);
      setError(err.message || "No se pudo crear el cliente-usuario");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[#1C1C1C]">
              Nuevo Cliente / Usuario
            </h2>
            <p className="text-sm text-[#5A564E] mt-1">
              Registra una nueva persona en el sistema
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded-xl">
              {error}
            </div>
          )}

          {/* Nombre */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-[#1C1C1C] flex items-center gap-2">
              <User size={16} />
              Nombre completo *
            </label>
            <input
              type="text"
              className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-[#F24C00] focus:ring-4 focus:ring-[#F24C00]/10 outline-none transition"
              placeholder="Ej: Juan Pérez"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-[#1C1C1C] flex items-center gap-2">
              <Mail size={16} />
              Email
            </label>
            <input
              type="email"
              className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-[#F24C00] focus:ring-4 focus:ring-[#F24C00]/10 outline-none transition"
              placeholder="correo@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Teléfono */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-[#1C1C1C] flex items-center gap-2">
              <Phone size={16} />
              Teléfono
            </label>
            <input
              type="text"
              className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-[#F24C00] focus:ring-4 focus:ring-[#F24C00]/10 outline-none transition"
              placeholder="+54 9 ..."
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          {/* Dirección */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-[#1C1C1C] flex items-center gap-2">
              <MapPin size={16} />
              Dirección
            </label>
            <input
              type="text"
              className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-[#F24C00] focus:ring-4 focus:ring-[#F24C00]/10 outline-none transition"
              placeholder="Calle, número, ciudad..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          {/* Botones */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-gray-300 text-sm font-semibold text-[#1C1C1C] hover:bg-gray-50 transition"
              disabled={saving}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#F24C00] text-white text-sm font-semibold shadow hover:brightness-110 transition disabled:opacity-60"
              disabled={saving}
            >
              {saving ? "Guardando..." : "Guardar cliente"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
