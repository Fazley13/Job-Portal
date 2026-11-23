import React, { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <Navbar onMenuClick={() => setMenuOpen(true)} />
      <main className="min-h-screen min-w-0 overflow-x-hidden pt-16 lg:pl-64">{children}</main>
    </div>
  );
};

export default DashboardLayout;
