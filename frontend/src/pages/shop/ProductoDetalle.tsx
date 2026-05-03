import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { productoService } from '@/services/producto.service';
import { useCartStore } from '@/stores/cartStore';
import { ShoppingCart, Heart, Star, ShieldCheck, Truck, RotateCcw, Plus, Minus, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

const ProductoDetalle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCartStore();
  const [cantidad, setCantidad] = useState(1);
  const [selectedImg, setSelectedImg] = useState(0);

  const { data: res, isLoading } = useQuery({
    queryKey: ['producto', id],
    queryFn: () => productoService.getProductoById(id!),
    enabled: !!id
  });

  const producto = res?.data?.data;

  const handleAddToCart = () => {
    if (!producto) return;
    addItem({
      id: producto.id,
      nombre: producto.nombre,
      precio: producto.precio_venta,
      cantidad: cantidad,
      imagen: producto.imagen_principal
    });
    toast.success(`${producto.nombre} agregado al carrito`);
  };

  if (isLoading) return <div className="container mx-auto px-4 py-24 text-center text-gray-400">Cargando detalles del producto...</div>;
  if (!producto) return <div className="container mx-auto px-4 py-24 text-center">Producto no encontrado</div>;

  const stockDisponible = producto.stock?.stock_disponible || 0;
  const isOutOfStock = stockDisponible <= 0;

  return (
    <div className="bg-white min-h-screen pb-24">
      {/* Breadcrumbs */}
      <div className="bg-gray-50 border-b">
        <div className="container mx-auto px-4 py-4 flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
          <button onClick={() => navigate('/')}>Home</button>
          <ChevronRight size={12} />
          <button onClick={() => navigate('/catalogo')}>Catálogo</button>
          <ChevronRight size={12} />
          <span className="text-gray-900">{producto.nombre}</span>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Galería de Imágenes */}
          <div className="space-y-6">
            <div className="aspect-square bg-gray-50 rounded-[40px] overflow-hidden border border-gray-100 group relative">
              <img 
                src={producto.imagen_principal || 'https://via.placeholder.com/600'} 
                alt={producto.nombre} 
                className="w-full h-full object-cover"
              />
              <button className="absolute top-6 right-6 p-4 bg-white rounded-full shadow-xl text-gray-400 hover:text-red-500 transition-colors">
                <Heart size={24} />
              </button>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {[0, 1, 2, 3].map(i => (
                <div key={i} className="aspect-square bg-gray-50 rounded-2xl border-2 border-transparent hover:border-blue-500 cursor-pointer transition-all overflow-hidden">
                   <img src={producto.imagen_principal} className="w-full h-full object-cover opacity-50 hover:opacity-100" />
                </div>
              ))}
            </div>
          </div>

          {/* Información del Producto */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-blue-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                {producto.categoria?.nombre || 'General'}
              </span>
              <div className="flex items-center gap-1 ml-4">
                {[1,2,3,4,5].map(i => <Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />)}
                <span className="text-xs font-bold text-gray-400 ml-2">(128 Reseñas)</span>
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 leading-tight uppercase tracking-tighter">
              {producto.nombre}
            </h1>
            
            <p className="text-gray-400 text-sm font-black uppercase tracking-widest mb-8">
              SKU: {producto.sku}
            </p>

            <div className="flex items-end gap-4 mb-10">
              <span className="text-5xl font-black text-blue-600 tracking-tighter">
                S/. {parseFloat(producto.precio_venta || '0').toFixed(2)}
              </span>
              {producto.precio_oferta && (
                <span className="text-xl text-gray-300 line-through font-bold mb-1">
                  S/. {parseFloat(producto.precio_oferta || '0').toFixed(2)}
                </span>
              )}
            </div>

            <p className="text-gray-600 leading-relaxed mb-10 text-lg">
              {producto.descripcion_larga || producto.descripcion_corta}
            </p>

            {/* Selector de Cantidad y Botón Compra */}
            <div className="p-8 bg-gray-50 rounded-[32px] border border-gray-100 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Disponibilidad</p>
                  <p className={`font-bold ${isOutOfStock ? 'text-red-500' : 'text-green-600'}`}>
                    {isOutOfStock ? 'Sin Stock' : `${stockDisponible} unidades disponibles`}
                  </p>
                </div>
                
                <div className="flex items-center bg-white border rounded-2xl shadow-sm overflow-hidden">
                  <button 
                    onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                    className="p-4 hover:bg-gray-50 text-gray-400"
                  >
                    <Minus size={20} />
                  </button>
                  <span className="w-12 text-center font-black text-lg">{cantidad}</span>
                  <button 
                    onClick={() => setCantidad(Math.min(stockDisponible, cantidad + 1))}
                    className="p-4 hover:bg-gray-50 text-gray-400"
                  >
                    <Plus size={20} />
                  </button>
                </div>
              </div>

              <button 
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="w-full bg-blue-600 text-white py-5 rounded-[20px] font-black text-lg uppercase tracking-tight flex items-center justify-center gap-3 hover:bg-blue-700 transition-all shadow-2xl shadow-blue-100 disabled:opacity-50 disabled:shadow-none"
              >
                <ShoppingCart size={24} />
                {isOutOfStock ? 'AGOTADO' : 'AGREGAR AL CARRITO'}
              </button>
            </div>

            {/* Beneficios */}
            <div className="grid grid-cols-3 gap-4 mt-10">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto text-gray-600">
                  <Truck size={24} />
                </div>
                <p className="text-[10px] font-black uppercase tracking-tighter">Envío Gratis</p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto text-gray-600">
                  <RotateCcw size={24} />
                </div>
                <p className="text-[10px] font-black uppercase tracking-tighter">30 Días Devolución</p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto text-gray-600">
                  <ShieldCheck size={24} />
                </div>
                <p className="text-[10px] font-black uppercase tracking-tighter">Garantía Total</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductoDetalle;
