import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

const slides = [
  {
    title: "Vitaminas y Minerales",
    subtitle: "Fortalece tu sistema inmunológico",
    cta: "Descubrir Más",
    image: "/hero-slide-vitamins.jpg",
    href: "#productos",
  },
  {
    title: "Alimentos Orgánicos",
    subtitle: "Ingredientes frescos y saludables",
    cta: "Ver categorías",
    image: "/hero-slide-organic-foods.jpg",
    href: "#categoria",
  }
];

export default function HeroSlider() {
  const [i, setI] = useState(0);
  const s = slides[i];

  const nextSlide = () => setI((i + 1) % slides.length);
  const prevSlide = () => setI((i - 1 + slides.length) % slides.length);

  // 🔥 Scroll suave al hacer clic
  const handleScroll = (e, href) => {
    e.preventDefault();
    const section = document.querySelector(href);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative overflow-hidden">
      <div
        className="h-[520px] w-full flex items-center bg-cover bg-center transition-all duration-700 ease-in-out
        sm:h-[420px] xs:h-[380px]"
        style={{ backgroundImage: `url(${s.image})` }}
      >

        {/* Overlay para mejor lectura */}
        <div className="absolute inset-0 bg-white/40 backdrop-blur-[3px]" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="w-full md:w-2/3 lg:w-1/2">
            <h1 className="text-4xl md:text-6xl font-extrabold mb-4 text-[var(--color-dark)] leading-tight">
              {s.title}
            </h1>

            <p className="text-lg md:text-xl text-[rgba(0,0,0,0.75)] mb-8 font-medium leading-relaxed">
              {s.subtitle}
            </p>

            {/* Scroll suave al ID */}
            <a
              className="btn-primary"
              href={s.href}
              onClick={(e) => handleScroll(e, s.href)}
            >
              {s.cta}
            </a>
          </div>
        </div>
      </div>

      {/* Botones prev/next */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white p-3 rounded-full shadow-md hover:scale-105 transition hidden sm:flex"
      >
        <ChevronLeft />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white p-3 rounded-full shadow-md hover:scale-105 transition hidden sm:flex"
      >
        <ChevronRight />
      </button>
    </section>
  );
}
