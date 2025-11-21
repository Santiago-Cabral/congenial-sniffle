export function isAuthenticated(){ return !!localStorage.getItem("admin_token"); }
export function getAdminUser(){ try{ return JSON.parse(localStorage.getItem("admin_user")); }catch{return null;} }
export function logout(){ localStorage.removeItem("admin_token"); localStorage.removeItem("admin_user"); }
