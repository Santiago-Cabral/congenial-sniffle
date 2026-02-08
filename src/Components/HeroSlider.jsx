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

  const next = () => setCurrent((prev) => (prev + 1) % slides.length);

  const prev = () =>
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);

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
      <div className="relative h-[500px] md:h-[600px] lg:h-[650px]">
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
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
          </div>
        ))}

        <div className="relative z-20 h-full flex items-center">
          <div className="w-full max-w-7xl mx-auto px-6 md:px-16">
            <div className="max-w-2xl text-white">
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold leading-tight drop-shadow-lg">
                {slides[current].title}
              </h1>

              <p className="mt-3 md:mt-4 text-base md:text-xl text-white/90 drop-shadow-md">
                {slides[current].subtitle}
              </p>

              <a
                href={slides[current].href}
                className="inline-block mt-6 md:mt-8 bg-[#F24C00] px-6 md:px-8 py-3 md:py-4 text-base md:text-lg rounded-xl font-bold shadow-lg hover:brightness-110 transition-all active:scale-95"
              >
                {slides[current].cta}
              </a>
            </div>
          </div>
        </div>

        {/* Flechas solo en desktop */}
        <button
          onClick={prev}
          className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-white/90 p-3 rounded-full shadow-lg hover:scale-105 transition items-center justify-center"
          aria-label="Anterior"
        >
          <ChevronLeft size={24} />
        </button>

        <button
          onClick={next}
          className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-white/90 p-3 rounded-full shadow-lg hover:scale-105 transition items-center justify-center"
          aria-label="Siguiente"
        >
          <ChevronRight size={24} />
        </button>

        {/* Indicadores */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-30">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-2.5 rounded-full transition-all ${
                i === current
                  ? "w-10 bg-[#F24C00]"
                  : "w-2.5 bg-white/60 hover:bg-white/80"
              }`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}