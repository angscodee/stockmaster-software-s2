import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import CartDrawer from '@/components/carrito/CartDrawer';

export default function MainLayout() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      
      <div className="flex flex-1">
        {isAdminRoute && <Sidebar />}
        
        <main className={`flex-1 ${isAdminRoute ? 'p-0' : 'container mx-auto px-4 py-8'}`}>
          <Outlet />
        </main>
      </div>

      <CartDrawer />
      
      {/* Footer (Simplified) */}
      {!isAdminRoute && (
        <footer className="bg-white border-t py-12 mt-auto">
          <div className="container mx-auto px-4 text-center">
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">
              &copy; {new Date().getFullYear()} StockMaster. Todos los derechos reservados.
            </p>
          </div>
        </footer>
      )}
    </div>
  );
}
