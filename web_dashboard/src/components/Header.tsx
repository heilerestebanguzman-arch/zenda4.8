import React, { useState } from 'react';
import { Bell, Moon, Sun, LogOut, User } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const useAuth = () => {
  return {
    user: { name: 'Administrador' },
    logout: () => {
      localStorage.removeItem('zenda-token');
      window.location.href = '/login';
    }
  };
};

const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [notifications] = useState(3);

  return (
    <header 
      className="h-16 bg-white dark:bg-zenda-dark border-b border-gray-200 dark:border-gray-700 
                 flex items-center justify-between px-6"
      role="banner"
      aria-label="Encabezado principal"
    >
      <div>
        <h1 className="text-xl font-zenda-display text-zenda-primary dark:text-white">
          Dashboard
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Bienvenido de vuelta, {user?.name || 'Administrador'}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 
                     transition-colors focus:outline-none focus:ring-2 
                     focus:ring-zenda-primary focus:ring-offset-2"
          aria-label={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5 text-yellow-500" aria-hidden="true" />
          ) : (
            <Moon className="w-5 h-5 text-gray-600" aria-hidden="true" />
          )}
        </button>

        <button
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 
                     transition-colors relative focus:outline-none focus:ring-2 
                     focus:ring-zenda-primary focus:ring-offset-2"
          aria-label={`Notificaciones (${notifications} nuevas)`}
          title="Ver notificaciones"
        >
          <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" aria-hidden="true" />
          {notifications > 0 && (
            <span 
              className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-zenda-secondary 
                         text-white text-[10px] font-bold rounded-full 
                         flex items-center justify-center animate-pulse"
              aria-label={`${notifications} notificaciones sin leer`}
            >
              {notifications}
            </span>
          )}
        </button>

        <div className="flex items-center gap-2 pl-3 border-l border-gray-200 dark:border-gray-700">
          <div 
            className="w-8 h-8 rounded-full bg-zenda-primary text-white 
                       flex items-center justify-center text-sm font-medium"
            aria-label={`Usuario: ${user?.name || 'Administrador'}`}
          >
            {user?.name?.charAt(0) || 'A'}
          </div>
          <button
            onClick={logout}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 
                       transition-colors focus:outline-none focus:ring-2 
                       focus:ring-zenda-primary focus:ring-offset-2"
            aria-label="Cerrar sesión"
            title="Cerrar sesión"
          >
            <LogOut className="w-4 h-4 text-gray-600 dark:text-gray-300" aria-hidden="true" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
