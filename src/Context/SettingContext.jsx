// src/Context/SettingContext.jsx
import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { getSettings, updateSettings as apiUpdateSettings } from "../admin/services/apiService";

const CACHE_KEY = "jovita_settings_cache";

const defaultSettings = {
  storeName: "Forrajeria Jovita",
  email: "contacto@forrajeriajovita.com",
  phone: "+54 9 3814669135",
  address: "Aragón 34 Yerba Buena, Argentina",
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

function normalizeZones(zones) {
  if (!Array.isArray(zones)) return defaultSettings.shippingZones;
  return zones.map(z => ({
    id: z.id ?? Date.now(),
    price: Number(z.price ?? 0),
    label: String(z.label ?? `Zona - $${z.price ?? 0}`),
    localities: Array.isArray(z.localities) ? z.localities.map(l => String(l).toLowerCase().trim()) : []
  })).sort((a,b) => a.price - b.price);
}

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const mergeWithDefaults = useCallback((incoming) => {
    if (!incoming) return { ...defaultSettings, shippingZones: normalizeZones(defaultSettings.shippingZones) };

    const merged = { ...defaultSettings, ...incoming };

    merged.shippingZones = normalizeZones(incoming.shippingZones ?? defaultSettings.shippingZones);

    merged.freeShippingMinimum = Number(incoming.freeShippingMinimum ?? defaultSettings.freeShippingMinimum);
    merged.shippingCost = Number(incoming.shippingCost ?? defaultSettings.shippingCost);
    merged.defaultShippingPrice = Number(incoming.defaultShippingPrice ?? defaultSettings.defaultShippingPrice);

    // IMPORTANT: preserve backend boolean values exactly if present
    merged.freeShipping = Object.prototype.hasOwnProperty.call(incoming, "freeShipping") ? incoming.freeShipping : defaultSettings.freeShipping;
    merged.cash = Object.prototype.hasOwnProperty.call(incoming, "cash") ? incoming.cash : defaultSettings.cash;
    merged.bankTransfer = Object.prototype.hasOwnProperty.call(incoming, "bankTransfer") ? incoming.bankTransfer : defaultSettings.bankTransfer;
    merged.cards = Object.prototype.hasOwnProperty.call(incoming, "cards") ? incoming.cards : defaultSettings.cards;
    merged.emailNewOrder = Object.prototype.hasOwnProperty.call(incoming, "emailNewOrder") ? incoming.emailNewOrder : defaultSettings.emailNewOrder;
    merged.emailLowStock = Object.prototype.hasOwnProperty.call(incoming, "emailLowStock") ? incoming.emailLowStock : defaultSettings.emailLowStock;
    merged.whatsappNewOrder = Object.prototype.hasOwnProperty.call(incoming, "whatsappNewOrder") ? incoming.whatsappNewOrder : defaultSettings.whatsappNewOrder;
    merged.whatsappLowStock = Object.prototype.hasOwnProperty.call(incoming, "whatsappLowStock") ? incoming.whatsappLowStock : defaultSettings.whatsappLowStock;

    merged.cbu = incoming.cbu ?? defaultSettings.cbu;
    merged.alias = incoming.alias ?? defaultSettings.alias;
    merged.bankName = incoming.bankName ?? defaultSettings.bankName;
    merged.accountHolder = incoming.accountHolder ?? defaultSettings.accountHolder;

    return merged;
  }, []);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getSettings();
      const merged = mergeWithDefaults(data);
      if (mountedRef.current) {
        setSettings(merged);
        setHasChanges(false);
        localStorage.setItem(CACHE_KEY, JSON.stringify(merged));
      }
    } catch (err) {
      console.error("Error cargando settings:", err);
      setError(err?.message || String(err));
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          const merged = mergeWithDefaults(parsed);
          if (mountedRef.current) {
            setSettings(merged);
            setHasChanges(false);
          }
        } else {
          if (mountedRef.current) {
            setSettings(mergeWithDefaults(null));
            setHasChanges(false);
          }
        }
      } catch (cacheErr) {
        console.error("Error leyendo cache:", cacheErr);
        if (mountedRef.current) {
          setSettings(mergeWithDefaults(null));
          setHasChanges(false);
        }
      }
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [mergeWithDefaults]);

  useEffect(() => { loadSettings(); }, [loadSettings]);

  const saveSettings = useCallback(async () => {
    if (!settings) return { ok: false, error: "No settings to save" };
    setSaving(true);
    try {
      const token = localStorage.getItem("admin_token");
      if (!token) throw new Error("No autorizado");

      // send current settings to backend
      const saved = await apiUpdateSettings(settings);

      // backend returns canonical DTO -> merge and set
      const merged = mergeWithDefaults(saved);
      if (mountedRef.current) {
        setSettings(merged);
        setHasChanges(false);
        localStorage.setItem(CACHE_KEY, JSON.stringify(merged));
      }

      window.dispatchEvent(new CustomEvent("settings:saved", { detail: merged }));
      return { ok: true };
    } catch (err) {
      console.error("Error guardando settings:", err);
      return { ok: false, error: err?.message || String(err) };
    } finally {
      if (mountedRef.current) setSaving(false);
    }
  }, [settings, mergeWithDefaults]);

  const updateSetting = useCallback((field, value) => {
    setSettings(prev => {
      const next = { ...(prev ?? {}), [field]: value };
      if (field === "shippingZones" && Array.isArray(value)) {
        next.shippingZones = normalizeZones(value);
      }
      return next;
    });
    setHasChanges(true);
  }, []);

  const addShippingZone = useCallback((price, label, localities = []) => {
    if (isNaN(price) || Number(price) < 0) return;
    setSettings(prev => {
      const zones = (prev?.shippingZones ?? []).slice();
      const newZone = { id: Date.now(), price: Number(price), label: String(label || `Zona - $${price}`), localities: Array.isArray(localities) ? localities.map(l => String(l).toLowerCase().trim()) : [] };
      return { ...(prev ?? {}), shippingZones: [...zones, newZone].sort((a,b) => a.price - b.price) };
    });
    setHasChanges(true);
  }, []);

  const updateShippingZone = useCallback((id, field, value) => {
    setSettings(prev => {
      const zones = (prev?.shippingZones ?? []).map(z => z.id === id ? { ...z, [field]: field === "price" ? Number(value) : value } : z).sort((a,b) => a.price - b.price);
      return { ...(prev ?? {}), shippingZones: zones };
    });
    setHasChanges(true);
  }, []);

  const deleteShippingZone = useCallback((id) => {
    setSettings(prev => ({ ...(prev ?? {}), shippingZones: (prev?.shippingZones ?? []).filter(z => z.id !== id) }));
    setHasChanges(true);
  }, []);

  const addLocalityToZone = useCallback((zoneId, locality) => {
    if (!locality || !String(locality).trim()) return;
    const normalized = String(locality).toLowerCase().trim();
    setSettings(prev => {
      const zones = (prev?.shippingZones ?? []).map(z => {
        if (z.id !== zoneId) return z;
        const exists = (z.localities ?? []).map(l => String(l).toLowerCase().trim()).includes(normalized);
        return exists ? z : { ...z, localities: [...(z.localities ?? []), normalized] };
      });
      return { ...(prev ?? {}), shippingZones: zones };
    });
    setHasChanges(true);
  }, []);

  const removeLocalityFromZone = useCallback((zoneId, locality) => {
    setSettings(prev => {
      const zones = (prev?.shippingZones ?? []).map(z => z.id === zoneId ? { ...z, localities: (z.localities ?? []).filter(loc => loc !== locality) } : z);
      return { ...(prev ?? {}), shippingZones: zones };
    });
    setHasChanges(true);
  }, []);

  const calculateShippingCost = useCallback((locality) => {
    if (!locality || !String(locality).trim()) return { cost: 0, zone: null, error: "Ingresá la localidad o barrio" };
    const normalized = String(locality).toLowerCase().trim();
    const zones = (settings && Array.isArray(settings.shippingZones)) ? settings.shippingZones : defaultSettings.shippingZones;
    const defaultPrice = settings?.defaultShippingPrice ?? defaultSettings.defaultShippingPrice;
    for (const zone of zones) {
      if (!zone.localities || zone.localities.length === 0) continue;
      const found = zone.localities.some(loc => normalized.includes(loc) || loc.includes(normalized));
      if (found) return { cost: zone.price, zone, message: zone.label, matchedLocality: locality };
    }
    return { cost: defaultPrice, zone: null, message: `Localidad no encontrada - $${defaultPrice}`, matchedLocality: locality, isDefault: true };
  }, [settings]);

  const validateCbu = useCallback((cbuValue) => {
    if (!cbuValue) return false;
    const digits = String(cbuValue).replace(/\D/g, "");
    return digits.length === 22;
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(mergeWithDefaults(null));
    setHasChanges(true);
  }, [mergeWithDefaults]);

  return (
    <SettingsContext.Provider value={{
      settings,
      hasChanges,
      loading,
      saving,
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
    }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}
