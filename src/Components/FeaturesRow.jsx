import { Truck, CreditCard, MessageCircle, MapPin } from "lucide-react";

const features = [
  { icon: Truck, title: "Envío Rápido", text: "Entrega en 24-48hs en toda la zona" },
  { icon: CreditCard, title: "Tarjetas de Crédito", text: "Aceptamos todas las tarjetas" },
  { icon: MessageCircle, title: "WhatsApp", text: "Atención personalizada por chat" },
  { icon: MapPin, title: "Sucursal", text: "Retirá en nuestro local" },
];

export default function FeaturesRow(){
  return (
    <section className="max-w-7xl mx-auto px-6 py-12">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
        {features.map((f, i) => {
          const Icon = f.icon;
          return (
            <div key={i} className="p-6 bg-white rounded-xl shadow text-(--title)">
              <div className="w-20 h-20 rounded-full center-row mx-auto mb-4" style={{ background: "var(--feature-bg)" }}>
                <Icon color="var(--feature-icon)" size={28} />
              </div>
              <h4 className="font-bold text-lg">{f.title}</h4>
              <p className="mt-2 text-(--muted)">{f.text}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
