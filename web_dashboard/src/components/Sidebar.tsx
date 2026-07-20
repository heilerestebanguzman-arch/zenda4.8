import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Map, 
  Users, 
  Truck, 
  CreditCard,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface MenuItem {
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}

interface SidebarProps {
  onCollapse?: (collapsed: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onCollapse }) => {
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const location = useLocation();

  const menuItems: MenuItem[] = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/routes', icon: Map, label: 'Rutas' },
    { path: '/drivers', icon: Users, label: 'Conductores' },
    { path: '/fleet', icon: Truck, label: 'Flota' },
    { path: '/payments', icon: CreditCard, label: 'Pagos' },
    { path: '/reports', icon: FileText, label: 'Reportes' },
    { path: '/settings', icon: Settings, label: 'Configuración' },
  ];

  const handleToggle = (): void => {
    const newState = !collapsed;
    setCollapsed(newState);
    if (onCollapse) {
      onCollapse(newState);
    }
  };

  return (
    <aside 
      className={`
        fixed left-0 top-0 h-full z-50
        ${collapsed ? 'w-16' : 'w-64'}
        bg-gradient-to-b from-zenda-primary to-zenda-primary-dark
        text-white transition-all duration-300 shadow-xl
      `}
      role="navigation"
      aria-label="Menú principal"
    >
      <div className="flex items-center justify-center h-16 border-b border-white/10">
        {collapsed ? (
          <img 
            src="/assets/logos/zenda-icon.svg" 
            alt="ZENDA" 
            className="w-8 h-8" 
            loading="lazy"
          />
        ) : (
          <img 
            src="/assets/logos/zenda-logo.svg" 
            alt="ZENDA Transport" 
            className="h-10" 
            loading="lazy"
          />
        )}
      </div>

      <nav className="mt-4 px-2" aria-label="Navegación principal">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex items-center px-3 py-2.5 rounded-lg transition-all
                ${isActive 
                  ? 'bg-white/20 text-white' 
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
                }
                ${collapsed ? 'justify-center' : 'gap-3'}
                focus:outline-none focus:ring-2 focus:ring-white/50
              `}
              aria-current={isActive ? 'page' : undefined}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
              {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
        <button
          onClick={handleToggle}
          className="w-full flex items-center justify-center text-white/60 
                     hover:text-white transition-colors focus:outline-none 
                     focus:ring-2 focus:ring-white/50 rounded-lg p-1"
          aria-label={collapsed ? 'Expandir menú' : 'Colapsar menú'}
          title={collapsed ? 'Expandir' : 'Colapsar'}
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5" aria-hidden="true" />
          ) : (
            <ChevronLeft className="w-5 h-5" aria-hidden="true" />
          )}
          {!collapsed && <span className="ml-2 text-xs">Colapsar</span>}
        </button>
        {!collapsed && (
          <div className="mt-2 text-center">
            <p className="text-[10px] text-white/40 font-medium tracking-wider">
              ZENDA v4.8
            </p>
            <p className="text-[8px] text-white/30">
              © 2026 Nebel Legend
            </p>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
