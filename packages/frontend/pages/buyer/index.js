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
import ProductGrid from '../../components/buyer/ProductGrid';
import { StatsSkeleton } from '../../components/common/Skeleton';
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
        <title>Marketplace - Pinoy Global Supply</title>
      </Head>

      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg p-6 text-white">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
              <h1 className="text-3xl font-bold text-white mb-2">Welcome to the Marketplace</h1>
              <p className="text-lg text-blue-100 font-medium">
                Discover quality products from verified Philippine suppliers
              </p>
            </div>
            <div className="flex space-x-3 mt-4 sm:mt-0">
              <Link href="/buyer/rfqs/create">
                <Button variant="secondary">
                  <Plus className="w-4 h-4 mr-2" />
                  Post RFQ
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        {loading ? (
          <StatsSkeleton />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg border border-secondary-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Package className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-secondary-600">Products</p>
                  <p className="text-lg font-bold text-secondary-900">50K+</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-secondary-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-secondary-600">Suppliers</p>
                  <p className="text-lg font-bold text-secondary-900">2.5K+</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-secondary-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-secondary-600">Avg Response</p>
                  <p className="text-lg font-bold text-secondary-900">2 hrs</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-secondary-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-secondary-600">Success Rate</p>
                  <p className="text-lg font-bold text-secondary-900">95%</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Product Marketplace */}
        <ProductGrid />
      </div>
    </>
  );
}
