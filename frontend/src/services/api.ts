import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

// Interceptor para inyectar token
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para refrescar token en 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = useAuthStore.getState().refreshToken;
      
      if (refreshToken) {
        try {
          const res = await axios.post(`${api.defaults.baseURL}/auth/refresh-token`, { 
            token: refreshToken 
          });
          
          const { accessToken } = res.data;
          useAuthStore.getState().setUser({ accessToken }); // Actualizar token en store
          
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          useAuthStore.getState().logout();
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = { 
  login: (data: any) => api.post('/auth/login', data), 
  logout: (token: string) => api.post('/auth/logout', { token }), 
  register: (data: any) => api.post('/auth/register', data), 
}; 

export const productoApi = { 
  getAll: (params: any) => api.get('/productos', { params }), 
  getById: (id: any) => api.get(`/productos/${id}`), 
  create: (data: any) => api.post('/productos', data), 
  update: (id: any, data: any) => api.put(`/productos/${id}`, data), 
  delete: (id: any) => api.delete(`/productos/${id}`), 
  getCategorias: () => api.get('/productos/categorias'), 
  getMarcas: () => api.get('/productos/marcas'), 
  getUnidades: () => api.get('/productos/unidades'), 
  subirImagen: (id: any, formData: FormData) => api.post(`/productos/${id}/imagen`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  eliminarImagen: (id: any, imagenId: any) => api.delete(`/productos/${id}/imagen/${imagenId}`),
}; 

export const carritoApi = { 
  get: () => api.get('/carrito'), 
  agregar: (data: any) => api.post('/carrito/agregar', data), 
  actualizar: (itemId: any, cantidad: number) => api.put(`/carrito/item/${itemId}`, { cantidad }), 
  eliminarItem: (itemId: any) => api.delete(`/carrito/item/${itemId}`), 
  vaciar: () => api.delete('/carrito/vaciar'), 
}; 

export const ordenApi = { 
  crear: (data: any) => api.post('/ordenes', data), 
  listar: (params: any) => api.get('/ordenes', { params }), 
  obtener: (id: any) => api.get(`/ordenes/${id}`), 
  cambiarEstado: (id: any, data: any) => api.patch(`/ordenes/${id}/estado`, data), 
}; 

export const clienteApi = { 
  listar: (params: any) => api.get('/clientes', { params }), 
  obtener: (id: any) => api.get(`/clientes/${id}`), 
  actualizar: (id: any, data: any) => api.put(`/clientes/${id}`, data), 
  agregarDireccion: (id: any, data: any) => api.post(`/clientes/${id}/direcciones`, data), 
}; 

export const inventarioApi = { 
  listarStock: (params: any) => api.get('/inventario/stock', { params }), 
  ajustar: (data: any) => api.post('/inventario/ajuste', data), 
  movimientos: (params: any) => api.get('/inventario/movimientos', { params }), 
  proveedores: () => api.get('/inventario/proveedores'), 
  crearProveedor: (data: any) => api.post('/inventario/proveedores', data), 
  ordenesCompra: () => api.get('/inventario/ordenes-compra'), 
  crearOrdenCompra: (data: any) => api.post('/inventario/ordenes-compra', data), 
}; 

export const dashboardApi = { 
  kpis: () => api.get('/dashboard/kpis'), 
  ventasDiarias: (dias: number) => api.get('/dashboard/ventas-diarias', { params: { dias } }), 
  ventasCategoria: () => api.get('/dashboard/ventas-categoria'), 
  ordenesPorEstado: () => api.get('/dashboard/ordenes-estado'), 
  topProductos: () => api.get('/dashboard/top-productos'), 
}; 

export const reporteApi = { 
  ordenes: (params: any) => api.get('/reportes/ordenes', { params, responseType: 'blob' }), 
  inventario: (params: any) => api.get('/reportes/inventario', { params, responseType: 'blob' }), 
  clientes: (params: any) => api.get('/reportes/clientes', { params, responseType: 'blob' }), 
  movimientos: (params: any) => api.get('/reportes/movimientos', { params, responseType: 'blob' }),
  stock_bajo: (params: any) => api.get('/reportes/stock_bajo', { params, responseType: 'blob' }),
  pagos: (params: any) => api.get('/reportes/pagos', { params, responseType: 'blob' }),
  devoluciones: (params: any) => api.get('/reportes/devoluciones', { params, responseType: 'blob' }),
  rentabilidad: (params: any) => api.get('/reportes/rentabilidad', { params, responseType: 'blob' }),
  ventas_cat: (params: any) => api.get('/reportes/ventas_cat', { params, responseType: 'blob' }),
  carritos: (params: any) => api.get('/reportes/carritos', { params, responseType: 'blob' }),
  clientes_seg: (params: any) => api.get('/reportes/clientes_seg', { params, responseType: 'blob' }),
  rotacion: (params: any) => api.get('/reportes/rotacion', { params, responseType: 'blob' }),
  finanzas: (params: any) => api.get('/reportes/finanzas', { params, responseType: 'blob' }),
}; 

export default api; 
