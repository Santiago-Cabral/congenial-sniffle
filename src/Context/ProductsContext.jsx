import React, { createContext, useContext, useEffect, useState } from "react";
import { mapProduct } from "../admin/services/apiService"; // Importamos el mapeador

const ProductsContext = createContext();

export function useProducts() {
  const ctx = useContext(ProductsContext);
  if (!ctx) throw new Error("useProducts debe usarse dentro de ProductsProvider");
  return ctx;
}

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        const res = await fetch("https://forrajeria-jovita-api.onrender.com/api/Products");
        const data = await res.json();
        
        // 🛠️ NORMALIZACIÓN: Mapeamos los productos apenas llegan
        const normalizedProducts = (Array.isArray(data) ? data : []).map(mapProduct);
        
        setProducts(normalizedProducts);
      } catch (err) {
        console.error("❌ Error cargando productos", err);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  return (
    <ProductsContext.Provider value={{ products, loading }}>
      {children}
    </ProductsContext.Provider>
  );
}