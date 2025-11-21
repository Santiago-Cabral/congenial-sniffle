const API_URL = "https://forrajeria-jovita-api.onrender.com/api";

async function request(path, opts = {}) {
  const url = `${API_URL}${path}`;
  const headers = { "Content-Type": "application/json", ...(opts.headers || {}) };
  const res = await fetch(url, { ...opts, headers });
  if (!res.ok) {
    const text = await res.text().catch(()=>"");
    throw new Error(`${res.status} ${text}`);
  }
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return res.json();
  return res.text();
}

/* Products */
export async function listProductsRaw() {
  return request("/Products");
}
export async function listProducts() {
  const arr = await listProductsRaw();
  return (arr || []).map(mapProduct);
}
export async function getProductRaw(id) {
  return request(`/Products/${id}`);
}
export async function getProduct(id) {
  const p = await getProductRaw(id);
  return mapProduct(p);
}
export async function createProduct(data) {
  return request("/Products", { method: "POST", body: JSON.stringify(data) });
}
export async function updateProduct(id, data) {
  return request(`/Products/${id}`, { method: "PUT", body: JSON.stringify(data) });
}
export async function deleteProduct(id) {
  return request(`/Products/${id}`, { method: "DELETE" });
}

/* Branches */
export const listBranches = () => request("/Branches");
export const createBranch = (d) => request("/Branches", { method: "POST", body: JSON.stringify(d) });
export const updateBranch = (id,d) => request(`/Branches/${id}`, { method: "PUT", body: JSON.stringify(d) });
export const deleteBranch = (id) => request(`/Branches/${id}`, { method: "DELETE" });

/* Orders/Sales */
export const listOrders = () => request("/Sales");
export const getOrder = (id) => request(`/Sales/${id}`);
export const updateOrder = (id, data) => request(`/Sales/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const createOrder = (data) => request(`/Sales`, { method: "POST", body: JSON.stringify(data) });

/* Clients */
export const listClients = () => request("/Clients");

/* Users (login fallback) */
export const listUsers = () => request("/Users");

/* Map product from API to UI model */
export function mapProduct(p = {}) {
  return {
    id: p.id,
    code: p.code,
    name: p.name,
    price: p.retailPrice ?? 0,
    costPrice: p.costPrice ?? 0,
    wholesalePrice: p.wholesalePrice ?? 0,
    isActived: !!p.isActived,
    baseUnit: p.baseUnit || "",
    updateDate: p.updateDate,
    image: p.image || "/placeholder.png",
    stock: typeof p.stock === "number" ? p.stock : 0,
    category: p.category || "General",
    raw: p,
  };
}

/* Simple login (fallback) */
export async function login(email, password) {
  // Prefer real auth endpoint if exists; fallback to Users search
  const users = await listUsers();
  const user = (users || []).find(u => (u.email || u.Email || "").toLowerCase() === (email||"").toLowerCase());
  if (!user) throw new Error("Usuario no encontrado");
  // If password field exists and mismatch -> error
  if (user.password && user.password !== password) throw new Error("Contraseña incorrecta");
  const token = btoa(`${user.id}:${Date.now()}`);
  localStorage.setItem("admin_token", token);
  localStorage.setItem("admin_user", JSON.stringify(user));
  return { token, user };
}
export function logout() {
  localStorage.removeItem("admin_token");
  localStorage.removeItem("admin_user");
}

export const api = {
  listProducts, listProductsRaw, getProduct, getProductRaw, createProduct, updateProduct, deleteProduct,
  listBranches, createBranch, updateBranch, deleteBranch,
  listOrders, getOrder, updateOrder, createOrder,
  listClients, listUsers,
  login, logout
};
