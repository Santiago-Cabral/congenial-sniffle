// src/App.jsx
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useState } from "react";

import Navbar from "./Components/Navbar";
import HeroSlider from "./Components/HeroSlider";
import CategoriesSection from "./Components/CategoriesSection";
import FeaturesRow from "./Components/FeaturesRow";
import FeaturedProducts from "./Components/FeaturedProducts";
import AboutSection from "./Components/AboutSection";
import Footer from "./components/Footer";
import CartSidebar from "./Components/CartSidebar";
import ProductPage from "./pages/Product";
import AllProducts from "../src/Components/AllProducts.jsx";

import AdminApp from "./admin/AppAdmin";
import WhatsAppAssistant from "./Components/WhatsAppButton";

import UserLoginPage from "./pages/UserLoginPage.jsx";
import PerfilPage from "./pages/PerfilPage";
import { useUserAuth } from "./Context/UserAuthContext";

// Rutas nuevas
import Error404 from "./pages/Error404";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCancel from "./pages/PaymentCancel";

// 🟩 PROTECCIÓN DE RUTA PARA ADMIN
function ProtectedAdminRoute({ children }) {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) return <Navigate to="/admin/login" replace />;

  const role = user.role?.toLowerCase?.() || "";

  const isAdmin =
    role.includes("admin") ||
    role.includes("administrador") ||
    role.includes("administrador/a");

  if (!isAdmin) return <Navigate to="/admin/login" replace />;

  return children;
}

// 🟦 PROTECCIÓN DE RUTA PARA USUARIO NORMAL
function ProtectedClientRoute({ children }) {
  const { isAuthenticated } = useUserAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return children;
}

export default function App() {
  const [cartOpen, setCartOpen] = useState(false);
  const location = useLocation();

  // Detectar si estamos en la sección admin
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <>
      {/* NAVBAR Y CARRITO SIEMPRE VISIBLES (también en admin, si querés luego lo cambiamos) */}
      <Navbar onOpenCart={() => setCartOpen(true)} />
      <CartSidebar open={cartOpen} onClose={() => setCartOpen(false)} />

      <main className="pt-20">
        <Routes>
          {/* HOME */}
          <Route
            path="/"
            element={
              <>
                <HeroSlider />
                <CategoriesSection />
                <FeaturesRow />
                <FeaturedProducts />
                <AboutSection />
              </>
            }
          />

          <Route path="/nosotros" element={<AboutSection />} />
          <Route path="/categorias" element={<CategoriesSection />} />

          {/* PRODUCTOS */}
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/products" element={<FeaturedProducts />} />
          <Route path="/allproductos" element={<AllProducts />} />

        {/*Alias para compatibilidad con los returnUrl/cancelUrl que generás en CheckoutForm*/}
<Route path="/payment/success" element={<PaymentSuccess />} />
<Route path="/payment/cancel" element={<PaymentCancel />} />


          {/* LOGIN USUARIO NORMAL */}
          <Route path="/login" element={<UserLoginPage />} />

          {/* PERFIL (CLIENTE) PROTEGIDO */}
          <Route
            path="/perfil"
            element={
              <ProtectedClientRoute>
                <PerfilPage />
              </ProtectedClientRoute>
            }
          />

          {/* RUTAS ADMIN PROTEGIDAS */}
          <Route
            path="/admin/*"
            element={
              <ProtectedAdminRoute>
                <AdminApp />
              </ProtectedAdminRoute>
            }
          />

          {/* RUTA 404 EXPLÍCITA (opcional) */}
          <Route path="/404" element={<Error404 />} />

          {/* CUALQUIER OTRA RUTA → 404 */}
          <Route path="*" element={<Error404 />} />
        </Routes>
      </main>

      {/* FOOTER Y WHATSAPP SOLO EN LA PARTE PÚBLICA */}
      {!isAdminRoute && <Footer />}
      {!isAdminRoute && <WhatsAppAssistant />}
    </>
  );
}
