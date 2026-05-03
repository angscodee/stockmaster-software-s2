import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { authService } from '@/services/auth.service';
import toast from 'react-hot-toast';

const registerSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  apellido: z.string().optional(),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

const Registro = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema)
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setLoading(true);
    try {
      await authService.register({
        nombre: data.nombre,
        apellido: data.apellido,
        email: data.email,
        password: data.password
      });
      toast.success('Cuenta creada exitosamente. Por favor, inicia sesión.');
      navigate('/login');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al crear la cuenta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h1 className="text-2xl font-bold mb-2 text-center">Crear Cuenta</h1>
        <p className="text-gray-500 text-center mb-8">Únete a nuestra comunidad hoy mismo.</p>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <input {...register('nombre')} type="text" placeholder="Nombre" className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre.message}</p>}
            </div>
            <div>
              <input {...register('apellido')} type="text" placeholder="Apellido" className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              {errors.apellido && <p className="text-red-500 text-xs mt-1">{errors.apellido.message}</p>}
            </div>
          </div>
          <div>
            <input {...register('email')} type="email" placeholder="Email" className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <input {...register('password')} type="password" placeholder="Contraseña" className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>
          <div>
            <input {...register('confirmPassword')} type="password" placeholder="Confirmar Contraseña" className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
          </div>
          
          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? 'Cargando...' : 'Registrarse'}
          </button>
        </form>

        <p className="mt-8 text-center text-gray-600">
          ¿Ya tienes cuenta? <Link to="/login" className="text-blue-600 font-bold hover:underline">Inicia Sesión</Link>
        </p>
      </div>
    </div>
  );
};

export default Registro;
