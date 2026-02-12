import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { getSettings, updateSettings as apiUpdateSettings } from "../admin/services/apiService";

const CACHE_KEY = "jovita_settings_cache";

const defaultSettings = {
  storeName: "Forrajeria Jovita",
  email: "contacto@forrajeriajovita.com",
  phone: "+54 9 3814669135",
  address: "Aragón 32 Yerba Buena, Argentina",
  description: "Tu dietética de confianza con productos naturales y saludables",
  storeLocation: "Yerba Buena, Tucumán",
  freeShipping: true,
  freeShippingMinimum: 5000,
  shippingCost: 1500,
  deliveryTime: "24-48 horas",
  shippingZones: [
    { id: 1, price: 800, label: "Zona 1 - $800", localities: ["yerba buena", "san pablo", "el portal"] },
    { id: 2, price: 1200, label: "Zona 2 - $1200", localities: ["san miguel de tucumán", "san miguel", "centro", "tucumán", "villa carmela", "barrio norte"] },
    { id: 3, price: 1800, label: "Zona 3 - $1800", localities: ["tafí viejo", "tafi viejo", "banda del río salí", "alderetes", "las talitas"] }
  ],
  defaultShippingPrice: 2500,
  cash: true,
  bankTransfer: true,
  cards: true,
  bankName: "Banco Macro",
  accountHolder: "Forrajeria Jovita S.R.L.",
  cbu: "0000003100010000000001",
  alias: "JOVITA.DIETETICA",
  emailNewOrder: true,
  emailLowStock: true,
  whatsappNewOrder: false,
  whatsappLowStock: false
};

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(defaultSettings);
  const [hasChanges, setHasChanges] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getSettings();
      const merged = { ...defaultSettings, ...data };
      
      setSettings(merged);
      localStorage.setItem(CACHE_KEY, JSON.stringify(merged));
    } catch (err) {
      console.error("❌ Error cargando settings:", err);
      setError(err.message);
      
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          setSettings({ ...defaultSettings, ...JSON.parse(cached) });
        }
      } catch {}
    } finally {
      setLoading(false);
    }
  }, []);

  const saveSettings = useCallback(async () => {
    try {
      const token = localStorage.getItem("admin_token");
      if (!token) throw new Error("No autorizado");

      await apiUpdateSettings(settings);

      setHasChanges(false);
      localStorage.setItem(CACHE_KEY, JSON.stringify(settings));

      window.dispatchEvent(new CustomEvent("settings:saved", { detail: settings }));

      return { ok: true };
    } catch (err) {
      console.error("❌ Error guardando settings:", err);
      return { ok: false, error: err.message };
    }
  }, [settings]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const updateSetting = useCallback((field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  }, []);

  const addShippingZone = useCallback((price, label, localities = []) => {
    if (isNaN(price) || price < 0) return;

    setSettings(prev => ({
      ...prev,
      shippingZones: [
        ...(prev.shippingZones || []),
        {
          id: Date.now(),
          price: Number(price),
          label: String(label || `Zona - $${price}`),
          localities: Array.isArray(localities) ? localities : []
        }
      ].sort((a, b) => a.price - b.price)
    }));
    setHasChanges(true);
  }, []);

  const updateShippingZone = useCallback((id, field, value) => {
    setSettings(prev => ({
      ...prev,
      shippingZones: (prev.shippingZones || []).map(z =>
        z.id === id
          ? {
              ...z,
              [field]: field === "price" ? Number(value) : value
            }
          : z
      ).sort((a, b) => a.price - b.price)
    }));
    setHasChanges(true);
  }, []);

  const deleteShippingZone = useCallback((id) => {
    setSettings(prev => ({
      ...prev,
      shippingZones: (prev.shippingZones || []).filter(z => z.id !== id)
    }));
    setHasChanges(true);
  }, []);

  const addLocalityToZone = useCallback((zoneId, locality) => {
    if (!locality || locality.trim() === "") return;

    setSettings(prev => ({
      ...prev,
      shippingZones: (prev.shippingZones || []).map(z => {
        if (z.id === zoneId) {
          const normalizedLocality = locality.toLowerCase().trim();
          if (z.localities && z.localities.includes(normalizedLocality)) {
            return z;
          }
          return {
            ...z,
            localities: [...(z.localities || []), normalizedLocality]
          };
        }
        return z;
      })
    }));
    setHasChanges(true);
  }, []);

  const removeLocalityFromZone = useCallback((zoneId, locality) => {
    setSettings(prev => ({
      ...prev,
      shippingZones: (prev.shippingZones || []).map(z => {
        if (z.id === zoneId) {
          return {
            ...z,
            localities: (z.localities || []).filter(loc => loc !== locality)
          };
        }
        return z;
      })
    }));
    setHasChanges(true);
  }, []);

  const calculateShippingCost = useCallback((locality) => {
    if (!locality || locality.trim() === "") {
      return { cost: 0, zone: null, error: "Ingresá la localidad o barrio" };
    }

    const normalizedLocality = locality.toLowerCase().trim();
    const zones = settings.shippingZones || defaultSettings.shippingZones;

    for (const zone of zones) {
      if (!zone.localities || zone.localities.length === 0) continue;
      
      const found = zone.localities.some(loc => {
        return normalizedLocality.includes(loc) || loc.includes(normalizedLocality);
      });

      if (found) {
        return {
          cost: zone.price,
          zone: zone,
          message: `${zone.label}`,
          matchedLocality: locality
        };
      }
    }

    const defaultPrice = settings.defaultShippingPrice || defaultSettings.defaultShippingPrice;
    
    return {
      cost: defaultPrice,
      zone: null,
      message: `Localidad no encontrada - $${defaultPrice}`,
      matchedLocality: locality,
      isDefault: true
    };
  }, [settings.shippingZones, settings.defaultShippingPrice]);

  const validateCbu = useCallback((cbuValue) => {
    if (!cbuValue) return false;
    const digits = String(cbuValue).replace(/\D/g, "");
    return digits.length === 22;
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(defaultSettings);
    setHasChanges(true);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#F24C00] mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Cargando configuración...</p>
        </div>
      </div>
    );
  }

  return (
    <SettingsContext.Provider
      value={{
        settings,
        hasChanges,
        loading,
        error,
        updateSetting,
        addShippingZone,
        updateShippingZone,
        deleteShippingZone,
        addLocalityToZone,
        removeLocalityFromZone,
        calculateShippingCost,
        saveSettings,
        resetSettings,
        loadSettings,
        validateCbu
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error("useSettings must be used within SettingsProvider");
  }
  return ctx;
}