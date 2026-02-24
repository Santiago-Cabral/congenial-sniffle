// src/admin/pages/Categories.jsx
import { useEffect, useState } from "react";
import { 
  listCategories, 
  createCategory, 
  updateCategory, 
  deleteCategory,
  listProducts
} from "../services/apiService";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    try {
      setLoading(true);
      
      // Obtener categorías y productos en paralelo
      const [categoriesData, productsData] = await Promise.all([
        listCategories(),
        listProducts()
      ]);
      
      // Contar productos por categoría
      const categoriesWithCount = categoriesData.map(cat => {
        const productsInCategory = productsData.filter(
          p => p.categoryId === cat.id || p.categoryName === cat.name
        );
        
        return {
          ...cat,
          products: productsInCategory,
          productCount: productsInCategory.length
        };
      });
      
      setCategories(categoriesWithCount);
    } catch (err) {
      setError("Error al cargar categorías");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function openCreateModal() {
    setEditingCategory(null);
    setFormData({ name: "" });
    setError("");
    setSuccess("");
    setShowModal(true);
  }

  function openEditModal(category) {
    setEditingCategory(category);
    setFormData({ name: category.name });
    setError("");
    setSuccess("");
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditingCategory(null);
    setFormData({ name: "" });
    setError("");
    setSuccess("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.name.trim()) {
      setError("El nombre de la categoría es requerido");
      return;
    }

    try {
      // El backend espera solo el string del nombre, no un objeto
      const categoryName = formData.name.trim();
      
      if (editingCategory) {
        await updateCategory(editingCategory.id, categoryName);
        setSuccess("Categoría actualizada exitosamente");
      } else {
        await createCategory(categoryName);
        setSuccess("Categoría creada exitosamente");
      }
      
      await loadCategories();
      setTimeout(() => {
        closeModal();
      }, 1500);
    } catch (err) {
      setError(err.message || "Error al guardar la categoría");
      console.error(err);
    }
  }

  async function handleDelete(category) {
    // Verificar si tiene productos asociados - NO PERMITIR ELIMINAR
    const productCount = category.productCount || category.products?.length || 0;
    
    if (productCount > 0) {
      setError(
        `No se puede eliminar la categoría "${category.name}" porque tiene ${productCount} producto(s) asociado(s). ` +
        `Por favor, reasigna o elimina primero los productos de esta categoría.`
      );
      setTimeout(() => setError(""), 5000);
      return;
    }

    // Confirmación final
    if (!confirm(`¿Estás seguro de eliminar la categoría "${category.name}"?`)) {
      return;
    }

    try {
      await deleteCategory(category.id);
      setSuccess("Categoría eliminada exitosamente");
      await loadCategories();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Error al eliminar:", err);
      
      // Mensajes de error más específicos
      let errorMessage = "Error al eliminar la categoría";
      
      if (err.code === 500) {
        errorMessage = "No se puede eliminar la categoría. Es posible que esté siendo utilizada en el sistema o tenga productos asociados.";
      } else if (err.code === 400) {
        errorMessage = "Solicitud incorrecta. Verifica que la categoría no tenga productos asociados.";
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setTimeout(() => setError(""), 5000);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando categorías...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Categorías</h1>
          <p className="text-gray-600 mt-1">
            Gestiona las categorías de tus productos
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-lg hover:shadow-xl"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nueva Categoría
        </button>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center gap-2">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          {success}
        </div>
      )}

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center gap-2">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      {/* Categories Grid */}
      {categories.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No hay categorías
          </h3>
          <p className="text-gray-600 mb-4">
            Comienza creando tu primera categoría
          </p>
          <button
            onClick={openCreateModal}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Crear Categoría
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <div
              key={category.id}
              className={`bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-200 border overflow-hidden group ${
                (category.productCount || category.products?.length || 0) > 0 
                  ? 'border-yellow-200' 
                  : 'border-gray-200'
              }`}
            >
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800 mb-1 group-hover:text-green-600 transition-colors">
                      {category.name}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                      <span className="font-medium">
                        {category.productCount || category.products?.length || 0}
                      </span>
                      <span>
                        {(category.productCount || category.products?.length || 0) === 1 ? "producto" : "productos"}
                      </span>
                    </div>
                    {(category.productCount || category.products?.length || 0) > 0 && (
                      <div className="mt-2 flex items-center gap-1 text-xs text-yellow-700 bg-yellow-50 px-2 py-1 rounded">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <span>No se puede eliminar</span>
                      </div>
                    )}
                  </div>
                  <div className={`p-2 rounded-lg ${
                    (category.productCount || category.products?.length || 0) > 0 
                      ? 'bg-yellow-100 text-yellow-700' 
                      : 'bg-green-100 text-green-700'
                  }`}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => openEditModal(category)}
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Editar
                  </button>
                  {(category.productCount || category.products?.length || 0) > 0 ? (
                    <div className="relative group">
                      <button
                        disabled
                        className="flex items-center justify-center gap-2 bg-gray-100 text-gray-400 px-4 py-2 rounded-lg font-medium cursor-not-allowed"
                        title={`No se puede eliminar porque tiene ${category.productCount || category.products?.length} producto(s) asociado(s)`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </button>
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                        Tiene {category.productCount || category.products?.length} producto(s)
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                          <div className="border-4 border-transparent border-t-gray-800"></div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleDelete(category)}
                      className="flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-700 px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">
                  {editingCategory ? "Editar Categoría" : "Nueva Categoría"}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6">
              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {success && (
                <div className="mb-4 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {success}
                </div>
              )}

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre de la Categoría *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ name: e.target.value })}
                  placeholder="Ej: Alimentos Balanceados"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                  required
                  autoFocus
                />
              </div>

              {/* Modal Actions */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors shadow-lg hover:shadow-xl"
                >
                  {editingCategory ? "Actualizar" : "Crear"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}