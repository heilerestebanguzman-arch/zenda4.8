import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const DashboardLayout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const sidebarWidth = sidebarCollapsed ? 64 : 256;

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-zenda-dark">
      <Sidebar onCollapse={setSidebarCollapsed} />
      <div 
        className="flex-1 transition-all duration-300"
        style={{ marginLeft: sidebarWidth }}
      >
        <Header />
        <main className="flex-1 overflow-auto p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
