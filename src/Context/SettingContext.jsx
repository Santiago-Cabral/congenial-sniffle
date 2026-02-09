import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback
} from "react";

const STORAGE_KEY = "jovita_settings_v1";

const defaultSettings = {
  // ===============================
  // 🏪 TIENDA
  // ===============================
  storeName: "Forrajeria Jovita",
  email: "contacto@forrajeriajovita.com",
  phone: "+54 9 3814669136",
  address: "Aragón 32, Yerba Buena, Tucumán",
  description: "Tu dietética de confianza con productos naturales y saludables",

  // ===============================
  // 📍 UBICACIÓN DEL LOCAL
  // ===============================
  storeLocation: "Yerba Buena, Tucumán",

  // ===============================
  // 🚚 ENVÍOS
  // ===============================
  freeShipping: true,
  freeShippingMinimum: 5000,
  shippingCost: 1500,
  deliveryTime: "24-48 horas",

  /**
   * 🔹 Zonas de envío por localidad/barrio
   * Cada zona tiene un precio y una lista de localidades/barrios
   * { id: number, price: number, label: string, localities: string[] }
   */
  shippingZones: [
    { 
      id: 1, 
      price: 800, 
      label: "Zona 1 - $800",
      localities: ["yerba buena", "san pablo", "el portal"]
    },
    { 
      id: 2, 
      price: 1200, 
      label: "Zona 2 - $1200",
      localities: ["san miguel de tucumán", "san miguel", "centro", "tucumán", "villa carmela", "barrio norte"]
    },
    { 
      id: 3, 
      price: 1800, 
      label: "Zona 3 - $1800",
      localities: ["tafí viejo", "tafi viejo", "banda del río salí", "alderetes", "las talitas"]
    }
  ],

  // Precio por defecto para localidades no encontradas
  defaultShippingPrice: 2500,

  // ===============================
  // 💳 PAGOS
  // ===============================
  cash: true,
  bankTransfer: true,
  cards: true,

  // ===============================
  // 🏦 DATOS BANCARIOS
  // ===============================
  bankName: "Banco Macro",
  accountHolder: "Forrajeria Jovita S.R.L.",
  cbu: "0000003100010000000001",
  alias: "JOVITA.DIETETICA",

  // ===============================
  // 🔔 NOTIFICACIONES
  // ===============================
  emailNewOrder: true,
  emailLowStock: true,
  whatsappNewOrder: false,
  whatsappLowStock: false
};

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultSettings;
      const saved = JSON.parse(raw);
      
      // Migrar del formato antiguo si es necesario
      if (saved.shippingZones && saved.shippingZones.length > 0) {
        const firstZone = saved.shippingZones[0];
        // Si tiene "place" o "maxDistance" es formato antiguo
        if (firstZone.place || firstZone.maxDistance) {
          saved.shippingZones = defaultSettings.shippingZones;
        }
      }
      
      return { ...defaultSettings, ...saved };
    } catch (err) {
      console.error("❌ Error parsing settings:", err);
      return defaultSettings;
    }
  });

  const [hasChanges, setHasChanges] = useState(false);

  // ===============================
  // 🔧 UPDATE GENÉRICO
  // ===============================
  const updateSetting = useCallback((field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  }, []);

  // ===============================
  // 🚚 CRUD ZONAS DE ENVÍO
  // ===============================
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
      ].sort((a, b) => a.price - b.price) // Ordenar por precio
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
      ).sort((a, b) => a.price - b.price) // Reordenar después de actualizar precio
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

  // ===============================
  // 📍 AGREGAR/ELIMINAR LOCALIDADES DE UNA ZONA
  // ===============================
  const addLocalityToZone = useCallback((zoneId, locality) => {
    if (!locality || locality.trim() === "") return;

    setSettings(prev => ({
      ...prev,
      shippingZones: (prev.shippingZones || []).map(z => {
        if (z.id === zoneId) {
          const normalizedLocality = locality.toLowerCase().trim();
          // Evitar duplicados
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

  // ===============================
  // 📍 CALCULAR COSTO POR LOCALIDAD
  // ===============================
  const calculateShippingCost = useCallback((locality) => {
    if (!locality || locality.trim() === "") {
      return { cost: 0, zone: null, error: "Ingresá la localidad o barrio" };
    }

    const normalizedLocality = locality.toLowerCase().trim();
    const zones = settings.shippingZones || defaultSettings.shippingZones;

    // Buscar en qué zona está la localidad
    for (const zone of zones) {
      if (!zone.localities || zone.localities.length === 0) continue;
      
      // Buscar coincidencia exacta o parcial
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

    // Si no se encuentra en ninguna zona, usar precio por defecto
    const defaultPrice = settings.defaultShippingPrice || defaultSettings.defaultShippingPrice;
    
    return {
      cost: defaultPrice,
      zone: null,
      message: `Localidad no encontrada - $${defaultPrice}`,
      matchedLocality: locality,
      isDefault: true
    };
  }, [settings.shippingZones, settings.defaultShippingPrice]);

  // ===============================
  // 🏦 VALIDACIÓN CBU
  // ===============================
  const validateCbu = useCallback((cbuValue) => {
    if (!cbuValue) return false;
    const digits = String(cbuValue).replace(/\D/g, "");
    return digits.length === 22;
  }, []);

  // ===============================
  // 💾 GUARDAR
  // ===============================
  const saveSettings = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      setHasChanges(false);

      window.dispatchEvent(
        new CustomEvent("settings:saved", { detail: settings })
      );

      return { ok: true };
    } catch (err) {
      console.error("❌ Error saving settings:", err);
      return { ok: false, error: err };
    }
  }, [settings]);

  // ===============================
  // 🔄 RESET
  // ===============================
  const resetSettings = useCallback(() => {
    setSettings(defaultSettings);
    setHasChanges(true);
  }, []);

  // ===============================
  // 🔄 LOAD EXTERNO
  // ===============================
  const loadSettings = useCallback(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        setSettings(defaultSettings);
      } else {
        setSettings({ ...defaultSettings, ...JSON.parse(raw) });
      }
      setHasChanges(false);
    } catch (err) {
      console.error("❌ Error loading settings:", err);
    }
  }, []);

  // ===============================
  // 🧠 SYNC ENTRE PESTAÑAS
  // ===============================
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === STORAGE_KEY) loadSettings();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [loadSettings]);

  // ===============================
  // ⚠️ BACKUP ANTES DE SALIR
  // ===============================
  useEffect(() => {
    const onBeforeUnload = () => {
      if (hasChanges) {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
        } catch {}
      }
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [hasChanges, settings]);

  return (
    <SettingsContext.Provider
      value={{
        settings,
        hasChanges,

        updateSetting,

        // 🚚 ZONAS
        addShippingZone,
        updateShippingZone,
        deleteShippingZone,
        
        // 📍 LOCALIDADES
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