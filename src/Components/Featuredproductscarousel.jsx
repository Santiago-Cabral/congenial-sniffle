import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useProducts } from "../Context/ProductsContext";
import ProductCard from "./ProductCard";

export default function FeaturedProductsCarousel() {
  const { products, loading } = useProducts();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  const featuredProducts = products.filter(
    (p) => p.isFeatured === true && p.isActived === true
  );

  // Intersection Observer para animación de entrada
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const hasCarousel = featuredProducts.length > 4;

  const getItemsToShow = () => {
    if (typeof window === "undefined") return 4;
    if (window.innerWidth < 640) return 1;
    if (window.innerWidth < 768) return 2;
    if (window.innerWidth < 1024) return 3;
    return 4;
  };

  useEffect(() => {
    if (!hasCarousel || isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const itemsToShow = getItemsToShow();
        return prev >= featuredProducts.length - itemsToShow ? 0 : prev + 1;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [hasCarousel, isPaused, featuredProducts.length]);

  const handlePrev = () => {
    const itemsToShow = getItemsToShow();
    setCurrentIndex((prev) =>
      prev > 0 ? prev - 1 : featuredProducts.length - itemsToShow
    );
  };

  const handleNext = () => {
    const itemsToShow = getItemsToShow();
    setCurrentIndex((prev) =>
      prev < featuredProducts.length - itemsToShow ? prev + 1 : 0
    );
  };

  if (loading) {
    return (
      <section className="relative py-24 overflow-hidden bg-[#FAFAF8]">
        {/* Fondo decorativo */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#F24C00] to-transparent opacity-30" />
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-[#F24C00]/5 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-[#F24C00]/5 blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-[#F24C00]/10 text-[#F24C00] px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F24C00] animate-pulse" />
              Selección especial
            </div>
            <div className="h-12 w-72 bg-gray-200 animate-pulse rounded-lg mx-auto mb-4" />
            <div className="h-4 w-48 bg-gray-100 animate-pulse rounded mx-auto" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm p-4 animate-pulse">
                <div className="bg-gray-100 h-52 rounded-xl mb-4" />
                <div className="bg-gray-100 h-4 rounded mb-2" />
                <div className="bg-gray-100 h-4 rounded w-2/3" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (featuredProducts.length === 0) return null;

  return (
    <section
      ref={sectionRef}
      className="relative py-24 overflow-hidden bg-[#FAFAF8]"
    >
      {/* ── Fondo decorativo ── */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#F24C00]/40 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#F24C00]/20 to-transparent" />
        <div className="absolute -top-60 -right-60 w-[500px] h-[500px] rounded-full bg-[#F24C00]/6 blur-3xl" />
        <div className="absolute -bottom-60 -left-60 w-[500px] h-[500px] rounded-full bg-orange-100/60 blur-3xl" />
        {/* Patrón de puntos sutil */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: "radial-gradient(circle, #F24C00 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-6">

        {/* ── Header ── */}
        <div
          className={`text-center mb-16 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          {/* Pill badge */}
          <div className="inline-flex items-center gap-2 bg-[#F24C00]/10 text-[#F24C00] px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-5 border border-[#F24C00]/20">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F24C00] animate-pulse" />
            Selección especial
          </div>

          <h2 className="text-4xl md:text-5xl font-black text-[#1C1C1C] leading-tight mb-4">
            Productos{" "}
            <span className="relative inline-block">
              <span className="relative z-10 text-[#F24C00]">Destacados</span>
              {/* Subrayado decorativo */}
              <svg
                className="absolute -bottom-2 left-0 w-full"
                viewBox="0 0 200 8"
                fill="none"
                preserveAspectRatio="none"
              >
                <path
                  d="M2 6 C50 2, 100 7, 150 3 S190 6, 198 4"
                  stroke="#F24C00"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  fill="none"
                  opacity="0.6"
                />
              </svg>
            </span>
          </h2>

          <p className="text-[#5A564E] text-lg max-w-xl mx-auto leading-relaxed">
            Los mejores productos seleccionados especialmente para vos
          </p>

          {/* Separador */}
          <div className="flex items-center justify-center gap-3 mt-6">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-[#F24C00]/50" />
            <div className="w-2 h-2 rounded-full bg-[#F24C00]" />
            <div className="w-1.5 h-1.5 rounded-full bg-[#F24C00]/50" />
            <div className="w-1 h-1 rounded-full bg-[#F24C00]/30" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-[#F24C00]/50" />
          </div>
        </div>

        {/* ── Contenido: Carrusel o Grid ── */}
        <div
          className={`transition-all duration-700 delay-200 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          {hasCarousel ? (
            <div
              className="relative"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              {/* Botón Anterior */}
              <button
                onClick={handlePrev}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-20 hidden md:flex items-center justify-center w-12 h-12 bg-white text-[#F24C00] border-2 border-[#F24C00]/20 rounded-full shadow-lg hover:bg-[#F24C00] hover:text-white hover:border-[#F24C00] hover:shadow-xl transition-all duration-200 hover:scale-110"
                aria-label="Anterior"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              {/* Track */}
              <div className="overflow-hidden md:px-16 px-1">
                <div
                  className="flex transition-transform duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] gap-5"
                  style={{
                    transform: `translateX(-${currentIndex * (100 / getItemsToShow())}%)`,
                  }}
                >
                  {featuredProducts.map((product, i) => (
                    <div
                      key={product.id}
                      className="flex-shrink-0 w-full sm:w-1/2 md:w-1/3 lg:w-1/4 px-1"
                    >
                      <FeaturedCard product={product} index={i} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Botón Siguiente */}
              <button
                onClick={handleNext}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-20 hidden md:flex items-center justify-center w-12 h-12 bg-white text-[#F24C00] border-2 border-[#F24C00]/20 rounded-full shadow-lg hover:bg-[#F24C00] hover:text-white hover:border-[#F24C00] hover:shadow-xl transition-all duration-200 hover:scale-110"
                aria-label="Siguiente"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* Dots */}
              <div className="flex justify-center items-center gap-2 mt-8">
                {Array.from({
                  length: Math.max(1, featuredProducts.length - getItemsToShow() + 1),
                }).map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`rounded-full transition-all duration-300 ${
                      idx === currentIndex
                        ? "w-8 h-2.5 bg-[#F24C00]"
                        : "w-2.5 h-2.5 bg-gray-300 hover:bg-gray-400"
                    }`}
                    aria-label={`Slide ${idx + 1}`}
                  />
                ))}
              </div>

              {/* Pausa indicator */}
              {isPaused && (
                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Pausado
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product, i) => (
                <FeaturedCard key={product.id} product={product} index={i} />
              ))}
            </div>
          )}
        </div>

        {/* ── CTA Ver todos ── */}
        {featuredProducts.length >= 4 && (
          <div
            className={`text-center mt-14 transition-all duration-700 delay-300 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
          >
            <Link
              to="/allproductos"
              className="group inline-flex items-center gap-3 bg-[#1C1C1C] hover:bg-[#F24C00] text-white px-9 py-4 rounded-full font-bold text-base transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              Ver todos los productos
              <span className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

// ── Card individual con badge ──
function FeaturedCard({ product, index }) {
  return (
    <div
      className="relative group"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* Badge DESTACADO */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
        <div className="flex items-center gap-1 bg-[#F24C00] text-white px-3 py-1 rounded-full text-[10px] font-black tracking-wider shadow-md shadow-[#F24C00]/30 border border-white/20">
          <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          DESTACADO
        </div>
      </div>

      {/* Halo hover */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#F24C00]/15 to-orange-200/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm -z-10 scale-105" />

      {/* Borde sutil */}
      <div className="absolute inset-0 rounded-2xl ring-1 ring-[#F24C00]/0 group-hover:ring-[#F24C00]/25 transition-all duration-300 pointer-events-none z-10" />

      <div className="relative pt-3">
        <ProductCard product={product} />
      </div>
    </div>
  );
}