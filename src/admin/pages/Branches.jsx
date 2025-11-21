// src/admin/pages/Branches.jsx
import { useEffect, useState } from "react";
import { listBranches, createBranch, updateBranch, deleteBranch } from "../services/apiService";

export default function Branches(){
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState("");

  async function load(){ setLoading(true); try { setBranches(await listBranches()); } catch(e){console.error(e)} finally{setLoading(false)} }

  useEffect(()=>{ load(); }, []);

  const save = async () => {
    if (editing) {
      await updateBranch(editing.id || editing.Id, { name });
    } else {
      await createBranch({ name });
    }
    setEditing(null); setName(""); load();
  };

  const onEdit = (b) => { setEditing(b); setName(b.name || b.Nombre || ""); };
  const onDel = async (id) => { if(!confirm("Eliminar sucursal?"))return; await deleteBranch(id); load(); };

  if (loading) return <div>Cargando...</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Sucursales</h2>

      <div className="bg-white p-4 rounded mb-6 shadow">
        <div className="flex gap-3">
          <input value={name} onChange={e=>setName(e.target.value)} className="flex-1 p-3 border rounded" placeholder="Nombre sucursal" />
          <button onClick={save} className="btn-primary">{editing ? "Guardar" : "Crear"}</button>
          {editing && <button onClick={()=>{setEditing(null); setName("");}} className="p-3 border rounded">Cancelar</button>}
        </div>
      </div>

      <div className="space-y-3">
        {branches.map(b => (
          <div key={b.id || b.Id} className="bg-white p-4 rounded flex justify-between items-center shadow">
            <div>{b.name || b.Nombre || "—"}</div>
            <div className="flex gap-2">
              <button onClick={()=>onEdit(b)} className="p-2 border rounded">✎</button>
              <button onClick={()=>onDel(b.id || b.Id)} className="p-2 border text-red-600 rounded">🗑</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
