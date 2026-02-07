import { Link } from 'react-router-dom';
import Navbar from '../Components/Navbar';


export default function Error404() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="flex-grow flex items-center justify-center px-4 py-12">
        <div className="max-w-2xl w-full">
          <div className="text-center">
            <h1 className="text-9xl font-bold text-green-600 mb-4">404</h1>
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Página no encontrada</h2>
            <p className="text-lg text-gray-600 mb-8">
              Lo sentimos, la página que buscas no existe o ha sido movida.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link to="/" className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition duration-300">
                Volver al inicio
              </Link>
              <Link to="/products" className="px-6 py-3 border-2 border-green-600 text-green-600 font-semibold rounded-lg hover:bg-green-50 transition duration-300">
                Ver productos
              </Link>
            </div>

            <div className="flex justify-center mb-12">
              <div className="text-8xl">🐕‍🦺</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">¿Qué puedes hacer?</h3>
            <ul className="space-y-3">
              <li><Link to="/" className="text-green-600 hover:text-green-700 font-medium">Ir a la página principal</Link></li>
              <li><Link to="/products" className="text-green-600 hover:text-green-700 font-medium">Explorar nuestros productos</Link></li>
              <li><Link to="/categorias" className="text-green-600 hover:text-green-700 font-medium">Ver categorías</Link></li>
            </ul>
          </div>
        </div>
      </div>

    </div>
  );
}
