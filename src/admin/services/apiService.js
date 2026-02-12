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

        // Intentar parsear como JSON
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

      // Manejar diferentes códigos de error
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
      // console.error("❌ Error parsing JSON response:", parseError, text);
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

  // 1️⃣ Intentar externalData si existe
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

  // 2️⃣ Fallback mínimo (sin "Cliente")
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

    // 👇 CLAVES
    customerDetails,
    clientName: rawCustomer || "",
    paymentMethod: s.PaymentMethod ?? s.paymentMethod ?? "",
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
        role: (data.Role || data.role || "").toLowerCase()
      }));
    }
    return data;
  } catch (error) {
    console.error("❌ Error en login:", error.message);
    throw new Error(`No se pudo iniciar sesión: ${error.message}`);
  }
}

// =======================================
// 📦 PRODUCTOS
// =======================================
export async function listProducts() {
  try {
    const data = await request(`${API_URL}/Products`, "GET", null, false);
    const mapped = (Array.isArray(data) ? data : []).map(mapProduct);

    // Filtrar productos NO eliminados
    const activeProducts = mapped.filter(p => !p.isDeleted);

  // console.log(`📦 Productos totales: ${mapped.length}, Activos: ${activeProducts.length}`);
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

export async function createCategory(body) {
  const result = await request(`${API_URL}/Categories`, "POST", body, true);
  return mapCategory(result);
}

export async function updateCategory(id, body) {
  const result = await request(`${API_URL}/Categories/${id}`, "PUT", body, true);
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
// Activar / desactivar sucursal
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
  // console.log("📤 createPublicSale - Datos recibidos:", body);

  if (!body.customer || body.customer.trim() === "") {
    throw new Error("La dirección es requerida");
  }

  if (!body.items || body.items.length === 0) {
    throw new Error("El carrito está vacío");
  }

  const payload = {
    customer: String(body.customer).trim(),
    items: body.items.map((it) => ({
      productId: Number(it.productId),
      quantity: Number(it.quantity),
      unitPrice: Number(it.unitPrice),
    })),
    shippingCost: Number(body.shippingCost || 0),
    paymentMethod: String(body.paymentMethod || "transfer").toLowerCase(),
    paymentReference: String(body.paymentReference || "Pedido Web"),
    externalData: body.externalData ?? null
  };

  // console.log("📦 createPublicSale - Payload final:", JSON.stringify(payload, null, 2));

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
    // console.log("✅ createPublicSale - Venta creada:", result);
    
    // ⭐ ENVIAR NOTIFICACIÓN DE WHATSAPP SI ESTÁ HABILITADA
    try {
      const settings = JSON.parse(localStorage.getItem('jovita_settings_v1') || '{}');
      
      if (settings.whatsappNewOrder) {
        // console.log("📱 Enviando notificación de WhatsApp...");
        
        // Preparar datos para la notificación
        const notificationData = {
          id: result.id || result.Id,
          customer: payload.customer,
          items: body.items, // Usar los items originales que tienen más info
          total: result.total || result.Total,
          shippingCost: payload.shippingCost,
          paymentMethod: payload.paymentMethod,
          fulfillmentMethod: body.fulfillmentMethod || 'delivery',
          customerDetails: body.customerDetails || {
            name: payload.customer,
            phone: '',
            email: '',
            address: ''
          }
        };

        // Enviar notificación después de un pequeño delay
        setTimeout(() => {
          sendNewOrderNotification(notificationData);
        }, 1000);
      }
    } catch (notifError) {
      // No fallar la venta si la notificación falla
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
    return {
      total: 0,
      count: 0,
      average: 0,
      error: error.message
    };
  }
}

export async function getTotalStatsRange(startDate, endDate) {
  try {
    const params = new URLSearchParams({ startDate, endDate });
    return await request(`${API_URL}/Sales/total?${params.toString()}`, "GET", null, true);
  } catch (error) {
    console.error("❌ Error en getTotalStatsRange:", error.message);
    return {
      total: 0,
      count: 0,
      average: 0,
      error: error.message
    };
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
    return {
      total: 0,
      count: 0,
      average: 0,
      error: error.message
    };
  }
}

export async function getMonthlyStats(year, month) {
  try {
    return await request(`${API_URL}/Sales/period/${year}/${month}`, "GET", null, true);
  } catch (error) {
    console.error(`❌ Error en getMonthlyStats(${year}/${month}):`, error.message);
    return {
      total: 0,
      count: 0,
      average: 0,
      error: error.message
    };
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
/**
 * Crear un checkout de Payway para pago con tarjeta
 * @param {Object} data - Datos del checkout
 * @returns {Promise<Object>} - URL de checkout y IDs
 */
export async function createPaywayCheckout(data) {
  try {
    // console.log("💳 Creando checkout Payway:", data);

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
    // console.log("✅ Checkout Payway creado:", result);

    // aceptar varios nombres comunes que pueda devolver el backend / provider
    const checkoutUrl =
      result?.checkoutUrl ||
      result?.CheckoutUrl ||
      result?.checkout_url ||
      result?.payment_url ||
      result?.url ||
      (result?.data && (result.data.checkoutUrl || result.data.checkout_url)) ||
      null;

    return {
      checkoutUrl: checkoutUrl,
      checkoutId: result?.checkoutId || result?.CheckoutId || result?.checkout_id || null,
      transactionId: result?.transactionId || result?.TransactionId || result?.transaction_id || null,
      raw: result
    };
  } catch (error) {
    console.error("❌ Error en createPaywayCheckout:", error?.message || error);
    // Si viene estructura del error, intentar propagar mensaje legible
    const msg = error?.message || (error?.details ? `${error.details}` : "Error desconocido");
    throw new Error(`No se pudo crear el checkout: ${msg}`);
  }
}

/**
 * Verificar el estado de un pago
 * @param {string} transactionId - ID de la transacción
 * @returns {Promise<Object>} - Estado del pago
 */
export async function getPaymentStatus(transactionId) {
  try {
    // console.log("🔍 Consultando estado del pago:", transactionId);

    const result = await request(`${API_URL}/Payway/payment-status/${transactionId}`, "GET", null, false);
    // console.log("📊 Estado del pago:", result);

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

/**
 * Obtener la transacción/checkout asociada a una venta (saleId)
 * Esta función se agregó para resolver el error: "does not provide an export named 'getTransactionBySale'"
 * Intenta varias rutas posibles en el backend por compatibilidad.
 * @param {number|string} saleId
 * @returns {Promise<Object|null>}
 */
export async function getTransactionBySale(saleId) {
  if (!saleId) throw new Error("saleId es requerido");

  // endpoints posibles (ajustá si tu backend usa otro path)
  const candidates = [
    `${API_URL}/Payway/transaction-by-sale/${saleId}`,
    `${API_URL}/Payway/transaction?saleId=${saleId}`,
    `${API_URL}/Sales/${saleId}/payment-transaction`,
    `${API_URL}/PaymentTransactions/sale/${saleId}`
  ];

  let lastErr = null;
  for (const url of candidates) {
    try {
      // console.log("🔎 Intentando obtener transacción desde:", url);
      const res = await request(url, "GET", null, false);
      if (!res) continue;

      // normalizar campos más comunes
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
      // continuar al siguiente candidato
    }
  }

  // ninguno funcionó -> propagar último error razonable
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
    // Retornar defaults si falla
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