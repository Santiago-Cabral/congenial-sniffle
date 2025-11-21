import { useState } from "react";
import { Store, Truck, CreditCard, Bell, Save } from "lucide-react";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    storeName: "Forrajeria Jovita",
    email: "contacto@forrajeriajovita.com",
    phone: "+54 9 11 1234-5678",
    address: "Villa Carmela, Buenos Aires",
    description: "Tu dietética de confianza con productos naturales y saludables",
    
    // Envío
    freeShipping: true,
    freeShippingMinimum: 5000,
    shippingCost: 1500,
    deliveryTime: "24-48 horas",
    
    // Pagos
    cash: true,
    bankTransfer: true,
    cbu: "0000003100010000000001",
    alias: "JOVITA.DIETETICA",
    cards: true,
    
    // Notificaciones
    emailNewOrder: true,
    emailLowStock: true,
    whatsappNewOrder: false
  });

  const [hasChanges, setHasChanges] = useState(false);

  const handleChange = (field, value) => {
    setSettings({ ...settings, [field]: value });
    setHasChanges(true);
  };

  const handleSave = () => {
    // Aquí iría la lógica para guardar en la API
    console.log("Guardando configuración:", settings);
    alert("Configuración guardada exitosamente");
    setHasChanges(false);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-[#1C1C1C] mb-2">
            Configuración
          </h1>
          <p className="text-[#5A564E]">
            Administra la configuración de tu tienda
          </p>
        </div>

        {hasChanges && (
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-3 bg-[#F24C00] text-white font-bold rounded-xl hover:brightness-110 transition shadow-lg"
          >
            <Save size={20} />
            Guardar Cambios
          </button>
        )}
      </div>

      {/* Información General */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <Store size={24} className="text-[#F24C00]" />
          <div>
            <h2 className="text-xl font-bold text-[#1C1C1C]">
              Información General
            </h2>
            <p className="text-sm text-[#5A564E]">
              Información básica de tu tienda
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-[#1C1C1C] mb-2">
              Nombre de la Tienda
            </label>
            <input
              type="text"
              value={settings.storeName}
              onChange={(e) => handleChange("storeName", e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#F24C00] focus:ring-4 focus:ring-[#F24C00]/10 transition outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#1C1C1C] mb-2">
              Email de Contacto
            </label>
            <input
              type="email"
              value={settings.email}
              onChange={(e) => handleChange("email", e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#F24C00] focus:ring-4 focus:ring-[#F24C00]/10 transition outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#1C1C1C] mb-2">
              Teléfono
            </label>
            <input
              type="tel"
              value={settings.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#F24C00] focus:ring-4 focus:ring-[#F24C00]/10 transition outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#1C1C1C] mb-2">
              Dirección
            </label>
            <input
              type="text"
              value={settings.address}
              onChange={(e) => handleChange("address", e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#F24C00] focus:ring-4 focus:ring-[#F24C00]/10 transition outline-none"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-[#1C1C1C] mb-2">
              Descripción
            </label>
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
            <h2 className="text-xl font-bold text-[#1C1C1C]">
              Configuración de Envío
            </h2>
            <p className="text-sm text-[#5A564E]">
              Gestiona las opciones de envío y entrega
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Envío Gratis Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <p className="font-semibold text-[#1C1C1C]">Envío Gratis</p>
              <p className="text-sm text-[#5A564E]">
                Ofrecer envío gratis en compras superiores a un monto mínimo
              </p>
            </div>
            <button
              onClick={() => handleChange("freeShipping", !settings.freeShipping)}
              className={`relative w-14 h-8 rounded-full transition ${
                settings.freeShipping ? "bg-[#F24C00]" : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                  settings.freeShipping ? "translate-x-6" : ""
                }`}
              />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-[#1C1C1C] mb-2">
                Monto Mínimo para Envío Gratis
              </label>
              <input
                type="number"
                value={settings.freeShippingMinimum}
                onChange={(e) => handleChange("freeShippingMinimum", e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#F24C00] focus:ring-4 focus:ring-[#F24C00]/10 transition outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1C1C1C] mb-2">
                Costo de Envío
              </label>
              <input
                type="number"
                value={settings.shippingCost}
                onChange={(e) => handleChange("shippingCost", e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#F24C00] focus:ring-4 focus:ring-[#F24C00]/10 transition outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-[#1C1C1C] mb-2">
                Tiempo de Entrega Estimado
              </label>
              <input
                type="text"
                value={settings.deliveryTime}
                onChange={(e) => handleChange("deliveryTime", e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#F24C00] focus:ring-4 focus:ring-[#F24C00]/10 transition outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Métodos de Pago */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <CreditCard size={24} className="text-[#F24C00]" />
          <div>
            <h2 className="text-xl font-bold text-[#1C1C1C]">
              Métodos de Pago
            </h2>
            <p className="text-sm text-[#5A564E]">
              Configura los métodos de pago disponibles
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Efectivo */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <p className="font-semibold text-[#1C1C1C]">Efectivo</p>
              <p className="text-sm text-[#5A564E]">
                Permitir pago en efectivo contra entrega
              </p>
            </div>
            <button
              onClick={() => handleChange("cash", !settings.cash)}
              className={`relative w-14 h-8 rounded-full transition ${
                settings.cash ? "bg-[#F24C00]" : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                  settings.cash ? "translate-x-6" : ""
                }`}
              />
            </button>
          </div>

          {/* Transferencia Bancaria */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <p className="font-semibold text-[#1C1C1C]">
                Transferencia Bancaria
              </p>
              <p className="text-sm text-[#5A564E]">
                Permitir pago por transferencia bancaria
              </p>
            </div>
            <button
              onClick={() => handleChange("bankTransfer", !settings.bankTransfer)}
              className={`relative w-14 h-8 rounded-full transition ${
                settings.bankTransfer ? "bg-[#F24C00]" : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                  settings.bankTransfer ? "translate-x-6" : ""
                }`}
              />
            </button>
          </div>

          {settings.bankTransfer && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ml-4">
              <div>
                <label className="block text-sm font-semibold text-[#1C1C1C] mb-2">
                  CBU
                </label>
                <input
                  type="text"
                  value={settings.cbu}
                  onChange={(e) => handleChange("cbu", e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#F24C00] focus:ring-4 focus:ring-[#F24C00]/10 transition outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#1C1C1C] mb-2">
                  Alias
                </label>
                <input
                  type="text"
                  value={settings.alias}
                  onChange={(e) => handleChange("alias", e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#F24C00] focus:ring-4 focus:ring-[#F24C00]/10 transition outline-none"
                />
              </div>
            </div>
          )}

          {/* Tarjetas */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <p className="font-semibold text-[#1C1C1C]">
                Tarjetas de Crédito/Débito
              </p>
              <p className="text-sm text-[#5A564E]">
                Permitir pago con tarjetas
              </p>
            </div>
            <button
              onClick={() => handleChange("cards", !settings.cards)}
              className={`relative w-14 h-8 rounded-full transition ${
                settings.cards ? "bg-[#F24C00]" : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                  settings.cards ? "translate-x-6" : ""
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Notificaciones */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <Bell size={24} className="text-[#F24C00]" />
          <div>
            <h2 className="text-xl font-bold text-[#1C1C1C]">
              Notificaciones
            </h2>
            <p className="text-sm text-[#5A564E]">
              Configura cómo quieres recibir notificaciones
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <p className="font-semibold text-[#1C1C1C]">
                Email - Nueva Orden
              </p>
              <p className="text-sm text-[#5A564E]">
                Recibir email cuando hay una nueva orden
              </p>
            </div>
            <button
              onClick={() => handleChange("emailNewOrder", !settings.emailNewOrder)}
              className={`relative w-14 h-8 rounded-full transition ${
                settings.emailNewOrder ? "bg-[#F24C00]" : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                  settings.emailNewOrder ? "translate-x-6" : ""
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <p className="font-semibold text-[#1C1C1C]">
                Email - Bajo Stock
              </p>
              <p className="text-sm text-[#5A564E]">
                Recibir email cuando un producto tiene bajo stock
              </p>
            </div>
            <button
              onClick={() => handleChange("emailLowStock", !settings.emailLowStock)}
              className={`relative w-14 h-8 rounded-full transition ${
                settings.emailLowStock ? "bg-[#F24C00]" : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                  settings.emailLowStock ? "translate-x-6" : ""
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <p className="font-semibold text-[#1C1C1C]">
                WhatsApp - Nueva Orden
              </p>
              <p className="text-sm text-[#5A564E]">
                Recibir mensaje de WhatsApp cuando hay una nueva orden
              </p>
            </div>
            <button
              onClick={() => handleChange("whatsappNewOrder", !settings.whatsappNewOrder)}
              className={`relative w-14 h-8 rounded-full transition ${
                settings.whatsappNewOrder ? "bg-[#F24C00]" : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                  settings.whatsappNewOrder ? "translate-x-6" : ""
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}