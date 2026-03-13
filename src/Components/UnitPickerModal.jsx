import { useEffect, useState } from "react";
import { X, ShoppingCart, ChevronRight } from "lucide-react";
import { getProductUnits } from "../admin/services/productUnitService";

function formatPrice(price) {
  if (price == null) return "Sin precio";
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
  }).format(price);
}

/**
 * Modal de selección de unidad de venta.
 *
 * Props:
 *   product   – objeto producto normalizado (debe tener .id y .name)
 *   onConfirm – fn({ product, unit, quantity }) → void
 *   onClose   – fn() → void
 */
export default function UnitPickerModal({ product, onConfirm, onClose }) {
  const [units, setUnits] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cerrar con Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Cargar unidades
  useEffect(() => {
    if (!product?.id) return;
    setLoading(true);
    setError(null);

    getProductUnits(product.id)
      .then((data) => {
        const sorted = [...(data.units ?? [])].sort(
          (a, b) => b.conversionToBase - a.conversionToBase
        );
        setUnits(sorted);
        // Seleccionar la unidad base por defecto (mayor conversionToBase = bolsa entera)
        setSelectedUnit(sorted[0] ?? null);
      })
      .catch(() => setError("No se pudieron cargar las presentaciones"))
      .finally(() => setLoading(false));
  }, [product?.id]);

  function handleConfirm() {
    if (!selectedUnit) return;
    onConfirm({ product, unit: selectedUnit, quantity });
    onClose();
  }

  const price = selectedUnit?.retailPrice;
  const subtotal = price != null ? price * quantity : null;
  const hasPrice = price != null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-0 sm:px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-4 border-b border-gray-100">
          <div className="flex-1 pr-4">
            <p className="text-xs font-semibold text-[#F24C00] uppercase tracking-widest mb-1">
              Elegí la presentación
            </p>
            <h3 className="text-xl font-extrabold text-[#1C1C1C] leading-tight">
              {product?.name}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition shrink-0"
          >
            <X size={18} className="text-[#5A564E]" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center py-10">
              <div className="w-8 h-8 border-4 border-[#F24C00] border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-4 rounded-xl text-center">
              {error}
            </div>
          )}

          {!loading && !error && units.length === 0 && (
            <p className="text-center text-[#5A564E] py-8">
              Este producto no tiene presentaciones configuradas.
            </p>
          )}

          {/* Opciones de unidad */}
          {!loading && units.map((unit) => {
            const isSelected = selectedUnit?.id === unit.id;
            const unitPrice = unit.retailPrice;

            return (
              <button
                key={unit.id}
                type="button"
                onClick={() => { setSelectedUnit(unit); setQuantity(1); }}
                className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all text-left ${
                  isSelected
                    ? "border-[#F24C00] bg-[#FFF4EF]"
                    : "border-gray-200 hover:border-gray-300 bg-white"
                }`}
              >
                <div>
                  <p className={`font-bold text-base ${isSelected ? "text-[#F24C00]" : "text-[#1C1C1C]"}`}>
                    {unit.displayName}
                  </p>
                  <p className="text-xs text-[#5A564E] mt-0.5">
                    {unit.unitLabel}
                    {unit.conversionToBase > 1
                      ? ` · ${unit.conversionToBase} kg`
                      : ""}
                  </p>
                </div>

                <div className="text-right">
                  {unitPrice != null ? (
                    <p className={`font-extrabold text-lg ${isSelected ? "text-[#F24C00]" : "text-[#1C1C1C]"}`}>
                      {formatPrice(unitPrice)}
                    </p>
                  ) : (
                    <p className="text-sm text-[#5A564E]">Sin precio</p>
                  )}
                  {isSelected && (
                    <ChevronRight size={16} className="ml-auto text-[#F24C00]" />
                  )}
                </div>
              </button>
            );
          })}

          {/* Selector de cantidad */}
          {!loading && selectedUnit && (
            <div className="pt-2">
              <p className="text-sm font-semibold text-[#1C1C1C] mb-3">Cantidad</p>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-12 h-12 rounded-xl border-2 border-gray-200 flex items-center justify-center text-xl font-bold hover:border-[#F24C00] hover:text-[#F24C00] transition"
                >
                  −
                </button>
                <span className="text-2xl font-bold w-16 text-center text-[#1C1C1C]">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-12 h-12 rounded-xl border-2 border-gray-200 flex items-center justify-center text-xl font-bold hover:border-[#F24C00] hover:text-[#F24C00] transition"
                >
                  +
                </button>

                {subtotal != null && (
                  <div className="ml-auto text-right">
                    <p className="text-xs text-[#5A564E]">Subtotal</p>
                    <p className="text-xl font-extrabold text-[#F24C00]">
                      {formatPrice(subtotal)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!selectedUnit || !hasPrice || loading}
            className="w-full flex items-center justify-center gap-3 py-4 rounded-xl font-bold text-white bg-[#F24C00] hover:brightness-110 transition disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-[#F24C00]/20"
          >
            <ShoppingCart size={22} />
            {hasPrice
              ? `Agregar al carrito · ${formatPrice(subtotal)}`
              : "Agregar al carrito"}
          </button>
        </div>
      </div>
    </div>
  );
}