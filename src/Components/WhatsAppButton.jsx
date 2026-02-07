import { useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { useProducts } from "../Context/ProductsContext";
import { Link } from "react-router-dom";

export default function WhatsAppAssistant() {
  const { products } = useProducts();

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      from: "bot",
      type: "text",
      text: "¡Hola! Soy el asistente virtual de Jovita 😊 ¿Qué producto o categoría estás buscando?"
    }
  ]);
  const [input, setInput] = useState("");

  const phone = "5493814669135";

  const IA_RESPONSES = [
    { keywords: ["horario", "abren", "cierran"], answer: "Nuestro horario es de 9 a 21 hs, lunes a sábado." },
    { keywords: ["envio", "entrega"], answer: "Realizamos envíos en la zona. ¿Cuál es tu dirección?" },
    { keywords: ["ubicacion", "direccion"], answer: "Estamos en Aragon 32, Yerba Buena" }
  ];

  // 🔍 Búsqueda por nombre y categoryName (dato real del backend)
  const searchProducts = (query) => {
    if (!products || products.length === 0) return [];

    const txt = query.toLowerCase();

    return products.filter((p) => {
      const nameMatch = p.name?.toLowerCase().includes(txt);
      const categoryMatch = p.categoryName?.toLowerCase().includes(txt);
      return nameMatch || categoryMatch;
    });
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userText = input.trim();
    setMessages((prev) => [...prev, { from: "user", type: "text", text: userText }]);

    const lower = userText.toLowerCase();
    const productMatches = searchProducts(lower);

    // ✅ SI ENCUENTRA PRODUCTOS
    if (productMatches.length > 0) {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            from: "bot",
            type: "text",
            text: `Encontré ${productMatches.length} producto(s) relacionado(s):`
          },
          {
            from: "bot",
            type: "products",
            items: productMatches.slice(0, 4)
          }
        ]);
      }, 300);

      setInput("");
      return;
    }

    // 🤖 RESPUESTAS AUTOMÁTICAS GENERALES
    let botResponse = null;

    for (const rule of IA_RESPONSES) {
      if (rule.keywords.some((w) => lower.includes(w))) {
        botResponse = rule.answer;
        break;
      }
    }

    // ❌ NO EXISTE PRODUCTO NI CATEGORÍA
    if (!botResponse) {
      botResponse =
        "No encontré productos ni categorías con ese nombre 😕\n" +
        "Probá con otra palabra o hablá con un asesor.";
    }

    setTimeout(() => {
      setMessages((prev) => [...prev, { from: "bot", type: "text", text: botResponse }]);
    }, 300);

    setInput("");
  };

  return (
    <>
      {/* BOTÓN FLOTANTE */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-[9999] bg-[#25D366] w-16 h-16 rounded-full flex items-center justify-center text-white shadow-2xl hover:scale-110 transition-all"
      >
        <MessageCircle size={32} />
      </button>

      {open && (
        <div className="fixed bottom-28 right-6 z-[9999] w-80 bg-white rounded-2xl shadow-2xl border flex flex-col overflow-hidden animate-slideUp">
          
          {/* HEADER */}
          <div className="bg-[#25D366] text-white p-4 flex justify-between items-center">
            <h3 className="font-semibold">Asistente Jovita</h3>
            <button onClick={() => setOpen(false)}>
              <X size={24} />
            </button>
          </div>

          {/* MENSAJES */}
          <div className="p-4 h-64 overflow-y-auto space-y-3">
            {messages.map((msg, i) => {
              if (msg.type === "products") {
                return (
                  <div key={i} className="space-y-3">
                    {msg.items.map((p) => {
                      const price = Number(p.retailPrice ?? 0);

                      return (
                        <div key={p.id} className="bg-[#FDF7EF] border rounded-xl p-3">
                          <div className="flex gap-3">
                            <img
                              src={p.image || "/placeholder.png"}
                              alt={p.name}
                              className="w-14 h-14 object-cover rounded-lg border"
                            />

                            <div className="flex flex-col justify-between">
                              <p className="font-semibold text-sm">{p.name}</p>
                              <p className="text-[#F24C00] font-bold text-sm">
                                {price > 0
                                  ? `$${price.toLocaleString("es-AR")}`
                                  : "Consultar precio"}
                              </p>

                              <div className="flex gap-2 mt-1 text-xs">
                                <Link
                                  to={`/product/${p.id}`}
                                  onClick={() => setOpen(false)}
                                  className="bg-[#F24C00] text-white px-3 py-1 rounded-lg"
                                >
                                  Ver producto
                                </Link>

                                <a
                                  href={`https://wa.me/${phone}?text=${encodeURIComponent(
                                    `Hola! Quiero consultar por ${p.name}`
                                  )}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="bg-[#25D366] text-white px-3 py-1 rounded-lg"
                                >
                                  Consultar
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              }

              return (
                <div
                  key={i}
                  className={`p-3 rounded-xl max-w-[80%] text-sm ${
                    msg.from === "user"
                      ? "bg-[#F24C00] text-white ml-auto"
                      : "bg-gray-200 text-black"
                  }`}
                >
                  {msg.text}
                </div>
              );
            })}
          </div>

          {/* INPUT */}
          <div className="p-3 border-t flex gap-2 bg-[#FDF7EF]">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Buscar productos o preguntar..."
              className="grow border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#25D366]"
            />
            <button
              onClick={handleSend}
              className="bg-[#25D366] text-white p-2 rounded-xl"
            >
              <Send size={18} />
            </button>
          </div>

          {/* CTA */}
          <a
            href={`https://wa.me/${phone}?text=${encodeURIComponent("Hola! Necesito ayuda 😊")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#25D366] text-white py-3 text-center text-sm font-bold"
          >
            Hablar con un asesor
          </a>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slideUp {
          animation: slideUp 0.25s ease-out;
        }
      `}</style>
    </>
  );
}
