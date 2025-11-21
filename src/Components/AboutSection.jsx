export default function AboutSection() {
  return (
    <section id="nosotros" className="bg-[#FDF7EF] py-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-5xl font-extrabold text-[#1C1C1C] mb-6 leading-tight">
              Sobre Forrajeria Jovita
            </h2>
            <p className="text-lg text-[#5A564E] mb-6 leading-relaxed">
              Desde hace más de 20 años, nos dedicamos a ofrecer los mejores productos 
              naturales y orgánicos para tu salud y bienestar.
            </p>
            <p className="text-lg text-[#5A564E] mb-8 leading-relaxed">
              Nuestra misión es promover un estilo de vida saludable a través de productos 
              de la más alta calidad, seleccionados cuidadosamente para ti y tu familia.
            </p>
            <a 
              href="/nosotros" 
              className="inline-block bg-[#F24C00] text-white px-8 py-4 rounded-xl font-bold text-lg hover:brightness-110 transition shadow-lg"
            >
              Conocer Más
            </a>
          </div>

          <div className="relative">
            <img 
              src="/store.jpg" 
              alt="Tienda Forrajería Jovita" 
              className="rounded-2xl shadow-2xl w-full h-[500px] object-cover"
            />
            <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-lg">
              <p className="text-4xl font-extrabold text-[#F24C00]">20+</p>
              <p className="text-[#5A564E] font-semibold">Años de experiencia</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}