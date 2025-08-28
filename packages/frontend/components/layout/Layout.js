import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import NavBar from './NavBar';
import BuyerNavBar from './BuyerNavBar';
import SideBar from './SideBar';
import BuyerSideBar from './BuyerSideBar';
import Footer from './Footer';

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();

  // Debug logging
  console.log('Layout Debug:', {
    pathname: router.pathname,
    isAuthenticated,
    user,
    usertype: user?.usertype
  });

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

  // Determine if this is a buyer page
  const isBuyerPage = router.pathname.startsWith('/buyer');

  // Layout for authenticated users with company data (with sidebar)
  return (
    <div className="min-h-screen bg-secondary-50 flex">
      {isBuyerPage ? (
        <BuyerSideBar isOpen={sidebarOpen} onClose={closeSidebar} />
      ) : (
        <SideBar isOpen={sidebarOpen} onClose={closeSidebar} />
      )}
      
      <div className="flex-1 flex flex-col lg:ml-0">
        {isBuyerPage ? (
          <BuyerNavBar onMenuToggle={toggleSidebar} isSidebarOpen={sidebarOpen} />
        ) : (
          <NavBar onMenuToggle={toggleSidebar} isSidebarOpen={sidebarOpen} />
        )}
        
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
