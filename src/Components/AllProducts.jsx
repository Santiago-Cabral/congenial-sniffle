// src/components/AllProducts.jsx
import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";

export default function AllProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("https://forrajeria-jovita-api.onrender.com/api/products");
        if (!res.ok) throw new Error("Error al cargar productos");
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error("Error al cargar productos:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) return <p className="text-center py-10">Cargando productos...</p>;
  if (products.length === 0) return <p className="text-center py-10">No hay productos disponibles</p>;

  return (
    <main className="max-w-7xl mx-auto px-6 py-16" id="todos-productos">
      <h2 className="h1-style text-4xl text-center mb-4">Todos los Productos</h2>
      <p className="text-center text-(--muted) mb-10">
        Descubre todos nuestros productos naturales y saludables
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </main>
  );
}
