import React, { useState } from 'react';
import { reporteApi } from '@/services/api';
import toast from 'react-hot-toast';
import { FileText, Download, Filter, BarChart2 } from 'lucide-react';

const REPORTES_OPERACIONALES = [
  { key: 'ordenes', label: 'Listado de Órdenes', desc: 'Detalle completo de pedidos por período' },
  { key: 'inventario', label: 'Inventario Valorizado', desc: 'Stock actual agrupado por categoría' },
  { key: 'movimientos', label: 'Movimientos Kardex', desc: 'Entradas, salidas y ajustes del mes' },
  { key: 'stock_bajo', label: 'Stock Crítico', desc: 'Productos agotados o bajo el mínimo' },
  { key: 'pagos', label: 'Detalle de Pagos', desc: 'Trazabilidad de transacciones recibidas' },
  { key: 'devoluciones', label: 'Listado de Devoluciones', desc: 'Registro de casos y reembolsos' },
  { key: 'factura', label: 'Factura Individual', desc: 'Generar PDF por número de orden', needsInput: true },
  { key: 'comprobante', label: 'Ticket de Venta', desc: 'Formato simplificado para impresión', needsInput: true },
];

const REPORTES_GESTION = [
  { key: 'rentabilidad', label: 'Rentabilidad x Producto', desc: 'Costo vs Venta y margen bruto' },
  { key: 'ventas_cat', label: 'Ventas por Categoría', desc: 'Comparativa mensual de ingresos' },
  { key: 'carritos', label: 'Comportamiento Carritos', desc: 'Abandono, conversión y ticket medio' },
  { key: 'clientes_seg', label: 'Segmentación Clientes', desc: 'Nuevos, VIP y recurrentes' },
  { key: 'rotacion', label: 'Rotación Inventario', desc: 'Velocidad de venta por categoría' },
  { key: 'finanzas', label: 'Ingresos vs Costos', desc: 'Balance mensual operativo' },
];

export default function Reportes() {
  const [filters, setFilters] = useState({ start: '', end: '', categoria: '' });
  const [loadingKey, setLoadingKey] = useState<string | null>(null);

  const descargar = async (key: string) => {
    try {
      setLoadingKey(key);
      const res = await (reporteApi as any)[key](filters);
      
      // Manejo de Blob para descarga de PDF
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `reporte_${key}_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Reporte generado exitosamente');
    } catch (err) {
      console.error('Error descargando reporte:', err);
      toast.error('Error al generar el reporte');
    } finally {
      setLoadingKey(null);
    }
  };

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Centro de Reportes</h1>
          <p className="text-sm text-gray-500">Genera documentos PDF para auditoría y toma de decisiones.</p>
        </div>

        <div className="flex items-center gap-3 bg-white p-2 rounded-xl border shadow-sm">
          <Filter size={16} className="text-gray-400 ml-2" />
          <input type="date" className="text-xs border-none focus:ring-0" onChange={e => setFilters({...filters, start: e.target.value})} />
          <span className="text-gray-300">|</span>
          <input type="date" className="text-xs border-none focus:ring-0" onChange={e => setFilters({...filters, end: e.target.value})} />
        </div>
      </div>

      <section>
        <div className="flex items-center gap-2 mb-6">
          <FileText className="text-blue-600" size={20} />
          <h2 className="text-lg font-bold">Reportes Operacionales</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {REPORTES_OPERACIONALES.map(r => (
            <div key={r.key} className="bg-white p-5 rounded-xl border hover:border-blue-200 transition-all group">
              <h3 className="font-bold text-sm mb-1 group-hover:text-blue-600">{r.label}</h3>
              <p className="text-xs text-gray-400 mb-4 h-8 overflow-hidden">{r.desc}</p>
              <button 
                disabled={loadingKey === r.key}
                onClick={() => descargar(r.key)}
                className="w-full flex items-center justify-center gap-2 py-2 bg-gray-50 text-gray-600 rounded-lg text-xs font-bold hover:bg-blue-600 hover:text-white disabled:opacity-50 transition-colors"
              >
                {loadingKey === r.key ? 'GENERANDO...' : <><Download size={14} /> DESCARGAR</>}
              </button>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center gap-2 mb-6">
          <BarChart2 className="text-purple-600" size={20} />
          <h2 className="text-lg font-bold">Reportes de Gestión (Business Intelligence)</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {REPORTES_GESTION.map(r => (
            <div key={r.key} className="bg-white p-6 rounded-2xl border-2 border-transparent hover:border-purple-100 shadow-sm transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-purple-50 rounded-xl text-purple-600">
                  <BarChart2 size={24} />
                </div>
                <span className="text-[10px] font-black bg-purple-100 text-purple-700 px-2 py-1 rounded-full uppercase tracking-tighter">BI REPORT</span>
              </div>
              <h3 className="font-black text-gray-800 mb-2 uppercase tracking-tight">{r.label}</h3>
              <p className="text-sm text-gray-500 mb-6">{r.desc}</p>
              <button 
                disabled={loadingKey === r.key}
                onClick={() => descargar(r.key)}
                className="flex items-center gap-2 text-purple-600 font-bold text-sm hover:translate-x-1 transition-transform"
              >
                {loadingKey === r.key ? 'Procesando...' : <><Download size={16} /> Generar Análisis PDF</>}
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
