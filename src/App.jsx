import Navbar from "./Components/Navbar";
import HeroSlider from "./Components/HeroSlider";
import CategoriesSection from "./Components/CategoriesSection";
import FeaturesRow from "./Components/FeaturesRow";
import ProductsSection from "./Components/ProductSection";
import AboutSection from "./Components/AboutSection";
import Footer from "./Components/Footer";
import CartSidebar from "./Components/CartSidebar";
import { BrowserRouter } from "react-router-dom";
import { useState } from "react";
import Product from "./pages/Product";

export default function App() {
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <BrowserRouter>
      <Navbar onOpenCart={() => setCartOpen(true)} />

      {/* TODO EL CONTENIDO DEBAJO DEL NAV */}
      <main className="top-0">
        <HeroSlider />
        <ProductsSection />
        <CategoriesSection />
        <Product />
        <FeaturesRow />
        <AboutSection />
      </main>

      <Footer />

      {/* CARRITO */}
      <CartSidebar open={cartOpen} onClose={() => setCartOpen(false)} />
    </BrowserRouter>
  );
}
