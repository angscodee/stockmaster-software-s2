import React from 'react';
import { useCartStore } from '@/stores/cartStore';
import { useUiStore } from '@/stores/uiStore';
import { useNavigate } from 'react-router-dom';
import { X, Trash2, ShoppingBag } from 'lucide-react';

const CartDrawer = () => {
  const { isCartOpen, closeCart } = useUiStore();
  const { items, removeItem, updateQuantity, totalPrice } = useCartStore();
  const navigate = useNavigate();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeCart}></div>
      
      <div className="absolute inset-y-0 right-0 max-w-full flex">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          <div className="p-6 border-b flex items-center justify-between">
            <h2 className="text-xl font-black uppercase tracking-tight">Tu Carrito</h2>
            <button onClick={closeCart} className="p-2 hover:bg-gray-100 rounded-full">
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <ShoppingBag size={48} className="mb-4 opacity-20" />
                <p className="font-bold">Tu carrito está vacío</p>
              </div>
            ) : (
              items.map(item => (
                <div key={item.id} className="flex gap-4 group">
                  <div className="w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                    {item.imagen ? <img src={item.imagen} alt={item.nombre} className="w-full h-full object-cover" /> : <span className="flex items-center justify-center h-full text-xl">📦</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm text-gray-800 truncate">{item.nombre}</h3>
                    <p className="text-xs text-gray-400 mb-2">S/. {parseFloat(item.precio as any || '0').toFixed(2)}</p>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center border rounded-lg">
                        <button onClick={() => {
                          if (item.cantidad <= 1) removeItem(item.id);
                          else updateQuantity(item.id, item.cantidad - 1);
                        }} className="px-2 py-1 text-gray-500 hover:bg-gray-50">-</button>
                        <span className="px-2 text-xs font-bold w-6 text-center">{item.cantidad}</span>
                        <button onClick={() => updateQuantity(item.id, item.cantidad + 1)} className="px-2 py-1 text-gray-500 hover:bg-gray-50">+</button>
                      </div>
                      <button onClick={() => removeItem(item.id)} className="text-[10px] font-black text-red-500 uppercase tracking-widest hover:underline">Eliminar</button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {items.length > 0 && (
            <div className="p-6 border-t bg-gray-50 space-y-4">
              <div className="flex justify-between items-end">
                <span className="text-sm font-bold text-gray-500 uppercase">Subtotal</span>
                <span className="text-2xl font-black text-blue-600">S/. {totalPrice().toFixed(2)}</span>
              </div>
              <button 
                onClick={() => { closeCart(); navigate('/carrito'); }}
                className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold hover:bg-black transition-all"
              >
                VER CARRITO COMPLETO
              </button>
              <button 
                onClick={() => { closeCart(); navigate('/checkout'); }}
                className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
              >
                CHECKOUT RÁPIDO
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartDrawer;
