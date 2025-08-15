import { useState } from 'react'
import { MagnifyingGlassIcon, BellIcon, ChatBubbleLeftRightIcon, LanguageIcon, ChevronDownIcon } from '@heroicons/react/24/outline'

export default function Navbar({ setSidebarOpen }) {
  const [languageOpen, setLanguageOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left side - Search */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search products, suppliers..." 
                className="w-96 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>
          
          {/* Right side - User menu and language switcher */}
          <div className="flex items-center space-x-4">
            {/* Language Switcher */}
            <div className="relative">
              <button 
                onClick={() => setLanguageOpen(!languageOpen)}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              >
                <LanguageIcon className="h-5 w-5" />
                <span className="text-sm">EN</span>
                <ChevronDownIcon className="h-4 w-4" />
              </button>
              
              {languageOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">🇺🇸 English</a>
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">🇵🇭 Tagalog</a>
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">🇨🇳 Chinese</a>
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">🇪🇸 Spanish</a>
                </div>
              )}
            </div>
            
            {/* Notifications */}
            <button className="relative p-2 text-gray-600 hover:text-gray-900">
              <BellIcon className="h-6 w-6" />
              <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400"></span>
            </button>
            
            {/* Messages */}
            <button className="relative p-2 text-gray-600 hover:text-gray-900">
              <ChatBubbleLeftRightIcon className="h-6 w-6" />
              <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-green-400"></span>
            </button>
            
            {/* User Profile Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center space-x-3 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <img 
                  className="h-8 w-8 rounded-full" 
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
                  alt=""
                />
                <div className="text-left">
                  <div className="font-medium text-gray-900">John Manufacturing Co.</div>
                  <div className="text-xs text-gray-500">Verified Supplier</div>
                </div>
                <ChevronDownIcon className="h-4 w-4 text-gray-400" />
              </button>
              
              {profileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Profile Settings</a>
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Company Info</a>
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Subscription</a>
                  <div className="border-t border-gray-100"></div>
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Sign out</a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
