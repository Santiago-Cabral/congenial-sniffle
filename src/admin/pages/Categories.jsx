// src/admin/pages/Categories.jsx
import { useEffect, useState } from "react";
import { listProducts } from "../services/apiService";

export default function Categories() {
  const [cats, setCats] = useState([]);

  useEffect(()=> {
    async function load() {
      const prods = await listProducts();
      const mapping = {};
      (prods || []).forEach(p => {
        const c = p.categoria || p.category || p.categoria || "Sin categoría";
        mapping[c] = (mapping[c] || 0) + 1;
      });
      setCats(Object.entries(mapping).map(([name, count]) => ({ name, count })));
    }
    load();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Categorías</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {cats.map(c => (
          <div key={c.name} className="bg-white p-4 rounded shadow flex items-center justify-between">
            <div>
              <div className="font-semibold">{c.name}</div>
              <div className="text-sm text-gray-500">{c.count} productos</div>
            </div>
            <div className="text-green-600 font-bold">→</div>
          </div>
        ))}
      </div>
    </div>
  );
}
