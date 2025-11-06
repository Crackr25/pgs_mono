<aside class="w-64 bg-white shadow-sm border-r border-gray-200 flex flex-col">
    <!-- Logo -->
    <div class="p-6 border-b border-gray-200">
        <div class="flex items-center space-x-3">
            <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"></path>
                </svg>
            </div>
            <div>
                <h1 class="text-xl font-bold text-gray-900">SupplierHub</h1>
                <p class="text-xs text-gray-500">Manufacturer Portal</p>
            </div>
        </div>
    </div>
    
    <!-- Navigation Menu -->
    <nav class="flex-1 p-4 space-y-2">
        <!-- Dashboard -->
        <a href="{{ route('dashboard') }}" class="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 {{ request()->routeIs('dashboard') ? 'bg-blue-50 text-blue-700' : '' }}">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"></path>
            </svg>
            <span class="font-medium">Dashboard</span>
        </a>
        
        <!-- Onboarding & Verification -->
        <div x-data="{ open: {{ request()->routeIs('onboarding.*') ? 'true' : 'false' }} }">
            <button @click="open = !open" class="w-full flex items-center justify-between px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100">
                <div class="flex items-center space-x-3">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <span class="font-medium">Onboarding</span>
                </div>
                <svg class="w-4 h-4 transition-transform" :class="{ 'rotate-180': open }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                </svg>
            </button>
            <div x-show="open" x-cloak class="ml-8 mt-2 space-y-1">
                <a href="{{ route('onboarding.company-profile') }}" class="block px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded">Company Profile</a>
                <a href="{{ route('onboarding.document-upload') }}" class="block px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded">Document Upload</a>
                <a href="{{ route('onboarding.kyc-upload') }}" class="block px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded">KYC Upload</a>
                <a href="{{ route('onboarding.factory-tour') }}" class="block px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded">Factory Tour</a>
            </div>
        </div>
        
        <!-- Product Management -->
        <div x-data="{ open: {{ request()->routeIs('products.*') ? 'true' : 'false' }} }">
            <button @click="open = !open" class="w-full flex items-center justify-between px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100">
                <div class="flex items-center space-x-3">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                    </svg>
                    <span class="font-medium">Products</span>
                </div>
                <svg class="w-4 h-4 transition-transform" :class="{ 'rotate-180': open }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                </svg>
            </button>
            <div x-show="open" x-cloak class="ml-8 mt-2 space-y-1">
                <a href="{{ route('products.dashboard') }}" class="block px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded">Dashboard</a>
                <a href="{{ route('products.create') }}" class="block px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded">Add Product</a>
                <a href="{{ route('products.bulk-upload') }}" class="block px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded">Bulk Upload</a>
            </div>
        </div>
        
        <!-- Orders & Quotes -->
        <div x-data="{ open: {{ request()->routeIs('orders.*') ? 'true' : 'false' }} }">
            <button @click="open = !open" class="w-full flex items-center justify-between px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100">
                <div class="flex items-center space-x-3">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                    </svg>
                    <span class="font-medium">Orders & Quotes</span>
                </div>
                <svg class="w-4 h-4 transition-transform" :class="{ 'rotate-180': open }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                </svg>
            </button>
            <div x-show="open" x-cloak class="ml-8 mt-2 space-y-1">
                <a href="{{ route('orders.quotes-dashboard') }}" class="block px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded">Quotes Dashboard</a>
                <a href="{{ route('orders.auto-reply') }}" class="block px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded">Auto-Reply Templates</a>
                <a href="{{ route('orders.order-tracking') }}" class="block px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded">Order Tracking</a>
                <a href="{{ route('orders.payment-status') }}" class="block px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded">Payment Status</a>
            </div>
        </div>
        
        <!-- Messaging -->
        <a href="{{ route('messaging.chat') }}" class="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 {{ request()->routeIs('messaging.*') ? 'bg-blue-50 text-blue-700' : '' }}">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
            </svg>
            <span class="font-medium">Messages</span>
            <span class="bg-red-500 text-white text-xs rounded-full px-2 py-1">3</span>
        </a>
        
        <!-- Analytics -->
        <a href="{{ route('analytics.dashboard') }}" class="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 {{ request()->routeIs('analytics.*') ? 'bg-blue-50 text-blue-700' : '' }}">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
            </svg>
            <span class="font-medium">Analytics</span>
        </a>
        
        <!-- Payments & Fees -->
        <div x-data="{ open: {{ request()->routeIs('payments.*') ? 'true' : 'false' }} }">
            <button @click="open = !open" class="w-full flex items-center justify-between px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100">
                <div class="flex items-center space-x-3">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                    </svg>
                    <span class="font-medium">Payments</span>
                </div>
                <svg class="w-4 h-4 transition-transform" :class="{ 'rotate-180': open }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                </svg>
            </button>
            <div x-show="open" x-cloak class="ml-8 mt-2 space-y-1">
                <a href="{{ route('payments.commission-tracker') }}" class="block px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded">Commission Tracker</a>
                <a href="{{ route('payments.payout-settings') }}" class="block px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded">Payout Settings</a>
                <a href="{{ route('payments.tax-receipts') }}" class="block px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded">Tax Receipts</a>
            </div>
        </div>
        
        <!-- Integrations & Tools -->
        <div x-data="{ open: {{ request()->routeIs('integrations.*') ? 'true' : 'false' }} }">
            <button @click="open = !open" class="w-full flex items-center justify-between px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100">
                <div class="flex items-center space-x-3">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path>
                    </svg>
                    <span class="font-medium">Tools</span>
                </div>
                <svg class="w-4 h-4 transition-transform" :class="{ 'rotate-180': open }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                </svg>
            </button>
            <div x-show="open" x-cloak class="ml-8 mt-2 space-y-1">
                <a href="{{ route('integrations.shipping-calculator') }}" class="block px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded">Shipping Calculator</a>
                <a href="{{ route('integrations.logistics') }}" class="block px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded">Logistics API</a>
                <a href="{{ route('integrations.sample-requests') }}" class="block px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded">Sample Requests</a>
                <a href="{{ route('integrations.compliance') }}" class="block px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded">AI Compliance</a>
            </div>
        </div>
        
        <!-- Support & Education -->
        <div x-data="{ open: {{ request()->routeIs('support.*') ? 'true' : 'false' }} }">
            <button @click="open = !open" class="w-full flex items-center justify-between px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100">
                <div class="flex items-center space-x-3">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"></path>
                    </svg>
                    <span class="font-medium">Support</span>
                </div>
                <svg class="w-4 h-4 transition-transform" :class="{ 'rotate-180': open }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                </svg>
            </button>
            <div x-show="open" x-cloak class="ml-8 mt-2 space-y-1">
                <a href="{{ route('support.knowledge-center') }}" class="block px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded">Knowledge Center</a>
                <a href="{{ route('support.webinars') }}" class="block px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded">Webinars</a>
                <a href="{{ route('support.account-manager') }}" class="block px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded">Account Manager</a>
            </div>
        </div>
        
        <!-- Trust & Reputation -->
        <div x-data="{ open: {{ request()->routeIs('trust.*') ? 'true' : 'false' }} }">
            <button @click="open = !open" class="w-full flex items-center justify-between px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100">
                <div class="flex items-center space-x-3">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                    </svg>
                    <span class="font-medium">Trust & Reputation</span>
                </div>
                <svg class="w-4 h-4 transition-transform" :class="{ 'rotate-180': open }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                </svg>
            </button>
            <div x-show="open" x-cloak class="ml-8 mt-2 space-y-1">
                <a href="{{ route('trust.verification') }}" class="block px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded">Verification Status</a>
                <a href="{{ route('trust.reviews') }}" class="block px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded">Reviews & Ratings</a>
                <a href="{{ route('trust.performance') }}" class="block px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded">Performance Metrics</a>
            </div>
        </div>
    </nav>
    
    <!-- Bottom Section -->
    <div class="p-4 border-t border-gray-200">
        <div class="bg-blue-50 rounded-lg p-3">
            <div class="flex items-center space-x-2">
                <div class="w-2 h-2 bg-green-400 rounded-full"></div>
                <span class="text-sm font-medium text-gray-900">Premium Plan</span>
            </div>
            <p class="text-xs text-gray-600 mt-1">30 days remaining</p>
            <button class="w-full mt-2 bg-blue-600 text-white text-xs py-1 px-2 rounded hover:bg-blue-700">
                Upgrade Now
            </button>
        </div>
    </div>
</aside>
