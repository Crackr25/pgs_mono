import { useState } from 'react';
import { useRouter } from 'next/router';
import { Bell, Search, User, Menu, X, MessageSquare } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../hooks/useLanguage';
import ChatNotificationBadge from '../chat/ChatNotificationBadge';


export default function NavBar({ onMenuToggle, isSidebarOpen }) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const { translate } = useLanguage();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    setIsProfileOpen(false);
    router.push('/login');
  };

  return (
    <nav className="bg-primary-600 shadow-sm border-b border-secondary-200 text-white">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <button
              onClick={onMenuToggle}
              className="p-2 rounded-md text-white hover:text-gray-200 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white lg:hidden"
            >
              {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
            
            <div className="flex-shrink-0 flex items-center ml-4 lg:ml-0 ">
              <h1 className="text-xl font-bold text-white">Pinoy Global Supply</h1>
            </div>
          </div>

          <div className="hidden md:flex items-center flex-1 max-w-lg mx-8">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-secondary-400" />
              </div>
              <input
                type="text"
                placeholder="Search products, orders, buyers..."
                className="block w-full pl-10 pr-3 py-2 border border-secondary-300 rounded-lg leading-5 bg-white placeholder-secondary-500 focus:outline-none focus:placeholder-secondary-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Chat Button */}
            {isAuthenticated && (
              <div className="relative">
                <button 
                  onClick={() => router.push('/chat')}
                  className="p-2 text-white hover:text-gray-200 hover:bg-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-white transition-colors"
                >
                  <MessageSquare className="h-6 w-6" />
                  <ChatNotificationBadge className="absolute -top-1 -right-1" />
                </button>
              </div>
            )}
            
            {/* Notification Bell */}
            {isAuthenticated && (
              <div className="relative">
                <button className="p-2 text-white hover:text-gray-200 hover:bg-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-white transition-colors">
                  <Bell className="h-6 w-6" />
                  {/* Notification Badge */}
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    3
                  </span>
                </button>
              </div>
            )}
            
            {isAuthenticated && (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 p-2 text-white hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-white rounded-lg"
                >
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-[#0046ad]" />
                  </div>
                  <span className="hidden sm:block text-sm font-medium">{user?.name}</span>
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                    <div className="py-1">
                      <button
                        onClick={() => {
                          router.push('/company-profile');
                          setIsProfileOpen(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Company Profile
                      </button>
                      <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        {translate('profile')}
                      </a>
                      <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        {translate('settings')}
                      </a>
                      <hr className="my-1" />
                      <button 
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        {translate('logout')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile search */}
      <div className="md:hidden px-4 pb-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-secondary-400" />
          </div>
          <input
            type="text"
            placeholder="Search..."
            className="block w-full pl-10 pr-3 py-2 border border-white rounded-lg leading-5 bg-white placeholder-secondary-500 focus:outline-none focus:placeholder-secondary-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </div>


    </nav>
  );
}
