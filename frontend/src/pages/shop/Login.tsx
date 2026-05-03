import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { authService } from '@/services/auth.service';
import toast from 'react-hot-toast';
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authService.login({ email, password });
      const { user: rawUser, accessToken, refreshToken } = res.data.data;
      // Normalizar: el backend devuelve 'role', el frontend usa 'rol'
      const user = { ...rawUser, rol: rawUser.rol ?? rawUser.role };
      login({ user, accessToken, refreshToken });
      toast.success(`Bienvenido de nuevo, ${user.nombre}`);
      navigate(user.rol === 'administrador' ? '/admin' : '/');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 md:p-12 rounded-[40px] shadow-2xl w-full max-w-lg border border-gray-100">
        <div className="text-center mb-10">
          <div className="bg-blue-600 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-100">
            <Lock className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tighter mb-2">Ingresar al Sistema</h1>
          <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">Gestiona tus compras y catálogo</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Correo Electrónico</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="email" 
                placeholder="ejemplo@correo.com" 
                className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl pl-12 pr-4 py-4 outline-none transition-all font-medium"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center ml-4 mr-4">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Contraseña</label>
              <Link to="/forgot-password" className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">¿Olvidaste tu contraseña?</Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="password" 
                placeholder="••••••••" 
                className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl pl-12 pr-4 py-4 outline-none transition-all font-medium"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-lg uppercase tracking-tight flex items-center justify-center gap-3 hover:bg-blue-700 transition-all shadow-2xl shadow-blue-100 transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : <>ENTRAR AHORA <ArrowRight size={20} /></>}
          </button>
        </form>

        <div className="mt-10 pt-8 border-t text-center">
          <p className="text-gray-500 font-medium">
            ¿No tienes una cuenta? <Link to="/registro" className="text-blue-600 font-black hover:underline ml-1">REGÍSTRATE AQUÍ</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
