import { ChartBarIcon, CubeIcon, ClipboardDocumentListIcon, CurrencyDollarIcon, EyeIcon, TrendingUpIcon, TrendingDownIcon } from '@heroicons/react/24/outline'

export default function Dashboard() {
  const stats = [
    { name: 'Total Products', value: '2,847', change: '+12%', changeType: 'increase', icon: CubeIcon },
    { name: 'Active Quotes', value: '156', change: '+8%', changeType: 'increase', icon: ClipboardDocumentListIcon },
    { name: 'Orders This Month', value: '89', change: '+23%', changeType: 'increase', icon: ChartBarIcon },
    { name: 'Revenue (USD)', value: '$45,230', change: '-2%', changeType: 'decrease', icon: CurrencyDollarIcon },
  ]

  const recentProducts = [
    { id: 1, name: 'Industrial LED Lights', views: 1250, inquiries: 45, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100&h=100&fit=crop' },
    { id: 2, name: 'Steel Manufacturing Tools', views: 980, inquiries: 32, image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=100&h=100&fit=crop' },
    { id: 3, name: 'Electronic Components', views: 756, inquiries: 28, image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=100&h=100&fit=crop' },
  ]

  const recentInquiries = [
    { id: 1, buyer: 'ABC Electronics Ltd.', product: 'LED Strip Lights', quantity: '10,000 pcs', status: 'pending', time: '2 hours ago' },
    { id: 2, buyer: 'Global Manufacturing Co.', product: 'Steel Brackets', quantity: '5,000 pcs', status: 'quoted', time: '4 hours ago' },
    { id: 3, buyer: 'Tech Solutions Inc.', product: 'Circuit Boards', quantity: '2,500 pcs', status: 'negotiating', time: '6 hours ago' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back, John Manufacturing Co.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="btn-secondary">Export Report</button>
          <button className="btn-primary">Add New Product</button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <stat.icon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              {stat.changeType === 'increase' ? (
                <TrendingUpIcon className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDownIcon className="h-4 w-4 text-red-500" />
              )}
              <span className={`text-sm font-medium ml-1 ${
                stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.change}
              </span>
              <span className="text-sm text-gray-500 ml-1">from last month</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Viewed Products */}
        <div className="card">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Most Viewed Products</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentProducts.map((product) => (
                <div key={product.id} className="flex items-center space-x-4">
                  <img src={product.image} alt={product.name} className="w-12 h-12 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                    <div className="flex items-center space-x-4 mt-1">
                      <div className="flex items-center space-x-1">
                        <EyeIcon className="h-4 w-4 text-gray-400" />
                        <span className="text-xs text-gray-500">{product.views} views</span>
                      </div>
                      <span className="text-xs text-gray-500">{product.inquiries} inquiries</span>
                    </div>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">View</button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Inquiries */}
        <div className="card">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Inquiries</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentInquiries.map((inquiry) => (
                <div key={inquiry.id} className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{inquiry.buyer}</p>
                    <p className="text-sm text-gray-600 truncate">{inquiry.product} - {inquiry.quantity}</p>
                    <p className="text-xs text-gray-500">{inquiry.time}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      inquiry.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      inquiry.status === 'quoted' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {inquiry.status}
                    </span>
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">Reply</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center">
            <CubeIcon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <span className="text-sm font-medium text-gray-900">Add Product</span>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center">
            <ClipboardDocumentListIcon className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <span className="text-sm font-medium text-gray-900">View Quotes</span>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center">
            <ChartBarIcon className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <span className="text-sm font-medium text-gray-900">Analytics</span>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center">
            <CurrencyDollarIcon className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
            <span className="text-sm font-medium text-gray-900">Payments</span>
          </button>
        </div>
      </div>
    </div>
  )
}
