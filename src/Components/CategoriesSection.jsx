import { Pill, Apple, HeartPulse, Leaf, Droplet, Coffee } from "lucide-react";

const cats = [
  { 
    title: "Suplementos", 
    count: "50+ productos", 
    img: "/category-supplements.jpg", 
    icon: Pill 
  },
  { 
    title: "Alimentos Orgánicos", 
    count: "80+ productos", 
    img: "/category-organic-foods.jpg", 
    icon: Apple 
  },
  { 
    title: "Vitaminas", 
    count: "40+ productos", 
    img: "/category-vitamins.jpg", 
    icon: HeartPulse 
  },
  { 
    title: "Hierbas Naturales", 
    count: "30+ productos", 
    img: "/category-herbs.jpg", 
    icon: Leaf 
  },
  { 
    title: "Aceites Esenciales", 
    count: "25+ productos", 
    img: "/category-essential-oils.jpg", 
    icon: Droplet 
  },
  { 
    title: "Infusiones", 
    count: "35+ productos", 
    img: "/category-teas.jpg", 
    icon: Coffee 
  }
];

export default function CategoriesSection() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-16">
      <h2 className="text-4xl font-bold text-center mb-10 h1-style" id="categoria">Categorías</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
        {cats.map((c, idx) => {
          const Icon = c.icon;

          return (
            <div
              key={idx}
              className="relative rounded-xl overflow-hidden product-card group cursor-pointer transition-transform hover:scale-[1.03]"
            >
              <img
                src={c.img}
                alt={c.title}
                className="w-full h-56 object-cover transition group-hover:scale-110"
              />

              <div className="absolute inset-0 bg-black/40 flex items-end p-6">
                <div>
                  <div className="w-12 h-12 rounded-full bg-white/25 center-row mb-3">
                    <Icon size={26} color="white" strokeWidth={2.5} />
                  </div>
                  <h3 className="text-white text-xl md:text-2xl font-bold">{c.title}</h3>
                  <p className="text-white/80 mt-1 text-sm">{c.count}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
