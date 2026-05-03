import React, { useState, useEffect, useRef } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, Upload, Trash2, Star, ImagePlus } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productoService } from '@/services/producto.service';
import { productoApi } from '@/services/api';
import toast from 'react-hot-toast';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  product?: any;
}

const emptyForm = {
  sku: '',
  nombre: '',
  descripcion_corta: '',
  categoria_id: '',
  marca_id: '',
  precio_costo: 0,
  precio_venta: 0,
  precio_oferta: '',
  stock_minimo: 5,
  activo: true,
};

const ProductModal = ({ isOpen, onClose, onSave, product }: ProductModalProps) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({ ...emptyForm });
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);
  const [imagenes, setImagenes] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: categoriasData } = useQuery({
    queryKey: ['categorias'],
    queryFn: () => productoService.getCategorias(),
    enabled: isOpen,
  });

  const { data: marcasData } = useQuery({
    queryKey: ['marcas'],
    queryFn: () => productoService.getMarcas(),
    enabled: isOpen,
  });

  const categorias = categoriasData?.data?.data || [];
  const marcas = marcasData?.data?.data || [];

  useEffect(() => {
    if (isOpen) {
      if (product) {
        setFormData({
          sku: product.sku || '',
          nombre: product.nombre || '',
          descripcion_corta: product.descripcion_corta || '',
          categoria_id: product.categoria_id || '',
          marca_id: product.marca_id || '',
          precio_costo: product.precio_costo || 0,
          precio_venta: product.precio_venta || 0,
          precio_oferta: product.precio_oferta || '',
          stock_minimo: product.stock_minimo || 5,
          activo: product.activo !== undefined ? product.activo : true,
        });
        setImagenes(product.imagenes || []);
      } else {
        setFormData({ ...emptyForm });
        setImagenes([]);
      }
    }
  }, [product, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? (e.target as HTMLInputElement).checked
          : type === 'number'
          ? value === '' ? '' : parseFloat(value)
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.categoria_id) { toast.error('Selecciona una categoría'); return; }
    if (!formData.precio_venta || Number(formData.precio_venta) <= 0) { toast.error('El precio de venta debe ser mayor a 0'); return; }

    setIsSaving(true);
    try {
      const payload: any = { ...formData };
      if (payload.precio_oferta === '' || payload.precio_oferta === 0) delete payload.precio_oferta;
      if (payload.marca_id === '') delete payload.marca_id;
      onSave(payload);
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !product?.id) return;

    setUploadingImg(true);
    try {
      const fd = new FormData();
      fd.append('imagen', file);
      const res = await productoApi.subirImagen(product.id, fd);
      const nuevaImagen = res.data?.data;
      setImagenes(prev => [...prev, nuevaImagen]);
      queryClient.invalidateQueries({ queryKey: ['productos-admin'] });
      toast.success('Imagen subida');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Error al subir imagen');
    } finally {
      setUploadingImg(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleEliminarImagen = async (imagenId: number) => {
    if (!product?.id) return;
    try {
      await productoApi.eliminarImagen(product.id, imagenId);
      setImagenes(prev => prev.filter(i => i.id !== imagenId));
      queryClient.invalidateQueries({ queryKey: ['productos-admin'] });
      toast.success('Imagen eliminada');
    } catch {
      toast.error('Error al eliminar imagen');
    }
  };

  return (
    <Transition show={isOpen} as={React.Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={React.Fragment}
          enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100"
          leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-40" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={React.Fragment}
              enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
              leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex justify-between items-center mb-6">
                  <Dialog.Title as="h3" className="text-lg font-bold text-gray-900">
                    {product ? 'Editar Producto' : 'Nuevo Producto'}
                  </Dialog.Title>
                  <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* SKU */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">SKU *</label>
                      <input type="text" name="sku" required value={formData.sku} onChange={handleChange}
                        placeholder="Ej: PROD-001"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>

                    {/* Nombre */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                      <input type="text" name="nombre" required value={formData.nombre} onChange={handleChange}
                        placeholder="Nombre del producto"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>

                    {/* Descripción */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Descripción corta</label>
                      <textarea name="descripcion_corta" rows={2} value={formData.descripcion_corta} onChange={handleChange}
                        placeholder="Descripción breve del producto..."
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>

                    {/* Categoría */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Categoría *</label>
                      <select name="categoria_id" required value={formData.categoria_id} onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                        <option value="">-- Selecciona una categoría --</option>
                        {categorias.map((c: any) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                      </select>
                    </div>

                    {/* Marca */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Marca</label>
                      <select name="marca_id" value={formData.marca_id} onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                        <option value="">-- Sin marca --</option>
                        {marcas.map((m: any) => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                      </select>
                    </div>

                    {/* Precio Costo */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Precio Costo *</label>
                      <input type="number" name="precio_costo" step="0.01" min="0" required value={formData.precio_costo} onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>

                    {/* Precio Venta */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Precio Venta *</label>
                      <input type="number" name="precio_venta" step="0.01" min="0.01" required value={formData.precio_venta} onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>

                    {/* Precio Oferta */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Precio Oferta</label>
                      <input type="number" name="precio_oferta" step="0.01" min="0" value={formData.precio_oferta} onChange={handleChange}
                        placeholder="Opcional"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>

                    {/* Stock Mínimo */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Stock Mínimo</label>
                      <input type="number" name="stock_minimo" min="0" value={formData.stock_minimo} onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>

                    {/* Activo */}
                    <div className="md:col-span-2 flex items-center gap-3 pt-1">
                      <input type="checkbox" id="activo" name="activo" checked={formData.activo} onChange={handleChange}
                        className="w-4 h-4 accent-blue-600" />
                      <label htmlFor="activo" className="text-sm font-medium text-gray-700">
                        Producto activo (visible en tienda)
                      </label>
                    </div>
                  </div>

                  {/* ── Sección de imágenes (solo al editar) ── */}
                  {product?.id && (
                    <div className="border-t pt-4 mt-2">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                          <ImagePlus size={16} className="text-blue-500" /> Imágenes del producto
                        </h4>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploadingImg}
                          className="flex items-center gap-2 text-xs font-bold bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-100 disabled:opacity-50 transition-colors"
                        >
                          <Upload size={13} />
                          {uploadingImg ? 'Subiendo...' : 'Subir imagen'}
                        </button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/gif"
                          className="hidden"
                          onChange={handleFileChange}
                        />
                      </div>

                      {imagenes.length === 0 ? (
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition-colors"
                        >
                          <ImagePlus size={32} className="mx-auto text-gray-300 mb-2" />
                          <p className="text-sm text-gray-400">Haz clic para subir la primera imagen</p>
                          <p className="text-xs text-gray-300 mt-1">JPG, PNG, WebP — máx. 5 MB</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-4 gap-3">
                          {imagenes.map((img) => (
                            <div key={img.id} className="relative group aspect-square rounded-xl overflow-hidden border-2 border-gray-100">
                              <img src={img.url} alt="" className="w-full h-full object-cover" />
                              {img.principal && (
                                <div className="absolute top-1 left-1 bg-yellow-400 rounded-full p-0.5">
                                  <Star size={10} className="text-white fill-white" />
                                </div>
                              )}
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button
                                  type="button"
                                  onClick={() => handleEliminarImagen(img.id)}
                                  className="p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </div>
                          ))}
                          {/* Botón añadir más */}
                          <div
                            onClick={() => fileInputRef.current?.click()}
                            className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition-colors"
                          >
                            <Upload size={20} className="text-gray-300" />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {!product?.id && (
                    <p className="text-xs text-gray-400 bg-gray-50 rounded-lg px-3 py-2">
                      💡 Guarda el producto primero y luego podrás agregar imágenes editándolo.
                    </p>
                  )}

                  <div className="mt-6 flex justify-end space-x-3 pt-4 border-t">
                    <button type="button" onClick={onClose}
                      className="px-5 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      Cancelar
                    </button>
                    <button type="submit" disabled={isSaving}
                      className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors disabled:opacity-60">
                      {isSaving ? 'Guardando...' : product ? 'Actualizar' : 'Crear Producto'}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ProductModal;
