import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { 
  Menu, 
  X, 
  Bell, 
  Search, 
  User, 
  LogOut, 
  Settings,
  Building,
  MessageSquare,
  Plus,
  ShoppingCart
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import apiService from '../../lib/api';

export default function BuyerNavBar({ onMenuToggle, isSidebarOpen }) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      // Mock notifications for buyers - replace with actual API
      const mockNotifications = [
        {
          id: 1,
          type: 'quote_received',
          title: 'New Quote Received',
          message: 'Manila Manufacturing Corp sent you a quote for LED Light Fixtures',
          time: '2 minutes ago',
          read: false
        },
        {
          id: 2,
          type: 'rfq_response',
          title: 'RFQ Response',
          message: '3 new responses to your Industrial Pumps RFQ',
          time: '1 hour ago',
          read: false
        },
        {
          id: 3,
          type: 'order_update',
          title: 'Order Shipped',
          message: 'Your order ORD-2024-002 has been shipped',
          time: '3 hours ago',
          read: true
        },
        {
          id: 4,
          type: 'message',
          title: 'New Message',
          message: 'Cebu Industrial Solutions sent you a message',
          time: '5 hours ago',
          read: false
        }
      ];

      setNotifications(mockNotifications);
      setUnreadCount(mockNotifications.filter(n => !n.read).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const markAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'quote_received':
      case 'rfq_response':
        return '💰';
      case 'order_update':
        return '📦';
      case 'message':
        return '💬';
      default:
        return '🔔';
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b border-secondary-200">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side */}
          <div className="flex items-center space-x-4">
            <button
              onClick={onMenuToggle}
              className="lg:hidden p-2 rounded-md text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {isSidebarOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>

            {/* Breadcrumb */}
            <div className="hidden sm:flex items-center space-x-2 text-sm">
              <Link href="/buyer" className="text-secondary-500 hover:text-secondary-700">
                Buyer Portal
              </Link>
              {router.pathname !== '/buyer' && (
                <>
                  <span className="text-secondary-400">/</span>
                  <span className="text-secondary-900 font-medium">
                    {router.pathname.includes('/suppliers') && 'Suppliers'}
                    {router.pathname.includes('/rfqs') && 'RFQs'}
                    {router.pathname.includes('/quotes') && 'Quotes'}
                    {router.pathname.includes('/orders') && 'Orders'}
                    {router.pathname.includes('/messages') && 'Messages'}
                    {router.pathname.includes('/profile') && 'Profile'}
                    {router.pathname.includes('/analytics') && 'Analytics'}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Center - Quick Actions */}
          <div className="hidden lg:flex items-center space-x-3">
            <Link href="/buyer/rfqs/create">
              <button className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors">
                <Plus className="w-4 h-4" />
                <span>Create RFQ</span>
              </button>
            </Link>
            
            <Link href="/buyer/suppliers">
              <button className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-secondary-700 bg-secondary-100 rounded-lg hover:bg-secondary-200 transition-colors">
                <Search className="w-4 h-4" />
                <span>Find Suppliers</span>
              </button>
            </Link>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-2 md:space-x-4">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 relative"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-secondary-200 z-50">
                  <div className="p-4 border-b border-secondary-200">
                    <h3 className="text-sm font-medium text-secondary-900">Notifications</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-4 border-b border-secondary-100 hover:bg-secondary-50 cursor-pointer ${
                            !notification.read ? 'bg-blue-50' : ''
                          }`}
                          onClick={() => markAsRead(notification.id)}
                        >
                          <div className="flex items-start space-x-3">
                            <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-secondary-900">
                                {notification.title}
                              </p>
                              <p className="text-sm text-secondary-600 mt-1">
                                {notification.message}
                              </p>
                              <p className="text-xs text-secondary-500 mt-1">
                                {notification.time}
                              </p>
                            </div>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-secondary-500">
                        No notifications
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Cart */}
            <Link href="/buyer/cart">
              <button className="p-2 text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 relative">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-primary-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </button>
            </Link>

            {/* Messages */}
            <Link href="/buyer/messages">
              <button className="p-2 text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                <MessageSquare className="h-5 w-5" />
              </button>
            </Link>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 p-2 text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <div className="w-7 h-7 md:w-8 md:h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-xs md:text-sm font-medium text-blue-600">
                    {user?.name?.charAt(0)?.toUpperCase() || 'B'}
                  </span>
                </div>
                <span className="hidden md:block text-sm font-medium text-secondary-900">
                  {user?.name || 'Buyer'}
                </span>
              </button>

              {/* User Dropdown */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-secondary-200 z-50">
                  <div className="p-4 border-b border-secondary-200">
                    <p className="text-sm font-medium text-secondary-900">
                      {user?.name || 'Buyer Account'}
                    </p>
                    <p className="text-xs text-secondary-500">
                      {user?.email || 'buyer@company.com'}
                    </p>
                  </div>
                  
                  <div className="py-2">
                    <Link href="/buyer/profile">
                      <button className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-100">
                        <Building className="w-4 h-4" />
                        <span>Company Profile</span>
                      </button>
                    </Link>
                    
                    <Link href="/buyer/settings">
                      <button className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-100">
                        <Settings className="w-4 h-4" />
                        <span>Settings</span>
                      </button>
                    </Link>
                    
                    <div className="border-t border-secondary-200 mt-2 pt-2">
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Click outside to close dropdowns */}
      {(showUserMenu || showNotifications) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowUserMenu(false);
            setShowNotifications(false);
          }}
        />
      )}
    </nav>
  );
}
