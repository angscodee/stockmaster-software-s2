import api from './api';

export const ordenService = {
  crearOrden: (data: any) => api.post('/ordenes', data).then(res => res.data),
  getMisOrdenes: (params: any) => api.get('/ordenes/mis-ordenes', { params }).then(res => res.data),
  getOrdenById: (id: string) => api.get(`/ordenes/${id}`).then(res => res.data),
  cancelarOrden: (id: string) => api.patch(`/ordenes/${id}/cancelar`).then(res => res.data),
  cambiarEstado: (id: string, estado_id: number, comentario?: string) => 
    api.patch(`/ordenes/${id}/estado`, { estado_id, comentario }).then(res => res.data),
  descargarFactura: (id: string) => api.get(`/ordenes/${id}/factura`, { responseType: 'blob' }),
  descargarTicket: (id: string) => api.get(`/ordenes/${id}/ticket`, { responseType: 'blob' }),
  getAllOrdenes: (params: any) => api.get('/ordenes', { params }).then(res => res.data),
};
