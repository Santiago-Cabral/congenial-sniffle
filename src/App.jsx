// src/App.jsx
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useState } from "react";

import Navbar from "./Components/Navbar";
import HeroSlider from "./Components/HeroSlider";
import CategoriesSection from "./Components/CategoriesSection";
import FeaturesRow from "./Components/FeaturesRow";
import FeaturedProducts from "./Components/FeaturedProducts";
import AboutSection from "./Components/AboutSection";
import Footer from "./Components/Footer";
import CartSidebar from "./Components/CartSidebar";
import ProductPage from "./pages/Product";
import AllProducts from "../src/Components/AllProducts.jsx";

import AdminApp from "./admin/AppAdmin";
import WhatsAppAssistant from "./Components/WhatsAppButton";

import UserLoginPage from "./pages/UserLoginPage.jsx";
import PerfilPage from "./pages/PerfilPage";
import { useUserAuth } from "./Context/UserAuthContext";

import Error404 from "./pages/Error404";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCancel from "./pages/PaymentCancel";

// 🟦 PROTECCIÓN DE RUTA PARA USUARIO NORMAL (mantener)
function ProtectedClientRoute({ children }) {
  const { isAuthenticated } = useUserAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return children;
}

export default function App() {
  const [cartOpen, setCartOpen] = useState(false);
  const location = useLocation();

  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <>
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

          {/* ✅ TODAS LAS RUTAS ADMIN (SIN PROTECCIÓN AQUÍ) 
              La protección está dentro de AdminApp.jsx */}
          <Route path="/admin/*" element={<AdminApp />} />

          <Route path="/404" element={<Error404 />} />
          <Route path="*" element={<Error404 />} />
        </Routes>
      </main>

      {!isAdminRoute && <Footer />}
      {!isAdminRoute && <WhatsAppAssistant />}
    </>
  );
}