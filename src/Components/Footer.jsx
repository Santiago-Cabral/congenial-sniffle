import { Phone, Mail, MapPin, Facebook, Instagram } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#F5F5F0] border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Columna 1: Info de la empresa */}
          <div>
            <h3 className="text-[#F24C00] font-extrabold text-xl mb-4">
              Forrajeria Jovita
            </h3>
            <p className="text-[#5A564E] mb-4 leading-relaxed">
              Tu tienda de confianza para productos naturales, 
              suplementos y alimentos saludables.
            </p>
          </div>

          {/* Columna 2: Enlaces rápidos */}
          <div>
            <h4 className="font-bold text-[#1C1C1C] mb-4">Enlaces Rápidos</h4>
            <ul className="space-y-2">
              <li>
                <a href="/" className="text-[#5A564E] hover:text-[#F24C00] transition">
                  Inicio
                </a>
              </li>
              <li>
                <a href="#productos" className="text-[#5A564E] hover:text-[#F24C00] transition">
                  Productos
                </a>
              </li>
              <li>
                <a href="#nosotros" className="text-[#5A564E] hover:text-[#F24C00] transition">
                  Nosotros
                </a>
              </li>
              <li>
                <a href="/contacto" className="text-[#5A564E] hover:text-[#F24C00] transition">
                  Contacto
                </a>
              </li>
            </ul>
          </div>

          {/* Columna 3: Contacto */}
          <div>
            <h4 className="font-bold text-[#1C1C1C] mb-4">Contacto</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-[#5A564E]">
                <Phone size={18} color="#F24C00" />
                <span>+54 9 11 1234-5678</span>
              </li>
              <li className="flex items-center gap-2 text-[#5A564E]">
                <Mail size={18} color="#F24C00" />
                <span>info@forrajeriajovita.com</span>
              </li>
              <li className="flex items-center gap-2 text-[#5A564E]">
                <MapPin size={18} color="#F24C00" />
                <span>Villa Carmela, Argentina</span>
              </li>
            </ul>

            <div className="flex gap-3 mt-6">
              <a 
                href="#" 
                className="w-10 h-10 rounded-full bg-[#F24C00] flex items-center justify-center hover:brightness-110 transition"
              >
                <Facebook size={20} color="white" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 rounded-full bg-[#F24C00] flex items-center justify-center hover:brightness-110 transition"
              >
                <Instagram size={20} color="white" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-300 mt-8 pt-6 text-center">
          <p className="text-[#5A564E] text-sm">
            © 2025 Forrajeria Jovita. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}