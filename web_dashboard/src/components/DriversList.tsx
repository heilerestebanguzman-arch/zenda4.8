import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { driverService, Driver } from '../services/driverService';

export const DriversList: React.FC = () => {
  const { t } = useTranslation();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDrivers();
  }, []);

  const loadDrivers = async () => {
    try {
      setLoading(true);
      const data = await driverService.getDrivers();
      setDrivers(data);
      setError(null);
    } catch (err) {
      setError(t('common.error'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-red-500 text-center py-8">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">{t('drivers.list')}</h2>
        <span className="text-sm text-gray-500">
          {t('drivers.total', { count: drivers.length })}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                {t('drivers.name')}
              </th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                {t('drivers.email')}
              </th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                {t('drivers.phone')}
              </th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                {t('drivers.license')}
              </th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                {t('drivers.status')}
              </th>
            </tr>
          </thead>
          <tbody>
            {drivers.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-4 text-gray-500">
                  {t('drivers.none')}
                </td>
              </tr>
            ) : (
              drivers.map((driver) => (
                <tr key={driver.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">{driver.full_name}</td>
                  <td className="px-4 py-2">{driver.email}</td>
                  <td className="px-4 py-2">{driver.phone}</td>
                  <td className="px-4 py-2">{driver.license_number}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      driver.status === 'ACTIVE'
                        ? 'bg-green-100 text-green-800'
                        : driver.status === 'INACTIVE'
                        ? 'bg-gray-100 text-gray-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {driver.status === 'ACTIVE' && t('drivers.active')}
                      {driver.status === 'INACTIVE' && t('drivers.inactive')}
                      {driver.status === 'SUSPENDED' && t('drivers.suspended')}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
