import { ShoppingCart } from "lucide-react";
import { useCart } from "../Context/CartContext.jsx";

const products = [
  {
    id: 1,
    title: "Miel Orgánica Pura",
    price: 19500,
    image: "/organic-honey-jar.jpg",
    stock: true,
    category: "Suplemento",
  },
  {
    id: 2,
    title: "Trébol Verde Orgánico en Caja",
    price: 6500,
    image: "/organic-green-tea-box.jpg",
    stock: true,
    category: "Infusión",
  },
  {
    id: 3,
    title: "Chia Seeds en Frasco de Vidrio",
    price: 3200,
    image: "/chia-seeds-in-glass-jar.jpg",
    stock: false,
    category: "Semillas",
  },
];

export default function ProductsSection() {
  const { addToCart } = useCart();

  return (
    <section className="max-w-7xl mx-auto px-6 py-20">
      <h2 className="text-4xl font-bold mb-10 text-center h1-style">
        Productos destacados
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
        {products.map((p) => (
          <div
            key={p.id}
            className="bg-white rounded-2xl shadow-md hover:shadow-xl transition overflow-hidden"
          >
            <img
              src={p.image}
              alt={p.title}
              className="w-full h-56 object-cover"
            />

            <div className="p-6 flex flex-col gap-3">
              {p.stock ? (
                <span className="bg-green-600 text-white text-xs px-3 py-1 rounded-full w-fit">
                  En stock
                </span>
              ) : (
                <span className="bg-red-600 text-white text-xs px-3 py-1 rounded-full w-fit">
                  Sin stock
                </span>
              )}

              <h3 className="text-xl font-semibold leading-tight text-[var(--color-dark)]">
                {p.title}
              </h3>

              <p className="text-2xl font-bold text-[var(--color-accent)]">
                ${p.price.toLocaleString("es-AR")}
              </p>

              <button
                onClick={() => p.stock && addToCart({ ...p, qty: 1 })}
                disabled={!p.stock}
                className={`flex items-center justify-center gap-2 w-full 
                  font-semibold py-3 rounded-xl shadow-md transition 
                  ${p.stock
                    ? "mt-6 btn-primary w-full flex items-center justify-center gap-3"
                    : "bg-gray-400 text-gray-100 cursor-not-allowed"
                  }`}
              >
                <ShoppingCart size={22} />
                Agregar al carrito
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
