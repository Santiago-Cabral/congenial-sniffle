import { useLocation, Link } from "react-router-dom";
import { useProducts } from "../Context/ProductsContext"; // 👈 Importar el contexto
import ProductCard from "./ProductCard";

export default function FeaturedProducts() {
  const { products, loading } = useProducts(); // 👈 Usar el contexto
  
  const location = useLocation();
  const categoryFilter = new URLSearchParams(location.search).get("category");

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#F24C00] border-t-transparent"></div>
        <p className="mt-4 text-[#5A564E]">Cargando productos...</p>
      </div>
    );
  }

  const filteredProducts = categoryFilter
    ? products.filter((p) => p.categoryName?.toLowerCase() === categoryFilter.toLowerCase())
    : products;

  return (
    <section id="productos" className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="w-full text-center mb-12">
          <h2 className="text-4xl font-extrabold text-[#1C1C1C]">
            {categoryFilter ? `Productos en "${categoryFilter}"` : "Nuestros Productos"}
          </h2>
        </div>

        {filteredProducts.length === 0 ? (
          <p className="text-center">No hay productos disponibles.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}