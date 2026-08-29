import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { mapProduct } from "../admin/services/apiService";

const ProductsContext = createContext();
const PAGE_SIZE = 50;
const API_URL = "https://forrajeria-jovita-api.onrender.com/api";

export function useProducts() {
  const ctx = useContext(ProductsContext);
  if (!ctx) throw new Error("useProducts debe usarse dentro de ProductsProvider");
  return ctx;
}

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true); // solo la primera carga
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // ⭐ Precio real + cantidad de presentaciones, para TODO el catálogo, en una sola llamada.
  // Reemplaza los fetches individuales que hacía cada ProductCard.
  const [unitsMap, setUnitsMap] = useState({});
  const [unitsMapLoaded, setUnitsMapLoaded] = useState(false);

  const hasMore = products.length < totalCount;

  const fetchPage = useCallback(async (pageToFetch, { append }) => {
    try {
      if (append) setLoadingMore(true);
      else setLoading(true);

      const res = await fetch(
        `${API_URL}/Products?page=${pageToFetch}&pageSize=${PAGE_SIZE}`
      );
      const data = await res.json();

      const total = Number(res.headers.get("X-Total-Count")) || 0;
      const normalized = (Array.isArray(data) ? data : []).map(mapProduct);

      setProducts((prev) => (append ? [...prev, ...normalized] : normalized));
      setTotalCount(total);
      setPage(pageToFetch);
    } catch (err) {
      console.error("❌ Error cargando productos", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  const fetchUnitsMap = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/Products/all-with-units`);
      const data = await res.json();

      const map = {};
      (Array.isArray(data) ? data : []).forEach((p) => {
        const id = p.Id ?? p.id;
        if (id == null) return;
        map[id] = {
          retailPrice: Number(p.BaseRetailPrice ?? p.baseRetailPrice ?? 0),
          unitCount: Number(p.UnitCount ?? p.unitCount ?? 1),
        };
      });

      setUnitsMap(map);
    } catch (err) {
      console.error("❌ Error cargando precios del catálogo", err);
    } finally {
      setUnitsMapLoaded(true);
    }
  }, []);

  useEffect(() => {
    fetchPage(1, { append: false });
    fetchUnitsMap();
  }, [fetchPage, fetchUnitsMap]);

  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore) return;
    fetchPage(page + 1, { append: true });
  }, [fetchPage, page, hasMore, loadingMore]);

  return (
    <ProductsContext.Provider
      value={{
        products,
        loading,
        loadingMore,
        hasMore,
        totalCount,
        loadMore,
        unitsMap,
        unitsMapLoaded,
      }}
    >
      {children}
    </ProductsContext.Provider>
  );
}