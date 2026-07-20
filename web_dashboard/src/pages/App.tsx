import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { DashboardLayout } from './layouts/DashboardLayout';
import { Login } from './pages/Login';
import { PrivateRoute } from './components/shared/PrivateRoute';

// Carga perezosa de componentes
const Dashboard = lazy(() => import('./pages/Dashboard'));
const RoutesList = lazy(() => import('./pages/Routes'));
const RoutesMapPage = lazy(() => import('./pages/RoutesPage'));

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Toaster position="top-right" />
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center dark:bg-dark-bg dark:text-white">Cargando...</div>}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route element={<PrivateRoute />}>
                <Route element={<DashboardLayout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/routes" element={<RoutesList />} />
                  <Route path="/routes-map" element={<RoutesMapPage />} />
                  <Route path="/" element={<Navigate to="/dashboard" />} />
                </Route>
              </Route>
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
