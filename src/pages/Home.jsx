export default function Home() {
  return (
    <section className="h-screen flex flex-col justify-center items-center text-center px-6 bg-(--color-light)">
      <h1 className="text-4xl md:text-6xl font-bold text-(--color-primary) drop-shadow-sm animate-fade">
        Forrajería Jovita 🐶🌾
      </h1>
      <p className="mt-4 text-lg md:text-xl max-w-xl text-[var(--color-dark)/80]">
        Alimentos naturales, saludables y ricos para tus mascotas 💚
      </p>
      <button
        className="mt-10 bg-(--color-primary) text-white py-3 px-6 rounded-xl shadow-md hover:bg-(--color-dark) transition"
      >
        Ver productos
      </button>
    </section>
  );
}
