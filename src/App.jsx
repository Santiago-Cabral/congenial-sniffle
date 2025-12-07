import { Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";

import Navbar from "./components/Navbar";
import HeroSlider from "./components/HeroSlider";
import CategoriesSection from "./Components/CategoriesSection";
import FeaturesRow from "./Components/FeaturesRow";
import FeaturedProducts from "./Components/FeaturedProducts";
import AboutSection from "./Components/AboutSection";
import Footer from "./components/Footer";
import CartSidebar from "./Components/CartSidebar";
import ProductPage from "./pages/Product";

import AdminApp from "./admin/AppAdmin";

// 🟩 PROTECCIÓN DE RUTA PARA ADMIN
function ProtectedAdminRoute({ children }) {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) return <Navigate to="/admin/login" replace />;

  const role = user.role?.toLowerCase();

  const isAdmin =
    role.includes("admin") ||
    role.includes("administrador") ||
    role.includes("administrador/a");

  if (!isAdmin) return <Navigate to="/admin/login" replace />;

  return children;
}

export default function App() {
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <>
      <Navbar onOpenCart={() => setCartOpen(true)} />
      <CartSidebar open={cartOpen} onClose={() => setCartOpen(false)} />

      <main className="pt-20">
        <Routes>
          {/* Home */}
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

          {/* Productos */}
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/products" element={<FeaturedProducts />} />

          {/* Login → redirige al login admin */}
          <Route path="/login" element={<Navigate to="/admin/login" replace />} />

          {/* RUTAS ADMIN PROTEGIDAS */}
          <Route
            path="/admin/*"
            element={
              <ProtectedAdminRoute>
                <AdminApp />
              </ProtectedAdminRoute>
            }
          />
        </Routes>
      </main>

      <Footer />
    </>
  );
}
