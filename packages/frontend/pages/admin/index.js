import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { 
  Users, 
  Building2, 
  Package, 
  ShoppingCart, 
  DollarSign, 
  MessageSquare,
  TrendingUp,
  AlertCircle,
  Activity,
  BarChart3
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../../components/common/Card';

export default function AdminDashboard() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCompanies: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingVerifications: 0,
    activeConversations: 0,
    recentActivity: []
  });

  // Redirect if not admin
  useEffect(() => {
    if (!loading && (!user || user.usertype !== 'admin')) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user || user.usertype !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      color: 'bg-blue-500',
      change: '+12%',
      changeType: 'positive'
    },
    {
      title: 'Companies',
      value: stats.totalCompanies.toLocaleString(),
      icon: Building2,
      color: 'bg-purple-500',
      change: '+8%',
      changeType: 'positive'
    },
    {
      title: 'Products',
      value: stats.totalProducts.toLocaleString(),
      icon: Package,
      color: 'bg-green-500',
      change: '+15%',
      changeType: 'positive'
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders.toLocaleString(),
      icon: ShoppingCart,
      color: 'bg-orange-500',
      change: '+23%',
      changeType: 'positive'
    },
    {
      title: 'Platform Revenue',
      value: `$${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-emerald-500',
      change: '+18%',
      changeType: 'positive'
    },
    {
      title: 'Pending Verifications',
      value: stats.pendingVerifications.toLocaleString(),
      icon: AlertCircle,
      color: 'bg-red-500',
      change: '3 new',
      changeType: 'neutral'
    }
  ];

  const quickActions = [
    { title: 'User Management', icon: Users, href: '/admin/users', color: 'bg-blue-500' },
    { title: 'Company Management', icon: Building2, href: '/admin/companies', color: 'bg-purple-500' },
    { title: 'Product Management', icon: Package, href: '/admin/products', color: 'bg-green-500' },
    { title: 'Order Management', icon: ShoppingCart, href: '/admin/orders', color: 'bg-orange-500' },
    { title: 'Financial Management', icon: DollarSign, href: '/admin/financial', color: 'bg-emerald-500' },
    { title: 'Chat Monitoring', icon: MessageSquare, href: '/admin/chat', color: 'bg-indigo-500' },
    { title: 'Analytics', icon: BarChart3, href: '/admin/analytics', color: 'bg-pink-500' },
    { title: 'System Settings', icon: Activity, href: '/admin/settings', color: 'bg-gray-500' }
  ];

  return (
    <>
      <Head>
        <title>Admin Dashboard - Pinoy Global Supply</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Welcome back, {user.name}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg font-semibold">
                  Super Admin
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {statCards.map((stat, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                    <p className={`text-sm mt-2 ${
                      stat.changeType === 'positive' ? 'text-green-600' : 
                      stat.changeType === 'negative' ? 'text-red-600' : 
                      'text-gray-600'
                    }`}>
                      {stat.change} from last month
                    </p>
                  </div>
                  <div className={`${stat.color} p-4 rounded-lg`}>
                    <stat.icon className="h-8 w-8 text-white" />
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => router.push(action.href)}
                  className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-all duration-200 hover:scale-105"
                >
                  <div className="flex flex-col items-center space-y-3">
                    <div className={`${action.color} p-3 rounded-lg`}>
                      <action.icon className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-sm font-semibold text-gray-700 text-center">
                      {action.title}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Recent Activity & Alerts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
                <Activity className="h-5 w-5 text-gray-400" />
              </div>
              <div className="space-y-4">
                <div className="flex items-start space-x-3 pb-4 border-b">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Users className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">New user registered</p>
                    <p className="text-xs text-gray-500">john.doe@example.com - 5 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 pb-4 border-b">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <Package className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">New product listed</p>
                    <p className="text-xs text-gray-500">ABC Manufacturing - 15 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 pb-4 border-b">
                  <div className="bg-orange-100 p-2 rounded-lg">
                    <ShoppingCart className="h-4 w-4 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Order completed</p>
                    <p className="text-xs text-gray-500">Order #12345 - $5,000 - 1 hour ago</p>
                  </div>
                </div>
                <button className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium">
                  View All Activity
                </button>
              </div>
            </Card>

            {/* Pending Actions */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Pending Actions</h3>
                <AlertCircle className="h-5 w-5 text-red-500" />
              </div>
              <div className="space-y-4">
                <div className="flex items-start space-x-3 pb-4 border-b">
                  <div className="bg-red-100 p-2 rounded-lg">
                    <Building2 className="h-4 w-4 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">3 Companies awaiting verification</p>
                    <button className="text-xs text-blue-600 hover:text-blue-700 font-medium mt-1">
                      Review Now →
                    </button>
                  </div>
                </div>
                <div className="flex items-start space-x-3 pb-4 border-b">
                  <div className="bg-yellow-100 p-2 rounded-lg">
                    <DollarSign className="h-4 w-4 text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">5 Payouts pending approval</p>
                    <button className="text-xs text-blue-600 hover:text-blue-700 font-medium mt-1">
                      Review Now →
                    </button>
                  </div>
                </div>
                <div className="flex items-start space-x-3 pb-4 border-b">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <MessageSquare className="h-4 w-4 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">2 Support tickets unresolved</p>
                    <button className="text-xs text-blue-600 hover:text-blue-700 font-medium mt-1">
                      Review Now →
                    </button>
                  </div>
                </div>
                <button className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium">
                  View All Pending
                </button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
