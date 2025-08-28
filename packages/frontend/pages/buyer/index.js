import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { 
  Search, 
  Plus, 
  TrendingUp, 
  ShoppingCart, 
  MessageSquare, 
  Clock,
  Package,
  Users,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../lib/api';

export default function BuyerDashboard() {
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    activeRFQs: 0,
    pendingQuotes: 0,
    activeOrders: 0,
    totalSpent: 0,
    recentRFQs: [],
    recentQuotes: [],
    recentOrders: [],
    topSuppliers: []
  });

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardData();
    }
  }, [isAuthenticated]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Mock data for now - replace with actual API calls
      setDashboardData({
        activeRFQs: 12,
        pendingQuotes: 8,
        activeOrders: 5,
        totalSpent: 125000,
        recentRFQs: [
          { id: 1, title: 'LED Light Fixtures - 1000 units', status: 'active', created_at: '2024-01-15', responses: 5 },
          { id: 2, title: 'Industrial Pumps - 50 units', status: 'closed', created_at: '2024-01-14', responses: 12 },
          { id: 3, title: 'Steel Pipes - 200 meters', status: 'active', created_at: '2024-01-13', responses: 3 }
        ],
        recentQuotes: [
          { id: 1, supplier: 'Manila Manufacturing Corp', product: 'LED Light Fixtures', price: '$25.00', status: 'pending' },
          { id: 2, supplier: 'Cebu Industrial Solutions', product: 'Industrial Pumps', price: '$850.00', status: 'accepted' },
          { id: 3, supplier: 'Davao Steel Works', product: 'Steel Pipes', price: '$45.00/m', status: 'pending' }
        ],
        recentOrders: [
          { id: 1, supplier: 'Manila Manufacturing Corp', total: '$25,000', status: 'in_production', date: '2024-01-10' },
          { id: 2, supplier: 'Cebu Industrial Solutions', total: '$42,500', status: 'shipped', date: '2024-01-08' }
        ],
        topSuppliers: [
          { name: 'Manila Manufacturing Corp', orders: 15, rating: 4.8 },
          { name: 'Cebu Industrial Solutions', orders: 12, rating: 4.9 },
          { name: 'Davao Steel Works', orders: 8, rating: 4.7 }
        ]
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      case 'accepted': return 'bg-blue-100 text-blue-800';
      case 'in_production': return 'bg-orange-100 text-orange-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Buyer Dashboard - Pinoy Global Supply</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-secondary-900">Buyer Dashboard</h1>
            <p className="mt-1 text-sm text-secondary-600">
              Welcome back, {user?.name}! Manage your sourcing activities.
            </p>
          </div>
          <div className="flex space-x-3 mt-4 sm:mt-0">
            <Link href="/buyer/rfq/create">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create RFQ
              </Button>
            </Link>
            <Link href="/buyer/suppliers">
              <Button variant="outline">
                <Search className="w-4 h-4 mr-2" />
                Find Suppliers
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Package className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600">Active RFQs</p>
                <p className="text-2xl font-bold text-secondary-900">{dashboardData.activeRFQs}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600">Pending Quotes</p>
                <p className="text-2xl font-bold text-secondary-900">{dashboardData.pendingQuotes}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ShoppingCart className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600">Active Orders</p>
                <p className="text-2xl font-bold text-secondary-900">{dashboardData.activeOrders}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600">Total Spent</p>
                <p className="text-2xl font-bold text-secondary-900">{formatCurrency(dashboardData.totalSpent)}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent RFQs */}
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-secondary-900">Recent RFQs</h3>
                <Link href="/buyer/rfqs">
                  <Button variant="outline" size="sm">View All</Button>
                </Link>
              </div>
              <div className="space-y-4">
                {dashboardData.recentRFQs.map((rfq) => (
                  <div key={rfq.id} className="flex items-center justify-between p-4 bg-secondary-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-secondary-900">{rfq.title}</h4>
                      <p className="text-sm text-secondary-600">
                        {rfq.responses} responses • {new Date(rfq.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(rfq.status)}`}>
                      {rfq.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Recent Quotes */}
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-secondary-900">Recent Quotes</h3>
                <Link href="/buyer/quotes">
                  <Button variant="outline" size="sm">View All</Button>
                </Link>
              </div>
              <div className="space-y-4">
                {dashboardData.recentQuotes.map((quote) => (
                  <div key={quote.id} className="flex items-center justify-between p-4 bg-secondary-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-secondary-900">{quote.product}</h4>
                      <p className="text-sm text-secondary-600">{quote.supplier}</p>
                      <p className="text-sm font-medium text-primary-600">{quote.price}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(quote.status)}`}>
                      {quote.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Recent Orders */}
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-secondary-900">Recent Orders</h3>
                <Link href="/buyer/orders">
                  <Button variant="outline" size="sm">View All</Button>
                </Link>
              </div>
              <div className="space-y-4">
                {dashboardData.recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 bg-secondary-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-secondary-900">{order.supplier}</h4>
                      <p className="text-sm text-secondary-600">{new Date(order.date).toLocaleDateString()}</p>
                      <p className="text-sm font-medium text-green-600">{order.total}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                      {order.status.replace('_', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Top Suppliers */}
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-secondary-900">Top Suppliers</h3>
                <Link href="/buyer/suppliers">
                  <Button variant="outline" size="sm">Find More</Button>
                </Link>
              </div>
              <div className="space-y-4">
                {dashboardData.topSuppliers.map((supplier, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-secondary-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-primary-600">
                          {supplier.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-medium text-secondary-900">{supplier.name}</h4>
                        <p className="text-sm text-secondary-600">{supplier.orders} orders</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <TrendingUp className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm font-medium text-secondary-900">{supplier.rating}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-medium text-secondary-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/buyer/rfq/create">
                <div className="p-4 border border-secondary-200 rounded-lg hover:bg-secondary-50 transition-colors cursor-pointer">
                  <Plus className="w-8 h-8 text-primary-600 mb-2" />
                  <h4 className="font-medium text-secondary-900">Create New RFQ</h4>
                  <p className="text-sm text-secondary-600">Request quotes from suppliers</p>
                </div>
              </Link>
              
              <Link href="/buyer/suppliers">
                <div className="p-4 border border-secondary-200 rounded-lg hover:bg-secondary-50 transition-colors cursor-pointer">
                  <Users className="w-8 h-8 text-green-600 mb-2" />
                  <h4 className="font-medium text-secondary-900">Browse Suppliers</h4>
                  <p className="text-sm text-secondary-600">Discover verified suppliers</p>
                </div>
              </Link>
              
              <Link href="/chat">
                <div className="p-4 border border-secondary-200 rounded-lg hover:bg-secondary-50 transition-colors cursor-pointer">
                  <MessageSquare className="w-8 h-8 text-blue-600 mb-2" />
                  <h4 className="font-medium text-secondary-900">Messages</h4>
                  <p className="text-sm text-secondary-600">Chat with suppliers</p>
                </div>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}
