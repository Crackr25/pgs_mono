import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { 
  Home, 
  Search, 
  FileText, 
  ShoppingCart, 
  MessageSquare, 
  BarChart3, 
  User, 
  Settings, 
  HelpCircle,
  Package2,
  Users,
  Building,
  DollarSign
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../lib/api';

export default function BuyerSideBar({ isOpen, onClose }) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [companyData, setCompanyData] = useState(null);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchCompanyData();
    }
  }, [isAuthenticated, user]);

  const fetchCompanyData = async () => {
    try {
      // Mock company data - replace with actual API call
      setCompanyData({
        name: 'ABC Trading Corporation',
        subscription: 'Premium Buyer'
      });
    } catch (error) {
      console.error('Error fetching company data:', error);
      setCompanyData({
        name: user?.name || 'Your Company',
        subscription: 'Standard'
      });
    }
  };

  const navigation = [
    { name: 'Home', href: '/buyer', icon: Home },
    { name: 'Messages', href: '/buyer/messages', icon: MessageSquare },
    { name: 'My Quotes', href: '/buyer/quotes', icon: DollarSign },
    { name: 'Buying Leads', href: '/buyer/rfqs', icon: FileText },
    { name: 'Orders', href: '/buyer/orders', icon: ShoppingCart },
    { name: 'Transactions', href: '/buyer/transactions', icon: Package2 },
    { name: 'Contacts', href: '/buyer/contacts', icon: Users },
    { name: 'My Lists', href: '/buyer/lists', icon: BarChart3 },
    { name: 'Trade Services', href: '/buyer/services', icon: Building },
  ];

  const isActive = (href) => {
    if (href === '/buyer') {
      return router.pathname === '/buyer' || router.pathname === '/buyer/';
    }
    return router.pathname.startsWith(href);
  };

  const getCompanyInitial = () => {
    if (companyData?.name) {
      return companyData.name.charAt(0).toUpperCase();
    }
    if (user?.name) {
      return user.name.charAt(0).toUpperCase();
    }
    return 'B';
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-secondary-600 bg-opacity-75 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-screen lg:inset-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full min-h-screen">
          {/* Logo area */}
          <div className="flex items-center justify-center h-16 px-4 bg-white border-b border-secondary-200">
            <div className="flex items-center space-x-2">
              <img src="/pgs2.png" className="h-8 w-auto" alt="Pinoy Global Supply" />
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                Buyer
              </span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto min-h-0">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200
                    ${isActive(item.href)
                      ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-600'
                      : 'text-secondary-600 hover:bg-secondary-100 hover:text-secondary-900'
                    }
                  `}
                  onClick={() => {
                    if (window.innerWidth < 1024) {
                      onClose();
                    }
                  }}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Bottom section */}
          <div className="p-4 border-t border-secondary-200 mt-auto flex-shrink-0">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-blue-600">
                  {getCompanyInitial()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-secondary-900 truncate">
                  {companyData?.name || user?.name || 'Your Company'}
                </p>
                <p className="text-xs text-secondary-500 truncate">
                  {companyData?.subscription || 'Buyer Account'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
