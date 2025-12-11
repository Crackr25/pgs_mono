import Link from 'next/link';
import { useRouter } from 'next/router';
import { 
  MessageSquare, 
  Home,
  HelpCircle,
  Users
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function AgentSideBar({ isOpen, onClose }) {
  const router = useRouter();
  const { user } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/agent/dashboard', icon: Home },
    { name: 'Wall Feed', href: '/agent/wall-feed', icon: Users },
    { name: 'Messages', href: '/chat', icon: MessageSquare },
    { name: 'Help', href: '/support', icon: HelpCircle },
  ];

  const isActive = (href) => {
    if (href === '/agent/dashboard') {
      return router.pathname === '/agent/dashboard';
    }
    return router.pathname.startsWith(href);
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
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-screen">
          {/* Logo area */}
          <div className="flex items-center justify-center h-16 px-4 bg-white border-b border-secondary-200 flex-shrink-0">
            <img src="/pgs2.png" className="h-8 w-auto" alt="Pinoy Global Supply" />
          </div>

          {/* Agent Badge */}
          <div className="px-4 py-3 bg-blue-50 border-b border-blue-100 flex-shrink-0">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-blue-900">Agent Portal</span>
            </div>
            <p className="text-xs text-blue-700 mt-1">
              {user?.active_company?.name || 'Company Agent'}
            </p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
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

          {/* Bottom section - Agent Info - Sticky to bottom */}
          <div className="p-4 border-t border-secondary-200 bg-white flex-shrink-0 mt-auto">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-blue-600">
                  {user?.name?.charAt(0).toUpperCase() || 'A'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-secondary-900 truncate">
                  {user?.name || 'Agent'}
                </p>
                <p className="text-xs text-secondary-500 truncate">
                  Agent Account
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
