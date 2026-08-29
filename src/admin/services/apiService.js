// =======================================
// 🌐 API SERVICE - FORRAJERÍA JOVITA
// =======================================

import { 
  sendNewOrderNotification
} from './whatsappService';

const API_URL = "https://forrajeria-jovita-api.onrender.com/api";

// ============= 🔐 TOKEN =============
function getToken() {
  return localStorage.getItem("admin_token") || "";
}

// ============= 🧰 HELPERS =============
async function request(url, method = "GET", body = null, auth = false) {
  const headers = { "Content-Type": "application/json" };

  if (auth) {
    const token = getToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  const options = { method, headers };
  if (body !== null && body !== undefined) {
    options.body = JSON.stringify(body);
  }

  try {
    const res = await fetch(url, options);

    if (res.status === 401) {
      console.error("❌ SESIÓN EXPIRADA");
      localStorage.removeItem("admin_token");
      localStorage.removeItem("admin_user");
      throw new Error("Su sesión ha expirado. Por favor ingrese nuevamente.");
    }

    if (!res.ok) {
      let detail = `HTTP ${res.status} - ${res.statusText}`;
      let serverError = null;
      let serverMessage = null;

      try {
        const text = await res.text();
        console.error("❌ RESPONSE TEXT:", text);

        if (text && text.trim() !== "") {
          try {
            const json = JSON.parse(text);
            detail = json.message || json.error || json.details || JSON.stringify(json);
            serverError = json.error || detail;
            serverMessage = json.message || "Error del servidor";
          } catch {
            detail = text.length > 100 ? text.substring(0, 100) + "..." : text;
            serverMessage = detail;
          }
        }
      } catch (parseError) {
        console.error("❌ Error parsing response:", parseError);
        detail = `No se pudo leer la respuesta del servidor: ${parseError.message}`;
      }

      const error = new Error();

      if (res.status === 500) {
        error.message = `Error interno del servidor: ${serverMessage || "Error desconocido"}`;
        error.details = serverError || detail;
        error.type = "SERVER_ERROR";
        error.code = 500;
      } else if (res.status === 404) {
        error.message = `Recurso no encontrado: ${url}`;
        error.type = "NOT_FOUND";
        error.code = 404;
      } else if (res.status === 400) {
        error.message = `Solicitud incorrecta: ${detail}`;
        error.type = "BAD_REQUEST";
        error.code = 400;
      } else if (res.status === 403) {
        error.message = `Acceso denegado: ${detail}`;
        error.type = "FORBIDDEN";
        error.code = 403;
      } else {
        error.message = detail;
        error.type = "HTTP_ERROR";
        error.code = res.status;
      }

      throw error;
    }

    if (res.status === 204) return null;
    const text = await res.text();
    if (!text || text.trim() === "") return null;

    try {
      const parsed = JSON.parse(text);
      return parsed;
    } catch (parseError) {
      throw new Error("Respuesta del servidor en formato inválido");
    }
  } catch (error) {
    console.error("❌ API ERROR", {
      url,
      method,
      error: error?.message,
      type: error?.type,
      code: error?.code,
      details: error?.details
    });
    throw error;
  }
}

// ============= 📦 MAPEOS (PASCALCASE -> CAMELCASE) =============
function getUnitLabel(unit) {
  switch (Number(unit)) {
    case 1: return "Kilogramo";
    case 2: return "Unidad";
    case 3: return "Litro";
    default: return "Unidad";
  }
}

export function mapProduct(p) {
  if (!p) return null;
  return {
    id: p.Id ?? p.id,
    code: p.Code ?? p.code ?? "",
    name: p.Name ?? p.name ?? p.nombre ?? "Producto",
    image: p.Image ?? p.image ?? p.imageUrl ?? "",
    stock: Number(p.Stock ?? p.stock ?? 0),
    costPrice: Number(p.CostPrice ?? p.costPrice ?? 0),
    retailPrice: Number(p.RetailPrice ?? p.retailPrice ?? 0),
    wholesalePrice: Number(p.WholesalePrice ?? p.wholesalePrice ?? 0),
    baseUnitId: Number(p.BaseUnit ?? p.baseUnit ?? 2),
    baseUnit: getUnitLabel(p.BaseUnit ?? p.baseUnit),
    categoryId: p.CategoryId ?? p.categoryId ?? null,
    categoryName: p.CategoryName ?? p.categoryName ?? p.category ?? "Sin categoría",
    isActived: p.IsActived ?? p.isActived ?? true,
    isFeatured: p.IsFeatured ?? p.isFeatured ?? false,
    isDeleted: p.IsDeleted ?? p.isDeleted ?? false,
  };
}

function mapCategory(c) {
  if (!c) return null;
  return {
    id: c.Id ?? c.id,
    name: c.Name ?? c.name ?? "Sin nombre",
    products: c.Products ?? c.products ?? [],
  };
}

function mapClient(c) {
  if (!c) return null;
  return {
    id: c.Id ?? c.id,
    name: c.Name ?? c.name ?? c.fullName ?? c.FullName ?? "",
    fullName: c.FullName ?? c.fullName ?? c.Name ?? c.name ?? "",
    email: c.Email ?? c.email ?? "",
    phone: c.Phone ?? c.phone ?? "",
    address: c.Address ?? c.address ?? "",
    ordersCount: Number(c.OrdersCount ?? c.ordersCount ?? c.Orders ?? c.orders ?? 0),
    totalSpent: Number(c.TotalSpent ?? c.totalSpent ?? c.Amount ?? c.amount ?? 0),
    amount: Number(c.Amount ?? c.amount ?? c.TotalSpent ?? c.totalSpent ?? 0),
    lastPurchaseAt: c.LastPurchaseAt ?? c.lastPurchaseAt ?? c.LastSaleAt ?? c.lastSaleAt ?? null,
    createdAt: c.CreatedAt ?? c.createdAt ?? c.CreationDate ?? c.creationDate ?? null,
    creationDate: c.CreationDate ?? c.creationDate ?? c.CreatedAt ?? c.createdAt ?? null,
  };
}

function mapSaleItem(item) {
  if (!item) return null;
  return {
    productId: item.ProductId ?? item.productId,
    productName: item.ProductName ?? item.productName ?? "Producto",
    quantity: Number(item.Quantity ?? item.quantity ?? 0),
    unitPrice: Number(item.UnitPrice ?? item.unitPrice ?? 0),
    discount: Number(item.Discount ?? item.discount ?? 0),
    total: Number(item.Total ?? item.total ?? 0),
  };
}

function mapSalePayment(payment) {
  if (!payment) return null;
  return {
    method: payment.Method ?? payment.method,
    methodName: payment.MethodName ?? payment.methodName ?? "",
    amount: Number(payment.Amount ?? payment.amount ?? 0),
    reference: payment.Reference ?? payment.reference ?? "",
  };
}

function mapSale(s) {
  if (!s) return null;

  let customerDetails = null;

  const rawCustomer =
    s.Customer ??
    s.customer ??
    s.CustomerName ??
    s.customerName ??
    s.ClientName ??
    s.clientName ??
    "";

  const externalData = s.ExternalData ?? s.externalData ?? null;

  if (externalData) {
    try {
      const parsed =
        typeof externalData === "string"
          ? JSON.parse(externalData)
          : externalData;

      customerDetails = {
        name: parsed.name || parsed.customerName || rawCustomer || "",
        phone: parsed.phone || parsed.phoneNumber || "",
        email: parsed.email || "",
        address:
          parsed.address ||
          parsed.shippingAddress ||
          s.DeliveryAddress ||
          s.deliveryAddress ||
          "",
      };
    } catch {
      // NO inventar nada
    }
  }

  if (!customerDetails) {
    customerDetails = {
      name: rawCustomer || "",
      phone: "",
      email: "",
      address: s.DeliveryAddress ?? s.deliveryAddress ?? "",
    };
  }

  const paymentsArray = Array.isArray(s.Payments)
    ? s.Payments
    : Array.isArray(s.payments)
    ? s.payments
    : [];

  return {
    id: s.Id ?? s.id,
    soldAt: s.SoldAt ?? s.soldAt,
    createdAt: s.CreatedAt ?? s.createdAt ?? s.SoldAt ?? s.soldAt,
    sellerName: s.SellerName ?? s.sellerName ?? "E-commerce",

    subtotal: Number(s.Subtotal ?? s.subtotal ?? 0),
    discountTotal: Number(s.DiscountTotal ?? s.discountTotal ?? 0),
    total: Number(s.Total ?? s.total ?? 0),

    deliveryType: s.DeliveryType ?? s.deliveryType,
    deliveryAddress: s.DeliveryAddress ?? s.deliveryAddress ?? "",
    deliveryCost: Number(s.DeliveryCost ?? s.deliveryCost ?? 0),
    shippingCost: Number(
      s.ShippingCost ??
        s.shippingCost ??
        s.DeliveryCost ??
        s.deliveryCost ??
        0
    ),
    deliveryNote: s.DeliveryNote ?? s.deliveryNote ?? "",

    paymentStatus: s.PaymentStatus ?? s.paymentStatus ?? 0,
    paymentStatusName:
      s.PaymentStatusName ?? s.paymentStatusName ?? "Pendiente",

    items: Array.isArray(s.Items)
      ? s.Items.map(mapSaleItem)
      : Array.isArray(s.items)
      ? s.items.map(mapSaleItem)
      : [],

    payments: paymentsArray.map(mapSalePayment),

    customerDetails,
    clientName: rawCustomer || "",
    paymentMethod: s.PaymentMethod ?? s.paymentMethod ?? "",
    saleChannel: (s.SaleChannel ?? s.saleChannel ?? "local").toLowerCase(),
    fulfillmentMethod:
      s.FulfillmentMethod ?? s.fulfillmentMethod ?? "delivery",
  };
}

// =======================================
// 🔐 AUTH
// =======================================
export async function login(email, password) {
  try {
    const data = await request(`${API_URL}/Auth/login`, "POST", { email, password }, false);

    const token = data.Token || data.token;
    if (token) {
      localStorage.setItem("admin_token", token);
      localStorage.setItem("admin_user", JSON.stringify({
        ...data,
        token: token,
        // ⭐ El rol viaja como string desde el backend (ej. "administrador/a", "empleado")
        // y ya está firmado dentro del JWT (ClaimTypes.Role). Esto es solo para la UI;
        // el control de acceso real lo hace el backend leyendo el token.
        role: (data.Role || data.role || "").toString().toLowerCase()
      }));
    }
    return data;
  } catch (error) {
    console.error("❌ Error en login:", error.message);
    throw new Error(`No se pudo iniciar sesión: ${error.message}`);
  }
}
// =======================================
// 🎟️ CUPONES
// =======================================

function mapCoupon(c) {
  if (!c) return null;
  return {
    id: c.Id ?? c.id,
    code: c.Code ?? c.code ?? "",
    type: Number(c.Type ?? c.type ?? 0), // 0 = Percentage, 1 = Fixed
    typeName: c.TypeName ?? c.typeName ?? "",
    value: Number(c.Value ?? c.value ?? 0),
    minPurchase: c.MinPurchase ?? c.minPurchase ?? null,
    maxUses: c.MaxUses ?? c.maxUses ?? null,
    usedCount: Number(c.UsedCount ?? c.usedCount ?? 0),
    expirationDate: c.ExpirationDate ?? c.expirationDate ?? null,
    isActive: c.IsActive ?? c.isActive ?? true,
    creationDate: c.CreationDate ?? c.creationDate ?? null,
  };
}

export async function listCoupons() {
  try {
    const data = await request(`${API_URL}/Coupons`, "GET", null, true);
    return (Array.isArray(data) ? data : []).map(mapCoupon);
  } catch (error) {
    console.error("❌ Error en listCoupons:", error.message);
    return [];
  }
}

export async function createCoupon(body) {
  const result = await request(`${API_URL}/Coupons`, "POST", body, true);
  return mapCoupon(result);
}

export async function updateCoupon(id, body) {
  return request(`${API_URL}/Coupons/${id}`, "PUT", { ...body, id }, true);
}

export async function deleteCoupon(id) {
  return request(`${API_URL}/Coupons/${id}`, "DELETE", null, true);
}

export async function validateCoupon(code, cartTotal) {
  try {
    const result = await request(
      `${API_URL}/Coupons/validate`,
      "POST",
      { code, cartTotal: Number(cartTotal) },
      false
    );
    return {
      valid: result?.Valid ?? result?.valid ?? false,
      message: result?.Message ?? result?.message ?? "",
      discountAmount: Number(result?.DiscountAmount ?? result?.discountAmount ?? 0),
      couponCode: result?.CouponCode ?? result?.couponCode ?? "",
    };
  } catch (error) {
    console.error("❌ Error en validateCoupon:", error.message);
    return { valid: false, message: "No se pudo validar el cupón", discountAmount: 0, couponCode: "" };
  }
}
// =======================================
// 📦 PRODUCTOS
// =======================================
export async function listProducts() {
  try {
    const data = await request(`${API_URL}/Products`, "GET", null, false);
    const mapped = (Array.isArray(data) ? data : []).map(mapProduct);
    const activeProducts = mapped.filter(p => !p.isDeleted);
    return activeProducts;
  } catch (error) {
    console.error("❌ Error en listProducts:", error.message);
    return [];
  }
}

export async function getProduct(id) {
  try {
    const p = await request(`${API_URL}/Products/${id}`, "GET", null, false);
    return mapProduct(p);
  } catch (error) {
    console.error(`❌ Error en getProduct(${id}):`, error.message);
    return null;
  }
}

export async function createProduct(body) {
  return request(`${API_URL}/Products`, "POST", body, true);
}

export async function updateProduct(id, body) {
  return request(`${API_URL}/Products/${id}`, "PUT", body, true);
}

export async function deleteProduct(id) {
  return request(`${API_URL}/Products/${id}`, "DELETE", null, true);
}

// =======================================
// 📂 CATEGORÍAS
// =======================================
export async function listCategories() {
  try {
    const data = await request(`${API_URL}/Categories`, "GET", null, true);
    return (Array.isArray(data) ? data : []).map(mapCategory);
  } catch (error) {
    console.error("❌ Error en listCategories:", error.message);
    return [];
  }
}

export async function createCategory(name) {
  const result = await request(`${API_URL}/Categories`, "POST", name, true);
  return mapCategory(result);
}

export async function updateCategory(id, name) {
  const result = await request(`${API_URL}/Categories/${id}`, "PUT", name, true);
  return mapCategory(result);
}

export async function deleteCategory(id) {
  return request(`${API_URL}/Categories/${id}`, "DELETE", null, true);
}

// =======================================
// 🏢 SUCURSALES
// =======================================
export async function listBranches() {
  try {
    return await request(`${API_URL}/Branches`, "GET", null, true);
  } catch (error) {
    console.error("❌ Error en listBranches:", error.message);
    return [];
  }
}

export async function setBranchActive(id, isActive) {
  return request(
    `${API_URL}/Branches/${id}/active?value=${isActive}`,
    "PATCH",
    null,
    true
  );
}

export async function getBranch(id) {
  try {
    return await request(`${API_URL}/Branches/${id}`, "GET", null, true);
  } catch (error) {
    console.error(`❌ Error en getBranch(${id}):`, error.message);
    return null;
  }
}

export async function createBranch(body) {
  return request(`${API_URL}/Branches`, "POST", body, true);
}

export async function updateBranch(id, body) {
  return request(`${API_URL}/Branches/${id}`, "PUT", body, true);
}

export async function deleteBranch(id) {
  return request(`${API_URL}/Branches/${id}`, "DELETE", null, true);
}

// =======================================
// 👥 CLIENTES
// =======================================
export async function listClients() {
  try {
    const data = await request(`${API_URL}/Clients`, "GET", null, true);
    return (Array.isArray(data) ? data : []).map(mapClient);
  } catch (error) {
    console.error("❌ Error en listClients:", error.message);
    return [];
  }
}

export async function getClient(id) {
  try {
    const c = await request(`${API_URL}/Clients/${id}`, "GET", null, true);
    return mapClient(c);
  } catch (error) {
    console.error(`❌ Error en getClient(${id}):`, error.message);
    return null;
  }
}

export async function createClient(body) {
  try {
    const c = await request(`${API_URL}/Clients`, "POST", body, true);
    return mapClient(c);
  } catch (error) {
    console.error("❌ Error en createClient:", error.message);
    throw error;
  }
}

export async function updateClient(id, body) {
  try {
    const c = await request(`${API_URL}/Clients/${id}`, "PUT", body, true);
    return mapClient(c);
  } catch (error) {
    console.error(`❌ Error en updateClient(${id}):`, error.message);
    throw error;
  }
}

export async function deleteClient(id) {
  return request(`${API_URL}/Clients/${id}`, "DELETE", null, true);
}

// =======================================
// 🛒 VENTAS (ADMIN)
// =======================================
export async function listOrders() {
  try {
    const data = await request(`${API_URL}/Sales`, "GET", null, true);
    return (Array.isArray(data) ? data : []).map(mapSale);
  } catch (error) {
    console.error("❌ Error en listOrders:", error.message);
    if (error.type === "SERVER_ERROR" && error.details?.includes("Unable to cast object")) {
      console.warn("⚠️ Error conocido del backend: Conversión de tipos en ventas");
    }
    return [];
  }
}

export async function getOrder(id) {
  try {
    const data = await request(`${API_URL}/Sales/${id}`, "GET", null, true);
    return mapSale(data);
  } catch (error) {
    console.error(`❌ Error en getOrder(${id}):`, error.message);
    return null;
  }
}

export async function createOrder(body) {
  try {
    const data = await request(`${API_URL}/Sales`, "POST", body, true);
    return mapSale(data);
  } catch (error) {
    console.error("❌ Error en createOrder:", error.message);
    throw error;
  }
}

export async function updateOrder(id, body) {
  try {
    const data = await request(`${API_URL}/Sales/${id}`, "PUT", body, true);
    return mapSale(data);
  } catch (error) {
    console.error(`❌ Error en updateOrder(${id}):`, error.message);
    throw error;
  }
}

export async function updateOrderStatus(id, status) {
  try {
    const data = await request(`${API_URL}/Sales/${id}/status`, "PUT", { status }, true);
    return mapSale(data);
  } catch (error) {
    console.error(`❌ Error en updateOrderStatus(${id}):`, error.message);
    throw error;
  }
}

// =======================================
// 🛒 CHECKOUT PÚBLICO (WEB)
// =======================================
export async function createPublicSale(body) {
  if (!body.customer || body.customer.trim() === "") {
    throw new Error("La dirección es requerida");
  }

  if (!body.items || body.items.length === 0) {
    throw new Error("El carrito está vacío");
  }

  const payload = {
    customer: String(body.customer).trim(),
    email: body.email || null,
    phone: body.phone || null,
    items: body.items.map((it) => ({
      productId: Number(it.productId),
      quantity: Number(it.quantity),
      unitPrice: Number(it.unitPrice),
    })),
    shippingCost: Number(body.shippingCost || 0),
    paymentMethod: String(body.paymentMethod || "transfer").toLowerCase(),
    paymentReference: String(body.paymentReference || "Pedido Web"),
    fulfillmentMethod: String(body.fulfillmentMethod || "delivery").toLowerCase(),
    externalData: body.externalData ?? null
  };

  payload.items.forEach((item, i) => {
    if (isNaN(item.productId) || isNaN(item.quantity) || isNaN(item.unitPrice)) {
      console.error(`❌ Item ${i} con valores inválidos:`, item);
      throw new Error(`Item ${i} tiene valores inválidos`);
    }
  });

  if (isNaN(payload.shippingCost)) {
    throw new Error("ShippingCost inválido");
  }

  try {
    const result = await request(`${API_URL}/Sales/public`, "POST", payload, false);

    try {
      const settings = JSON.parse(localStorage.getItem('jovita_settings_cache') || '{}');

      if (settings.whatsappNewOrder) {
        const notificationData = {
          id: result.id || result.Id,
          customer: payload.customer,
          items: body.items,
          total: result.total || result.Total,
          shippingCost: payload.shippingCost,
          paymentMethod: payload.paymentMethod,
          fulfillmentMethod: payload.fulfillmentMethod,
          customerDetails: body.customerDetails || {
            name: payload.customer,
            phone: payload.phone || '',
            email: payload.email || '',
            address: ''
          }
        };

        setTimeout(() => {
          sendNewOrderNotification(notificationData);
        }, 1000);
      }
    } catch (notifError) {
      console.error("⚠️ Error al enviar notificación (no crítico):", notifError);
    }

    return mapSale(result);
  } catch (error) {
    console.error("❌ createPublicSale - Error:", error.message);
    throw error;
  }
}

// =======================================
// 📊 ESTADÍSTICAS
// =======================================
export async function getTodayStats() {
  try {
    return await request(`${API_URL}/Sales/today`, "GET", null, true);
  } catch (error) {
    console.error("❌ Error en getTodayStats:", error.message);
    return { total: 0, count: 0, average: 0, error: error.message };
  }
}

export async function getTotalStatsRange(startDate, endDate) {
  try {
    const params = new URLSearchParams({ startDate, endDate });
    return await request(`${API_URL}/Sales/total?${params.toString()}`, "GET", null, true);
  } catch (error) {
    console.error("❌ Error en getTotalStatsRange:", error.message);
    return { total: 0, count: 0, average: 0, error: error.message };
  }
}

export async function getTotalStats() {
  try {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const end = now.toISOString();
    return await getTotalStatsRange(start, end);
  } catch (error) {
    console.error("❌ Error en getTotalStats:", error.message);
    return { total: 0, count: 0, average: 0, error: error.message };
  }
}

export async function getMonthlyStats(year, month) {
  try {
    return await request(`${API_URL}/Sales/period/${year}/${month}`, "GET", null, true);
  } catch (error) {
    console.error(`❌ Error en getMonthlyStats(${year}/${month}):`, error.message);
    return { total: 0, count: 0, average: 0, error: error.message };
  }
}

export async function getSalesStatistics(startDate = null, endDate = null) {
  try {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    const url = `${API_URL}/Sales/statistics${params.toString() ? '?' + params.toString() : ''}`;
    return await request(url, "GET", null, true);
  } catch (error) {
    console.error("❌ Error en getSalesStatistics:", error.message);
    return {
      totalSales: 0,
      totalAmount: 0,
      averageSale: 0,
      bestSellingProducts: [],
      salesByDay: [],
      error: error.message
    };
  }
}

// =======================================
// 📦 STOCK
// =======================================
export async function getProductStock(productId) {
  try {
    const data = await request(`${API_URL}/Products/${productId}/stock`, "GET", null, true);

    if (Array.isArray(data)) {
      return data.map(s => ({
        branchId: s.BranchId ?? s.branchId,
        quantity: Number(s.Quantity ?? s.quantity ?? 0),
        lastUpdated: s.LastUpdated ?? s.lastUpdated ?? s.LastUpdate ?? s.lastUpdate,
      }));
    }

    return data;
  } catch (error) {
    console.error(`❌ Error en getProductStock(${productId}):`, error.message);
    return [];
  }
}

export async function setProductStock(productId, body) {
  try {
    return await request(`${API_URL}/Products/${productId}/stock/set`, "POST", body, true);
  } catch (error) {
    console.error(`❌ Error en setProductStock(${productId}):`, error.message);
    throw error;
  }
}

export async function addProductStock(productId, body) {
  try {
    return await request(`${API_URL}/Products/${productId}/stock/add`, "POST", body, true);
  } catch (error) {
    console.error(`❌ Error en addProductStock(${productId}):`, error.message);
    throw error;
  }
}

// =======================================
// 🔑 UNIDADES DE PRODUCTO
// =======================================
export async function getProductUnits(productId) {
  try {
    const res = await fetch(`${API_URL}/Products/${productId}/units`);
    if (!res.ok) throw new Error("Error al cargar unidades del producto");
    const data = await res.json();

    const units = (data.Units ?? data.units ?? [])
      .map(u => {
        const prices = (u.Prices ?? u.prices ?? []).map(p => ({
          id: p.Id ?? p.id,
          tier: p.Tier ?? p.tier,
          tierValue: p.TierValue ?? p.tierValue,
          price: p.Price ?? p.price,
        }));

        return {
          id: u.Id ?? u.id,
          displayName: u.DisplayName ?? u.displayName,
          unitLabel: u.UnitLabel ?? u.unitLabel,
          conversionToBase: u.ConversionToBase ?? u.conversionToBase,
          allowFractionalQuantity: u.AllowFractionalQuantity ?? u.allowFractionalQuantity,
          minSellStep: u.MinSellStep ?? u.minSellStep,
          stockDecimals: u.StockDecimals ?? u.stockDecimals,
          retailPrice:
            prices.find(p => p.tier === 0)?.price ??
            u.RetailPrice ?? u.retailPrice ??
            null,
          wholesalePrice:
            prices.find(p => p.tier === 1)?.price ?? null,
          prices,
        };
      })
      .filter(u => u.retailPrice != null && u.retailPrice > 0);

    return {
      productId: data.ProductId ?? data.productId,
      productName: data.ProductName ?? data.productName,
      units,
    };
  } catch (error) {
    console.error(`❌ Error en getProductUnits(${productId}):`, error.message);
    return { productId, productName: "", units: [] };
  }
}

// =======================================
// 🗑️ BORRAR ORDEN (SOFT DELETE)
// =======================================
export async function deleteOrder(id) {
  if (!id) throw new Error("ID inválido");
  return request(`${API_URL}/Sales/${id}`, "DELETE", null, true);
}

// =======================================
// 🛠️ UTILIDADES ADICIONALES
// =======================================
export async function checkApiHealth() {
  try {
    const response = await fetch(`${API_URL}/health`);
    return response.ok;
  } catch {
    return false;
  }
}

export function clearAuth() {
  localStorage.removeItem("admin_token");
  localStorage.removeItem("admin_user");
}

export function isAuthenticated() {
  const token = getToken();
  return !!token;
}

export function isServerError(error) {
  return error?.type === "SERVER_ERROR" || error?.code === 500;
}

export function getFriendlyErrorMessage(error) {
  if (isServerError(error)) {
    return "Error en el servidor. Por favor, contacte al administrador.";
  }
  return error?.message || "Error desconocido";
}

// =======================================
// 💳 PAYWAY - PAGOS CON TARJETA
// =======================================
export async function createPaywayCheckout(data) {
  try {
    const payload = {
      saleId: Number(data.saleId),
      amount: Number(data.amount),
      description: String(data.description || `Pedido #${data.saleId} - Forrajería Jovita`),
      customer: {
        name: String(data.customer?.name || ""),
        email: String(data.customer?.email || `${data.customer?.phone}@temp.com`),
        phone: String(data.customer?.phone || "")
      },
      returnUrl: String(data.returnUrl || `${window.location.origin}/payment/success`),
      cancelUrl: String(data.cancelUrl || `${window.location.origin}/payment/cancel`)
    };

    const result = await request(`${API_URL}/Payway/create-checkout`, "POST", payload, false);

    const checkoutUrl =
      result?.checkoutUrl ||
      result?.CheckoutUrl ||
      result?.checkout_url ||
      result?.payment_url ||
      result?.url ||
      (result?.data && (result.data.checkoutUrl || result.data.checkout_url)) ||
      null;

    return {
      checkoutUrl,
      checkoutId: result?.checkoutId || result?.CheckoutId || result?.checkout_id || null,
      transactionId: result?.transactionId || result?.TransactionId || result?.transaction_id || null,
      raw: result
    };
  } catch (error) {
    console.error("❌ Error en createPaywayCheckout:", error?.message || error);
    const msg = error?.message || (error?.details ? `${error.details}` : "Error desconocido");
    throw new Error(`No se pudo crear el checkout: ${msg}`);
  }
}

export async function getPaymentStatus(transactionId) {
  try {
    const result = await request(`${API_URL}/Payway/payment-status/${transactionId}`, "GET", null, false);

    if (!result) return null;

    return {
      status: result.status || result.Status,
      statusDetail: result.statusDetail || result.StatusDetail,
      amount: Number(result.amount || result.Amount || 0),
      transactionId: result.transactionId || result.TransactionId,
      saleId: Number(result.saleId || result.SaleId || 0),
      createdAt: result.createdAt || result.CreatedAt,
      completedAt: result.completedAt || result.CompletedAt,
      raw: result
    };
  } catch (error) {
    console.error("❌ Error en getPaymentStatus:", error.message || error);
    throw error;
  }
}

export async function getTransactionBySale(saleId) {
  if (!saleId) throw new Error("saleId es requerido");

  const candidates = [
    `${API_URL}/Payway/transaction-by-sale/${saleId}`,
    `${API_URL}/Payway/transaction?saleId=${saleId}`,
    `${API_URL}/Sales/${saleId}/payment-transaction`,
    `${API_URL}/PaymentTransactions/sale/${saleId}`
  ];

  let lastErr = null;
  for (const url of candidates) {
    try {
      const res = await request(url, "GET", null, false);
      if (!res) continue;

      const txId = res.transactionId || res.TransactionId || res.siteTransactionId || res.SiteTransactionId || res.SiteTransaction_Id || null;
      const checkoutId = res.checkoutId || res.CheckoutId || res.checkout_id || res.Checkout_Id || null;
      const saleIdResp = Number(res.saleId || res.SaleId || res.Sale || saleId);
      const status = (res.status || res.Status || res.paymentStatus || res.PaymentStatus || "").toString();
      const amount = Number(res.amount || res.Amount || res.Total || 0);

      return {
        transactionId: txId,
        checkoutId,
        status,
        statusDetail: res.statusDetail || res.StatusDetail || res.message || null,
        amount,
        saleId: saleIdResp,
        raw: res
      };
    } catch (err) {
      lastErr = err;
      console.warn("⚠️ Intento fallido en", url, err?.message || err);
    }
  }

  console.error("❌ No se pudo obtener transaction by sale. Último error:", lastErr);
  throw lastErr || new Error("No se encontró transacción para la venta indicada.");
}

// =======================================
// ⚙️ SETTINGS
// =======================================
export async function getSettings() {
  try {
    const data = await request(`${API_URL}/Settings`, "GET", null, false);
    return data;
  } catch (error) {
    console.error("❌ Error en getSettings:", error.message);
    return getDefaultSettings();
  }
}

export async function updateSettings(settings) {
  try {
    const data = await request(`${API_URL}/Settings`, "PUT", settings, true);
    return data;
  } catch (error) {
    console.error("❌ Error en updateSettings:", error.message);
    throw error;
  }
}

export async function resetSettings() {
  try {
    const data = await request(`${API_URL}/Settings/reset`, "POST", null, true);
    return data;
  } catch (error) {
    console.error("❌ Error en resetSettings:", error.message);
    throw error;
  }
}

function getDefaultSettings() {
  return {
    storeName: "Forrajeria Jovita",
    email: "contacto@forrajeriajovita.com",
    phone: "+54 9 3814669135",
    address: "Aragón 32 Yerba Buena, Argentina",
    description: "Tu dietética de confianza con productos naturales y saludables",
    storeLocation: "Yerba Buena, Tucumán",
    freeShipping: true,
    freeShippingMinimum: 5000,
    shippingCost: 1500,
    deliveryTime: "24-48 horas",
    shippingZones: [
      {
        id: 1,
        price: 800,
        label: "Zona 1 - $800",
        localities: ["yerba buena", "san pablo", "el portal"]
      },
      {
        id: 2,
        price: 1200,
        label: "Zona 2 - $1200",
        localities: ["san miguel de tucumán", "san miguel", "centro", "tucumán", "villa carmela", "barrio norte"]
      },
      {
        id: 3,
        price: 1800,
        label: "Zona 3 - $1800",
        localities: ["tafí viejo", "tafi viejo", "banda del río salí", "alderetes", "las talitas"]
      }
    ],
    defaultShippingPrice: 2500,
    cash: true,
    bankTransfer: true,
    cards: true,
    bankName: "Banco Macro",
    accountHolder: "Forrajeria Jovita S.R.L.",
    cbu: "0000003100010000000001",
    alias: "JOVITA.DIETETICA",
    emailNewOrder: true,
    emailLowStock: true,
    whatsappNewOrder: false,
    whatsappLowStock: false
  };
}