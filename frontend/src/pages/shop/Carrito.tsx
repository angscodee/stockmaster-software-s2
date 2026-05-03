import React, { useState } from 'react';
import { useCartStore } from '@/stores/cartStore';
import { useUiStore } from '@/stores/uiStore';
import { useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Carrito() {
  const { items, removeItem, updateQuantity, totalPrice, clearCart } = useCartStore();
  const { openCart } = useUiStore();
  const navigate = useNavigate();
  const [coupon, setCoupon] = useState('');

  const total = totalPrice();
  const subtotal = total / 1.18;
  const igv = total - subtotal;

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <div className="bg-white p-12 rounded-3xl border shadow-sm max-w-lg mx-auto">
          <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag size={40} className="text-gray-300" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Tu carrito está vacío</h1>
          <p className="text-gray-500 mb-8">Parece que aún no has agregado nada a tu carrito de compras.</p>
          <button 
            onClick={() => navigate('/catalogo')}
            className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-200"
          >
            Explorar Catálogo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-black text-gray-900 mb-8 uppercase tracking-tight">Mi Carrito de Compras</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Listado de Items */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
            <div className="p-6 border-b bg-gray-50 flex justify-between items-center">
              <span className="text-sm font-bold text-gray-500 uppercase">{items.length} Productos</span>
              <button onClick={clearCart} className="text-xs font-bold text-red-500 hover:underline">VACIAR CARRITO</button>
            </div>
            
            <div className="divide-y">
              {items.map((item) => (
                <div key={item.id} className="p-6 flex flex-col md:flex-row gap-6 hover:bg-gray-50 transition-colors">
                  <div className="w-24 h-24 bg-gray-100 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden">
                    {item.imagen ? <img src={item.imagen} alt={item.nombre} className="w-full h-full object-cover" /> : <span className="text-2xl">📦</span>}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-gray-800 leading-tight">{item.nombre}</h3>
                      <button onClick={() => removeItem(item.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </div>
                    <p className="text-xs text-gray-400 mb-4 uppercase font-bold tracking-widest">{item.variante || 'Estándar'}</p>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center border rounded-lg bg-white overflow-hidden shadow-sm">
                        <button 
                          onClick={() => updateQuantity(item.id, Math.max(1, item.cantidad - 1))}
                          className="p-2 hover:bg-gray-50 text-gray-500"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-10 text-center font-bold text-sm">{item.cantidad}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.cantidad + 1)}
                          className="p-2 hover:bg-gray-50 text-gray-500"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400">Precio Unit: S/. {parseFloat(item.precio as any || '0').toFixed(2)}</p>
                        <p className="text-lg font-black text-blue-600">S/. {(item.precio * item.cantidad).toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Resumen de Pago */}
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-2xl border shadow-sm sticky top-28">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Resumen del Pedido</h2>
            
            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-gray-500 font-medium">
                <span>Subtotal</span>
                <span>S/. {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-500 font-medium">
                <span>Impuestos (IGV 18%)</span>
                <span>S/. {igv.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-500 font-medium">
                <span>Envío</span>
                <span className="text-green-500 font-bold uppercase text-xs">Gratis</span>
              </div>
              <hr />
              <div className="flex justify-between items-end">
                <span className="text-gray-800 font-bold">Total a Pagar</span>
                <span className="text-3xl font-black text-blue-600">S/. {total.toFixed(2)}</span>
              </div>
            </div>

            <div className="mb-8">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input 
                    type="text" 
                    placeholder="Código de cupón" 
                    className="w-full border-2 border-gray-100 rounded-xl pl-10 pr-4 py-3 text-sm focus:border-blue-500 outline-none transition-all"
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value)}
                  />
                </div>
                <button className="bg-gray-800 text-white px-6 rounded-xl font-bold text-sm hover:bg-black transition-all">
                  Aplicar
                </button>
              </div>
            </div>

            <button 
              onClick={() => navigate('/checkout')}
              className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-blue-700 transition-all shadow-xl hover:shadow-blue-200 group"
            >
              PROCEDER AL PAGO
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
            
            <p className="text-center text-[10px] text-gray-400 mt-6 uppercase font-bold tracking-widest">
              Pagos 100% Seguros y Encriptados
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
