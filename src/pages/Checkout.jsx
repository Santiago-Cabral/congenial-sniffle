import { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ShoppingBag, Truck, User, CreditCard } from "lucide-react";

function formatMoney(v) {
  return Number(v || 0).toLocaleString("es-AR", { minimumFractionDigits: 0 });
}

export default function Checkout() {
  const { cart, total, clearCart } = useCart();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    postal: "",
  });

  const [shipping, setShipping] = useState({ cost: 0, days: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const updateField = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const calculateShipping = () => {
    if (!form.postal) return;

    if (/^(40|41|42|43|44|45|46|47|48|49)\d{2}$/.test(form.postal)) {
      setShipping({ cost: 1500, days: "1-2 días (Tucumán)" });
    } else {
      setShipping({ cost: 3000, days: "3-5 días" });
    }
  };

  const finishOrder = async () => {
    if (!form.name || !form.phone || !form.email || !form.address || !form.city) {
      alert("Por favor completa todos los datos.");
      return;
    }

    setLoading(true);

    try {
      // 👇 Aquí después conectamos con tu API /api/Sales
      console.log("Pedido enviado:", {
        form,
        cart,
        total,
        totalFinal: total + shipping.cost,
      });

      clearCart();
      alert("¡Pedido confirmado! Pronto nos pondremos en contacto.");
      navigate("/");
    } catch (err) {
      console.error(err);
      alert("Hubo un error al procesar el pedido.");
    } finally {
      setLoading(false);
    }
  };

  const totalFinal = total + shipping.cost;

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-4">Tu carrito está vacío</h2>
        <Link
          to="/"
          className="bg-[#F24C00] text-white px-6 py-3 rounded-xl font-bold"
        >
          Volver a la tienda
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#FDF7EF] min-h-screen py-12">
      <div className="max-w-5xl mx-auto px-6">

        {/* Volver */}
        <Link to="/" className="inline-flex items-center gap-2 text-[#5A564E] hover:text-[#F24C00] transition mb-6">
          <ArrowLeft size={20} />
          Volver a productos
        </Link>

        <h1 className="text-4xl font-extrabold text-[#1C1C1C] mb-10">
          Finalizar Compra
        </h1>

        <div className="grid md:grid-cols-3 gap-10">

          {/* Formulario */}
          <div className="md:col-span-2 space-y-8">

            {/* Datos del cliente */}
            <div className="bg-white p-6 rounded-2xl shadow">
              <div className="flex items-center gap-3 mb-4">
                <User className="text-[#F24C00]" size={26} />
                <h3 className="text-xl font-bold">Datos del cliente</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input className="input" name="name" placeholder="Nombre y apellido" onChange={updateField} />
                <input className="input" name="phone" placeholder="Teléfono" onChange={updateField} />
                <input className="input md:col-span-2" name="email" placeholder="Email" onChange={updateField} />
              </div>
            </div>

            {/* Envío */}
            <div className="bg-white p-6 rounded-2xl shadow">
              <div className="flex items-center gap-3 mb-4">
                <Truck className="text-[#F24C00]" size={26} />
                <h3 className="text-xl font-bold">Dirección de envío</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input className="input md:col-span-2" name="address" placeholder="Dirección" onChange={updateField} />
                <input className="input" name="city" placeholder="Localidad" onChange={updateField} />
                <input className="input" name="postal" placeholder="Código Postal" onChange={updateField} />

                <button
                  className="btn-secondary px-6 col-span-2"
                  onClick={calculateShipping}
                >
                  Calcular envío
                </button>
              </div>

              {shipping.cost > 0 && (
                <div className="mt-4 bg-[#FFE8D8] p-4 rounded-xl">
                  <p className="text-[#F24C00] font-bold">
                    Envío: ${formatMoney(shipping.cost)}
                  </p>
                  <p className="text-sm">{shipping.days}</p>
                </div>
              )}
            </div>

            {/* Pago */}
            <div className="bg-white p-6 rounded-2xl shadow">
              <div className="flex items-center gap-3 mb-4">
                <CreditCard className="text-[#F24C00]" size={26} />
                <h3 className="text-xl font-bold">Método de pago</h3>
              </div>

              <select className="input">
                <option>Efectivo / Transferencia</option>
                <option>Mercado Pago</option>
              </select>
            </div>
          </div>

          {/* Resumen */}
          <div className="bg-white p-6 rounded-2xl shadow h-fit">
            <div className="flex items-center gap-3 mb-4">
              <ShoppingBag className="text-[#F24C00]" size={26} />
              <h3 className="text-xl font-bold">Resumen del pedido</h3>
            </div>

            <div className="space-y-3 mb-4">
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>
                    {item.name} × {item.qty}
                  </span>
                  <span>${formatMoney(item.price * item.qty)}</span>
                </div>
              ))}
            </div>

            <div className="border-t pt-3 space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${formatMoney(total)}</span>
              </div>
              <div className="flex justify-between">
                <span>Envío</span>
                <span>${formatMoney(shipping.cost)}</span>
              </div>
              <div className="flex justify-between text-xl font-bold pt-2">
                <span>Total</span>
                <span className="text-[#F24C00]">${formatMoney(totalFinal)}</span>
              </div>
            </div>

            <button
              onClick={finishOrder}
              disabled={loading}
              className="w-full bg-[#F24C00] text-white py-4 rounded-xl font-bold mt-6 hover:brightness-110 transition"
            >
              {loading ? "Procesando..." : "Confirmar pedido"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
