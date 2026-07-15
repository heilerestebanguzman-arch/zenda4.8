import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { orderService } from '../services/orderService';
import { reportService } from '../services/reportService';
import { DriversList } from '../components/DriversList';
import { LanguageSelector } from '../components/ui/LanguageSelector';

export const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const [orders, setOrders] = useState([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [ordersData, summaryData] = await Promise.all([
        orderService.getOrders(),
        reportService.getSummary()
      ]);
      setOrders(ordersData);
      setSummary(summaryData);
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('dashboard.title')}</h1>
        <LanguageSelector />
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">{t('dashboard.total_orders')}</p>
          <p className="text-2xl font-bold">{summary?.total_orders || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">{t('dashboard.pending_orders')}</p>
          <p className="text-2xl font-bold text-yellow-600">{summary?.pending || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">{t('dashboard.completed_orders')}</p>
          <p className="text-2xl font-bold text-green-600">{summary?.completed || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">{t('dashboard.total_revenue')}</p>
          <p className="text-2xl font-bold text-blue-600">${summary?.total_revenue || 0}</p>
        </div>
      </div>

      {/* Lista de Conductores */}
      <div className="mt-6">
        <DriversList />
      </div>
    </div>
  );
};
