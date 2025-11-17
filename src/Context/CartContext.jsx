import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);

  // recalcula el total cada vez que cambia el carrito
  useEffect(() => {
    const newTotal = cart.reduce((acc, item) => acc + (item.costPrice || 0) * (item.qty || 1), 0);
    setTotal(newTotal);
  }, [cart]);

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((p) => p.id === product.id);
      if (existing) {
        return prev.map((p) =>
          p.id === product.id ? { ...p, qty: (p.qty || 1) + 1 } : p
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const removeFromCart = (id) => setCart((prev) => prev.filter((p) => p.id !== id));

  const updateQty = (id, qty) =>
    setCart((prev) => prev.map((p) => (p.id === id ? { ...p, qty } : p)));

  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQty, clearCart, total }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
