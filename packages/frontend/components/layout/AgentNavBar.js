import { useState } from 'react';
import { useRouter } from 'next/router';
import { Bell, User, Menu, X, MessageSquare, LogOut, Settings as SettingsIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import ChatNotificationBadge from '../chat/ChatNotificationBadge';
import NotificationBell from '../wall-feed/NotificationBell';

export default function AgentNavBar({ onMenuToggle, isSidebarOpen }) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    setIsProfileOpen(false);
    router.push('/login');
  };

  return (
    <nav className="bg-white shadow-sm border-b border-secondary-200 sticky top-0 z-30">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left side - Menu button and title */}
          <div className="flex items-center">
            <button
              onClick={onMenuToggle}
              className="lg:hidden p-2 rounded-md text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
            >
              {isSidebarOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
            
            <div className="ml-4 lg:ml-0">
              <h1 className="text-lg font-semibold text-secondary-900">
                Agent Portal
              </h1>
              {user?.active_company && (
                <p className="text-xs text-secondary-600 hidden sm:block">
                  {user.active_company.name}
                </p>
              )}
            </div>
          </div>

          {/* Right side - Chat and Profile */}
          <div className="flex items-center space-x-4">
            {/* Company Badge */}
            {user?.active_company && (
              <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 bg-blue-50 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-blue-900">
                  {user.active_company.name}
                </span>
              </div>
            )}

            {/* Chat Button with Notification Badge */}
            <button
              onClick={() => router.push('/chat')}
              className="relative p-2 text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100 rounded-full transition-colors duration-200"
            >
              <MessageSquare className="h-6 w-6" />
              <ChatNotificationBadge />
            </button>

            {/* Notifications */}
            <NotificationBell variant="light" />

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-secondary-100 transition-colors duration-200"
              >
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-blue-600">
                    {user?.name?.charAt(0).toUpperCase() || 'A'}
                  </span>
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-secondary-900">
                    {user?.name || 'Agent'}
                  </p>
                  <p className="text-xs text-secondary-500">Agent</p>
                </div>
              </button>

              {/* Dropdown Menu */}
              {isProfileOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsProfileOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-secondary-200 py-1 z-20">
                    <div className="px-4 py-3 border-b border-secondary-200">
                      <p className="text-sm font-medium text-secondary-900">
                        {user?.name}
                      </p>
                      <p className="text-xs text-secondary-500 mt-1">
                        {user?.email}
                      </p>
                      <p className="text-xs text-blue-600 mt-1 font-medium">
                        Agent Account
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        router.push('/profile');
                        setIsProfileOpen(false);
                      }}
                      className="w-full flex items-center px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-100"
                    >
                      <User className="w-4 h-4 mr-3" />
                      Profile
                    </button>

                    <button
                      onClick={() => {
                        router.push('/settings');
                        setIsProfileOpen(false);
                      }}
                      className="w-full flex items-center px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-100"
                    >
                      <SettingsIcon className="w-4 h-4 mr-3" />
                      Settings
                    </button>

                    <div className="border-t border-secondary-200 my-1"></div>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
