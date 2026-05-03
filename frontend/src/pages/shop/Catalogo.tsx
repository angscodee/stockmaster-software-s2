import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { productoService } from '@/services/producto.service';
import ProductCard from '@/components/producto/ProductCard';
import { Search, Filter, X, ChevronDown, LayoutGrid, List } from 'lucide-react';

const Catalogo = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState({
    categoria_id: '',
    marca: '',
    precioMin: '',
    precioMax: '',
    buscar: '',
    orden: 'reciente'
  });

  const { data: productos, isLoading } = useQuery({
    queryKey: ['productos', filters],
    queryFn: () => productoService.getProductos({ ...filters, limit: 24 })
  });

  const { data: categorias } = useQuery({ queryKey: ['categorias'], queryFn: () => productoService.getCategorias() });
  const { data: marcas } = useQuery({ queryKey: ['marcas'], queryFn: () => productoService.getMarcas() });

  const clearFilters = () => setFilters({ categoria_id: '', marca: '', precioMin: '', precioMax: '', buscar: '', orden: 'reciente' });

  return (
    <div className="bg-white min-h-screen">
      {/* Search Bar Mobile/Sticky */}
      <div className="border-b sticky top-16 bg-white/80 backdrop-blur-md z-40">
        <div className="container mx-auto px-4 py-4 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="¿Qué estás buscando hoy?" 
              className="w-full bg-gray-100 border-none rounded-2xl pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 transition-all"
              value={filters.buscar}
              onChange={e => setFilters({...filters, buscar: e.target.value})}
            />
          </div>
          <button className="md:hidden p-3 bg-gray-100 rounded-2xl text-gray-600">
            <Filter size={20} />
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row gap-12">
        {/* Sidebar de Filtros */}
        <aside className="hidden md:block w-72 flex-shrink-0 space-y-10">
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-black text-xs uppercase tracking-widest text-gray-400">Categorías</h3>
              <ChevronDown size={14} className="text-gray-400" />
            </div>
            <div className="space-y-3">
              {categorias?.data?.data?.map((c: any) => (
                <label key={c.id} className="flex items-center group cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                    checked={filters.categoria_id === c.id.toString()}
                    onChange={() => setFilters({...filters, categoria_id: filters.categoria_id === c.id.toString() ? '' : c.id.toString()})}
                  />
                  <span className="ml-3 text-sm font-medium text-gray-600 group-hover:text-blue-600 transition-colors">{c.nombre}</span>
                </label>
              ))}
            </div>
          </div>
          
          <div>
             <h3 className="font-black text-xs uppercase tracking-widest text-gray-400 mb-6">Rango de Precio</h3>
             <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400 uppercase">Min</span>
                  <input 
                    type="number" 
                    className="w-full bg-gray-50 border-none rounded-xl pl-10 pr-2 py-3 text-xs font-bold focus:ring-2 focus:ring-blue-500"
                    value={filters.precioMin}
                    onChange={e => setFilters({...filters, precioMin: e.target.value})}
                  />
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400 uppercase">Max</span>
                  <input 
                    type="number" 
                    className="w-full bg-gray-50 border-none rounded-xl pl-10 pr-2 py-3 text-xs font-bold focus:ring-2 focus:ring-blue-500"
                    value={filters.precioMax}
                    onChange={e => setFilters({...filters, precioMax: e.target.value})}
                  />
                </div>
             </div>
          </div>

          <button 
            onClick={clearFilters}
            className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-gray-200"
          >
            Limpiar Filtros
          </button>
        </aside>

        {/* Listado de Productos */}
        <main className="flex-1">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
            <div>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Mostrando resultados</p>
              <h2 className="text-2xl font-black text-gray-900">
                {isLoading ? '...' : productos?.data?.total || 0} PRODUCTOS ENCONTRADOS
              </h2>
            </div>
            
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <select 
                className="bg-white border-2 border-gray-100 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-600 outline-none focus:border-blue-500 transition-all flex-1 sm:flex-none"
                value={filters.orden}
                onChange={e => setFilters({...filters, orden: e.target.value})}
              >
                <option value="reciente">Novedades</option>
                <option value="precio_asc">Menor Precio</option>
                <option value="precio_desc">Mayor Precio</option>
                <option value="popular">Populares</option>
              </select>
              
              <div className="hidden sm:flex border-2 border-gray-100 rounded-xl overflow-hidden bg-white">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-2.5 transition-colors ${viewMode === 'grid' ? 'bg-gray-900 text-white' : 'text-gray-400 hover:bg-gray-50'}`}
                >
                  <LayoutGrid size={18} />
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={`p-2.5 transition-colors ${viewMode === 'list' ? 'bg-gray-900 text-white' : 'text-gray-400 hover:bg-gray-50'}`}
                >
                  <List size={18} />
                </button>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="aspect-[3/4] bg-gray-100 rounded-[32px] animate-pulse"></div>
              ))}
            </div>
          ) : (productos?.data?.data && productos.data.data.length > 0) ? (
            <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-8`}>
              {productos.data.data.map((p: any) => (
                <ProductCard key={p.id} producto={p} />
              ))}
            </div>
          ) : (
            <div className="text-center py-24 bg-gray-50 rounded-[40px] border-2 border-dashed border-gray-200">
              <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                <X size={32} className="text-gray-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">No encontramos lo que buscas</h3>
              <p className="text-gray-500 mb-8">Intenta ajustando los filtros o el término de búsqueda.</p>
              <button onClick={clearFilters} className="text-blue-600 font-black text-sm uppercase hover:underline">Ver todo el catálogo</button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Catalogo;
