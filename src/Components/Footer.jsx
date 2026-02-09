// src/components/Footer.jsx
import React from "react";
import { Phone, Mail, MapPin, Facebook, Instagram } from "lucide-react";
import { useSettings } from "../Context/SettingContext"; // <-- ajusta si tu archivo se llama SettingContext

function normalizeUrl(raw) {
  if (!raw) return null;
  const trimmed = String(raw).trim();
  if (!trimmed) return null;
  // If already has protocol, keep it
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  // Otherwise assume https
  return `https://${trimmed}`;
}

export default function Footer() {
  // Leer settings desde el contexto (fallback silencioso)
  let settings = {};
  try {
    const ctx = useSettings();
    settings = ctx?.settings ?? {};
  } catch (err) {
    console.warn("SettingsProvider no encontrado — usando valores por defecto para el footer.");
    settings = {};
  }

  const {
    storeName,
    phone,
    email,
    address,
    facebookUrl,
    instagramUrl
  } = settings;

  const displayStoreName = storeName || "Forrajeria Jovita";
  const displayPhone = phone || "+54 9 3814669135";
  const displayEmail = email || "info@forrajeriajovita.com";
  const displayAddress = address || "Aragón 32 Yerba Buena , Argentina";

  const telHref = `tel:${String(displayPhone).replace(/[^+\d]/g, "")}`;
  const mailtoHref = `mailto:${displayEmail}`;
  const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(displayAddress)}`;

  const fbHref = normalizeUrl(facebookUrl);
  // If user didn't provide instagram in settings, fallback to the known instagram handle
  const igHref = normalizeUrl(instagramUrl) || "https://www.instagram.com/forrajeria.jovita/";

  const showFacebook = !!fbHref;

  return (
    <footer className="bg-[#F5F5F0] border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Columna 1: Info de la empresa */}
          <div>
            <h3 className="text-[#F24C00] font-extrabold text-xl mb-4">
              {displayStoreName}
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
                <a href="/allproductos" className="text-[#5A564E] hover:text-[#F24C00] transition">
                  Productos
                </a>
              </li>
              <li>
                <a href="/nosotros" className="text-[#5A564E] hover:text-[#F24C00] transition">
                  Nosotros
                </a>
              </li>
            </ul>
          </div>

          {/* Columna 3: Contacto */}
          <div>
            <h4 className="font-bold text-[#1C1C1C] mb-4">Contacto</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-[#5A564E]">
                <a href={telHref} className="flex items-center gap-2">
                  <Phone size={18} color="#F24C00" />
                  <span>{displayPhone}</span>
                </a>
              </li>
              <li className="flex items-center gap-2 text-[#5A564E]">
                <a href={mailtoHref} className="flex items-center gap-2">
                  <Mail size={18} color="#F24C00" />
                  <span>{displayEmail}</span>
                </a>
              </li>
              <li className="flex items-center gap-2 text-[#5A564E]">
                <a href={mapsHref} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                  <MapPin size={18} color="#F24C00" />
                  <span>{displayAddress}</span>
                </a>
              </li>
            </ul>

            <div className="flex gap-3 mt-6">
              {/* Facebook: solo mostrar si hay URL válida */}
              {showFacebook && (
                <a
                  href={fbHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-[#F24C00] flex items-center justify-center hover:brightness-110 transition"
                  aria-label="Facebook"
                >
                  <Facebook size={20} color="white" />
                </a>
              )}

              {/* Instagram: siempre mostrar y abrir en nueva pestaña */}
              <a
                href={igHref}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-[#F24C00] flex items-center justify-center hover:brightness-110 transition"
                aria-label="Instagram"
              >
                <Instagram size={20} color="white" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-300 mt-8 pt-6 text-center">
          <p className="text-[#5A564E] text-sm mb-2">
            © {new Date().getFullYear()} {displayStoreName}. Todos los derechos reservados.
          </p>
          <p className="text-[#5A564E] text-sm">
            Desarrollado por{" "}
            <a 
              href="https://sc-softwares.vercel.app/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-[#F24C00] hover:text-[#F24C00] font-semibold transition"
            >
              SC software
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
