import Link from 'next/link';
import { useRouter } from 'next/router';
import { 
  Home, 
  Package, 
  FileText, 
  ShoppingCart, 
  MessageSquare, 
  BarChart3, 
  CreditCard, 
  Settings, 
  HelpCircle, 
  Star,
  UserCheck
} from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';

export default function SideBar({ isOpen, onClose }) {
  const router = useRouter();
  const { translate } = useLanguage();

  const navigation = [
    { name: translate('dashboard'), href: '/', icon: Home },
    { name: translate('products'), href: '/products', icon: Package },
    { name: translate('quotes'), href: '/quotes', icon: FileText },
    { name: translate('orders'), href: '/orders', icon: ShoppingCart },
    { name: translate('messages'), href: '/chat', icon: MessageSquare },
    { name: translate('analytics'), href: '/analytics', icon: BarChart3 },
    { name: translate('payments'), href: '/payments', icon: CreditCard },
    { name: translate('tools'), href: '/tools', icon: Settings },
    { name: translate('support'), href: '/support', icon: HelpCircle },
    { name: translate('reputation'), href: '/reputation', icon: Star },
  ];

  const isActive = (href) => {
    if (href === '/') {
      return router.pathname === '/';
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
        <div className="flex flex-col h-full">
          {/* Logo area */}
          <div className="flex items-center justify-center h-16 px-4 bg-white">
            <img src="/pgs2.png" className="h-8 w-auto" alt="Pinoy Global Supply" />
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

          {/* Bottom section */}
          <div className="p-4 border-t border-secondary-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-primary-600">JD</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-secondary-900 truncate">
                  Manila Manufacturing Corp
                </p>
                <p className="text-xs text-secondary-500 truncate">
                  Premium Account
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
