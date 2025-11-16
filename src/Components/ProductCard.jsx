import { ShoppingCart } from "lucide-react";
import { useCart } from "../Context/CartContext";

export default function ProductCard({ product }){
  const { addToCart } = useCart();
  return (
    <div className="product-card">
      <div className="relative">
        <img src={product.image} alt={product.title} className="card-img-top w-full"/>
        <div className="absolute left-4 top-4 tag-green">{product.category}</div>
      </div>
      <div className="p-6">
        <h3 className="text-xl font-semibold text-(--title)">{product.title}</h3>
        <p className="text-2xl font-extrabold text-(--accent) mt-4">${product.price.toFixed(2)}</p>
        <button onClick={() => addToCart(product)} className="mt-6 btn-primary w-full flex items-center justify-center gap-3">
          <ShoppingCart /> Agregar al Carrito
        </button>
      </div>
    </div>
  );
}
