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
import ProminentSearchBar from '../common/ProminentSearchBar';

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

  // Layout for unauthenticated users
  // Only use minimal layout for login page, not for buyer pages
  if (!isAuthenticated && router.pathname === '/login') {
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
  // Updated to work for both authenticated and unauthenticated users
  const isBuyerUser = user?.usertype === 'buyer';
  const isBuyerPage = router.pathname.startsWith('/buyer') || (isBuyerUser && router.pathname === '/chat');
  const isBuyerDashboard = router.pathname === '/buyer';
  
  // For unauthenticated users, treat all /buyer routes as buyer pages
  const isUnauthenticatedBuyerPage = !isAuthenticated && router.pathname.startsWith('/buyer');
  
  // Determine when to show the prominent search bar (Alibaba-style)
  // Show on main buyer pages but not on detail pages, forms, or specific functionality pages
  const shouldShowProminentSearch = (isBuyerPage || isUnauthenticatedBuyerPage) && (
    router.pathname === '/buyer' || // Homepage
    router.pathname === '/buyer/search' || // Search results page
    router.pathname === '/buyer/suppliers' || // Suppliers listing
    router.pathname.startsWith('/buyer/products') && router.pathname === '/buyer/products' // Products listing (not detail)
  );

  // Layout for buyer dashboard (home) - only global topnav, no sidenav
  // Works for both authenticated and unauthenticated users
  // Includes prominent Alibaba-style search bar when appropriate
  if (isBuyerDashboard || (isUnauthenticatedBuyerPage && router.pathname === '/buyer')) {
    return (
      <CartProvider>
        <div className="min-h-screen bg-secondary-50">
          <BuyerGlobalTopNav />
          {/* Prominent Search Bar - Alibaba Style (only on homepage) */}
          {shouldShowProminentSearch && <ProminentSearchBar />}
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
  // Works for both authenticated and unauthenticated users
  // Includes prominent Alibaba-style search bar when appropriate
  if (isBuyerPage || isUnauthenticatedBuyerPage) {
    return (
      <CartProvider>
        <div className="min-h-screen bg-secondary-50">
          <BuyerGlobalTopNav />
          {/* Prominent Search Bar - Alibaba Style (on main listing pages) */}
          {shouldShowProminentSearch && <ProminentSearchBar />}
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
