import { Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";

import Navbar from "./components/Navbar";
import HeroSlider from "./components/HeroSlider";
import CategoriesSection from "./Components/CategoriesSection";
import FeaturesRow from "./Components/FeaturesRow";
import FeaturedProducts from "./components/FeaturedProducts";
import AboutSection from "./components/AboutSection";
import Footer from "./components/Footer";
import CartSidebar from "./Components/CartSidebar";
import ProductPage from "./pages/Product";

import AdminApp from "./admin/AppAdmin";

export default function App() {
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <>
      <Navbar onOpenCart={() => setCartOpen(true)} />
      <CartSidebar open={cartOpen} onClose={() => setCartOpen(false)} />

      <main className="pt-20">
        <Routes>
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

          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/products" element={<FeaturedProducts />} />
          <Route path="/login" element={<Navigate to="/admin/login" replace />} />
          <Route path="/admin/*" element={<AdminApp />} />
        </Routes>
      </main>
      <Footer />

    </>
  );
}