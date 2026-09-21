// src/lib/heroSlides.js

export const DEFAULT_HERO_SLIDES = [
  {
    title: "Vitaminas y Minerales",
    subtitle: "Fortalece tu sistema inmunológico",
    cta: "Descubrir más",
    image: "/banners-salud-hd.png",
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
    image: "/banners-perros-hd.png",
    href: "#productos",
  },
];

export function normalizeHeroSlides(slides, count = 3) {
  const source = Array.isArray(slides) ? slides : [];
  const result = [];
  for (let i = 0; i < count; i++) {
    const s = source[i] && typeof source[i] === "object" ? source[i] : {};
    result.push({
      title: String(s.title ?? DEFAULT_HERO_SLIDES[i]?.title ?? ""),
      subtitle: String(s.subtitle ?? DEFAULT_HERO_SLIDES[i]?.subtitle ?? ""),
      cta: String(s.cta ?? DEFAULT_HERO_SLIDES[i]?.cta ?? ""),
      image: String(s.image ?? DEFAULT_HERO_SLIDES[i]?.image ?? ""),
      href: String(s.href ?? DEFAULT_HERO_SLIDES[i]?.href ?? "#productos"),
    });
  }
  return result;
}