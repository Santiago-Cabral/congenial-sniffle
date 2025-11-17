import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./Components/Navbar";
import HeroSlider from "./Components/HeroSlider";
import CategoriesSection from "./Components/CategoriesSection";
import FeaturesRow from "./Components/FeaturesRow";
import FeaturedProducts from "./Components/FeaturedProducts";
import AllProducts from "./Components/AllProducts";
import AboutSection from "./Components/AboutSection";
import Footer from "./Components/Footer";
import CartSidebar from "./Components/CartSidebar";

// Página individual de producto
import Product from "./pages/Product";

export default function App() {
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <BrowserRouter>
      {/* Navbar con carrito */}
      <Navbar onOpenCart={() => setCartOpen(true)} />

      {/* Carrito */}
      <CartSidebar open={cartOpen} onClose={() => setCartOpen(false)} />

      {/* Rutas principales */}
      <Routes>
        {/* Home */}
        <Route
          path="/"
          element={
            <>
              <main className="top-0">
                <HeroSlider />
                <CategoriesSection />
                <FeaturedProducts />
                <FeaturesRow />
                <AboutSection />
              </main>
              <Footer />
            </>
          }
        />

        {/* Página individual de producto */}
        <Route
          path="/product/:id"
          element={
            <>
              <Product />
              <Footer />
            </>
          }
        />

        {/* Todos los productos */}
        <Route
          path="/products"
          element={
            <>
              <AllProducts />
              <Footer />
            </>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
