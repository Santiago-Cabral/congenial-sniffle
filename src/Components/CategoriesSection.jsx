import { Pill, Apple, HeartPulse, Leaf, Droplet, Coffee } from "lucide-react";

const categories = [
  { 
    title: "Suplementos", 
    count: "50+ productos", 
    icon: Pill,
    color: "#FFE8D8",
    img: "/category-supplements.jpg"
  },
  { 
    title: "Alimentos Orgánicos", 
    count: "80+ productos", 
    icon: Apple,
    color: "#D4F4DD",
    img: "/category-organic-foods.jpg"
  },
  { 
    title: "Vitaminas", 
    count: "40+ productos", 
    icon: HeartPulse,
    color: "#FFE0F0",
    img: "/category-vitamins.jpg"
  },
  { 
    title: "Hierbas Naturales", 
    count: "30+ productos", 
    icon: Leaf,
    color: "#E8F5E9",
    img: "/category-herbs.jpg"
  },
  { 
    title: "Aceites Esenciales", 
    count: "25+ productos", 
    icon: Droplet,
    color: "#E3F2FD",
    img: "/category-essential-oils.jpg"
  },
  { 
    title: "Infusiones", 
    count: "35+ productos", 
    icon: Coffee,
    color: "#FFF3E0",
    img: "/category-teas.jpg"
  }
];

export default function CategoriesSection() {
  return (
    <section className="bg-white py-16" id="categorias">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-4xl font-extrabold text-center text-[#1C1C1C] mb-12">
          Categorías
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {categories.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <div
                key={idx}
                className="group cursor-pointer"
              >
                <div 
                  className="aspect-square rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-all hover:scale-105 hover:shadow-xl shadow-md relative overflow-hidden"
                  style={{ backgroundColor: cat.color }}
                >
                  <div className="w-16 h-16 rounded-full bg-white/80 flex items-center justify-center mb-4">
                    <Icon size={32} color="#F24C00" strokeWidth={2} />
                  </div>
                  <h3 className="font-bold text-[#1C1C1C] text-base mb-1">
                    {cat.title}
                  </h3>
                  <p className="text-sm text-[#5A564E]">{cat.count}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}