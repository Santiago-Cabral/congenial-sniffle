import { Truck, CreditCard, MessageCircle, MapPin } from "lucide-react";

const features = [
  { 
    icon: Truck, 
    title: "Envío Rápido", 
    text: "Entrega en 24-48hs en toda la zona" 
  },
  { 
    icon: CreditCard, 
    title: "Tarjetas de Crédito", 
    text: "Aceptamos todas las tarjetas" 
  },
  { 
    icon: MessageCircle, 
    title: "WhatsApp", 
    text: "Atención personalizada por chat" 
  },
  { 
    icon: MapPin, 
    title: "Sucursal", 
    text: "Retirá en nuestro local" 
  }
];

export default function FeaturesRow() {
  return (
    <section className="bg-[#FDF7EF] py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div key={idx} className="text-center">
                <div className="w-20 h-20 rounded-full bg-[#FFE8D8] flex items-center justify-center mx-auto mb-4 transition-transform hover:scale-110">
                  <Icon size={32} color="#F24C00" strokeWidth={2} />
                </div>
                <h3 className="font-bold text-lg text-[#1C1C1C] mb-2">
                  {feature.title}
                </h3>
                <p className="text-[#5A564E] text-sm leading-relaxed">
                  {feature.text}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}