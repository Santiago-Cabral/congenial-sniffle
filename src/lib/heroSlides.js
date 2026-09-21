// src/lib/heroSlides.js

export const DEFAULT_HERO_SLIDES = [
  {
    title: "Vitaminas y Minerales",
    subtitle: "Fortalece tu sistema inmunológico",
    cta: "Descubrir más",
    image: "/banners-salud-hd.webp",
    href: "#productos",
  },
  {
    title: "Alimentos Orgánicos y Naturales",
    subtitle: "Productos naturales para tu bienestar",
    cta: "Ver productos",
    image: "/banner-j.webp",
    href: "#productos",
  },
  {
    title: "Alimentos para Mascotas",
    subtitle: "Cuida a tus amigos peludos",
    cta: "Ver productos",
    image: "/banners-perros-hd.webp",
    href: "#productos",
  },
];

// Even if settings guardan rutas viejas (.png/.jpg) de los banners o categorías,
// las re-mapeamos a las versiones WebP comprimidas para no romper la página.
const LEGACY_IMAGE_MAP = {
  "banners-salud-hd.png": "banners-salud-hd.webp",
  "banners-perros-hd.png": "banners-perros-hd.webp",
  "otros.png": "otros.webp",
  "logo-jovita.png": "logo-jovita.webp",
  "sin-foto.png": "sin-foto.webp",
  "hero-slide-protein-supplements.jpg": "hero-slide-protein-supplements.webp",
  "hero-slide-vitamins.jpg": "hero-slide-vitamins.webp",
  "category-teas.jpg": "category-teas.webp",
  "organic-quinoa-in-bag.jpg": "organic-quinoa-in-bag.webp",
  "organic-honey-jar.jpg": "organic-honey-jar.webp",
  "healthy-natural-food-store-interior.jpg": "healthy-natural-food-store-interior-with-fresh-pro.webp",
};

function remapLegacyImage(url) {
  if (typeof url !== "string") return url;
  const base = url.split("/").pop();
  if (LEGACY_IMAGE_MAP[base]) {
    return url.slice(0, url.length - base.length) + LEGACY_IMAGE_MAP[base];
  }
  return url;
}

export function normalizeHeroSlides(slides, count = 3) {
  const source = Array.isArray(slides) ? slides : [];
  const result = [];
  for (let i = 0; i < count; i++) {
    const s = source[i] && typeof source[i] === "object" ? source[i] : {};
    result.push({
      title: String(s.title ?? DEFAULT_HERO_SLIDES[i]?.title ?? ""),
      subtitle: String(s.subtitle ?? DEFAULT_HERO_SLIDES[i]?.subtitle ?? ""),
      cta: String(s.cta ?? DEFAULT_HERO_SLIDES[i]?.cta ?? ""),
      image: remapLegacyImage(String(s.image ?? DEFAULT_HERO_SLIDES[i]?.image ?? "")),
      href: String(s.href ?? DEFAULT_HERO_SLIDES[i]?.href ?? "#productos"),
    });
  }
  return result;
}