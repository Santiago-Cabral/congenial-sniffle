// src/admin/pages/SettingsPage.jsx
import React, { useState } from "react";
import { Store, Truck, CreditCard, Bell, Save, Plus, Trash2, MapPin, X } from "lucide-react";
import { useSettings } from "../../Context/SettingContext";

export default function SettingsPage() {
  const {
    settings,
    hasChanges,
    saving,
    updateSetting,
    saveSettings,
    resetSettings,
    validateCbu,
    addShippingZone,
    updateShippingZone,
    deleteShippingZone,
    addLocalityToZone,
    removeLocalityFromZone
  } = useSettings();

  const [newZonePrice, setNewZonePrice] = useState("");
  const [newZoneLabel, setNewZoneLabel] = useState("");
  const [newLocalityInputs, setNewLocalityInputs] = useState({});

  // Si no hay settings todavía, mostramos un placeholder simple.
  if (!settings) return <div>Cargando configuración...</div>;

  const handleChange = (field, value) => {
    if (field === "freeShippingMinimum" || field === "shippingCost" || field === "defaultShippingPrice") {
      const parsed = Number(value || 0);
      updateSetting(field, Number.isNaN(parsed) ? 0 : parsed);
    } else if (
      field === "bankTransfer" ||
      field === "cash" ||
      field === "cards" ||
      field === "freeShipping" ||
      field === "emailNewOrder" ||
      field === "emailLowStock" ||
      field === "whatsappNewOrder" ||
      field === "whatsappLowStock"
    ) {
      updateSetting(field, !!value);
    } else {
      updateSetting(field, value);
    }
  };

  // <-- Cambiado a async y usando await correctamente
  const handleSaveClick = async () => {
    if (settings.bankTransfer && !validateCbu(settings.cbu)) {
      alert("El CBU debe tener 22 dígitos. Por favor verificalo antes de guardar.");
      return;
    }

    try {
      const result = await saveSettings(); // <- await obligatorio
      if (result && result.ok) {
        // Puedes usar alguna notificación bonita en vez de alert más adelante
        alert("Configuración guardada exitosamente");
      } else {
        console.error("Error guardando settings:", result?.error);
        alert("Error al guardar la configuración. Revisa la consola.");
      }
    } catch (err) {
      console.error("Error inesperado al guardar settings:", err);
      alert("Error inesperado al guardar la configuración.");
    }
  };

  const handleAddZone = () => {
    const price = parseFloat(newZonePrice);
    
    if (isNaN(price) || price < 0) {
      alert("Por favor ingresa un precio válido");
      return;
    }

    const label = newZoneLabel.trim() || `Zona - $${price}`;
    addShippingZone(price, label, []);
    
    setNewZonePrice("");
    setNewZoneLabel("");
  };

  const handleAddLocality = (zoneId) => {
    const locality = newLocalityInputs[zoneId];
    if (!locality || locality.trim() === "") {
      alert("Por favor ingresa una localidad o barrio");
      return;
    }

    addLocalityToZone(zoneId, locality.trim());
    setNewLocalityInputs({ ...newLocalityInputs, [zoneId]: "" });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-[#1C1C1C] mb-2">Configuración</h1>
          <p className="text-[#5A564E]">Administra la configuración de tu tienda</p>
        </div>

        <div className="flex gap-2">
          {hasChanges && (
            <button
              type="button"
              onClick={handleSaveClick}
              disabled={saving || !hasChanges}
              aria-busy={saving}
              className={`flex items-center gap-2 px-6 py-3 font-bold rounded-xl transition shadow-lg ${
                saving ? "bg-gray-300 text-gray-600 cursor-not-allowed" : "bg-[#F24C00] text-white hover:brightness-110"
              }`}
            >
              <Save size={20} />
              {saving ? "Guardando..." : "Guardar Cambios"}
            </button>
          )}
          <button
            type="button"
            onClick={resetSettings}
            disabled={saving}
            className="px-4 py-3 bg-white border rounded-xl hover:bg-gray-50"
          >
            Resetear Cambios
          </button>
        </div>
      </div>

      {/* Información General */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <Store size={24} className="text-[#F24C00]" />
          <div>
            <h2 className="text-xl font-bold text-[#1C1C1C]">Información General</h2>
            <p className="text-sm text-[#5A564E]">Información básica de tu tienda</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-[#1C1C1C] mb-2">Nombre de la Tienda</label>
            <input
              type="text"
              value={settings.storeName}
              onChange={(e) => handleChange("storeName", e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#F24C00] focus:ring-4 focus:ring-[#F24C00]/10 transition outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#1C1C1C] mb-2">Email de Contacto</label>
            <input
              type="email"
              value={settings.email}
              onChange={(e) => handleChange("email", e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#F24C00] focus:ring-4 focus:ring-[#F24C00]/10 transition outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#1C1C1C] mb-2">Teléfono</label>
            <input
              type="tel"
              value={settings.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#F24C00] focus:ring-4 focus:ring-[#F24C00]/10 transition outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#1C1C1C] mb-2">Dirección</label>
            <input
              type="text"
              value={settings.address}
              onChange={(e) => handleChange("address", e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#F24C00] focus:ring-4 focus:ring-[#F24C00]/10 transition outline-none"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-[#1C1C1C] mb-2">Descripción</label>
            <textarea
              value={settings.description}
              onChange={(e) => handleChange("description", e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#F24C00] focus:ring-4 focus:ring-[#F24C00]/10 transition outline-none resize-none"
            />
          </div>
        </div>
      </div>

      {/* Configuración de Envío */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <Truck size={24} className="text-[#F24C00]" />
          <div>
            <h2 className="text-xl font-bold text-[#1C1C1C]">Configuración de Envío</h2>
            <p className="text-sm text-[#5A564E]">Gestiona las opciones de envío y entrega</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Ubicación del Local */}
          <div className="p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
            <div className="flex items-center gap-2 mb-3">
              <MapPin size={20} className="text-blue-600" />
              <h3 className="text-sm font-bold text-blue-900">Ubicación del Local</h3>
            </div>
            <input
              type="text"
              value={settings.storeLocation || ""}
              onChange={(e) => handleChange("storeLocation", e.target.value)}
              placeholder="Ej: Yerba Buena, Tucumán"
              className="w-full px-4 py-3 border-2 border-blue-300 rounded-xl focus:border-[#F24C00] focus:ring-4 focus:ring-[#F24C00]/10 transition outline-none"
            />
            <p className="text-xs text-blue-700 mt-2">
              💡 Esta ubicación se muestra al cliente cuando retira en local
            </p>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <p className="font-semibold text-[#1C1C1C]">Envío Gratis</p>
              <p className="text-sm text-[#5A564E]">Ofrecer envío gratis en compras superiores a un monto mínimo</p>
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={!!settings.freeShipping}
                onChange={(e) => handleChange("freeShipping", e.target.checked)}
                aria-checked={!!settings.freeShipping}
                className="hidden"
              />
              <div className={`relative w-14 h-8 rounded-full transition ${settings.freeShipping ? "bg-[#F24C00]" : "bg-gray-300"}`}>
                <span className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${settings.freeShipping ? "translate-x-6" : ""}`} />
              </div>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-[#1C1C1C] mb-2">Monto Mínimo para Envío Gratis</label>
              <input
                type="number"
                value={settings.freeShippingMinimum}
                onChange={(e) => handleChange("freeShippingMinimum", e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#F24C00] focus:ring-4 focus:ring-[#F24C00]/10 transition outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1C1C1C] mb-2">Precio por Defecto (localidades no encontradas)</label>
              <input
                type="number"
                value={settings.defaultShippingPrice}
                onChange={(e) => handleChange("defaultShippingPrice", e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#F24C00] focus:ring-4 focus:ring-[#F24C00]/10 transition outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-[#1C1C1C] mb-2">Tiempo de Entrega Estimado</label>
              <input
                type="text"
                value={settings.deliveryTime}
                onChange={(e) => handleChange("deliveryTime", e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#F24C00] focus:ring-4 focus:ring-[#F24C00]/10 transition outline-none"
              />
            </div>
          </div>

          {/* CRUD ZONAS DE ENVÍO POR LOCALIDADES/BARRIOS */}
          <div className="mt-6 p-4 bg-orange-50 rounded-xl border-2 border-orange-200">
            <div className="flex items-center gap-2 mb-4">
              <MapPin size={20} className="text-orange-600" />
              <h3 className="text-sm font-bold text-orange-900">Zonas de Envío por Localidad/Barrio</h3>
            </div>
            
            <p className="text-xs text-orange-700 mb-4">
              📍 Crea zonas con diferentes precios y asigna localidades o barrios a cada una. 
              El sistema detecta automáticamente la zona según lo que ingrese el cliente.
            </p>

            {/* Lista de zonas */}
            {settings.shippingZones && settings.shippingZones.length > 0 && (
              <div className="space-y-4 mb-4">
                {settings.shippingZones.map((zone) => (
                  <div key={zone.id} className="bg-white p-4 rounded-lg border-2 border-orange-200">
                    {/* Header de la zona */}
                    <div className="flex items-center gap-2 mb-3">
                      <input
                        type="text"
                        value={zone.label}
                        onChange={(e) => updateShippingZone(zone.id, "label", e.target.value)}
                        placeholder="Nombre de la zona"
                        className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-[#F24C00] focus:ring-2 focus:ring-[#F24C00]/10 outline-none font-semibold"
                      />
                      <input
                        type="number"
                        value={zone.price}
                        onChange={(e) => updateShippingZone(zone.id, "price", e.target.value)}
                        placeholder="Precio"
                        className="w-32 px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-[#F24C00] focus:ring-2 focus:ring-[#F24C00]/10 outline-none font-semibold"
                      />
                      <button
                        type="button"
                        onClick={() => deleteShippingZone(zone.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Eliminar zona"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    {/* Localidades de la zona */}
                    <div className="ml-2">
                      <p className="text-xs font-semibold text-gray-700 mb-2">
                        Localidades/Barrios en esta zona:
                      </p>
                      
                      {zone.localities && zone.localities.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-2">
                          {zone.localities.map((locality, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium"
                            >
                              {locality}
                              <button
                                type="button"
                                onClick={() => removeLocalityFromZone(zone.id, locality)}
                                className="ml-1 hover:bg-orange-200 rounded-full p-0.5 transition"
                              >
                                <X size={12} />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Input para agregar localidad */}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newLocalityInputs[zone.id] || ""}
                          onChange={(e) => setNewLocalityInputs({ ...newLocalityInputs, [zone.id]: e.target.value })}
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddLocality(zone.id);
                            }
                          }}
                          placeholder="Agregar localidad o barrio..."
                          className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg focus:border-[#F24C00] focus:ring-2 focus:ring-[#F24C00]/10 outline-none text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddLocality(zone.id)}
                          className="px-3 py-1.5 bg-[#F24C00] text-white rounded-lg hover:brightness-110 transition text-sm font-semibold"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        💡 Ej: "San Miguel de Tucumán", "Centro", "Barrio Norte"
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Agregar nueva zona */}
            <div className="space-y-2 pt-4 border-t-2 border-orange-300">
              <p className="text-xs font-semibold text-orange-900">Crear nueva zona de envío:</p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newZoneLabel}
                  onChange={(e) => setNewZoneLabel(e.target.value)}
                  placeholder="Nombre de la zona (ej: Zona 1 - $800)"
                  className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-[#F24C00] focus:ring-2 focus:ring-[#F24C00]/10 outline-none text-sm"
                />
                <input
                  type="number"
                  value={newZonePrice}
                  onChange={(e) => setNewZonePrice(e.target.value)}
                  placeholder="Precio ($)"
                  className="w-28 px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-[#F24C00] focus:ring-2 focus:ring-[#F24C00]/10 outline-none text-sm"
                />
                <button
                  type="button"
                  onClick={handleAddZone}
                  className="flex items-center gap-1 px-4 py-2 bg-[#F24C00] text-white rounded-lg hover:brightness-110 transition text-sm font-semibold"
                >
                  <Plus size={16} />
                  Crear Zona
                </button>
              </div>
              <p className="text-xs text-orange-600">
                💡 Después de crear la zona, podrás agregarle localidades/barrios
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Métodos de Pago */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <CreditCard size={24} className="text-[#F24C00]" />
          <div>
            <h2 className="text-xl font-bold text-[#1C1C1C]">Métodos de Pago</h2>
            <p className="text-sm text-[#5A564E]">Configura los métodos de pago disponibles</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Efectivo */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <p className="font-semibold text-[#1C1C1C]">Efectivo</p>
              <p className="text-sm text-[#5A564E]">Permitir pago en efectivo contra entrega</p>
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={!!settings.cash}
                onChange={(e) => handleChange("cash", e.target.checked)}
                aria-checked={!!settings.cash}
                className="hidden"
              />
              <div className={`relative w-14 h-8 rounded-full transition ${settings.cash ? "bg-[#F24C00]" : "bg-gray-300"}`}>
                <span className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${settings.cash ? "translate-x-6" : ""}`} />
              </div>
            </label>
          </div>

          {/* Transferencia */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <p className="font-semibold text-[#1C1C1C]">Transferencia Bancaria</p>
              <p className="text-sm text-[#5A564E]">Permitir pago por transferencia bancaria</p>
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={!!settings.bankTransfer}
                onChange={(e) => handleChange("bankTransfer", e.target.checked)}
                aria-checked={!!settings.bankTransfer}
                className="hidden"
              />
              <div className={`relative w-14 h-8 rounded-full transition ${settings.bankTransfer ? "bg-[#F24C00]" : "bg-gray-300"}`}>
                <span className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${settings.bankTransfer ? "translate-x-6" : ""}`} />
              </div>
            </label>
          </div>

          {settings.bankTransfer && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ml-4 p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
              <div className="md:col-span-2">
                <p className="text-sm font-semibold text-blue-900 mb-3">📋 Datos Bancarios (se mostrarán al cliente)</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#1C1C1C] mb-2">Nombre del Banco</label>
                <input
                  type="text"
                  value={settings.bankName}
                  onChange={(e) => handleChange("bankName", e.target.value)}
                  placeholder="Ej: Banco Macro"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#F24C00] focus:ring-4 focus:ring-[#F24C00]/10 transition outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#1C1C1C] mb-2">Titular de la Cuenta</label>
                <input
                  type="text"
                  value={settings.accountHolder}
                  onChange={(e) => handleChange("accountHolder", e.target.value)}
                  placeholder="Ej: Juan Pérez"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#F24C00] focus:ring-4 focus:ring-[#F24C00]/10 transition outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#1C1C1C] mb-2">CBU</label>
                <input
                  type="text"
                  value={settings.cbu}
                  onChange={(e) => handleChange("cbu", e.target.value)}
                  placeholder="22 dígitos"
                  maxLength={22}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#F24C00] focus:ring-4 focus:ring-[#F24C00]/10 transition outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#1C1C1C] mb-2">Alias</label>
                <input
                  type="text"
                  value={settings.alias}
                  onChange={(e) => handleChange("alias", e.target.value)}
                  placeholder="Ej: MI.NEGOCIO.MP"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#F24C00] focus:ring-4 focus:ring-[#F24C00]/10 transition outline-none"
                />
              </div>
            </div>
          )}

          {/* Tarjetas */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <p className="font-semibold text-[#1C1C1C]">Tarjetas de Crédito/Débito</p>
              <p className="text-sm text-[#5A564E]">Permitir pago con tarjetas (Payway)</p>
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={!!settings.cards}
                onChange={(e) => handleChange("cards", e.target.checked)}
                aria-checked={!!settings.cards}
                className="hidden"
              />
              <div className={`relative w-14 h-8 rounded-full transition ${settings.cards ? "bg-[#F24C00]" : "bg-gray-300"}`}>
                <span className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${settings.cards ? "translate-x-6" : ""}`} />
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Notificaciones */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <Bell size={24} className="text-[#F24C00]" />
          <div>
            <h2 className="text-xl font-bold text-[#1C1C1C]">Notificaciones</h2>
            <p className="text-sm text-[#5A564E]">Configura cómo quieres recibir notificaciones</p>
          </div>
        </div>

        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">📱</span>
            <p className="font-semibold text-green-900">Número de WhatsApp configurado</p>
          </div>
          <p className="text-sm text-green-700">
            Las notificaciones se enviarán a: <span className="font-bold">+54 9 381 4669135</span>
          </p>
          <p className="text-xs text-green-600 mt-1">
            💡 Las notificaciones abrirán WhatsApp automáticamente con el mensaje preparado
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <p className="font-semibold text-[#1C1C1C]">WhatsApp - Nueva Orden</p>
              <p className="text-sm text-[#5A564E]">Recibir mensaje de WhatsApp cuando hay una nueva orden</p>
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={!!settings.whatsappNewOrder}
                onChange={(e) => handleChange("whatsappNewOrder", e.target.checked)}
                className="hidden"
              />
              <div className={`relative w-14 h-8 rounded-full transition ${settings.whatsappNewOrder ? "bg-[#F24C00]" : "bg-gray-300"}`}>
                <span className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${settings.whatsappNewOrder ? "translate-x-6" : ""}`} />
              </div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <p className="font-semibold text-[#1C1C1C]">WhatsApp - Stock Bajo</p>
              <p className="text-sm text-[#5A564E]">Recibir mensaje de WhatsApp cuando un producto tiene stock bajo</p>
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={!!settings.whatsappLowStock}
                onChange={(e) => handleChange("whatsappLowStock", e.target.checked)}
                className="hidden"
              />
              <div className={`relative w-14 h-8 rounded-full transition ${settings.whatsappLowStock ? "bg-[#F24C00]" : "bg-gray-300"}`}>
                <span className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${settings.whatsappLowStock ? "translate-x-6" : ""}`} />
              </div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
