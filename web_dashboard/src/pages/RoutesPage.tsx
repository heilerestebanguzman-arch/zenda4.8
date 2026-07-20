import React from 'react';
import { useTranslation } from 'react-i18next';
import RouteMap from '../components/RouteMap';
import RoutesList from '../components/DriversList'; // Reutilizar componente de lista

const RoutesPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        🚌 {t('routes.title') || 'Gestión de Rutas'}
      </h1>

      {/* Mapa interactivo */}
      <div className="mb-6">
        <RouteMap />
      </div>

      {/* Lista de rutas (opcional) */}
      {/* <div className="mt-6">
        <RoutesList />
      </div> */}
    </div>
  );
};

export default RoutesPage;
