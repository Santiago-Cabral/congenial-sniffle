import { useState, useEffect } from "react";
import { createProduct, updateProduct } from "../services/apiService";

export default function ProductForm({ product, onClose }) {
  const [form, setForm] = useState({ code:"", name:"", retailPrice:0, image:"", stock:0, category:"", isActived:true, baseUnit:"" });

  useEffect(()=> {
    if(product) setForm({
      code: product.code || "",
      name: product.name || "",
      retailPrice: product.retailPrice || 0,
      image: product.image || "",
      stock: product.stock ?? 0,
      category: product.category || "",
      isActived: product.isActived ?? true,
      baseUnit: product.baseUnit || ""
    });
  }, [product]);

  const onChange = (k,v) => setForm(prev=>({...prev,[k]:v}));

  const submit = async (e) => {
    e.preventDefault();
    try {
      if(product && product.id) await updateProduct(product.id, form);
      else await createProduct(form);
      onClose();
    } catch(e){ alert("Error: " + (e.message||e)); }
  };

  return (
    <div className="fixed inset-0 z-60">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-white p-6 rounded shadow">
        <h3 className="text-xl font-bold mb-4">{product ? "Editar" : "Nuevo Producto"}</h3>
        <form onSubmit={submit} className="space-y-3">
          <input className="w-full p-3 border rounded" placeholder="Código" value={form.code} onChange={e=>onChange("code", e.target.value)} />
          <input className="w-full p-3 border rounded" placeholder="Nombre" value={form.name} onChange={e=>onChange("name", e.target.value)} />
          <div className="grid grid-cols-3 gap-3">
            <input className="p-3 border rounded" placeholder="Precio venta" value={form.retailPrice} onChange={e=>onChange("retailPrice", Number(e.target.value))} />
            <input className="p-3 border rounded" placeholder="Stock" value={form.stock} onChange={e=>onChange("stock", Number(e.target.value))} />
            <input className="p-3 border rounded" placeholder="Unidad" value={form.baseUnit} onChange={e=>onChange("baseUnit", e.target.value)} />
          </div>
          <input className="w-full p-3 border rounded" placeholder="Categoría" value={form.category} onChange={e=>onChange("category", e.target.value)} />
          <input className="w-full p-3 border rounded" placeholder="URL imagen" value={form.image} onChange={e=>onChange("image", e.target.value)} />
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.isActived} onChange={e=>onChange("isActived", e.target.checked)} /> Activo</label>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded">Cancelar</button>
            <button type="submit" className="btn-primary px-6 py-2">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  );
}
