import ProductCard from "../Components/ProductCard";

const fakeProducts = [
  { id: 1, title: "Proteína de Suero Orgánica", price: 2499.99, image: "/organic-whey-protein-powder-container.jpg", category: "Suplementos" },
  { id: 2, title: "Semillas de Quinoa Orgánicas", price: 899.99, image: "/organic-quinoa-in-bag.jpg", category: "Alimentos" },
  { id: 3, title: "Aceite de Coco Virgen", price: 1299.99, image: "/coconut-oil-jar.jpg", category: "Alimentos" },
  { id: 4, title: "Multivitamínico Natural Omega 3", price: 1899.99, image: "/omega-3-supplement-bottle.jpg", category: "Vitaminas" },
];

export default function Products(){
  return (
    <main className="max-w-7xl mx-auto px-6 py-16" id="productos">
      <h2 className="h1-style text-4xl text-center mb-4">Nuestros Productos</h2>
      <p className="text-center text-(--muted) mb-10">Explora nuestra amplia selección de productos naturales y saludables</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {fakeProducts.map(p => <ProductCard key={p.id} product={p} />)}
      </div>
    </main>
  );
}
