import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCartStore } from '@/stores/cartStore';
import { useAuthStore } from '@/stores/authStore';
import { ordenService } from '@/services/orden.service';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  CreditCard, Truck, MapPin, CheckCircle, 
  ArrowRight, ArrowLeft, Loader2, ShoppingBag 
} from 'lucide-react';

const checkoutSchema = z.object({
  direccion: z.string().min(5, 'Dirección muy corta'),
  ciudad: z.string().min(2, 'Ciudad requerida'),
  departamento: z.string().min(2, 'Departamento requerido'),
  codigo_postal: z.string().min(5, 'CP inválido'),
  metodo_envio: z.string(),
  metodo_pago: z.string(),
  numero_operacion: z.string().optional(),
});

const steps = ['Identificación', 'Envío', 'Método Envío', 'Pago', 'Revisión'];

export default function Checkout() {
  const [currentStep, setCurrentStep] = useState(1);
  const { items, totalPrice, clearCart } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { register, handleSubmit, trigger, formState: { errors }, watch } = useForm<z.infer<typeof checkoutSchema>>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      metodo_envio: 'estandar',
      metodo_pago: 'tarjeta',
      direccion: '',
      ciudad: '',
      departamento: '',
      codigo_postal: ''
    }
  });

  const formData = watch();

  const handleNext = async () => {
    if (currentStep === 1 && !isAuthenticated) {
      toast.error('Debes iniciar sesión para continuar');
      navigate('/login?redirect=checkout');
      return;
    }
    
    if (currentStep === 2) {
      const isValid = await trigger(['direccion', 'ciudad', 'codigo_postal', 'departamento']);
      if (!isValid) return;
    }

    setCurrentStep(prev => Math.min(prev + 1, 5));
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      const orderData = {
        items: items.map(i => ({ producto_id: i.id, cantidad: i.cantidad })),
        direccion_obj: {
          direccion_linea1: formData.direccion,
          ciudad: formData.ciudad,
          departamento: formData.departamento,
          codigo_postal: formData.codigo_postal
        },
        metodo_envio: formData.metodo_envio,
        metodo_pago: formData.metodo_pago,
        notas: formData.numero_operacion ? `Operación: ${formData.numero_operacion}` : ''
      };
      
      const res = await ordenService.crearOrden(orderData);
      toast.success('¡Pedido realizado con éxito!');
      clearCart();
      navigate(`/mis-ordenes`);
    } catch (err) {
      toast.error('Error al procesar el pedido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="flex justify-between mb-12 relative">
        <div className="absolute top-5 left-0 w-full h-0.5 bg-gray-200 -z-10"></div>
        {steps.map((step, i) => (
          <div key={i} className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
              currentStep > i + 1 ? 'bg-green-500 text-white' : 
              currentStep === i + 1 ? 'bg-blue-600 text-white' : 'bg-white border-2 border-gray-200 text-gray-400'
            }`}>
              {currentStep > i + 1 ? '✓' : i + 1}
            </div>
            <span className={`text-[10px] mt-2 font-black uppercase tracking-tighter ${currentStep === i + 1 ? 'text-blue-600' : 'text-gray-400'}`}>
              {step}
            </span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 bg-white p-8 rounded-[32px] border shadow-sm">
          {currentStep === 1 && (
            <div className="text-center py-12">
              <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-600">
                <ShoppingBag size={32} />
              </div>
              <h2 className="text-2xl font-black uppercase tracking-tight mb-2">Identificación</h2>
              <p className="text-gray-500 mb-8">
                {isAuthenticated ? `Estás identificado como ${user?.nombre}` : 'Inicia sesión para una compra más rápida.'}
              </p>
              {isAuthenticated ? (
                <button onClick={handleNext} className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold uppercase tracking-widest hover:bg-blue-700">
                  Continuar como {user?.nombre}
                </button>
              ) : (
                <div className="flex gap-4 justify-center">
                  <button onClick={() => navigate('/login?redirect=checkout')} className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold">Login</button>
                  <button onClick={handleNext} className="border-2 border-gray-200 px-8 py-3 rounded-xl font-bold">Invitado</button>
                </div>
              )}
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                <MapPin className="text-blue-600" /> Dirección de Envío
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Dirección Exacta</label>
                  <input {...register('direccion')} className="w-full border-2 border-gray-100 rounded-xl p-3 mt-1 focus:border-blue-500 outline-none" placeholder="Calle, número, departamento..." />
                  {errors.direccion && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.direccion.message}</p>}
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Ciudad</label>
                  <input {...register('ciudad')} className="w-full border-2 border-gray-100 rounded-xl p-3 mt-1 outline-none focus:border-blue-500" />
                  {errors.ciudad && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.ciudad.message}</p>}
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Departamento</label>
                  <input {...register('departamento')} className="w-full border-2 border-gray-100 rounded-xl p-3 mt-1 outline-none focus:border-blue-500" />
                  {errors.departamento && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.departamento.message}</p>}
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Código Postal</label>
                  <input {...register('codigo_postal')} className="w-full border-2 border-gray-100 rounded-xl p-3 mt-1 outline-none focus:border-blue-500" />
                  {errors.codigo_postal && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.codigo_postal.message}</p>}
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                <Truck className="text-blue-600" /> Método de Envío
              </h2>
              <div className="space-y-3">
                {[
                  { id: 'estandar', label: 'Estandar (3-5 días)', price: 'Gratis' },
                  { id: 'express', label: 'Express (24 horas)', price: 'S/. 15.00' }
                ].map(m => (
                  <label key={m.id} className={`flex items-center justify-between p-4 border-2 rounded-2xl cursor-pointer transition-all ${formData.metodo_envio === m.id ? 'border-blue-500 bg-blue-50' : 'border-gray-100'}`}>
                    <div className="flex items-center gap-3">
                      <input type="radio" value={m.id} {...register('metodo_envio')} className="hidden" />
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${formData.metodo_envio === m.id ? 'border-blue-600' : 'border-gray-300'}`}>
                        {formData.metodo_envio === m.id && <div className="w-2 h-2 bg-blue-600 rounded-full" />}
                      </div>
                      <span className="font-bold text-gray-700">{m.label}</span>
                    </div>
                    <span className="font-black text-blue-600 text-sm">{m.price}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                <CreditCard className="text-blue-600" /> Método de Pago
              </h2>
              
              <div className="flex gap-4 mb-6">
                <label className={`flex-1 p-4 border-2 rounded-2xl cursor-pointer text-center transition-all ${formData.metodo_pago === 'tarjeta' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200'}`}>
                  <input type="radio" value="tarjeta" {...register('metodo_pago')} className="hidden" />
                  <CreditCard className="mx-auto mb-2" />
                  <span className="font-bold text-sm">Tarjeta</span>
                </label>
                <label className={`flex-1 p-4 border-2 rounded-2xl cursor-pointer text-center transition-all ${formData.metodo_pago === 'yape' ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-200'}`}>
                  <input type="radio" value="yape" {...register('metodo_pago')} className="hidden" />
                  <div className="w-6 h-6 bg-purple-600 text-white font-black rounded-full flex items-center justify-center mx-auto mb-2">Y</div>
                  <span className="font-bold text-sm">Yape</span>
                </label>
                <label className={`flex-1 p-4 border-2 rounded-2xl cursor-pointer text-center transition-all ${formData.metodo_pago === 'plin' ? 'border-sky-500 bg-sky-50 text-sky-700' : 'border-gray-200'}`}>
                  <input type="radio" value="plin" {...register('metodo_pago')} className="hidden" />
                  <div className="w-6 h-6 bg-sky-500 text-white font-black rounded-full flex items-center justify-center mx-auto mb-2">P</div>
                  <span className="font-bold text-sm">Plin</span>
                </label>
              </div>

              {formData.metodo_pago === 'tarjeta' && (
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-4">
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Número de Tarjeta</label>
                    <input type="text" placeholder="0000 0000 0000 0000" className="w-full border-2 border-gray-200 rounded-xl p-3 mt-1 outline-none focus:border-blue-500" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Vencimiento</label>
                      <input type="text" placeholder="MM/YY" className="w-full border-2 border-gray-200 rounded-xl p-3 mt-1 outline-none focus:border-blue-500" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">CVV</label>
                      <input type="text" placeholder="123" className="w-full border-2 border-gray-200 rounded-xl p-3 mt-1 outline-none focus:border-blue-500" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Titular de la Tarjeta</label>
                    <input type="text" placeholder="Nombre completo" className="w-full border-2 border-gray-200 rounded-xl p-3 mt-1 outline-none focus:border-blue-500" />
                  </div>
                </div>
              )}

              {(formData.metodo_pago === 'yape' || formData.metodo_pago === 'plin') && (
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 text-center space-y-4">
                  <p className="font-bold text-gray-700">Escanea el código QR para pagar</p>
                  <div className="w-48 h-48 bg-white mx-auto rounded-2xl border-4 overflow-hidden shadow-sm flex items-center justify-center p-2"
                       style={{ borderColor: formData.metodo_pago === 'yape' ? '#9333ea' : '#0ea5e9' }}>
                    <img 
                      src={formData.metodo_pago === 'yape' ? '/qr_yape.png' : '/qr_plin.png'} 
                      alt={`QR ${formData.metodo_pago}`} 
                      className="w-full h-full object-contain opacity-50"
                      onError={(e) => {
                        (e.target as any).onerror = null; 
                        (e.target as any).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25'%3E%3Crect width='100%25' height='100%25' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='20' font-weight='bold' fill='%239ca3af'%3EMOCKUP QR%3C/text%3E%3C/svg%3E";
                      }}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Número de Operación</label>
                    <input {...register('numero_operacion')} type="text" placeholder="Ej. 12345678" className="w-full max-w-xs mx-auto block border-2 border-gray-200 rounded-xl p-3 mt-1 outline-none focus:border-blue-500 text-center font-bold tracking-widest" />
                  </div>
                </div>
              )}
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-8">
              <div className="text-center">
                <div className="bg-green-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-green-500">
                  <CheckCircle size={32} />
                </div>
                <h2 className="text-2xl font-black uppercase tracking-tight">Revisión Final</h2>
                <p className="text-gray-500">Confirma que todos tus datos sean correctos.</p>
              </div>
              
              <div className="grid grid-cols-2 gap-6 bg-gray-50 p-6 rounded-2xl">
                <div>
                  <h4 className="text-[10px] font-black text-gray-400 uppercase mb-2">Envío a</h4>
                  <p className="text-sm font-bold">{formData.direccion}</p>
                  <p className="text-sm text-gray-600">{formData.ciudad}, {formData.departamento}</p>
                </div>
                <div>
                  <h4 className="text-[10px] font-black text-gray-400 uppercase mb-2">Pago con</h4>
                  <p className="text-sm font-bold uppercase tracking-widest">{formData.metodo_pago}</p>
                  {formData.numero_operacion && <p className="text-xs text-gray-500 mt-1">Op: {formData.numero_operacion}</p>}
                </div>
              </div>
            </div>
          )}

          <div className="mt-12 flex justify-between pt-8 border-t">
            {currentStep > 1 && (
              <button onClick={() => setCurrentStep(prev => prev - 1)} className="flex items-center gap-2 font-black text-xs uppercase text-gray-400 hover:text-gray-800">
                <ArrowLeft size={16} /> Atrás
              </button>
            )}
            <div className="ml-auto">
              {currentStep < 5 ? (
                <button onClick={handleNext} className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest flex items-center gap-3 hover:bg-blue-700 shadow-xl shadow-blue-100">
                  Siguiente Paso <ArrowRight size={18} />
                </button>
              ) : (
                <button 
                  onClick={handlePlaceOrder}
                  disabled={loading}
                  className="bg-green-600 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest flex items-center gap-3 hover:bg-green-700 shadow-xl shadow-green-100 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="animate-spin" /> : 'Confirmar Pedido'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Resumen lateral */}
        <div className="lg:col-span-1">
          <div className="bg-gray-900 text-white p-8 rounded-[32px] sticky top-24">
            <h3 className="text-lg font-black uppercase tracking-tight mb-6">Tu Pedido</h3>
            <div className="space-y-4 mb-8 max-h-60 overflow-y-auto pr-2">
              {items.map(item => (
                <div key={item.id} className="flex justify-between items-center gap-4">
                  <div className="flex-1">
                    <p className="text-xs font-bold line-clamp-1">{item.nombre}</p>
                    <p className="text-[10px] text-gray-400">Cant: {item.cantidad}</p>
                  </div>
                  <span className="text-sm font-black">S/. {(item.precio * item.cantidad).toFixed(2)}</span>
                </div>
              ))}
            </div>
            
            <div className="space-y-3 pt-6 border-t border-white/10">
              <div className="flex justify-between text-xs text-gray-400">
                <span>Subtotal</span>
                <span>S/. {(totalPrice() / 1.18).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-400">
                <span>IGV (18%)</span>
                <span>S/. {(totalPrice() - (totalPrice() / 1.18)).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xl font-black pt-4">
                <span>Total</span>
                <span className="text-blue-400">S/. {totalPrice().toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
