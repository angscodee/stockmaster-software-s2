import api from './api';

export const productoService = {
  getProductos: (params: any) => api.get('/productos', { params }),
  getProductoById: (id: string) => api.get(`/productos/${id}`),
  createProducto: (data: any) => api.post('/productos', data),
  updateProducto: (id: string, data: any) => api.put(`/productos/${id}`, data),
  deleteProducto: (id: string) => api.delete(`/productos/${id}`),
  getCategorias: () => api.get('/productos/categorias'),
  getMarcas: () => api.get('/productos/marcas'),
  getUnidades: () => api.get('/productos/unidades'),
  importarCSV: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/productos/importar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  exportarCSV: () => api.get('/productos/exportar', { responseType: 'blob' }),
};
