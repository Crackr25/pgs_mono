import { useState } from 'react';
import Head from 'next/head';
import { 
  Package, 
  FileText, 
  ShoppingCart, 
  DollarSign, 
  TrendingUp, 
  Users, 
  Eye,
  Plus
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import { useLanguage } from '../hooks/useLanguage';
import { useStripeOnboardingCheck } from '../hooks/useStripeOnboardingCheck';
import { analyticsData, products, orders, quotes } from '../lib/dummyData';

export default function Dashboard() {
  const { translate } = useLanguage();
  
  // Check if seller needs Stripe onboarding and redirect if necessary
  useStripeOnboardingCheck();

  const stats = [
    {
      name: 'Total Products',
      value: analyticsData.totalProducts,
      change: '+12%',
      changeType: 'increase',
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      name: 'Active Quotes',
      value: analyticsData.totalQuotes,
      change: '+8%',
      changeType: 'increase',
      icon: FileText,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      name: 'Total Orders',
      value: analyticsData.totalOrders,
      change: '+23%',
      changeType: 'increase',
      icon: ShoppingCart,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      name: 'Revenue',
      value: analyticsData.totalRevenue,
      change: '+15%',
      changeType: 'increase',
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
          <Button className="mt-4 sm:mt-0">
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
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
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="ml-1 text-sm font-medium text-green-600">
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
              <Button variant="outline" size="sm">View All</Button>
            </div>
            <div className="space-y-4">
              {products.slice(0, 3).map((product) => (
                <div key={product.id} className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center">
                    <Package className="w-6 h-6 text-secondary-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-secondary-900 truncate">
                      {product.name}
                    </p>
                    <p className="text-sm text-secondary-500">
                      MOQ: {product.moq} units
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-secondary-900">
                      {product.price}
                    </p>
                    <Badge variant="success" size="xs">Active</Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Recent Orders */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-secondary-900">Recent Orders</h3>
              <Button variant="outline" size="sm">View All</Button>
            </div>
            <div className="space-y-4">
              {orders.slice(0, 3).map((order) => (
                <div key={order.id} className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center">
                    <ShoppingCart className="w-6 h-6 text-secondary-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-secondary-900 truncate">
                      {order.orderNumber}
                    </p>
                    <p className="text-sm text-secondary-500">
                      {order.quantity} units
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-secondary-900">
                      {order.totalAmount}
                    </p>
                    <Badge 
                      variant={order.status === 'shipped' ? 'success' : 'info'} 
                      size="xs"
                    >
                      {order.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Most Viewed Products */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-secondary-900">Most Viewed Products</h3>
            <Button variant="outline" size="sm">View Analytics</Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {analyticsData.mostViewedProducts.map((product, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-secondary-50 rounded-lg">
                <div className="flex-shrink-0">
                  <Eye className="w-5 h-5 text-secondary-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-secondary-900 truncate">
                    {product.name}
                  </p>
                  <p className="text-sm text-secondary-500">
                    {product.views} views
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick Actions */}
        <Card>
          <h3 className="text-lg font-medium text-secondary-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col">
              <Package className="w-6 h-6 mb-2" />
              Add Product
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <FileText className="w-6 h-6 mb-2" />
              View Quotes
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Users className="w-6 h-6 mb-2" />
              Message Buyers
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <TrendingUp className="w-6 h-6 mb-2" />
              View Analytics
            </Button>
          </div>
        </Card>
      </div>
    </>
  );
}
