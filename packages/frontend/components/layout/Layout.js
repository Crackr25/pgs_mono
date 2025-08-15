import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import NavBar from './NavBar';
import SideBar from './SideBar';
import Footer from './Footer';

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  // Layout for unauthenticated users (login page)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-secondary-50">
        {children}
      </div>
    );
  }

  // Layout for onboarding page (authenticated but no sidenav)
  if (router.pathname === '/onboarding') {
    return (
      <div className="min-h-screen bg-secondary-50">
        <main className="p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    );
  }

  // Layout for authenticated users with company data (with sidebar)
  return (
    <div className="min-h-screen bg-secondary-50 flex">
      <SideBar isOpen={sidebarOpen} onClose={closeSidebar} />
      
      <div className="flex-1 flex flex-col lg:ml-0">
        <NavBar onMenuToggle={toggleSidebar} isSidebarOpen={sidebarOpen} />
        
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
        
        <Footer />
      </div>
    </div>
  );
}
