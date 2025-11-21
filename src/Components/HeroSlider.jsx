import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const slides = [
  {
    title: "Vitaminas y Minerales",
    subtitle: "Fortalece tu sistema inmunológico",
    cta: "Descubrir Más",
    image: "/hero-slide-vitamins.jpg",
    href: "#productos"
  },
  {
    title: "Alimentos Orgánicos",
    subtitle: "Productos naturales para tu bienestar",
    cta: "Ver Productos",
    image: "/hero-slide-organic-foods.jpg",
    href: "#productos"
  }
];

export default function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => setCurrentSlide((currentSlide + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((currentSlide - 1 + slides.length) % slides.length);

  const slide = slides[currentSlide];

  return (
    <section className="relative h-[600px] w-full overflow-hidden bg-[#FDF7EF]">
      {slides.map((s, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-700 ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${s.image})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/70 to-transparent" />
        </div>
      ))}
      
      <div className="relative h-full max-w-7xl mx-auto px-6 flex items-center z-10">
        <div className="max-w-2xl">
          <h1 className="text-6xl font-extrabold text-[#1C1C1C] mb-4 leading-tight">
            {slide.title}
          </h1>
          <p className="text-xl text-[#5A564E] mb-8">
            {slide.subtitle}
          </p>
          <a 
            href={slide.href}
            className="inline-block bg-[#F24C00] text-white px-8 py-4 rounded-xl font-bold text-lg hover:brightness-110 transition shadow-lg"
          >
            {slide.cta}
          </a>
        </div>
      </div>

      <button 
        onClick={prevSlide}
        className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/90 p-4 rounded-full shadow-lg hover:bg-white transition z-20"
      >
        <ChevronLeft size={24} />
      </button>
      
      <button 
        onClick={nextSlide}
        className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/90 p-4 rounded-full shadow-lg hover:bg-white transition z-20"
      >
        <ChevronRight size={24} />
      </button>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-3 rounded-full transition-all ${
              index === currentSlide ? 'bg-[#F24C00] w-8' : 'bg-white/60 w-3'
            }`}
          />
        ))}
      </div>
    </section>
  );
}