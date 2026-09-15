import { X, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { searchProducts } from "../admin/services/apiService";

export default function SearchOverlay({ open, onClose }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // Búsqueda contra el backend con debounce (evita un fetch por cada tecla)
  useEffect(() => {
    const term = query.trim();

    if (!term) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timeoutId = setTimeout(() => {
      searchProducts(term)
        .then((data) => setResults(data))
        .finally(() => setLoading(false));
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  // Resetear el estado cuando se cierra el overlay
  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults([]);
      setLoading(false);
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-[999] flex justify-center items-start pt-32 px-4 animate-fadeIn">

      {/* CARD */}
      <div className="relative w-full max-w-2xl bg-[#FDF7EF] rounded-2xl shadow-2xl border border-[#e6dccc] p-8 animate-slideUp">

        {/* BOTÓN CERRAR (X) */}
        <button
          onClick={onClose}
          className="absolute right-1 top-[17px] -translate-y-1/2 text-[#5A564E] hover:text-[#F24C00] transition"
        >
          <X size={28} />
        </button>

        {/* INPUT */}
        <div className="relative">
          <input
            autoFocus
            type="text"
            placeholder="Buscar productos..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="
              w-full border border-[#e0d7c7] rounded-xl px-5 py-4 text-lg text-[#1C1C1C]
              focus:ring-2 focus:ring-[#F24C00] focus:outline-none bg-white shadow-sm
            "
          />
          {loading && (
            <Loader2
              size={20}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#F24C00] animate-spin"
            />
          )}
        </div>

        {/* RESULTADOS */}
        <div className="mt-6 max-h-80 overflow-y-auto pr-1">
          {!loading && query && results.length === 0 && (
            <p className="text-[#5A564E] text-sm mt-2">
              No se encontraron productos.
            </p>
          )}

          <ul className="divide-y divide-[#e8e1d4]">
            {results.map((p) => {

              const price = Number(
                p.retailPrice ??
                p.price ??
                0
              );

              const displayPrice =
                price > 0
                  ? `$${price.toLocaleString("es-AR")}`
                  : "Consultar precio";

              return (
                <li
                  key={p.id}
                  className="py-4 flex items-center justify-between gap-4 hover:bg-white rounded-lg px-2 transition cursor-pointer"
                >
                  {/* Imagen */}
                  <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border border-[#e4d9c7]">
                    <img
                      src={p.image || "/placeholder.png"}
                      alt={p.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-grow">
                    <p className="font-semibold text-[#1C1C1C]">
                      {p.name}
                    </p>
                    <p className="text-sm text-[#5A564E]">{displayPrice}</p>
                  </div>

                  {/* Botón Ver más */}
                  <Link
                    to={`/product/${p.id}`}
                    onClick={onClose}
                    className="bg-[#F24C00] text-white px-4 py-2 rounded-lg text-sm font-semibold 
                               shadow-sm hover:brightness-110 transition"
                  >
                    Ver más
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* Animaciones */}
      <style>
        {`
        .animate-fadeIn {
          animation: fadeIn .25s ease-out;
        }
        .animate-slideUp {
          animation: slideUp .35s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        `}
      </style>
    </div>
  );
}