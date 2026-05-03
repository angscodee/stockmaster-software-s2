import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { 
  LayoutDashboard, Package, ShoppingBag, 
  Users, BarChart2, FileText, Settings, Database 
} from 'lucide-react';

const Sidebar = () => {
  const { user } = useAuthStore();

  const menuItems = [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, roles: ['administrador'] },
    { to: '/admin/productos', label: 'Productos', icon: Package, roles: ['administrador'] },
    { to: '/admin/ordenes', label: 'Órdenes', icon: ShoppingBag, roles: ['administrador', 'gerente_ventas', 'vendedor'] },
    { to: '/admin/inventario', label: 'Inventario', icon: Database, roles: ['administrador', 'gerente_inventario'] },
    { to: '/admin/clientes', label: 'Clientes', icon: Users, roles: ['administrador', 'gerente_ventas'] },
    { to: '/admin/reportes', label: 'Reportes', icon: FileText, roles: ['administrador'] },
    { to: '/admin/estadisticas', label: 'Estadísticas', icon: BarChart2, roles: ['administrador', 'gerente_ventas', 'gerente_inventario'] },
  ];

  const filteredItems = menuItems.filter(item => 
    !item.roles || (user && item.roles.includes(user.rol))
  );

  return (
    <aside className="w-64 bg-white border-r min-h-[calc(100vh-64px)] hidden lg:block">
      <div className="p-6 space-y-2">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6 ml-2">Panel de Administración</p>
        {filteredItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/admin'}
            className={({ isActive }) => `
              flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all
              ${isActive 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' 
                : 'text-gray-500 hover:bg-gray-50 hover:text-blue-600'}
            `}
          >
            <item.icon size={20} />
            {item.label}
          </NavLink>
        ))}
      </div>
      
      <div className="absolute bottom-0 w-64 p-6 border-t bg-gray-50/50">
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 bg-white rounded-xl border flex items-center justify-center text-blue-600 font-black shadow-sm">
             {user?.nombre?.[0]}
           </div>
           <div>
             <p className="text-xs font-black text-gray-800 uppercase tracking-tight">{user?.nombre} {user?.apellido}</p>
             <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{user?.rol}</p>
           </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
