import { useState } from 'react';
import AdminNavBar from './AdminNavBar';
import AdminSideBar from './AdminSideBar';

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-secondary-50 flex">
      <AdminSideBar isOpen={sidebarOpen} onClose={closeSidebar} />
      
      <div className="flex-1 flex flex-col lg:ml-0">
        <AdminNavBar onMenuToggle={toggleSidebar} isSidebarOpen={sidebarOpen} />
        
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
        
        {/* Admin Footer */}
        <footer className="bg-white border-t border-secondary-200 py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-secondary-600">
              <div className="mb-2 sm:mb-0">
                © 2024 Pinoy Global Supply. All rights reserved.
              </div>
              <div className="flex space-x-4">
                <span className="font-medium text-primary-600">Admin Panel v1.0</span>
                <span>•</span>
                <a href="#" className="hover:text-primary-600 transition-colors">Documentation</a>
                <span>•</span>
                <a href="#" className="hover:text-primary-600 transition-colors">Support</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
