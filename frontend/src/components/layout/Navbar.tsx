import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useCartStore } from '@/stores/cartStore';
import { useUiStore } from '@/stores/uiStore';
import { ShoppingCart, User, LogOut, Menu, X, Package } from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuthStore();
  const { items } = useCartStore();
  const { toggleCart, toggleMobileMenu, isMobileMenuOpen } = useUiStore();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const totalItems = items.reduce((acc, item) => acc + item.cantidad, 0);

  return (
    <nav className="bg-white border-b sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleMobileMenu}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <Link to="/" className="text-xl font-black uppercase tracking-tighter text-blue-600">
              StockMaster
            </Link>
          </div>

          <div className="hidden lg:flex items-center gap-8">
            <Link to="/" className="text-sm font-bold text-gray-600 hover:text-blue-600 uppercase tracking-widest">Inicio</Link>
            <Link to="/catalogo" className="text-sm font-bold text-gray-600 hover:text-blue-600 uppercase tracking-widest">Catálogo</Link>
            {(user?.rol === 'administrador' || (user as any)?.role === 'administrador') && (
              <Link to="/admin" className="text-sm font-bold text-blue-600 hover:text-blue-700 uppercase tracking-widest">Admin</Link>
            )}
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={toggleCart}
              className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ShoppingCart size={24} className="text-gray-700" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                  {totalItems}
                </span>
              )}
            </button>

            {isAuthenticated ? (
              <div className="relative">
                <button 
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1.5 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-bold">
                    {user?.nombre?.[0]}{user?.apellido?.[0]}
                  </div>
                  <span className="hidden md:block text-sm font-bold text-gray-700">{user?.nombre}</span>
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-50 mb-2">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Usuario</p>
                      <p className="text-sm font-black text-gray-800 truncate">{user?.email}</p>
                    </div>
                    <Link to="/perfil" className="flex items-center gap-3 px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition-colors">
                      <User size={18} /> Mi Perfil
                    </Link>
                    <Link to="/mis-ordenes" className="flex items-center gap-3 px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition-colors">
                      <Package size={18} /> Mis Órdenes
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut size={18} /> Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link 
                to="/login"
                className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
              >
                Ingresar
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
