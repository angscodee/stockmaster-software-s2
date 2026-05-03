import React, { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordenService } from '@/services/orden.service';
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
import { Search, ChevronLeft, ChevronRight, Eye, Printer, FileText, XCircle, Package } from 'lucide-react';
import { IOrden } from '@/types';

const ESTADOS: Record<number, { label: string, color: string }> = {
  1: { label: 'Pendiente', color: 'yellow' },
  2: { label: 'Pagada', color: 'green' },
  3: { label: 'En Proceso', color: 'blue' },
  4: { label: 'Enviada', color: 'indigo' },
  5: { label: 'Entregada', color: 'emerald' },
  6: { label: 'Cancelada', color: 'red' },
  7: { label: 'Devuelta', color: 'gray' }
};

export default function OrdenesAdmin() {
  const queryClient = useQueryClient();
  const [globalFilter, setGlobalFilter] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [downloadingTicket, setDownloadingTicket] = useState(false);

  const handleDescargarTicket = async (id: string, codigo: string) => {
    setDownloadingTicket(true);
    try {
      const res = await ordenService.descargarTicket(id);
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url  = window.URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `ticket_${codigo}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success('Ticket descargado');
    } catch {
      toast.error('Error al generar el ticket');
    } finally {
      setDownloadingTicket(false);
    }
  };

  const { data: ordenesData, isLoading, isError, error } = useQuery({
    queryKey: ['ordenes-admin'],
    queryFn: () => ordenService.getAllOrdenes({ limit: 100 })
  });

  // Carga el detalle completo (con items/productos) solo cuando se selecciona una orden
  const { data: ordenDetalle, isLoading: loadingDetalle } = useQuery({
    queryKey: ['orden-detalle', selectedOrderId],
    queryFn: () => ordenService.getOrdenById(selectedOrderId!).then(r => r.data ?? r),
    enabled: !!selectedOrderId
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status, comment }: { id: string, status: number, comment?: string }) => 
      ordenService.cambiarEstado(id, status, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ordenes-admin'] });
      queryClient.invalidateQueries({ queryKey: ['orden-detalle', selectedOrderId] });
      queryClient.invalidateQueries({ queryKey: ['inventario-stock'] }); // refrescar stock
      toast.success('Estado actualizado');
    }
  });

  const columns = useMemo<ColumnDef<IOrden>[]>(() => [
    { accessorKey: 'codigo', header: 'Código', cell: info => <span className="font-mono text-blue-600 font-bold">{info.getValue() as string}</span> },
    { 
      id: 'cliente', 
      header: 'Cliente',
      accessorFn: row => `${(row as any).cliente?.usuario?.nombre || 'Desconocido'} ${(row as any).cliente?.usuario?.apellido || ''}`,
      cell: info => <span className="font-medium">{info.getValue() as string}</span>
    },
    { 
      accessorKey: 'total', 
      header: 'Total',
      cell: info => <span className="font-bold text-gray-800">S/. {parseFloat(info.getValue() as string || '0').toFixed(2)}</span>
    },
    { 
      accessorKey: 'estado_id', 
      header: 'Estado',
      cell: info => {
        const id = info.getValue() as number;
        const status = ESTADOS[id] || { label: 'Desconocido', color: 'gray' };
        return (
          <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase bg-${status.color}-100 text-${status.color}-700`}>
            {status.label}
          </span>
        );
      }
    },
    { 
      accessorKey: 'fecha_orden', 
      header: 'Fecha',
      cell: info => <span className="text-gray-500">{new Date(info.getValue() as string || Date.now()).toLocaleDateString()}</span>
    },
    {
      id: 'actions',
      header: 'Acciones',
      cell: info => (
        <div className="flex gap-2">
          <button 
            onClick={() => setSelectedOrderId(info.row.original.id.toString())}
            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
          >
            <Eye size={14} />
          </button>
          <button className="p-1.5 text-gray-600 hover:bg-gray-50 rounded">
            <Printer size={14} />
          </button>
        </div>
      )
    }
  ], []);

  const tableData = useMemo(() => {
    if (Array.isArray(ordenesData?.data)) return ordenesData.data;
    if (Array.isArray(ordenesData)) return ordenesData;
    return [];
  }, [ordenesData]);

  const table = useReactTable({
    data: tableData,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  if (isLoading) return <div className="p-12 text-center text-gray-400">Cargando órdenes...</div>;

  if (isError) {
    return (
      <div className="p-12 text-center text-red-500">
        <p className="font-bold">Error al cargar órdenes</p>
        <p className="text-sm">{(error as any)?.response?.data?.message || (error as any)?.message}</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Gestión de Órdenes</h1>
        <p className="text-sm text-gray-500">Administra pedidos, estados y facturación.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="p-4 border-b flex items-center gap-3">
          <Search size={18} className="text-gray-400" />
          <input 
            type="text" 
            placeholder="Buscar por código, cliente o estado..." 
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
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map(row => (
                  <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className="px-6 py-4">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-12 text-center text-gray-400">
                    <div className="flex flex-col items-center gap-2">
                      <Package size={32} className="text-gray-200" />
                      <p>No se encontraron órdenes en el sistema.</p>
                      <p className="text-xs">Total cargado: {tableData.length}</p>
                    </div>
                  </td>
                </tr>
              )}
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

      {selectedOrderId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl p-8">
            {loadingDetalle ? (
              <div className="text-center py-12 text-gray-400">Cargando detalle...</div>
            ) : ordenDetalle ? (
              <>
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-xl font-bold">Orden {ordenDetalle.codigo}</h2>
                    <p className="text-sm text-gray-500">{new Date(ordenDetalle.fecha_orden).toLocaleString()}</p>
                  </div>
                  <button onClick={() => setSelectedOrderId(null)} className="text-gray-400 hover:text-gray-600">
                    <XCircle size={24} />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">Cliente</h4>
                      <p className="font-bold">{(ordenDetalle as any).cliente?.usuario?.nombre || 'Desconocido'} {(ordenDetalle as any).cliente?.usuario?.apellido || ''}</p>
                      <p className="text-sm text-gray-500">{(ordenDetalle as any).cliente?.usuario?.email || 'Sin correo'}</p>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">Cambiar Estado</h4>
                      <select 
                        className="w-full border p-2 rounded-lg text-sm"
                        defaultValue={ordenDetalle.estado_id}
                        onChange={(e) => statusMutation.mutate({ id: selectedOrderId, status: parseInt(e.target.value) })}
                      >
                        {Object.entries(ESTADOS).map(([id, s]) => (
                          <option key={id} value={id}>{s.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h4 className="text-xs font-bold text-gray-400 uppercase mb-4">Productos</h4>
                    <div className="space-y-3">
                      {(ordenDetalle as any).items?.length > 0 ? (
                        (ordenDetalle as any).items.map((item: any) => (
                          <div key={item.id} className="flex justify-between text-sm">
                            <span>{item.producto?.nombre || `Producto #${item.producto_id}`} × {item.cantidad}</span>
                            <span className="font-bold">S/. {(parseFloat(item.precio_unitario) * item.cantidad).toFixed(2)}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-400">Sin productos registrados</p>
                      )}
                    </div>
                    <div className="border-t mt-4 pt-4 flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span className="text-blue-600">S/. {parseFloat(ordenDetalle.total.toString()).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-8 pt-6 border-t">
                  <button
                    onClick={() => handleDescargarTicket(selectedOrderId!, ordenDetalle.codigo)}
                    disabled={downloadingTicket}
                    className="flex-1 flex items-center justify-center gap-2 border py-2 rounded-lg text-sm font-bold hover:bg-gray-50 disabled:opacity-50"
                  >
                    <FileText size={16} /> {downloadingTicket ? 'Generando...' : 'Descargar Ticket'}
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-2 rounded-lg text-sm font-bold hover:bg-blue-700">
                    <Printer size={16} /> Guía de Remisión
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
