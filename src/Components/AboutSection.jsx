export default function AboutSection(){
  return (
    <section className="max-w-7xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-10 items-center">
      <div>
        <h2 className="h1-style text-4xl mb-6">Sobre Forrajeria Jovita</h2>
        <p className="text-lg text-(--muted) mb-6">Desde hace más de 20 años, nos dedicamos a ofrecer los mejores productos naturales y orgánicos para tu salud y bienestar.</p>
        <a className="btn-primary inline-block mt-2" href="/nosotros">Conocer Más</a>
      </div>
      <div>
        <img src="/store.jpg" alt="store" className="rounded-xl shadow"/>
      </div>
    </section>
  );
}
