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
import FeaturedProductsCarousel from "./Components/Featuredproductscarousel";
import CartSidebar from "./Components/CartSidebar";
import ProductPage from "./pages/Product";
import AllProducts from "../src/Components/AllProducts.jsx";

import AdminApp from "./admin/AppAdmin";
import WhatsAppAssistant from "./Components/WhatsAppButton";

import UserLoginPage from "./pages/UserLoginPage.jsx";
import PerfilPage from "./pages/PerfilPage";
import { useUserAuth } from "./Context/UserAuthContext";
import { useProducts } from "./Context/ProductsContext";

import Error404 from "./pages/Error404";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCancel from "./pages/PaymentCancel";

function ProtectedClientRoute({ children }) {
  const { isAuthenticated } = useUserAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

function GlobalLoader() {
  return (
    <div className="fixed inset-0 bg-[#FAFAF8] flex flex-col items-center justify-center z-50">
      {/* Logo */}
      <img
        src="/logo.png"
        alt="Jovita"
        className="w-24 h-24 object-contain mb-8"
        onError={(e) => { e.target.style.display = "none"; }}
      />

      {/* Spinner */}
      <div className="w-14 h-14 border-4 border-[#F24C00]/20 border-t-[#F24C00] rounded-full animate-spin mb-6" />

      {/* Texto */}
      <p className="text-[#F24C00] font-black text-xl tracking-wide animate-pulse">
        Cargando productos...
      </p>
      <p className="text-[#5A564E] text-sm mt-2">
        Esto puede tardar unos segundos
      </p>

      {/* Puntos animados */}
      <div className="flex gap-2 mt-6">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-[#F24C00]"
            style={{ animation: `bounce 1s ease-in-out ${i * 0.2}s infinite` }}
          />
        ))}
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); opacity: 0.4; }
          50% { transform: translateY(-8px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export default function App() {
  const [cartOpen, setCartOpen] = useState(false);
  const location = useLocation();
  const { loading } = useProducts();

  const isAdminRoute = location.pathname.startsWith("/admin");

  // 🔄 Mostrar loader global mientras cargan los productos
  if (loading && !isAdminRoute) {
    return <GlobalLoader />;
  }

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
                <FeaturedProductsCarousel />
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

          {/* LOGIN */}
          <Route path="/login" element={<UserLoginPage />} />

          {/* PERFIL PROTEGIDO */}
          <Route
            path="/perfil"
            element={
              <ProtectedClientRoute>
                <PerfilPage />
              </ProtectedClientRoute>
            }
          />

          {/* ADMIN */}
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