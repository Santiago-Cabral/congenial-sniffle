import { Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "./layout/AdminLayout";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Orders from "./pages/Orders";
import Clients from "./pages/Clients";
import Branches from "./pages/Branches";
import Categories from "./pages/Categories";
import SettingPage from "./pages/SettingPage";
import Login from "../pages/Login";
import { isAuthenticated } from "./utils/auth";

function Protected({ children }) {
  return isAuthenticated() ? children : <Navigate to="/admin/login" replace />;
}

export default function AppAdmin(){
  return (
    <Routes>
      <Route path="login" element={<Login/>} />
      <Route path="/*" element={
        <Protected>
          <AdminLayout>
            <Routes>
              <Route path="/" element={<Dashboard/>} />
              <Route path="productos" element={<Products/>} />
              <Route path="ordenes" element={<Orders/>} />
              <Route path="clientes" element={<Clients/>} />
              <Route path="sucursales" element={<Branches/>} />
              <Route path="categorias" element={<Categories/>} />
              <Route path="configuracion" element={<SettingPage/>} />
            </Routes>
          </AdminLayout>
        </Protected>
      } />
    </Routes>
  );
}
