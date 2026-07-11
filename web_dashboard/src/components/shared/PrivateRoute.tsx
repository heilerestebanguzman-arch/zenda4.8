import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const PrivateRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Verificando autenticación...</div>;
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};
