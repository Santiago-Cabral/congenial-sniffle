// =======================================
// 🌐 API SERVICE - FORRAJERÍA JOVITA
// =======================================

// Usa SIEMPRE el mismo archivo para admin y cliente
const API_URL = "https://forrajeria-jovita-api.onrender.com/api";

// =============================
// 🔐 TOKEN
// =============================
function getToken() {
  return localStorage.getItem("token") || "";
}

// =============================
// 🧰 HELPER REQUEST
// =============================
async function request(url, method = "GET", body = null, auth = false) {
  const headers = { "Content-Type": "application/json" };

  if (auth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(url, options);

  if (!res.ok) {
    let msg = `Error HTTP ${res.status}`;
    try {
      const t = await res.json();
      msg = t.message || msg;
    } catch {
      /* ignore */
    }
    throw new Error(msg);
  }

  if (res.status === 204) return null;
  return res.json();
}

// =======================================
// 🔐 AUTH
// =======================================
export async function login(email, password) {
  const data = await request(`${API_URL}/Auth/login`, "POST", {
    email,
    password,
  });

  localStorage.setItem("token", data.token);
  localStorage.setItem("user", JSON.stringify(data));

  return data;
}

// =======================================
// 📦 MAPEO DE PRODUCTOS
// =======================================
function getUnitLabel(unit) {
  switch (Number(unit)) {
    case 1:
      return "Kilogramo";
    case 2:
      return "Unidad";
    case 3:
      return "Litro";
    default:
      return "Unidad";
  }
}

export function mapProduct(p) {
  // 👇 Muy importante: traer STOCK e isActived del backend
  return {
    id: p.id,
    code: p.code ?? "",
    name: p.name ?? "",
    image: p.image ?? p.imageUrl ?? "",
    stock: Number(p.stock ?? 0),

    costPrice: Number(p.costPrice ?? 0),
    retailPrice: Number(p.retailPrice ?? 0),
    wholesalePrice: Number(p.wholesalePrice ?? 0),

    baseUnitId: Number(p.baseUnit ?? 2),
    baseUnit: getUnitLabel(p.baseUnit),

    categoryId: p.categoryId ?? null,
    categoryName: p.categoryName ?? p.category ?? "Sin categoría",

    isActived: p.isActived ?? true,
  };
}

// =======================================
// 📦 PRODUCTOS
// =======================================
export async function listProducts() {
  const data = await request(`${API_URL}/Products`);
  console.log("🔁 Productos desde API:", data);
  return data.map(mapProduct);
}

export async function getProduct(id) {
  const p = await request(`${API_URL}/Products/${id}`);
  return mapProduct(p);
}

export async function createProduct(body) {
  // requiere token
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
  return request(`${API_URL}/Categories`, "GET", null, true);
}

export async function createCategory(body) {
  return request(`${API_URL}/Categories`, "POST", body, true);
}

export async function updateCategory(id, body) {
  return request(`${API_URL}/Categories/${id}`, "PUT", body, true);
}

export async function deleteCategory(id) {
  return request(`${API_URL}/Categories/${id}`, "DELETE", null, true);
}

// =======================================
// 🏢 SUCURSALES
// =======================================
export async function listBranches() {
  return request(`${API_URL}/Branches`, "GET", null, true);
}

export async function getBranch(id) {
  return request(`${API_URL}/Branches/${id}`, "GET", null, true);
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
  return request(`${API_URL}/Clients`, "GET", null, true);
}

export async function getClient(id) {
  return request(`${API_URL}/Clients/${id}`, "GET", null, true);
}

export async function createClient(body) {
  return request(`${API_URL}/Clients`, "POST", body, true);
}

export async function updateClient(id, body) {
  return request(`${API_URL}/Clients/${id}`, "PUT", body, true);
}

export async function deleteClient(id) {
  return request(`${API_URL}/Clients/${id}`, "DELETE", null, true);
}

// =======================================
// 🛒 ÓRDENES / VENTAS
// =======================================
export async function listOrders() {
  return request(`${API_URL}/Sales`, "GET", null, true);
}

export async function getOrder(id) {
  return request(`${API_URL}/Sales/${id}`, "GET", null, true);
}

export async function createOrder(body) {
  return request(`${API_URL}/Sales`, "POST", body, true);
}

export async function updateOrder(id, body) {
  return request(`${API_URL}/Sales/${id}`, "PUT", body, true);
}

// =======================================
// 📊 DASHBOARD / ESTADÍSTICAS
// =======================================
export async function getTodayStats() {
  return request(`${API_URL}/Sales/today`, "GET", null, true);
}

export async function getTotalStats() {
  return request(`${API_URL}/Sales/total`, "GET", null, true);
}

export async function getMonthlyStats(year, month) {
  return request(
    `${API_URL}/Sales/period/${year}/${month}`,
    "GET",
    null,
    true
  );
}

export async function getSalesStatistics() {
  return request(`${API_URL}/Sales/statistics`, "GET", null, true);
}

// =======================================
// 🏢 STOCK POR PRODUCTO
// =======================================
export async function getProductStock(productId) {
  // Devuelve lista de { branchId, branchName, quantity, lastUpdated }
  return request(`${API_URL}/Products/${productId}/stock`, "GET", null, true);
}

export async function setProductStock(productId, body) {
  // body: { branchId, productId, quantity }
  return request(
    `${API_URL}/Products/${productId}/stock/set`,
    "POST",
    body,
    true
  );
}

export async function addProductStock(productId, body) {
  return request(
    `${API_URL}/Products/${productId}/stock/add`,
    "POST",
    body,
    true
  );
}
