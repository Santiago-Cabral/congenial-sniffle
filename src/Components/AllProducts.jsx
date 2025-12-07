import { useEffect, useState } from "react";
import { listProducts } from "../admin/services/apiService";
import ProductCard from "./ProductCard";

export default function AllProducts() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    listProducts().then(setProducts).catch(console.error);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-4xl font-bold mb-6 text-[var(--title)]">
        Todos los Productos
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
