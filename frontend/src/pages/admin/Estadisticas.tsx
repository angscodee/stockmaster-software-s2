import React, { useState } from 'react';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ScatterChart, Scatter, ZAxis, Legend, Cell, ComposedChart
} from 'recharts';
import { Calendar, TrendingUp, Users, Package, ShoppingCart } from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

// Mock data para Heatmap y Cohortes (requiere componentes personalizados o librerías extra, simulamos con gráficos Recharts)
const salesByHour = [
  { hour: '00-04', Mon: 10, Tue: 5, Wed: 8, Thu: 12, Fri: 15, Sat: 20, Sun: 18 },
  { hour: '04-08', Mon: 5, Tue: 3, Wed: 4, Thu: 8, Fri: 10, Sat: 12, Sun: 10 },
  { hour: '08-12', Mon: 45, Tue: 40, Wed: 50, Thu: 55, Fri: 60, Sat: 40, Sun: 30 },
  { hour: '12-16', Mon: 80, Tue: 75, Wed: 85, Thu: 90, Fri: 95, Sat: 70, Sun: 60 },
  { hour: '16-20', Mon: 120, Tue: 110, Wed: 130, Thu: 140, Fri: 150, Sat: 100, Sun: 90 },
  { hour: '20-24', Mon: 60, Tue: 55, Wed: 65, Thu: 70, Fri: 80, Sat: 90, Sun: 85 },
];

const paretoData = [
  { name: 'Prod A', sales: 5000, percentage: 40 },
  { name: 'Prod B', sales: 3000, percentage: 65 },
  { name: 'Prod C', sales: 1500, percentage: 80 },
  { name: 'Prod D', sales: 800, percentage: 90 },
  { name: 'Prod E', sales: 400, percentage: 95 },
  { name: 'Otros', sales: 300, percentage: 100 },
];

export default function Estadisticas() {
  const [range, setRange] = useState('30');

  return (
    <div className="p-8 space-y-10 bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tighter">Business Intelligence</h1>
          <p className="text-gray-500 font-medium">Análisis descriptivo y predictivo de operaciones.</p>
        </div>
        
        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border">
          <Calendar size={18} className="text-gray-400 ml-2" />
          <select 
            value={range} 
            onChange={(e) => setRange(e.target.value)}
            className="text-sm font-bold bg-transparent outline-none pr-4"
          >
            <option value="7">Últimos 7 días</option>
            <option value="30">Últimos 30 días</option>
            <option value="90">Últimos 3 meses</option>
            <option value="365">Último año</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 1. Análisis ABC (Pareto) */}
        <div className="bg-white p-8 rounded-[32px] border shadow-sm">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h3 className="font-black text-gray-800 uppercase tracking-tight">Análisis ABC de Productos</h3>
              <p className="text-xs text-gray-400 font-bold uppercase">Ley de Pareto: 80/20 de Ingresos</p>
            </div>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Package size={20} />
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={paretoData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{fontSize: 10, fontWeight: 'bold'}} />
                <YAxis yAxisId="left" tick={{fontSize: 10}} />
                <YAxis yAxisId="right" orientation="right" tick={{fontSize: 10}} unit="%" />
                <Tooltip />
                <Bar yAxisId="left" dataKey="sales" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="percentage" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, fill: '#ef4444' }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Distribución de Ventas (Heatmap simplificado) */}
        <div className="bg-white p-8 rounded-[32px] border shadow-sm">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h3 className="font-black text-gray-800 uppercase tracking-tight">Puntos de Calor de Venta</h3>
              <p className="text-xs text-gray-400 font-bold uppercase">Distribución por Hora y Día</p>
            </div>
            <div className="p-2 bg-orange-50 text-orange-600 rounded-xl">
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesByHour}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="hour" tick={{fontSize: 10, fontWeight: 'bold'}} />
                <YAxis tick={{fontSize: 10}} />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="Mon" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                <Area type="monotone" dataKey="Fri" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                <Area type="monotone" dataKey="Sat" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. Análisis RFM */}
        <div className="bg-white p-8 rounded-[32px] border shadow-sm">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h3 className="font-black text-gray-800 uppercase tracking-tight">Segmentación RFM</h3>
              <p className="text-xs text-gray-400 font-bold uppercase">Recencia vs Frecuencia de Clientes</p>
            </div>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
              <Users size={20} />
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" dataKey="frecuencia" name="Frecuencia" label={{ value: 'Compras', position: 'insideBottom', offset: -5 }} />
                <YAxis type="number" dataKey="monetario" name="Gasto Total" label={{ value: 'Monto S/.', angle: -90, position: 'insideLeft' }} />
                <ZAxis type="number" dataKey="recencia" range={[100, 1000]} name="Recencia (Días)" />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Scatter name="Clientes VIP" data={[{frecuencia: 15, monetario: 4500, recencia: 2}, {frecuencia: 12, monetario: 3800, recencia: 5}]} fill="#8b5cf6" />
                <Scatter name="Recurrentes" data={[{frecuencia: 5, monetario: 1200, recencia: 20}, {frecuencia: 8, monetario: 2100, recencia: 15}]} fill="#3b82f6" />
                <Scatter name="En Riesgo" data={[{frecuencia: 2, monetario: 400, recencia: 120}, {frecuencia: 1, monetario: 150, recencia: 200}]} fill="#ef4444" />
                <Legend />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 4. Cohortes de Retención (Heatmap de Tabla) */}
        <div className="bg-white p-8 rounded-[32px] border shadow-sm">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h3 className="font-black text-gray-800 uppercase tracking-tight">Retención por Cohortes</h3>
              <p className="text-xs text-gray-400 font-bold uppercase">% de Re-compra por Mes de Registro</p>
            </div>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <ShoppingCart size={20} />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[10px] font-bold uppercase tracking-tighter">
              <thead>
                <tr>
                  <th className="p-2 text-left">Cohorte</th>
                  <th className="p-2">Mes 0</th>
                  <th className="p-2">Mes 1</th>
                  <th className="p-2">Mes 2</th>
                  <th className="p-2">Mes 3</th>
                </tr>
              </thead>
              <tbody className="text-center">
                {[
                  { name: 'Enero 2026', vals: ['100%', '35%', '28%', '22%'], colors: ['bg-blue-600', 'bg-blue-300', 'bg-blue-200', 'bg-blue-100'] },
                  { name: 'Febrero 2026', vals: ['100%', '42%', '30%', '-'], colors: ['bg-blue-600', 'bg-blue-400', 'bg-blue-200', 'bg-transparent'] },
                  { name: 'Marzo 2026', vals: ['100%', '38%', '-', '-'], colors: ['bg-blue-600', 'bg-blue-300', 'bg-transparent', 'bg-transparent'] },
                ].map((row, i) => (
                  <tr key={i} className="border-t">
                    <td className="p-3 text-left font-black text-gray-600">{row.name}</td>
                    {row.vals.map((v, j) => (
                      <td key={j} className={`p-3 ${row.colors[j]} ${j === 0 ? 'text-white' : 'text-gray-800'}`}>{v}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
