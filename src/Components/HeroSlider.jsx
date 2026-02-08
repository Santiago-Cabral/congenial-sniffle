import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const slides = [
  {
    title: "Vitaminas y Minerales",
    subtitle: "Fortalece tu sistema inmunológico",
    cta: "Descubrir más",
    image: "/banners-salud-hd.png",
    href: "#productos",
  },
  {
    title: "Alimentos Orgánicos y Naturales",
    subtitle: "Productos naturales para tu bienestar",
    cta: "Ver productos",
    image: "/banner-j.webp",
    href: "#productos",
  },
  {
    title: "Alimentos para Mascotas",
    subtitle: "Cuida a tus amigos peludos",
    cta: "Ver productos",
    image: "/banners-perros-hd.png",
    href: "#productos",
  },
];

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const intervalRef = useRef(null);
  const touchStartX = useRef(null);

  /* ==============================
     AUTOPLAY
  ============================== */
  useEffect(() => {
    startAutoplay();
    return stopAutoplay;
    // eslint-disable-next-line
  }, []);

  const startAutoplay = () => {
    stopAutoplay();
    intervalRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 6000);
  };

  const stopAutoplay = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  /* ==============================
     CONTROLES
  ============================== */
  const next = () => setCurrent((prev) => (prev + 1) % slides.length);

  const prev = () =>
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);

  /* ==============================
     SWIPE MOBILE
  ============================== */
  const onTouchStart = (e) => {
    stopAutoplay();
    touchStartX.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e) => {
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(deltaX) > 50) {
      deltaX < 0 ? next() : prev();
    }
    startAutoplay();
  };

  return (
    <section
      className="relative w-full overflow-hidden"
      onMouseEnter={stopAutoplay}
      onMouseLeave={startAutoplay}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* SLIDER */}
      <div className="relative h-[450px] sm:h-[500px] md:h-[600px] lg:h-[650px]">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-700 ${
              index === current ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
            style={{
              backgroundImage: `url(${slide.image})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            {/* OVERLAY - Más oscuro en móvil para mejor legibilidad */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/50 to-black/30 md:from-black/65 md:via-black/35 md:to-transparent" />
          </div>
        ))}

        {/* CONTENIDO */}
        <div className="relative z-20 h-full max-w-7xl mx-auto px-4 sm:px-6 md:px-12 lg:px-16 flex items-center">
          <div className="max-w-2xl text-white w-full">
            {/* Título responsivo */}
            <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-extrabold leading-tight drop-shadow-lg">
              {slides[current].title}
            </h1>

            {/* Subtítulo responsivo */}
            <p className="mt-3 md:mt-4 text-sm sm:text-base md:text-lg lg:text-xl text-white/90 drop-shadow-md">
              {slides[current].subtitle}
            </p>

            {/* Botón CTA responsivo */}
            <a
              href={slides[current].href}
              className="inline-block mt-6 md:mt-8 bg-[#F24C00] px-5 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 text-sm sm:text-base md:text-lg rounded-lg md:rounded-xl font-bold shadow-lg hover:brightness-110 transition-all active:scale-95"
            >
              {slides[current].cta}
            </a>
          </div>
        </div>

        {/* FLECHAS - Más pequeñas y mejor posicionadas en móvil */}
        <button
          onClick={prev}
          className="absolute left-2 sm:left-3 md:left-4 top-1/2 -translate-y-1/2 z-30 bg-white/90 p-2 sm:p-2.5 md:p-3 rounded-full shadow-lg hover:scale-105 active:scale-95 transition"
          aria-label="Anterior"
        >
          <ChevronLeft size={18} className="sm:w-5 sm:h-5 md:w-6 md:h-6" />
        </button>

        <button
          onClick={next}
          className="absolute right-2 sm:right-3 md:right-4 top-1/2 -translate-y-1/2 z-30 bg-white/90 p-2 sm:p-2.5 md:p-3 rounded-full shadow-lg hover:scale-105 active:scale-95 transition"
          aria-label="Siguiente"
        >
          <ChevronRight size={18} className="sm:w-5 sm:h-5 md:w-6 md:h-6" />
        </button>

        {/* INDICADORES - Más pequeños y mejor espaciados en móvil */}
        <div className="absolute bottom-4 sm:bottom-5 md:bottom-6 left-1/2 -translate-x-1/2 flex gap-2 md:gap-3 z-30">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-2 md:h-3 rounded-full transition-all ${
                i === current
                  ? "w-8 md:w-10 bg-[#F24C00]"
                  : "w-2 md:w-3 bg-white/60"
              }`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}