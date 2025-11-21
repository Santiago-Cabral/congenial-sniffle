import { useEffect, useState } from "react";
import { listProductsRaw, createProduct, updateProduct, deleteProduct } from "../services/apiService";
import ProductForm from "../widgets/ProductFrom";

export default function Products(){
  const [products, setProducts] = useState([]);
  const [loading,setLoading] = useState(true);
  const [openForm,setOpenForm] = useState(false);
  const [editing,setEditing] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const raw = await listProductsRaw();
      setProducts(raw || []);
    } catch(e){ console.error(e); }
    finally{ setLoading(false); }
  };

  useEffect(()=>{ load(); }, []);

  const onDelete = async (id) => {
    if(!confirm("Eliminar producto?")) return;
    await deleteProduct(id);
    load();
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Productos</h2>
          <p className="text-gray-500">Gestiona catálogo</p>
        </div>
        <div>
          <button onClick={()=>{ setEditing(null); setOpenForm(true); }} className="btn-primary">+ Nuevo</button>
        </div>
      </div>

      <div className="space-y-3">
        {loading ? <div>Cargando...</div> : products.map(p => (
          <div key={p.id} className="bg-white p-4 rounded flex items-center justify-between shadow">
            <div className="flex items-center gap-4">
              <img src={p.image || "/placeholder.png"} alt={p.name} className="w-14 h-14 object-cover rounded"/>
              <div>
                <div className="font-semibold">{p.name}</div>
                <div className="text-sm text-gray-500">{p.category} · {p.baseUnit}</div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="font-bold">${(p.retailPrice||0).toLocaleString("es-AR")}</div>
              <div className="text-sm text-gray-600">Stock: {p.stock ?? 0}</div>
              <div className="flex gap-2">
                <button onClick={()=>{ setEditing(p); setOpenForm(true); }} className="p-2 border rounded">✎</button>
                <button onClick={()=>onDelete(p.id)} className="p-2 border rounded text-red-600">🗑</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {openForm && <ProductForm product={editing} onClose={()=>{ setOpenForm(false); setEditing(null); load(); }} />}
    </>
  );
}
