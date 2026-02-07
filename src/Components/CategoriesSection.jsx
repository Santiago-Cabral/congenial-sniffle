import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Pill,
  Apple,
  HeartPulse,
  Leaf,
  Droplet,
  Coffee,
  Package,
  Wheat,
  Cat,
  PawPrint,
} from "lucide-react";
import { useProducts } from "../Context/ProductsContext";

const normalize = (str = "") =>
  str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

const iconByCategoryName = (name = "") => {
  const n = normalize(name);
  if (n.includes("vitamina") || n.includes("suplemento") || n.includes("mineral") || n.includes("omega")) return Pill;
  if (n.includes("cereal") || n.includes("harina") || n.includes("trigo") || n.includes("maiz")) return Wheat;
  if (n.includes("perro") || n.includes("canino") || n.includes("mascota")) return PawPrint;
  if (n.includes("gato") || n.includes("felino")) return Cat;
  if (n.includes("organico") || n.includes("natural") || n.includes("bio")) return Apple;
  if (n.includes("salud") || n.includes("bienestar")) return HeartPulse;
  if (n.includes("hierba") || n.includes("yuyo") || n.includes("medicinal")) return Leaf;
  if (n.includes("aceite")) return Droplet;
  if (n.includes("infusion") || n.includes("te") || n.includes("mate") || n.includes("cafe")) return Coffee;
  return Package;
};

const imageByCategoryName = (name = "") => {
  const n = normalize(name);
  if (n.includes("suplement") || n.includes("proteina")) return "/hero-slide-protein-supplements.jpg";
  if (n.includes("vitamina") || n.includes("omega")) return "/hero-slide-vitamins.jpg";
  if (n.includes("te") || n.includes("infusion") || n.includes("mate")) return "/category-teas.jpg";
  if (n.includes("organico") || n.includes("natural")) return "/healthy-natural-food-store-interior.jpg";
  if (n.includes("cereal") || n.includes("chia") || n.includes("quinoa")) return "/organic-quinoa-in-bag.jpg";
  if (n.includes("perro") || n.includes("mascota")) return "/mascotas.webp";
  if (n.includes("gato")) return "/gatos.webp";
  if (n.includes("aceite")) return "/organic-honey-jar.jpg";
  return "/otros.png";
};

export default function CategoriesSection() {
  const { products, loading } = useProducts();
  const navigate = useNavigate();

  const categories = useMemo(() => {
    const map = new Map();
    if (!products || products.length === 0) return [];

    products.forEach((p) => {
      // Usamos las propiedades normalizadas por el Context/mapProduct
      const name = p.categoryName || "Otros";

      if (!map.has(name)) {
        map.set(name, { title: name, count: 0 });
      }
      map.get(name).count += 1;
    });

    return Array.from(map.values());
  }, [products]);

  if (loading) return null; // O un spinner pequeño

  return (
    <section className="bg-white py-16" id="categorias">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-4xl font-extrabold text-center text-[#1C1C1C] mb-12">
          Categorías
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {categories.map((cat, idx) => {
            const Icon = iconByCategoryName(cat.title);
            const image = imageByCategoryName(cat.title);

            return (
              <button
                key={idx}
                type="button"
                onClick={() =>
                  navigate(`/products?category=${encodeURIComponent(cat.title)}`)
                }
                className="group relative h-56 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition"
              >
                <img
                  src={image}
                  alt={cat.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20" />

                <div className="relative z-10 h-full flex flex-col items-center justify-center text-white text-center px-4">
                  <div className="mb-3">
                    <Icon size={36} strokeWidth={2.5} />
                  </div>
                  <h3 className="text-xl font-extrabold mb-1">{cat.title}</h3>
                  <p className="text-sm opacity-90">{cat.count} productos</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}