import React, { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart debe usarse dentro de CartProvider");
  }
  return context;
}

/* ======================================================
   🔥 NORMALIZACIÓN GLOBAL (UNIFICADA)
   ====================================================== */
function normalizeProduct(p) {
  console.log("🔍 Normalizando producto:", p);
  
  // Imagen válida o fallback
  const img = p.image || p.imageUrl || p.img || "";
  const invalidImage =
    !img ||
    img === "Producto" ||
    img.includes("300x300") ||
    img.includes("?text") ||
    img.includes("placeholder.com");

  const normalized = {
    id: p.id,
    name: p.name || p.nombre || "Producto",
    price: Number(p.price ?? p.retailPrice ?? 0),
    stock: p.stock === null || p.stock === undefined ? 999 : Number(p.stock),

    image: invalidImage ? "/placeholder.png" : img,

    category:
      p.categoryName ||
      p.category ||
      p.categoria ||
      "Sin categoría",

    // 👉 Si no viene isActived, asumimos que está activo
    // Solo bloqueamos si es explícitamente false
    isActived: p.isActived === undefined ? true : p.isActived !== false,
  };
  
  console.log("✅ Producto normalizado:", normalized);
  return normalized;
}

/* ======================================================
   🔥 CART PROVIDER
   ====================================================== */
export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem("cart_jovita");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Guardar cambios
  useEffect(() => {
    localStorage.setItem("cart_jovita", JSON.stringify(cart));
    console.log("💾 Carrito guardado:", cart);
  }, [cart]);

  /* ======================================================
     ➕ AGREGAR AL CARRITO
     ====================================================== */
  const addToCart = (rawProduct, qty = 1) => {
    console.log("🛒 addToCart llamado con:", rawProduct, "qty:", qty);
    
    if (!rawProduct || !rawProduct.id) {
      console.error("❌ Producto inválido (sin id):", rawProduct);
      return;
    }

    const product = normalizeProduct(rawProduct);

    // 🔒 Bloquea SOLO si isActived es explícitamente false
    if (product.isActived === false) {
      console.warn("⚠️ Producto desactivado:", product.name);
      alert(`El producto "${product.name}" no está disponible actualmente`);
      return;
    }

    // 🔒 Bloquea si no hay stock (pero no si stock es 999 que es nuestro default)
    if (product.stock !== 999 && product.stock <= 0) {
      console.warn("⚠️ Producto sin stock:", product.name);
      alert(`El producto "${product.name}" no tiene stock disponible`);
      return;
    }

    console.log("✅ Producto válido, agregando al carrito");

    setCart((prev) => {
      const existing = prev.find((p) => p.id === product.id);

      if (existing) {
        const newQty = Math.min(existing.qty + qty, product.stock);
        console.log(`📦 Actualizando cantidad de "${product.name}": ${existing.qty} → ${newQty}`);
        return prev.map((p) =>
          p.id === product.id ? { ...p, qty: newQty } : p
        );
      }

      console.log(`✨ Agregando nuevo producto al carrito: "${product.name}"`);
      return [...prev, { ...product, qty: Math.min(qty, product.stock) }];
    });
  };

  /* ======================================================
     🔄 CAMBIAR CANTIDAD
     ====================================================== */
  const updateQty = (id, qty) => {
    if (qty < 1) return;

    setCart((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, qty: Math.min(qty, p.stock) } : p
      )
    );
  };

  /* ======================================================
     ❌ ELIMINAR
     ====================================================== */
  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((p) => p.id !== id));
  };

  /* ======================================================
     🧹 VACIAR
     ====================================================== */
  const clearCart = () => setCart([]);

  /* ======================================================
     🧮 TOTALES
     ====================================================== */
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const itemCount = cart.reduce((sum, item) => sum + item.qty, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQty,
        removeFromCart,
        clearCart,
        total,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}