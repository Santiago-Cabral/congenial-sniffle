import { Facebook, Instagram } from "lucide-react";

export default function Footer(){
  return (
    <footer className="bg-(--bg) border-t mt-20 py-12">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-8">
        <div>
          <h4 className="text-(--accent) font-bold text-xl">Forrajeria Jovita</h4>
          <p className="mt-4 text-(--muted)">Tu tienda de confianza para productos naturales, suplementos y alimentos saludables.</p>
        </div>

        <div>
          <h5 className="font-semibold mb-3">Enlaces Rápidos</h5>
          <ul className="space-y-2 text-(--muted)">
            <li>Inicio</li>
            <li>Productos</li>
            <li>Nosotros</li>
            <li>Contacto</li>
          </ul>
        </div>

        <div>
          <h5 className="font-semibold mb-3">Contacto</h5>
          <p className="mb-2">+54 9 11 1234-5678</p>
          <p className="mb-2">info@forrajeriajovita.com</p>
          <div className="flex gap-3 mt-4">
            <Facebook />
            <Instagram />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-8 border-t pt-6 text-center text-sm text-(--muted)">
        © {new Date().getFullYear()} Forrajeria Jovita. Todos los derechos reservados.
      </div>
    </footer>
  );
}
