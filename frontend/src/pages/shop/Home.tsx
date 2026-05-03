import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { productoService } from '@/services/producto.service';
import ProductCard from '@/components/producto/ProductCard';
import { ArrowRight, Zap, ShieldCheck, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home = () => {
  const { data: productos, isLoading } = useQuery({
    queryKey: ['productos-destacados'],
    queryFn: () => productoService.getProductos({ limit: 4 })
  });

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative bg-gray-900 h-[600px] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent z-10"></div>
        <img 
          src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1920" 
          className="absolute inset-0 w-full h-full object-cover"
          alt="Banner"
        />
        
        <div className="container mx-auto px-4 relative z-20">
          <div className="max-w-2xl text-white">
            <span className="inline-block bg-blue-600 text-[10px] font-black px-3 py-1 rounded-full mb-6 uppercase tracking-widest">Nueva Colección 2026</span>
            <h1 className="text-6xl md:text-8xl font-black mb-6 leading-[0.9] uppercase tracking-tighter">
              El Futuro <br /> del E-Commerce
            </h1>
            <p className="text-lg text-gray-300 mb-10 max-w-lg font-medium leading-relaxed">
              Descubre una experiencia de compra sin precedentes con trazabilidad total y gestión inteligente de inventarios.
            </p>
            <div className="flex gap-4">
              <Link to="/catalogo" className="bg-white text-black px-10 py-4 rounded-2xl font-black uppercase tracking-tight hover:bg-gray-100 transition-all flex items-center gap-2 group">
                COMPRAR AHORA
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 border-b bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { icon: Truck, title: 'Envío Gratis', desc: 'En todos tus pedidos superiores a S/. 199' },
              { icon: ShieldCheck, title: 'Pago Seguro', desc: 'Transacciones 100% encriptadas y seguras' },
              { icon: Zap, title: 'Entrega Rápida', desc: 'Recibe tus productos en menos de 24 horas' },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-6">
                <div className="p-4 bg-white rounded-2xl shadow-sm text-blue-600">
                  <f.icon size={32} />
                </div>
                <div>
                  <h4 className="font-black uppercase text-sm tracking-tight">{f.title}</h4>
                  <p className="text-gray-500 text-sm">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Destacados */}
      <section className="py-24 container mx-auto px-4">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl font-black uppercase tracking-tight mb-2">Productos Destacados</h2>
            <div className="h-1.5 w-20 bg-blue-600 rounded-full"></div>
          </div>
          <Link to="/catalogo" className="text-blue-600 font-black text-sm uppercase hover:underline flex items-center gap-2">
            Ver Todo <ArrowRight size={16} />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[1,2,3,4].map(i => (
              <div key={i} className="aspect-[3/4] bg-gray-100 rounded-3xl animate-pulse"></div>
            ))}
          </div>
        ) : (productos?.data?.data && productos.data.data.length > 0) ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {productos.data.data.map((p: any) => (
              <ProductCard key={p.id} producto={p} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400">
            No hay productos disponibles en este momento.
          </div>
        )}
      </section>

      {/* Categories Banner */}
      <section className="py-12 container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="h-80 bg-slate-900 rounded-[40px] overflow-hidden relative group">
            <img src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800" className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-700" alt="Tech" />
            <div className="absolute inset-0 p-12 flex flex-col justify-end text-white">
              <h3 className="text-4xl font-black uppercase mb-4">Gadgets Tech</h3>
              <Link to="/catalogo/electronica" className="font-bold text-sm underline decoration-blue-500 decoration-4 underline-offset-8">EXPLORAR CATEGORÍA</Link>
            </div>
          </div>
          <div className="h-80 bg-blue-600 rounded-[40px] overflow-hidden relative group">
             <img src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800" className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-700" alt="Sport" />
             <div className="absolute inset-0 p-12 flex flex-col justify-end text-white">
              <h3 className="text-4xl font-black uppercase mb-4">Deportes & Outdoor</h3>
              <Link to="/catalogo/deportes" className="font-bold text-sm underline decoration-white decoration-4 underline-offset-8">EXPLORAR CATEGORÍA</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
