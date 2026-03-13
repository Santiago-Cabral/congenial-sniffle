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
function normalizeProduct(p, unitOverride = null) {
  const img = p.image || p.imageUrl || p.img || "";
  const invalidImage =
    !img ||
    img === "Producto" ||
    img.includes("300x300") ||
    img.includes("?text") ||
    img.includes("placeholder.com");

  // Si viene con unidad, usamos su precio y la combinación id+unitId como clave
  const unitId   = unitOverride?.id   ?? p.unitId   ?? null;
  const unitLabel = unitOverride?.displayName ?? p.unitLabel ?? null;
  const price    = unitOverride != null
    ? Number(unitOverride.retailPrice ?? 0)
    : Number(p.price ?? p.retailPrice ?? 0);

  // Clave única: si tiene unidad, diferenciamos por ella
  const cartKey = unitId ? `${p.id}_${unitId}` : String(p.id);

  return {
    // cartKey es lo que usamos para deduplicar en el carrito
    cartKey,
    id: p.id,
    name: p.name || p.nombre || "Producto",
    price,
    stock: p.stock === null || p.stock === undefined ? 999 : Number(p.stock),
    image: invalidImage ? "/placeholder.png" : img,
    category: p.categoryName || p.category || p.categoria || "Sin categoría",
    isActived: p.isActived === undefined ? true : p.isActived !== false,
    // Datos de unidad para mostrar en carrito y checkout
    unitId,
    unitLabel,
  };
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

  useEffect(() => {
    localStorage.setItem("cart_jovita", JSON.stringify(cart));
  }, [cart]);

  /* ======================================================
     ➕ AGREGAR AL CARRITO
     Firma: addToCart(rawProduct, qty, unit?)
       - rawProduct: objeto producto normalizado (viene de mapProduct)
       - qty: cantidad
       - unit: objeto unidad { id, displayName, retailPrice } (opcional)
         Si se pasa, el precio y la clave del carrito vienen de la unidad.
     ====================================================== */
  const addToCart = (rawProduct, qty = 1, unit = null) => {
    if (!rawProduct || !rawProduct.id) {
      console.error("❌ Producto inválido (sin id):", rawProduct);
      return;
    }

    const product = normalizeProduct(rawProduct, unit);

    if (product.isActived === false) {
      alert(`El producto "${product.name}" no está disponible actualmente`);
      return;
    }

    if (product.stock !== 999 && product.stock <= 0) {
      alert(`El producto "${product.name}" no tiene stock disponible`);
      return;
    }

    setCart((prev) => {
      // Deduplicar por cartKey (id + unitId)
      const existing = prev.find((p) => p.cartKey === product.cartKey);

      if (existing) {
        const newQty = Math.min(existing.qty + qty, product.stock);
        return prev.map((p) =>
          p.cartKey === product.cartKey ? { ...p, qty: newQty } : p
        );
      }

      return [...prev, { ...product, qty: Math.min(qty, product.stock) }];
    });
  };

  /* ======================================================
     🔄 CAMBIAR CANTIDAD — usa cartKey
     ====================================================== */
  const updateQty = (cartKey, qty) => {
    if (qty < 1) return;
    setCart((prev) =>
      prev.map((p) =>
        p.cartKey === cartKey ? { ...p, qty: Math.min(qty, p.stock) } : p
      )
    );
  };

  /* ======================================================
     ❌ ELIMINAR — usa cartKey
     ====================================================== */
  const removeFromCart = (cartKey) => {
    setCart((prev) => prev.filter((p) => p.cartKey !== cartKey));
  };

  /* ======================================================
     🧹 VACIAR
     ====================================================== */
  const clearCart = () => setCart([]);

  /* ======================================================
     🧮 TOTALES
     ====================================================== */
  const total     = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
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