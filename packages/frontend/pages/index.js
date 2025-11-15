import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { 
  Package, 
  FileText, 
  ShoppingCart, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Users, 
  Eye,
  Plus,
  Loader2,
  RefreshCw
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import { useLanguage } from '../hooks/useLanguage';
import { useStripeOnboardingCheck } from '../hooks/useStripeOnboardingCheck';
import { useDashboard } from '../hooks/useDashboard';

export default function Dashboard() {
  const { translate } = useLanguage();
  const { dashboardData, loading, refreshing, error, refreshDashboard } = useDashboard();
  const router = useRouter();
  
  // Check if seller needs Stripe onboarding and redirect if necessary
  useStripeOnboardingCheck();

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
          <span className="text-secondary-600">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={refreshDashboard}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const stats = [
    {
      name: 'Total Products',
      value: dashboardData.analytics.totalProducts || 0,
      change: dashboardData.analytics.growthPercentages?.products?.value || '0%',
      changeType: dashboardData.analytics.growthPercentages?.products?.type || 'neutral',
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      name: 'Active Quotes',
      value: dashboardData.analytics.totalQuotes || 0,
      change: dashboardData.analytics.growthPercentages?.quotes?.value || '0%',
      changeType: dashboardData.analytics.growthPercentages?.quotes?.type || 'neutral',
      icon: FileText,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      name: 'Total Orders',
      value: dashboardData.analytics.totalOrders || 0,
      change: dashboardData.analytics.growthPercentages?.orders?.value || '0%',
      changeType: dashboardData.analytics.growthPercentages?.orders?.type || 'neutral',
      icon: ShoppingCart,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      name: 'Revenue',
      value: dashboardData.analytics.totalRevenue || '$0',
      change: dashboardData.analytics.growthPercentages?.revenue?.value || '0%',
      changeType: dashboardData.analytics.growthPercentages?.revenue?.type || 'neutral',
      icon: DollarSign,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    }
  ];

  return (
    <>
      <Head>
        <title>Dashboard - SupplierHub</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-secondary-900">
              {translate('welcome')}
            </h1>
            <p className="mt-1 text-sm text-secondary-600">
              Here's what's happening with your business today.
            </p>
          </div>
          <div className="flex items-center space-x-2 mt-4 sm:mt-0">
            <Button 
              variant="outline" 
              size="sm"
              onClick={refreshDashboard}
              disabled={refreshing}
              className="flex items-center"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
            <Button onClick={() => router.push('/products/add')}>
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.name} className="p-6">
                <div className="flex items-center">
                  <div className={`${stat.bgColor} p-3 rounded-lg`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-secondary-600">
                      {stat.name}
                    </p>
                    <p className="text-2xl font-semibold text-secondary-900">
                      {stat.value}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  {stat.changeType === 'increase' ? (
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  ) : stat.changeType === 'decrease' ? (
                    <TrendingDown className="w-4 h-4 text-red-500" />
                  ) : (
                    <TrendingUp className="w-4 h-4 text-gray-500" />
                  )}
                  <span className={`ml-1 text-sm font-medium ${
                    stat.changeType === 'increase' ? 'text-green-600' : 
                    stat.changeType === 'decrease' ? 'text-red-600' : 
                    'text-gray-600'
                  }`}>
                    {stat.change}
                  </span>
                  <span className="ml-1 text-sm text-secondary-500">
                    from last month
                  </span>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Products */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-secondary-900">Recent Products</h3>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => router.push('/products')}
              >
                View All
              </Button>
            </div>
            <div className="space-y-4">
              {dashboardData.recentProducts.length > 0 ? (
                dashboardData.recentProducts.map((product) => (
                  <div key={product.id} className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center">
                      <Package className="w-6 h-6 text-secondary-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-secondary-900 truncate">
                        {product.name || product.title}
                      </p>
                      <p className="text-sm text-secondary-500">
                        MOQ: {product.moq || product.minimum_order_quantity || 'N/A'} units
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-secondary-900">
                        {product.price || product.unit_price || 'N/A'}
                      </p>
                      <Badge variant="success" size="xs">
                        {product.status === 'active' ? 'Active' : 'Active'}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 text-secondary-300 mx-auto mb-4" />
                  <p className="text-secondary-500">No products found</p>
                  <Button className="mt-2" size="sm">Add Your First Product</Button>
                </div>
              )}
            </div>
          </Card>

          {/* Recent Orders */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-secondary-900">Recent Orders</h3>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => router.push('/orders')}
              >
                View All
              </Button>
            </div>
            <div className="space-y-4">
              {dashboardData.recentOrders.length > 0 ? (
                dashboardData.recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center">
                      <ShoppingCart className="w-6 h-6 text-secondary-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-secondary-900 truncate">
                        {order.order_number || order.orderNumber || `Order #${order.id}`}
                      </p>
                      <p className="text-sm text-secondary-500">
                        {order.quantity} units
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-secondary-900">
                        {order.total_amount || order.totalAmount || 'N/A'}
                      </p>
                      <Badge 
                        variant={order.status === 'shipped' || order.status === 'completed' ? 'success' : 'info'} 
                        size="xs"
                      >
                        {(order.status || 'pending').replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <ShoppingCart className="w-12 h-12 text-secondary-300 mx-auto mb-4" />
                  <p className="text-secondary-500">No orders found</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Most Viewed Products */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-secondary-900">Top Products by Inquiries</h3>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => router.push('/analytics')}
            >
              View Analytics
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {dashboardData.analytics.mostViewedProducts && dashboardData.analytics.mostViewedProducts.length > 0 ? (
              dashboardData.analytics.mostViewedProducts.map((product, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-secondary-50 rounded-lg">
                  <div className="flex-shrink-0">
                    <Eye className="w-5 h-5 text-secondary-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-secondary-900 truncate">
                      {product.label || product.name}
                    </p>
                    <p className="text-sm text-secondary-500">
                      {product.value || product.views} {product.views ? 'views' : 'inquiries'}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 text-center py-8">
                <Eye className="w-12 h-12 text-secondary-300 mx-auto mb-4" />
                <p className="text-secondary-500">No product views data available</p>
              </div>
            )}
          </div>
        </Card>

        {/* Quick Actions */}
        <Card>
          <h3 className="text-lg font-medium text-secondary-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              className="h-20 flex-col"
              onClick={() => router.push('/products/add')}
            >
              <Package className="w-6 h-6 mb-2" />
              Add Product
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col"
              onClick={() => router.push('/quotes')}
            >
              <FileText className="w-6 h-6 mb-2" />
              View Quotes
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col"
              onClick={() => router.push('/chat')}
            >
              <Users className="w-6 h-6 mb-2" />
              Message Buyers
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col"
              onClick={() => router.push('/analytics')}
            >
              <TrendingUp className="w-6 h-6 mb-2" />
              View Analytics
            </Button>
          </div>
        </Card>
      </div>
    </>
  );
}
