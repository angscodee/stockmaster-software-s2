import React, { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productoService } from '@/services/producto.service';
import ProductModal from '@/components/producto/ProductModal';
import { 
  useReactTable, 
  getCoreRowModel, 
  flexRender, 
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  ColumnDef
} from '@tanstack/react-table';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, Download, Upload, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { IProducto } from '@/types';

export default function ProductosAdmin() {
  const queryClient = useQueryClient();
  const [globalFilter, setGlobalFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<IProducto | null>(null);

  // Queries
  const { data: productosData, isLoading } = useQuery({
    queryKey: ['productos-admin'],
    queryFn: () => productoService.getProductos({ limit: 100 })
  });

  const { data: categorias } = useQuery({ queryKey: ['categorias'], queryFn: () => productoService.getCategorias() });
  const { data: marcas } = useQuery({ queryKey: ['marcas'], queryFn: () => productoService.getMarcas() });
  const { data: unidades } = useQuery({ queryKey: ['unidades'], queryFn: () => productoService.getUnidades() });

  // Mutations
  const deleteMutation = useMutation({
    mutationFn: (id: string) => productoService.deleteProducto(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productos-admin'] });
      toast.success('Producto eliminado');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Error al eliminar')
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => productoService.createProducto(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productos-admin'] });
      toast.success('Producto creado exitosamente');
      setModalOpen(false);
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Error al crear producto')
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => productoService.updateProducto(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productos-admin'] });
      toast.success('Producto actualizado');
      setModalOpen(false);
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Error al actualizar')
  });

  const handleSave = (formData: any) => {
    if (selectedProduct) {
      updateMutation.mutate({ id: selectedProduct.id.toString(), data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const exportMutation = useMutation({
    mutationFn: () => productoService.exportarCSV(),
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(new Blob([blob.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'productos.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    }
  });

  const columns = useMemo<ColumnDef<IProducto>[]>(() => [
    { accessorKey: 'sku', header: 'SKU', cell: info => <span className="font-mono text-xs">{info.getValue() as string}</span> },
    { accessorKey: 'nombre', header: 'Nombre', cell: info => <span className="font-medium">{info.getValue() as string}</span> },
    { 
      accessorKey: 'categoria.nombre', 
      header: 'Categoría',
      cell: info => <span className="text-gray-500">{info.getValue() as string || '-'}</span>
    },
    { 
      accessorKey: 'precio_venta', 
      header: 'Precio',
      cell: info => <span className="font-bold text-blue-600">S/. {parseFloat(info.getValue() as string || '0').toFixed(2)}</span>
    },
    { 
      accessorKey: 'stock.stock_fisico', 
      header: 'Stock',
      cell: info => {
        const stock = info.getValue() as number || 0;
        return (
          <span className={`font-medium ${stock < 5 ? 'text-red-500' : 'text-gray-700'}`}>
            {stock}
          </span>
        );
      }
    },
    {
      accessorKey: 'activo',
      header: 'Estado',
      cell: info => (
        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
          info.getValue() ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {info.getValue() ? 'Activo' : 'Inactivo'}
        </span>
      )
    },
    {
      id: 'actions',
      header: 'Acciones',
      cell: info => (
        <div className="flex gap-2">
          <button 
            onClick={() => { setSelectedProduct(info.row.original); setModalOpen(true); }}
            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
          >
            <Pencil size={14} />
          </button>
          <button 
            onClick={() => { if(confirm('¿Eliminar?')) deleteMutation.mutate(info.row.original.id.toString()) }}
            className="p-1.5 text-red-600 hover:bg-red-50 rounded"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )
    }
  ], []);

  const table = useReactTable({
    data: productosData?.data?.data || [],
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  if (isLoading) return <div className="p-12 text-center text-gray-400">Cargando catálogo...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Administración de Productos</h1>
          <p className="text-sm text-gray-500">Gestiona el catálogo, stock y precios.</p>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={() => exportMutation.mutate()}
            className="flex items-center gap-2 border px-4 py-2 rounded-lg text-sm hover:bg-gray-50"
          >
            <Download size={16} /> Exportar
          </button>
          <button className="flex items-center gap-2 border px-4 py-2 rounded-lg text-sm hover:bg-gray-50">
            <Upload size={16} /> Importar
          </button>
          <button 
            onClick={() => { setSelectedProduct(null); setModalOpen(true); }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700"
          >
            <Plus size={16} /> Nuevo Producto
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="p-4 border-b flex items-center gap-3">
          <Search size={18} className="text-gray-400" />
          <input 
            type="text" 
            placeholder="Buscar por SKU, nombre o categoría..." 
            className="flex-1 outline-none text-sm"
            value={globalFilter}
            onChange={e => setGlobalFilter(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 border-b">
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th key={header.id} className="px-6 py-4 font-semibold uppercase text-[10px] tracking-wider">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y">
              {table.getRowModel().rows.map(row => (
                <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="px-6 py-4">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-2">
            Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => table.previousPage()} 
              disabled={!table.getCanPreviousPage()}
              className="p-2 border rounded hover:bg-gray-50 disabled:opacity-50"
            >
              <ChevronLeft size={16} />
            </button>
            <button 
              onClick={() => table.nextPage()} 
              disabled={!table.getCanNextPage()}
              className="p-2 border rounded hover:bg-gray-50 disabled:opacity-50"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
      
      <ProductModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setSelectedProduct(null); }}
        onSave={handleSave}
        product={selectedProduct}
      />
    </div>
  );
}
