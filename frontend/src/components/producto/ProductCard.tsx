import React from 'react';
import { Link } from 'react-router-dom';
import { IProducto } from '@/types';
import { useCartStore } from '@/stores/cartStore';
import { ShoppingCart as CartIcon, Heart as HeartIcon, Star as StarIcon } from 'lucide-react';
import toast from 'react-hot-toast';

interface ProductCardProps {
  producto: IProducto;
}

const ProductCard = ({ producto }: ProductCardProps) => {
  const { addItem } = useCartStore();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({
      id: producto.id,
      nombre: producto.nombre,
      precio: producto.precio_venta,
      cantidad: 1,
      imagen: producto.imagen_principal
    });
    toast.success(`${producto.nombre} agregado al carrito`);
  };

  const precioVenta = parseFloat(String(producto.precio_venta || 0));
  const precioOferta = producto.precio_oferta ? parseFloat(String(producto.precio_oferta)) : null;
  const isOutOfStock = (producto.stock?.stock_disponible || 0) <= 0;

  return (
    <Link 
      to={`/producto/${producto.id}`}
      className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all group relative flex flex-col h-full"
    >
      {/* Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
        {producto.precio_oferta && (
          <span className="bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded-lg uppercase">OFERTA</span>
        )}
        <span className="bg-white/90 backdrop-blur-sm text-gray-800 text-[10px] font-black px-2 py-1 rounded-lg uppercase border border-gray-100 shadow-sm">NUEVO</span>
      </div>

      <button className="absolute top-3 right-3 z-10 p-2 bg-white/90 backdrop-blur-sm rounded-full text-gray-400 hover:text-red-500 transition-colors shadow-sm">
        <HeartIcon size={16} />
      </button>

      {/* Imagen */}
      <div className="aspect-square bg-gray-50 flex items-center justify-center overflow-hidden">
        {producto.imagen_principal ? (
          <img 
            src={producto.imagen_principal} 
            alt={producto.nombre} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <span className="text-4xl grayscale opacity-20">📦</span>
        )}
      </div>

      {/* Contenido */}
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-center gap-1 mb-2">
          {[1,2,3,4,5].map(i => (
            <StarIcon key={i} size={10} className="fill-yellow-400 text-yellow-400" />
          ))}
          <span className="text-[10px] text-gray-400 font-bold ml-1">(24)</span>
        </div>

        <h3 className="font-bold text-gray-800 text-sm mb-1 line-clamp-2 h-10 group-hover:text-blue-600 transition-colors">
          {producto.nombre}
        </h3>
        
        <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-4">
          {producto.sku}
        </p>

        <div className="mt-auto pt-4 flex items-center justify-between">
          <div>
            {precioOferta ? (
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-400 line-through font-bold">S/. {precioVenta.toFixed(2)}</span>
                <span className="text-lg font-black text-red-600 leading-none">S/. {precioOferta.toFixed(2)}</span>
              </div>
            ) : (
              <span className="text-lg font-black text-blue-600 leading-none">S/. {precioVenta.toFixed(2)}</span>
            )}
          </div>

          <button 
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`p-3 rounded-xl transition-all shadow-lg ${
              isOutOfStock 
              ? 'bg-gray-100 text-gray-300 cursor-not-allowed shadow-none' 
              : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-100'
            }`}
          >
            <CartIcon size={18} />
          </button>
        </div>
      </div>

      {isOutOfStock && (
        <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center pointer-events-none">
          <span className="bg-gray-800 text-white text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-widest rotate-[-12deg]">AGOTADO</span>
        </div>
      )}
    </Link>
  );
};

export default ProductCard;
