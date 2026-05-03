import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/services/api';
import { 
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, FunnelChart, Funnel, LabelList, CartesianGrid
} from 'recharts';
import { 
  TrendingUp, ShoppingCart, Users, AlertTriangle, 
  DollarSign, Percent, MousePointerClick, RefreshCcw, Package 
} from 'lucide-react';
import StatCard from '@/components/charts/StatCard';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function Dashboard() {
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const { data: dashboardData, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['dashboard-data', dateRange],
    queryFn: async () => {
      const [k, v, vc, oe, tp] = await Promise.all([
        dashboardApi.kpis(),
        dashboardApi.ventasDiarias(30),
        dashboardApi.ventasCategoria(),
        dashboardApi.ordenesPorEstado(),
        dashboardApi.topProductos(),
      ]);
      return {
        kpis: k.data?.data || {},
        ventasDiarias: (v.data?.data || []).map((d: any) => ({ ...d, total: parseFloat(d.total || 0), costo: parseFloat(d.costo || 0), abandono: parseFloat(d.abandono || 0) })),
        ventasCategoria: (vc.data?.data || []).map((d: any) => ({ ...d, total: parseFloat(d.total || 0), cantidad: parseInt(d.cantidad || 0) })),
        ordenesPorEstado: (oe.data?.data || []).map((d: any) => ({ ...d, cantidad: parseInt(d.cantidad || 0) })),
        topProductos: (tp.data?.data || []).map((d: any) => ({ ...d, unidades_vendidas: parseInt(d.unidades_vendidas || 0), ingresos: parseFloat(d.ingresos || 0) })),
      };
    },
    retry: 1,
  });

  if (isLoading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"/>
    </div>
  );

  if (isError) {
    const errMsg = (error as any)?.response?.data?.message || 'Error al cargar el dashboard';
    const status = (error as any)?.response?.status;
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4 text-center">
        <AlertTriangle size={48} className="text-red-400" />
        <h2 className="text-xl font-bold text-gray-700">
          {status === 403 ? 'Acceso denegado' : 'Error al cargar datos'}
        </h2>
        <p className="text-gray-500 max-w-sm">
          {status === 403
            ? 'Tu rol no tiene permisos para ver el dashboard. Contacta al administrador.'
            : errMsg}
        </p>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700"
        >
          <RefreshCcw size={16} /> Reintentar
        </button>
      </div>
    );
  }

  const kpis = dashboardData?.kpis || {};

  return (
    <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Panel de Control</h1>
        <div className="flex gap-3">
          <input 
            type="date" 
            className="border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" 
            onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
          />
          <input 
            type="date" 
            className="border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" 
            onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
          />
        </div>
      </div>

      {/* 9 KPIs Requeridos */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <StatCard label="Ventas Totales" value={`S/. ${parseFloat(kpis.ventasMes||0).toLocaleString()}`} icon={DollarSign} color="blue" sub={`${kpis.cantidadOrdenes||0} órdenes`} />
        <StatCard label="Ticket Promedio" value={`S/. ${parseFloat(kpis.ticketPromedio||0).toFixed(2)}`} icon={TrendingUp} color="green" />
        <StatCard label="Conversión" value={`${kpis.tasaConversion||0}%`} icon={MousePointerClick} color="purple" />
        <StatCard label="Abandono Carrito" value={`${kpis.tasaAbandono||0}%`} icon={ShoppingCart} color="red" />
        <StatCard label="Stock Bajo/Agotado" value={kpis.productosBajoStock||0} icon={AlertTriangle} color="orange" />
        <StatCard label="Ingresos Categoría" value={`S/. ${parseFloat(kpis.ingresosTopCategoria||0).toLocaleString()}`} icon={Package} color="indigo" sub={kpis.topCategoriaNombre} />
        <StatCard label="Clientes Nuevos" value={kpis.clientesNuevos||0} icon={Users} color="pink" />
        <StatCard label="Órdenes Pendientes" value={kpis.ordenesPendientes||0} icon={RefreshCcw} color="yellow" />
        <StatCard label="Reembolsos" value={`S/. ${parseFloat(kpis.montoReembolsos||0).toFixed(2)}`} icon={Percent} color="slate" sub={`${kpis.cantidadReembolsos||0} casos`} />
      </div>

      {/* 7 Gráficos Requeridos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. AreaChart - Evolución Ventas */}
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <h3 className="font-bold mb-6">Evolución de Ventas</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dashboardData?.ventasDiarias}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="fecha" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="total" stroke="#3b82f6" fill="#dbeafe" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. BarChart - Ventas por Categoría */}
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <h3 className="font-bold mb-6">Ventas por Categoría</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dashboardData?.ventasCategoria}>
                <XAxis dataKey="categoria" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. PieChart - Órdenes por Estado */}
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <h3 className="font-bold mb-6">Distribución de Órdenes</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={dashboardData?.ordenesPorEstado} 
                  dataKey="cantidad" 
                  nameKey="estado" 
                  cx="50%" cy="50%" 
                  innerRadius={60} 
                  outerRadius={80}
                >
                  {dashboardData?.ordenesPorEstado.map((_: any, i: number) => (
                    <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip /><Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 4. BarChart Apilado - Ingresos vs Costos */}
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <h3 className="font-bold mb-6">Ingresos vs Costos</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dashboardData?.ventasDiarias}>
                <XAxis dataKey="fecha" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total" stackId="a" fill="#3b82f6" name="Ingresos" />
                <Bar dataKey="costo" stackId="a" fill="#f87171" name="Costos" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 5. LineChart - Tendencia Abandono */}
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <h3 className="font-bold mb-6">Tendencia Abandono de Carrito</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dashboardData?.ventasDiarias}>
                <XAxis dataKey="fecha" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="abandono" stroke="#ef4444" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 6. BarChart Horizontal - Top 10 Productos */}
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <h3 className="font-bold mb-6">Top 10 Productos Vendidos</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={dashboardData?.topProductos}>
                <XAxis type="number" />
                <YAxis dataKey="nombre" type="category" width={100} tick={{fontSize: 10}} />
                <Tooltip />
                <Bar dataKey="unidades_vendidas" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 7. FunnelChart - Embudo de Conversión */}
        <div className="bg-white p-6 rounded-xl border shadow-sm lg:col-span-2">
          <h3 className="font-bold mb-6 text-center">Embudo de Conversión</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <FunnelChart>
                <Tooltip />
                <Funnel
                  data={[
                    { value: 1000, name: 'Visitas', fill: '#94a3b8' },
                    { value: 400, name: 'Carrito', fill: '#64748b' },
                    { value: 200, name: 'Checkout', fill: '#475569' },
                    { value: 80, name: 'Pago', fill: '#334155' },
                  ]}
                  dataKey="value"
                >
                  <LabelList position="right" fill="#000" stroke="none" dataKey="name" />
                </Funnel>
              </FunnelChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
