import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { authService } from '@/services/auth.service';
import toast from 'react-hot-toast';

const Perfil = () => {
  const { user, setUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    telefono: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        nombre: user.nombre || '',
        apellido: user.apellido || '',
        telefono: (user as any).telefono || ''
      });
    }
  }, [user]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await authService.updateProfile(formData);
      setUser({ user: res.data.data });
      toast.success('Perfil actualizado correctamente');
    } catch (error) {
      toast.error('Error al actualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Mi Perfil</h1>
      <div className="space-y-8">
        <section className="bg-white p-6 rounded-xl border shadow-sm">
          <h2 className="text-xl font-bold mb-6">Datos Personales</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nombre</label>
                <input 
                  type="text" 
                  value={formData.nombre}
                  onChange={e => setFormData({...formData, nombre: e.target.value})}
                  className="mt-1 w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Apellido</label>
                <input 
                  type="text" 
                  value={formData.apellido}
                  onChange={e => setFormData({...formData, apellido: e.target.value})}
                  className="mt-1 w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" 
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Teléfono</label>
              <input 
                type="text" 
                value={formData.telefono}
                onChange={e => setFormData({...formData, telefono: e.target.value})}
                className="mt-1 w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" 
              />
            </div>
            <button 
              onClick={handleSubmit}
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </section>

        <section className="bg-white p-6 rounded-xl border shadow-sm">
          <h2 className="text-xl font-bold mb-6">Seguridad</h2>
          <button className="text-blue-600 font-medium hover:underline">
            Cambiar Contraseña
          </button>
        </section>
      </div>
    </div>
  );
};

export default Perfil;
