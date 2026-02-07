// src/Components/AboutSection.jsx
import { MapPin, Clock, Phone, Star, Truck, Instagram } from "lucide-react";

export default function AboutSection() {
  return (
    <section id="nosotros" className="bg-[#FDF7EF] py-16">
      <div className="max-w-7xl mx-auto px-6 grid gap-10 md:grid-cols-2 items-start">
        {/* Columna izquierda: texto principal */}
        <div>
          <h2 className="text-4xl font-extrabold text-[#1C1C1C] mb-4">
            Sobre Forrajería Jovita
          </h2>
          <p className="text-lg text-[#5A564E] mb-6 leading-relaxed">
            Somos una tienda de alimentos para animales ubicada en Yerba Buena,
            Tucumán, comprometida con ofrecerte{" "}
            <span className="font-semibold">muy buena atención</span> y{" "}
            <span className="font-semibold">precios accesibles</span> para el cuidado
            de tus mascotas y animales de granja.
          </p>

          <p className="text-base text-[#5A564E] mb-6 leading-relaxed">
            Nuestros clientes nos eligen por la cercanía, el trato personalizado y la
            calidad de los productos. Trabajamos todos los días para que siempre
            encuentres lo que necesitás, al mejor precio posible.
          </p>

          <div className="grid gap-4 sm:grid-cols-2 mt-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow">
                <Truck size={20} className="text-[#F24C00]" />
              </div>
              <div>
                <h3 className="font-semibold text-[#1C1C1C] text-sm">
                  Entrega a domicilio
                </h3>
                <p className="text-xs text-[#5A564E]">
                  Llevamos tus pedidos directo a tu domicilio en la zona.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow">
                <Star size={20} className="text-[#F24C00]" />
              </div>
              <div>
                <h3 className="font-semibold text-[#1C1C1C] text-sm">
                  Atención y precios
                </h3>
                <p className="text-xs text-[#5A564E]">
                  “Excelente atención y muy buenos precios”, como dicen nuestros clientes.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Columna derecha: info + reseñas */}
        <div className="space-y-6">
          {/* Card información */}
          <div className="bg-white rounded-2xl shadow-md p-6 border border-[#f0e4d4]">
            <h3 className="text-lg font-bold text-[#1C1C1C] mb-4">
              Información del local
            </h3>

            <div className="flex items-start gap-3 mb-3">
              <MapPin className="text-[#F24C00]" size={20} />
              <div>
                <p className="text-sm font-semibold text-[#1C1C1C]">
                  Dirección
                </p>
                <p className="text-sm text-[#5A564E]">
                  Calle Roque Aragón 34, T4107 Yerba Buena, Tucumán
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 mb-3">
              <Clock className="text-[#F24C00]" size={20} />
              <div>
                <p className="text-sm font-semibold text-[#1C1C1C]">
                  Horarios
                </p>
                <p className="text-sm text-[#5A564E]">
                      Lunes a viernes: 9:30 a.m. - 1:30 p.m. / 17:30 p.m. - 9:30 p.m.
                </p>
                <p className="text-sm text-[#5A564E]">
                   Sábado: 9:30 a.m. - 1:30 p.m.
                </p>
                <p className="text-sm text-[#5A564E]">
                  Domingo: cerrado
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 mb-3">
              <Phone className="text-[#F24C00]" size={20} />
              <div>
                <p className="text-sm font-semibold text-[#1C1C1C]">
                  Teléfono
                </p>
                <a
                  href="https://wa.me/+543814669136"
                  className="text-sm text-[#F24C00] font-semibold hover:underline"
                >
                  0381 466-9136
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Instagram className="text-[#F24C00]" size={20} />
              <div>
                <p className="text-sm font-semibold text-[#1C1C1C]">
                  Instagram
                </p>
                <a
                  href="https://www.instagram.com/forrajeria.jovita/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[#F24C00] font-semibold hover:underline"
                >
                  forrajeria.jovita

                </a>
                <p className="text-xs text-[#5A564E] mt-1">
                  Seguinos para ver novedades, promos y nuevos productos.
                </p>
              </div>
            </div>
          </div>

          {/* Card reseñas */}
          <div className="bg-white rounded-2xl shadow-md p-6 border border-[#f0e4d4]">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-semibold text-[#1C1C1C]">Opiniones</p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-[#1C1C1C]">5,0</span>
                  <div className="flex text-[#FBC02D]">
                    <Star size={18} fill="#FBC02D" className="text-[#FBC02D]" />
                    <Star size={18} fill="#FBC02D" className="text-[#FBC02D]" />
                    <Star size={18} fill="#FBC02D" className="text-[#FBC02D]" />
                    <Star size={18} fill="#FBC02D" className="text-[#FBC02D]" />
                    <Star size={18} fill="#FBC02D" className="text-[#FBC02D]" />
                  </div>
                </div>
                <p className="text-xs text-[#5A564E] mt-1">6 reseñas en Google</p>
              </div>
            </div>

            <div className="space-y-3 mt-4">
              <div className="border-l-4 border-[#F24C00] pl-3">
                <p className="text-sm text-[#1C1C1C]">
                  “Muy buena atención y precios bastante accesibles”
                </p>
                <p className="text-xs text-[#5A564E] mt-1">– Máximo Juarez</p>
              </div>

              <div className="border-l-4 border-[#F24C00] pl-3">
                <p className="text-sm text-[#1C1C1C]">
                  “Excelente atención, y muy buenos precios”
                </p>
                <p className="text-xs text-[#5A564E] mt-1">– Felix Enrique Pardo</p>
              </div>

              <div className="border-l-4 border-[#F24C00] pl-3">
                <p className="text-sm text-[#1C1C1C]">
                  “Muy buena la atención y los precios accesibles”
                </p>
                <p className="text-xs text-[#5A564E] mt-1">– Franco Pascual</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
