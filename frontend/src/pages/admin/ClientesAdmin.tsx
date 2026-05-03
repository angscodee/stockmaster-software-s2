import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { clienteApi } from '@/services/api';
import { 
  useReactTable, 
  getCoreRowModel, 
  flexRender, 
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  ColumnDef
} from '@tanstack/react-table';
import { Search, ChevronLeft, ChevronRight, UserCheck, UserX, Mail, Phone } from 'lucide-react';
import { ICliente } from '@/types';

export default function ClientesAdmin() {
  const [globalFilter, setGlobalFilter] = useState('');

  const { data: clientesData, isLoading } = useQuery({
    queryKey: ['clientes-admin'],
    queryFn: async () => {
      const response = await clienteApi.listar({ limit: 100 });
      console.log('API Response Clientes:', response.data);
      return response.data;
    }
  });

  const columns = useMemo<ColumnDef<ICliente>[]>(() => [
    { 
      id: 'nombre',
      header: 'Cliente',
      accessorFn: row => {
        const u = (row as any).usuario;
        if (!u) return 'Usuario no vinculado';
        return `${u.nombre || ''} ${u.apellido || ''}`.trim() || 'Sin nombre definido';
      },
      cell: info => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
            {(info.row.original as any).usuario?.nombre?.[0] || '?'}
          </div>
          <div>
            <p className="font-medium text-gray-900">{info.getValue() as string}</p>
            <p className="text-[10px] text-gray-400">ID Cliente: {info.row.original.id} | ID User: {(info.row.original as any).usuario_id}</p>
          </div>
        </div>
      )
    },
    { 
      id: 'email',
      header: 'Contacto',
      accessorFn: row => (row as any).usuario?.email || 'Sin correo',
      cell: info => (
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <Mail size={12} /> {info.getValue() as string}
          </div>
          {info.row.original.telefono && (
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <Phone size={12} /> {info.row.original.telefono}
            </div>
          )}
        </div>
      )
    },
    {
      accessorKey: 'nivel',
      header: 'Segmento',
      cell: info => {
        const nivel = (info.getValue() as string || 'nuevo').toLowerCase();
        const colors: Record<string, string> = {
          vip: 'bg-purple-100 text-purple-700 border-purple-200',
          recurrente: 'bg-blue-100 text-blue-700 border-blue-200',
          nuevo: 'bg-green-100 text-green-700 border-green-200',
          inactivo: 'bg-gray-100 text-gray-700 border-gray-200'
        };
        return (
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${colors[nivel] || colors.nuevo}`}>
            {nivel}
          </span>
        );
      }
    },
    {
      accessorKey: 'activo',
      header: 'Estado',
      cell: info => (
        <span className={`flex items-center gap-1.5 text-xs font-medium ${info.getValue() ? 'text-green-600' : 'text-red-600'}`}>
          {info.getValue() ? <UserCheck size={14} /> : <UserX size={14} />}
          {info.getValue() ? 'Activo' : 'Baneado'}
        </span>
      )
    },
    {
      accessorKey: 'created_at',
      header: 'Registro',
      cell: info => <span className="text-gray-500 text-xs">{new Date(info.getValue() as string).toLocaleDateString()}</span>
    },
    {
      id: 'actions',
      header: 'Acciones',
      cell: info => (
        <button className="text-blue-600 hover:underline text-xs font-bold">DETALLE</button>
      )
    }
  ], []);

  const table = useReactTable({
    data: clientesData?.data || [],
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  if (isLoading) return <div className="p-12 text-center text-gray-400">Cargando clientes...</div>;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Base de Clientes</h1>
        <p className="text-sm text-gray-500">Visualiza el historial, segmentación y estado de tus usuarios.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="p-4 border-b flex items-center gap-3">
          <Search size={18} className="text-gray-400" />
          <input 
            type="text" 
            placeholder="Buscar por nombre, email o teléfono..." 
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
    </div>
  );
}
