const API_URL = "https://forrajeria-jovita-api.onrender.com/api";

function mapUnit(u) {
  return {
    id: u.Id ?? u.id,
    displayName: u.DisplayName ?? u.displayName,
    unitLabel: u.UnitLabel ?? u.unitLabel,
    conversionToBase: u.ConversionToBase ?? u.conversionToBase,
    allowFractionalQuantity: u.AllowFractionalQuantity ?? u.allowFractionalQuantity,
    minSellStep: u.MinSellStep ?? u.minSellStep,
    stockDecimals: u.StockDecimals ?? u.stockDecimals,
    retailPrice: u.RetailPrice ?? u.retailPrice ?? null,
    prices: (u.Prices ?? u.prices ?? []).map(p => ({
      id: p.Id ?? p.id,
      tier: p.Tier ?? p.tier,
      tierValue: p.TierValue ?? p.tierValue,
      price: p.Price ?? p.price,
    })),
  };
}

/**
 * Trae todas las unidades de venta de un producto con precios vigentes.
 * GET /api/Products/{id}/units
 * Solo devuelve unidades con precio Retail > 0.
 */
export async function getProductUnits(productId) {
  const res = await fetch(`${API_URL}/Products/${productId}/units`);
  if (!res.ok) throw new Error("Error al cargar unidades del producto");
  const data = await res.json();

  const units = (data.Units ?? data.units ?? [])
    .map(mapUnit)
    .filter(u => u.retailPrice != null && u.retailPrice > 0);

  return {
    productId: data.ProductId ?? data.productId,
    productName: data.ProductName ?? data.productName,
    units,
  };
}