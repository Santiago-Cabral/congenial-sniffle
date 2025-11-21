import { useEffect, useState } from "react";
import { listProducts } from "../admin/services/apiService";
import ProductCard from "./ProductCard";

export default function FeaturedProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await listProducts();
        setProducts(res || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#F24C00] border-t-transparent"></div>
        <p className="mt-4 text-[#5A564E]">Cargando productos...</p>
      </div>
    );
  }

  return (
    <section id="productos" className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-extrabold text-[#1C1C1C] mb-3">
            Nuestros Productos
          </h2>
          <p className="text-lg text-[#5A564E]">
            Explora nuestra amplia selección de productos naturales y saludables
          </p>
        </div>

        {products.length === 0 ? (
          <p className="text-center text-[#5A564E]">No hay productos disponibles</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}