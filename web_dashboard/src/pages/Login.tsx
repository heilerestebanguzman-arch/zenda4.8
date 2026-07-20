import React, { useState } from 'react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('admin@zenda.com');
  const [password, setPassword] = useState('Zenda2026!Secure');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🔐 Login iniciado');
    
    // Guardar token
    localStorage.setItem('zenda-token', 'fake-token');
    console.log('✅ Token guardado');
    
    // Redirigir directamente
    window.location.href = '/dashboard';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zenda-primary to-zenda-accent">
      <div className="bg-white dark:bg-zenda-dark p-8 rounded-2xl shadow-2xl w-96">
        <div className="text-center mb-8">
          <img src="/assets/logos/zenda-logo.svg" alt="ZENDA" className="h-12 mx-auto" />
          <h2 className="text-2xl font-zenda-display font-bold text-zenda-primary dark:text-white mt-4">
            Iniciar Sesión
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Sistema de Gestión de Transporte
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                         focus:ring-2 focus:ring-zenda-primary focus:border-transparent
                         dark:bg-zenda-primary-dark dark:text-white"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                         focus:ring-2 focus:ring-zenda-primary focus:border-transparent
                         dark:bg-zenda-primary-dark dark:text-white"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-zenda-primary text-white py-2 rounded-lg
                       hover:bg-zenda-primary-dark transition-colors
                       font-medium"
          >
            Ingresar
          </button>
        </form>

        <div className="mt-4 text-center text-xs text-gray-500 dark:text-gray-400">
          <p>ZENDA v4.8 © 2026 Nebel Legend</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
