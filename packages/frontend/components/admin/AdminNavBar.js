import { useState } from 'react';
import { useRouter } from 'next/router';
import { Bell, Search, User, Menu, X, Shield, LogOut, Settings as SettingsIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function AdminNavBar({ onMenuToggle, isSidebarOpen }) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    setIsProfileOpen(false);
    router.push('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/admin/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Mock notifications - replace with real data
  const notifications = [
    { id: 1, title: 'New company verification pending', time: '5 min ago', unread: true },
    { id: 2, title: 'Payout request approved', time: '1 hour ago', unread: true },
    { id: 3, title: 'System backup completed', time: '2 hours ago', unread: false }
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <nav className="bg-white shadow-sm border-b border-secondary-200 sticky top-0 z-30">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <button
              onClick={onMenuToggle}
              className="p-2 rounded-md text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 lg:hidden"
            >
              {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
            
            <div className="flex-shrink-0 flex items-center ml-4 lg:ml-0">
              <h1 className="text-xl font-bold text-secondary-900">
                Admin Dashboard
              </h1>
            </div>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex items-center flex-1 max-w-2xl mx-8">
            <form onSubmit={handleSearch} className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-secondary-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users, companies, orders, products..."
                className="block w-full pl-10 pr-3 py-2 border border-secondary-300 rounded-lg leading-5 bg-white placeholder-secondary-500 focus:outline-none focus:placeholder-secondary-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-secondary-900"
              />
            </form>
          </div>

          <div className="flex items-center space-x-4">
            {/* Admin Badge */}
            <div className="hidden md:flex items-center bg-gradient-to-r from-red-500 to-red-600 px-3 py-1 rounded-full shadow-sm">
              <Shield className="w-4 h-4 text-white mr-1.5" />
              <span className="text-xs font-bold text-white">
                ADMIN
              </span>
            </div>
            
            {/* Notification Bell */}
            <div className="relative">
              <button className="p-2 text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors relative">
                <Bell className="h-6 w-6" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>
            
            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-3 p-2 text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-lg transition-colors"
              >
                <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center shadow-md">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-sm font-bold text-secondary-900">{user?.name}</div>
                  <div className="text-xs text-primary-600 font-medium">Super Admin</div>
                </div>
              </button>

              {isProfileOpen && (
                <>
                  {/* Backdrop */}
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsProfileOpen(false)}
                  />
                  
                  {/* Dropdown Menu */}
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl ring-1 ring-black ring-opacity-5 z-50 overflow-hidden">
                    {/* User Info Header */}
                    <div className="px-4 py-3 bg-gradient-to-r from-primary-50 to-blue-50 border-b border-secondary-200">
                      <p className="text-sm font-bold text-secondary-900">{user?.name}</p>
                      <p className="text-xs text-secondary-600">{user?.email}</p>
                      <div className="mt-2 inline-flex items-center px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">
                        <Shield className="w-3 h-3 mr-1" />
                        Administrator
                      </div>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          router.push('/admin/profile');
                          setIsProfileOpen(false);
                        }}
                        className="flex items-center w-full text-left px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50 transition-colors"
                      >
                        <User className="w-4 h-4 mr-3 text-secondary-500" />
                        My Profile
                      </button>
                      
                      <button
                        onClick={() => {
                          router.push('/admin/settings');
                          setIsProfileOpen(false);
                        }}
                        className="flex items-center w-full text-left px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50 transition-colors"
                      >
                        <SettingsIcon className="w-4 h-4 mr-3 text-secondary-500" />
                        Settings
                      </button>

                      <hr className="my-1 border-secondary-200" />
                      
                      <button 
                        onClick={handleLogout}
                        className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        Logout
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile search */}
      <div className="md:hidden px-4 pb-3 border-t border-secondary-200">
        <form onSubmit={handleSearch} className="relative mt-3">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-secondary-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search..."
            className="block w-full pl-10 pr-3 py-2 border border-secondary-300 rounded-lg leading-5 bg-white placeholder-secondary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </form>
      </div>
    </nav>
  );
}
