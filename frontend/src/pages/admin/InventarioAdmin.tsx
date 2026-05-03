import React, { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventarioApi } from '@/services/api';
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
import { Search, ChevronLeft, ChevronRight, AlertTriangle, ArrowUpRight, ArrowDownRight, Settings, Plus, Truck } from 'lucide-react';
import { IProducto } from '@/types';

export default function InventarioAdmin() {
  const queryClient = useQueryClient();
  const [globalFilter, setGlobalFilter] = useState('');
  const [modalAjuste, setModalAjuste] = useState<IProducto | null>(null);
  const [ajusteForm, setAjusteForm] = useState({ cantidad: '', tipo: 'entrada', motivo: '' });

  const { data: stockData, isLoading } = useQuery({
    queryKey: ['inventario-stock'],
    queryFn: () => inventarioApi.listarStock({ limit: 100 }),
    refetchOnWindowFocus: true,
    staleTime: 0,
  });

  const ajusteMutation = useMutation({
    mutationFn: (data: any) => inventarioApi.ajustar(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventario-stock'] });
      toast.success('Ajuste registrado');
      setModalAjuste(null);
      setAjusteForm({ cantidad: '', tipo: 'entrada', motivo: '' });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Error al registrar ajuste');
    }
  });

  const columns = useMemo<ColumnDef<IProducto>[]>(() => [
    { accessorKey: 'sku', header: 'SKU', cell: info => <span className="font-mono text-xs text-gray-500">{info.getValue() as string}</span> },
    { accessorKey: 'nombre', header: 'Producto', cell: info => <span className="font-medium">{info.getValue() as string}</span> },
    { 
      accessorKey: 'stock.stock_fisico', 
      header: 'Físico',
      cell: info => <span className="font-bold">{info.getValue() as number || 0}</span>
    },
    { 
      accessorKey: 'stock.stock_reservado', 
      header: 'Reservado',
      cell: info => <span className="text-yellow-600">{(info.getValue() as number) || 0}</span>
    },
    { 
      accessorKey: 'stock.stock_disponible', 
      header: 'Disponible',
      cell: info => {
        const stock = info.getValue() as number || 0;
        const bajo = stock <= (info.row.original.stock_minimo || 0);
        return (
          <div className="flex items-center gap-2">
            <span className={`font-black text-lg ${bajo ? 'text-red-600' : 'text-blue-600'}`}>
              {stock}
            </span>
            {bajo && <AlertTriangle size={14} className="text-red-500" />}
          </div>
        );
      }
    },
    { 
      accessorKey: 'stock_minimo', 
      header: 'Mínimo',
      cell: info => <span className="text-gray-400">{(info.getValue() as number) || 0}</span>
    },
    {
      id: 'actions',
      header: 'Ajuste',
      cell: info => (
        <button 
          onClick={() => setModalAjuste(info.row.original)}
          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded flex items-center gap-1 text-xs font-bold"
        >
          <Settings size={14} /> AJUSTAR
        </button>
      )
    }
  ], []);

  const table = useReactTable({
    data: stockData?.data?.data || [],
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  if (isLoading) return <div className="p-12 text-center text-gray-400">Cargando inventario...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Control de Inventario</h1>
          <p className="text-sm text-gray-500">Stock físico, reservado y disponible en tiempo real.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => toast.error('Funcionalidad en desarrollo')} className="flex items-center gap-2 border px-4 py-2 rounded-lg text-sm hover:bg-gray-50">
            <Truck size={16} /> Proveedores
          </button>
          <button onClick={() => toast.error('Funcionalidad en desarrollo')} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700">
            <Plus size={16} /> Orden de Compra
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="p-4 border-b flex items-center gap-3">
          <Search size={18} className="text-gray-400" />
          <input 
            type="text" 
            placeholder="Buscar producto por SKU o nombre..." 
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
          <div className="flex gap-2">
            <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} className="p-2 border rounded hover:bg-gray-50 disabled:opacity-50">
              <ChevronLeft size={16} />
            </button>
            <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} className="p-2 border rounded hover:bg-gray-50 disabled:opacity-50">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {modalAjuste && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-8">
            <h2 className="text-xl font-bold mb-6">Ajuste de Inventario</h2>
            <div className="bg-blue-50 p-4 rounded-xl mb-6">
              <p className="text-xs font-bold text-blue-600 uppercase mb-1">Producto</p>
              <p className="font-bold">{modalAjuste.nombre}</p>
              <p className="text-sm text-blue-800">Stock Actual: {modalAjuste.stock?.stock_fisico || 0}</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">Tipo de Ajuste</label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <button 
                    onClick={() => setAjusteForm({...ajusteForm, tipo: 'entrada'})}
                    className={`flex items-center justify-center gap-2 py-3 rounded-lg border-2 transition-all ${
                      ajusteForm.tipo === 'entrada' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-100 text-gray-400'
                    }`}
                  >
                    <ArrowUpRight size={18} /> Entrada
                  </button>
                  <button 
                    onClick={() => setAjusteForm({...ajusteForm, tipo: 'salida'})}
                    className={`flex items-center justify-center gap-2 py-3 rounded-lg border-2 transition-all ${
                      ajusteForm.tipo === 'salida' ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-100 text-gray-400'
                    }`}
                  >
                    <ArrowDownRight size={18} /> Salida
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">Cantidad</label>
                <input 
                  type="number" 
                  className="w-full border p-3 rounded-lg mt-1 outline-none focus:ring-2 focus:ring-blue-500"
                  value={ajusteForm.cantidad}
                  onChange={e => setAjusteForm({...ajusteForm, cantidad: e.target.value})}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">Motivo / Observación</label>
                <textarea 
                  className="w-full border p-3 rounded-lg mt-1 outline-none focus:ring-2 focus:ring-blue-500 h-24"
                  value={ajusteForm.motivo}
                  onChange={e => setAjusteForm({...ajusteForm, motivo: e.target.value})}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8 pt-6 border-t">
              <button onClick={() => setModalAjuste(null)} className="flex-1 py-3 border rounded-lg font-bold">Cancelar</button>
              <button 
                onClick={() => {
                  const cant = parseInt(ajusteForm.cantidad);
                  if (!cant || cant <= 0) { toast.error('Ingresa una cantidad válida'); return; }
                  if (!ajusteForm.motivo.trim()) { toast.error('Ingresa un motivo'); return; }
                  ajusteMutation.mutate({
                    producto_id: modalAjuste.id,
                    tipo: ajusteForm.tipo,
                    cantidad: cant,
                    motivo: ajusteForm.motivo
                  });
                }}
                disabled={ajusteMutation.isPending}
                className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50"
              >
                {ajusteMutation.isPending ? 'Guardando...' : 'Confirmar Ajuste'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
