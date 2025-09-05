import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import { CartProvider } from '../../contexts/CartContext';
import NavBar from './NavBar';
import BuyerNavBar from './BuyerNavBar';
import BuyerGlobalTopNav from './BuyerGlobalTopNav';
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

  // Determine if this is a buyer page or buyer accessing chat
  const isBuyerUser = user?.usertype === 'buyer';
  const isBuyerPage = router.pathname.startsWith('/buyer') || (isBuyerUser && router.pathname === '/chat');
  const isBuyerDashboard = router.pathname === '/buyer';

  // Layout for buyer dashboard (home) - only global topnav, no sidenav
  if (isBuyerDashboard) {
    return (
      <CartProvider>
        <div className="min-h-screen bg-secondary-50">
          <BuyerGlobalTopNav />
          <main className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
          <Footer />
        </div>
      </CartProvider>
    );
  }

  // Layout for other buyer pages - both global topnav and sidenav
  if (isBuyerPage) {
    return (
      <CartProvider>
        <div className="min-h-screen bg-secondary-50">
          <BuyerGlobalTopNav />
          <div className="flex">
            <BuyerSideBar isOpen={sidebarOpen} onClose={closeSidebar} />
            <div className="flex-1 flex flex-col lg:ml-0">
              <main className="flex-1 p-4 sm:p-6 lg:p-8">
                <div className="max-w-7xl mx-auto">
                  {children}
                </div>
              </main>
            </div>
          </div>
          <Footer />
        </div>
      </CartProvider>
    );
  }

  // Layout for seller pages (existing functionality)
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
