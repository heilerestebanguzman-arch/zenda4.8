import api from './api';

export interface Driver {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  identification_number: string;
  license_number: string;
  license_expiry_date: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  created_at: string;
}

export const driverService = {
  getDrivers: async (): Promise<Driver[]> => {
    const response = await api.get('/api/v1/drivers');
    return response.data;
  },

  registerDriver: async (data: Omit<Driver, 'id' | 'created_at' | 'status'>) => {
    const response = await api.post('/api/v1/drivers/register', data);
    return response.data;
  },

  getDriverById: async (id: string): Promise<Driver> => {
    const response = await api.get(`/api/v1/drivers/${id}`);
    return response.data;
  },

  updateDriver: async (id: string, data: Partial<Driver>) => {
    const response = await api.put(`/api/v1/drivers/${id}`, data);
    return response.data;
  },

  deleteDriver: async (id: string): Promise<void> => {
    await api.delete(`/api/v1/drivers/${id}`);
  }
};

export default driverService;
