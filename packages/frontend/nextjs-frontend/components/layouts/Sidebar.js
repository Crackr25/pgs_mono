import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { 
  HomeIcon, 
  CheckCircleIcon, 
  CubeIcon, 
  ClipboardDocumentListIcon,
  ChatBubbleLeftRightIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  WrenchScrewdriverIcon,
  LifebuoyIcon,
  ShieldCheckIcon,
  ChevronDownIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline'

export default function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const router = useRouter()
  const [openMenus, setOpenMenus] = useState({})

  const toggleMenu = (menu) => {
    setOpenMenus(prev => ({
      ...prev,
      [menu]: !prev[menu]
    }))
  }

  const isActive = (path) => router.pathname === path
  const isMenuActive = (paths) => paths.some(path => router.pathname.startsWith(path))

  return (
    <aside className="w-64 bg-white shadow-sm border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <UserGroupIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">SupplierHub</h1>
            <p className="text-xs text-gray-500">Manufacturer Portal</p>
          </div>
        </div>
      </div>
      
      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-2">
        {/* Dashboard */}
        <Link href="/" className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 ${isActive('/') ? 'bg-blue-50 text-blue-700' : ''}`}>
          <HomeIcon className="w-5 h-5" />
          <span className="font-medium">Dashboard</span>
        </Link>
        
        {/* Onboarding & Verification */}
        <div>
          <button 
            onClick={() => toggleMenu('onboarding')}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100"
          >
            <div className="flex items-center space-x-3">
              <CheckCircleIcon className="w-5 h-5" />
              <span className="font-medium">Onboarding</span>
            </div>
            <ChevronDownIcon className={`w-4 h-4 transition-transform ${openMenus.onboarding ? 'rotate-180' : ''}`} />
          </button>
          {openMenus.onboarding && (
            <div className="ml-8 mt-2 space-y-1">
              <Link href="/onboarding/company-profile" className="block px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded">
                Company Profile
              </Link>
              <Link href="/onboarding/document-upload" className="block px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded">
                Document Upload
              </Link>
              <Link href="/onboarding/kyc-upload" className="block px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded">
                KYC Upload
              </Link>
              <Link href="/onboarding/factory-tour" className="block px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded">
                Factory Tour
              </Link>
            </div>
          )}
        </div>
        
        {/* Product Management */}
        <div>
          <button 
            onClick={() => toggleMenu('products')}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100"
          >
            <div className="flex items-center space-x-3">
              <CubeIcon className="w-5 h-5" />
              <span className="font-medium">Products</span>
            </div>
            <ChevronDownIcon className={`w-4 h-4 transition-transform ${openMenus.products ? 'rotate-180' : ''}`} />
          </button>
          {openMenus.products && (
            <div className="ml-8 mt-2 space-y-1">
              <Link href="/products" className="block px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded">
                Dashboard
              </Link>
              <Link href="/products/create" className="block px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded">
                Add Product
              </Link>
              <Link href="/products/bulk-upload" className="block px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded">
                Bulk Upload
              </Link>
            </div>
          )}
        </div>
        
        {/* Orders & Quotes */}
        <div>
          <button 
            onClick={() => toggleMenu('orders')}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100"
          >
            <div className="flex items-center space-x-3">
              <ClipboardDocumentListIcon className="w-5 h-5" />
              <span className="font-medium">Orders & Quotes</span>
            </div>
            <ChevronDownIcon className={`w-4 h-4 transition-transform ${openMenus.orders ? 'rotate-180' : ''}`} />
          </button>
          {openMenus.orders && (
            <div className="ml-8 mt-2 space-y-1">
              <Link href="/orders/quotes" className="block px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded">
                Quotes Dashboard
              </Link>
              <Link href="/orders/auto-reply" className="block px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded">
                Auto-Reply Templates
              </Link>
              <Link href="/orders/tracking" className="block px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded">
                Order Tracking
              </Link>
              <Link href="/orders/payments" className="block px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded">
                Payment Status
              </Link>
            </div>
          )}
        </div>
        
        {/* Messaging */}
        <Link href="/messaging" className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 ${isActive('/messaging') ? 'bg-blue-50 text-blue-700' : ''}`}>
          <ChatBubbleLeftRightIcon className="w-5 h-5" />
          <span className="font-medium">Messages</span>
          <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">3</span>
        </Link>
        
        {/* Analytics */}
        <Link href="/analytics" className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 ${isActive('/analytics') ? 'bg-blue-50 text-blue-700' : ''}`}>
          <ChartBarIcon className="w-5 h-5" />
          <span className="font-medium">Analytics</span>
        </Link>
        
        {/* Payments & Fees */}
        <div>
          <button 
            onClick={() => toggleMenu('payments')}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100"
          >
            <div className="flex items-center space-x-3">
              <CurrencyDollarIcon className="w-5 h-5" />
              <span className="font-medium">Payments</span>
            </div>
            <ChevronDownIcon className={`w-4 h-4 transition-transform ${openMenus.payments ? 'rotate-180' : ''}`} />
          </button>
          {openMenus.payments && (
            <div className="ml-8 mt-2 space-y-1">
              <Link href="/payments/commission" className="block px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded">
                Commission Tracker
              </Link>
              <Link href="/payments/settings" className="block px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded">
                Payout Settings
              </Link>
              <Link href="/payments/receipts" className="block px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded">
                Tax Receipts
              </Link>
            </div>
          )}
        </div>
        
        {/* Integrations & Tools */}
        <div>
          <button 
            onClick={() => toggleMenu('integrations')}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100"
          >
            <div className="flex items-center space-x-3">
              <WrenchScrewdriverIcon className="w-5 h-5" />
              <span className="font-medium">Tools</span>
            </div>
            <ChevronDownIcon className={`w-4 h-4 transition-transform ${openMenus.integrations ? 'rotate-180' : ''}`} />
          </button>
          {openMenus.integrations && (
            <div className="ml-8 mt-2 space-y-1">
              <Link href="/integrations/shipping" className="block px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded">
                Shipping Calculator
              </Link>
              <Link href="/integrations/logistics" className="block px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded">
                Logistics API
              </Link>
              <Link href="/integrations/samples" className="block px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded">
                Sample Requests
              </Link>
              <Link href="/integrations/compliance" className="block px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded">
                AI Compliance
              </Link>
            </div>
          )}
        </div>
        
        {/* Support & Education */}
        <div>
          <button 
            onClick={() => toggleMenu('support')}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100"
          >
            <div className="flex items-center space-x-3">
              <LifebuoyIcon className="w-5 h-5" />
              <span className="font-medium">Support</span>
            </div>
            <ChevronDownIcon className={`w-4 h-4 transition-transform ${openMenus.support ? 'rotate-180' : ''}`} />
          </button>
          {openMenus.support && (
            <div className="ml-8 mt-2 space-y-1">
              <Link href="/support/knowledge" className="block px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded">
                Knowledge Center
              </Link>
              <Link href="/support/webinars" className="block px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded">
                Webinars
              </Link>
              <Link href="/support/manager" className="block px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded">
                Account Manager
              </Link>
            </div>
          )}
        </div>
        
        {/* Trust & Reputation */}
        <div>
          <button 
            onClick={() => toggleMenu('trust')}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100"
          >
            <div className="flex items-center space-x-3">
              <ShieldCheckIcon className="w-5 h-5" />
              <span className="font-medium">Trust & Reputation</span>
            </div>
            <ChevronDownIcon className={`w-4 h-4 transition-transform ${openMenus.trust ? 'rotate-180' : ''}`} />
          </button>
          {openMenus.trust && (
            <div className="ml-8 mt-2 space-y-1">
              <Link href="/trust/verification" className="block px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded">
                Verification Status
              </Link>
              <Link href="/trust/reviews" className="block px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded">
                Reviews & Ratings
              </Link>
              <Link href="/trust/performance" className="block px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded">
                Performance Metrics
              </Link>
            </div>
          )}
        </div>
      </nav>
      
      {/* Bottom Section */}
      <div className="p-4 border-t border-gray-200">
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-sm font-medium text-gray-900">Premium Plan</span>
          </div>
          <p className="text-xs text-gray-600 mt-1">30 days remaining</p>
          <button className="w-full mt-2 bg-blue-600 text-white text-xs py-1 px-2 rounded hover:bg-blue-700">
            Upgrade Now
          </button>
        </div>
      </div>
    </aside>
  )
}
