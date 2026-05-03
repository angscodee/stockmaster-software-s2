import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ordenService } from '@/services/orden.service';
import { useAuthStore } from '@/stores/authStore';
import { FileText, X, Download, Package } from 'lucide-react';
import toast from 'react-hot-toast';

const ESTADOS: Record<number, { label: string; color: string }> = {
  1: { label: 'Pendiente',   color: 'yellow'  },
  2: { label: 'Pagada',      color: 'green'   },
  3: { label: 'En Proceso',  color: 'blue'    },
  4: { label: 'Enviada',     color: 'indigo'  },
  5: { label: 'Entregada',   color: 'emerald' },
  6: { label: 'Cancelada',   color: 'red'     },
  7: { label: 'Devuelta',    color: 'gray'    },
};

const MisOrdenes = () => {
  const { user } = useAuthStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  const { data: ordenes, isLoading } = useQuery({
    queryKey: ['mis-ordenes', user?.id],
    queryFn: () => ordenService.getMisOrdenes({ limit: 50 }),
    enabled: !!user,
  });

  const { data: detalle, isLoading: loadingDetalle } = useQuery({
    queryKey: ['orden-detalle-cliente', selectedId],
    queryFn: () => ordenService.getOrdenById(selectedId!).then(r => r.data ?? r),
    enabled: !!selectedId,
  });

  const handleDescargarTicket = async () => {
    if (!detalle) return;
    setDownloading(true);
    try {
      const res = await ordenService.descargarTicket(detalle.id.toString());
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url  = window.URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `ticket_${detalle.codigo}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success('Ticket descargado');
    } catch {
      toast.error('Error al generar el ticket');
    } finally {
      setDownloading(false);
    }
  };

  const lista: any[] = Array.isArray(ordenes?.data) ? ordenes.data
    : Array.isArray(ordenes) ? ordenes : [];

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Mis Órdenes</h1>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-4 font-semibold text-gray-700 text-sm">Código</th>
              <th className="px-6 py-4 font-semibold text-gray-700 text-sm">Fecha</th>
              <th className="px-6 py-4 font-semibold text-gray-700 text-sm">Total</th>
              <th className="px-6 py-4 font-semibold text-gray-700 text-sm">Estado</th>
              <th className="px-6 py-4 font-semibold text-gray-700 text-sm">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? (
              <tr>
                <td className="px-6 py-10 text-center text-gray-400" colSpan={5}>
                  Cargando órdenes...
                </td>
              </tr>
            ) : lista.length > 0 ? (
              lista.map((orden: any) => {
                const estado = ESTADOS[orden.estado_id] || { label: orden.estado?.nombre || 'Pendiente', color: 'gray' };
                return (
                  <tr key={orden.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-mono text-blue-600 font-bold text-sm">
                      {orden.codigo || `#${orden.id.toString().padStart(6, '0')}`}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(orden.created_at || orden.fecha_orden).toLocaleDateString('es-PE')}
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-800">
                      S/. {parseFloat(orden.total || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold bg-${estado.color}-100 text-${estado.color}-700`}>
                        {estado.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setSelectedId(orden.id.toString())}
                        className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-medium text-sm"
                      >
                        <FileText size={14} /> Ver detalle
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td className="px-6 py-12 text-center text-gray-400" colSpan={5}>
                  <Package size={40} className="mx-auto mb-3 opacity-20" />
                  No tienes órdenes registradas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Modal detalle ── */}
      {selectedId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
            {loadingDetalle ? (
              <div className="p-12 text-center text-gray-400">Cargando detalle...</div>
            ) : detalle ? (
              <>
                {/* Header */}
                <div className="bg-blue-600 rounded-t-2xl px-6 py-5 flex justify-between items-start">
                  <div>
                    <p className="text-blue-200 text-xs font-bold uppercase tracking-wider mb-1">Comprobante de venta</p>
                    <h2 className="text-white text-xl font-black">{detalle.codigo}</h2>
                    <p className="text-blue-200 text-xs mt-1">
                      {new Date(detalle.fecha_orden).toLocaleString('es-PE', {
                        day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <button onClick={() => setSelectedId(null)} className="text-blue-200 hover:text-white mt-1">
                    <X size={22} />
                  </button>
                </div>

                <div className="p-6 space-y-5">
                  {/* Estado */}
                  {(() => {
                    const est = ESTADOS[detalle.estado_id] || { label: detalle.estado?.nombre || 'Pendiente', color: 'gray' };
                    return (
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold bg-${est.color}-100 text-${est.color}-700`}>
                          {est.label}
                        </span>
                        {detalle.metodo_pago && (
                          <span className="text-xs text-gray-400">· Pago: {detalle.metodo_pago.toUpperCase()}</span>
                        )}
                      </div>
                    );
                  })()}

                  {/* Productos */}
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase mb-3">Productos</h4>
                    <div className="space-y-2">
                      {(detalle as any).items?.length > 0 ? (
                        (detalle as any).items.map((item: any) => (
                          <div key={item.id} className="flex justify-between items-center text-sm py-2 border-b border-gray-50 last:border-0">
                            <div>
                              <p className="font-medium text-gray-800">
                                {item.producto?.nombre || `Producto #${item.producto_id}`}
                              </p>
                              <p className="text-xs text-gray-400">
                                {item.cantidad} × S/. {parseFloat(item.precio_unitario).toFixed(2)}
                              </p>
                            </div>
                            <span className="font-bold text-gray-800">
                              S/. {(parseFloat(item.precio_unitario) * item.cantidad).toFixed(2)}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-400">Sin productos registrados</p>
                      )}
                    </div>
                  </div>

                  {/* Totales */}
                  <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Subtotal (sin IGV)</span>
                      <span>S/. {parseFloat(detalle.subtotal).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>IGV (18%)</span>
                      <span>S/. {parseFloat(detalle.impuestos).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-black text-lg text-blue-600 pt-2 border-t border-gray-200">
                      <span>TOTAL</span>
                      <span>S/. {parseFloat(detalle.total).toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Botón ticket */}
                  <button
                    onClick={handleDescargarTicket}
                    disabled={downloading}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    <Download size={16} />
                    {downloading ? 'Generando PDF...' : 'Descargar Ticket / Comprobante'}
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};

export default MisOrdenes;
