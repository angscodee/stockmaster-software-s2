import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '@/routes/ProtectedRoute';

// Layouts
import MainLayout from '@/components/layout/MainLayout';

// Shop Pages
import Home from '@/pages/shop/Home';
import Catalogo from '@/pages/shop/Catalogo';
import ProductoDetalle from '@/pages/shop/ProductoDetalle';
import Carrito from '@/pages/shop/Carrito';
import Checkout from '@/pages/shop/Checkout';
import MisOrdenes from '@/pages/shop/MisOrdenes';
import Perfil from '@/pages/shop/Perfil';
import Login from '@/pages/shop/Login';
import Registro from '@/pages/shop/Registro';

// Admin Pages
import Dashboard from '@/pages/admin/Dashboard';
import ProductosAdmin from '@/pages/admin/ProductosAdmin';
import OrdenesAdmin from '@/pages/admin/OrdenesAdmin';
import InventarioAdmin from '@/pages/admin/InventarioAdmin';
import ClientesAdmin from '@/pages/admin/ClientesAdmin';
import Reportes from '@/pages/admin/Reportes';
import Estadisticas from '@/pages/admin/Estadisticas';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Rutas Públicas */}
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Registro />} />
      
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/catalogo" element={<Catalogo />} />
        <Route path="/catalogo/:slug" element={<Catalogo />} />
        <Route path="/producto/:id" element={<ProductoDetalle />} />
        <Route path="/carrito" element={<Carrito />} />

        {/* Rutas Protegidas Cliente */}
        <Route element={<ProtectedRoute allowedRoles={['cliente', 'administrador']} />}>
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/mis-ordenes" element={<MisOrdenes />} />
          <Route path="/perfil" element={<Perfil />} />
        </Route>

        {/* Rutas Protegidas Admin */}
        <Route path="/admin">
          <Route element={<ProtectedRoute allowedRoles={['administrador']} />}>
            <Route index element={<Dashboard />} />
            <Route path="productos" element={<ProductosAdmin />} />
            <Route path="reportes" element={<Reportes />} />
          </Route>
          
          <Route element={<ProtectedRoute allowedRoles={['administrador', 'gerente_ventas', 'vendedor']} />}>
            <Route path="ordenes" element={<OrdenesAdmin />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['administrador', 'gerente_inventario']} />}>
            <Route path="inventario" element={<InventarioAdmin />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['administrador', 'gerente_ventas']} />}>
            <Route path="clientes" element={<ClientesAdmin />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['administrador', 'gerente_ventas', 'gerente_inventario']} />}>
            <Route path="estadisticas" element={<Estadisticas />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
