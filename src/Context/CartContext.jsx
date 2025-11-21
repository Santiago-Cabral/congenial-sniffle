import React, { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart debe usarse dentro de CartProvider");
  }
  return context;
}

function normalizeProduct(product) {
  return {
    id: product.id,
    name: product.name || product.nombre || "Producto",
    price: Number(product.retailPrice ?? product.precio ?? product.price ?? 0),
    stock: Number(product.stock ?? 99),
    image: product.image || product.imagen || product.img || "/placeholder.png",
    category: product.category || product.categoria || "",
    isActived: product.isActived ?? true,
  };
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem("cart_jovita");
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      console.error("Error al cargar carrito:", error);
      return [];
    }
  });

  // Guardar en localStorage cuando cambie el carrito
  useEffect(() => {
    try {
      localStorage.setItem("cart_jovita", JSON.stringify(cart));
    } catch (error) {
      console.error("Error al guardar carrito:", error);
    }
  }, [cart]);

  const addToCart = (rawProduct, qty = 1) => {
    if (!rawProduct || !rawProduct.id) {
      console.warn("Producto inválido");
      return;
    }

    const product = normalizeProduct(rawProduct);
    
    if (!product.isActived) {
      alert("Este producto no está disponible");
      return;
    }

    if (product.stock <= 0) {
      alert("Producto sin stock");
      return;
    }

    setCart(prev => {
      const existing = prev.find(p => p.id === product.id);
      
      if (existing) {
        const newQty = Math.min((existing.qty || 1) + qty, product.stock);
        
        if (newQty > existing.qty) {
          // Mostrar feedback visual
          console.log(`Cantidad actualizada: ${newQty}`);
        }
        
        return prev.map(p => 
          p.id === product.id ? { ...p, qty: newQty } : p
        );
      }
      
      const firstQty = Math.min(qty, product.stock);
      console.log("Producto agregado al carrito:", product.name);
      
      return [...prev, { ...product, qty: firstQty }];
    });
  };

  const updateQty = (id, qty) => {
    if (qty < 1) return;
    
    setCart(prev =>
      prev.map(p => {
        if (p.id === id) {
          const newQty = Math.min(qty, p.stock);
          return { ...p, qty: newQty };
        }
        return p;
      })
    );
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(p => p.id !== id));
    console.log("Producto eliminado del carrito");
  };

  const clearCart = () => {
    if (window.confirm("¿Estás seguro de vaciar el carrito?")) {
      setCart([]);
      console.log("Carrito vaciado");
    }
  };

  const total = cart.reduce((sum, p) => sum + (p.price * p.qty), 0);

  const itemCount = cart.reduce((sum, p) => sum + p.qty, 0);

  return (
    <CartContext.Provider
      value={{ 
        cart, 
        addToCart, 
        updateQty, 
        removeFromCart, 
        clearCart, 
        total,
        itemCount
      }}
    >
      {children}
    </CartContext.Provider>
  );
}