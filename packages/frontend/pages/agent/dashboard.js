import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { 
  Building2, 
  Package, 
  MessageSquare, 
  FileText, 
  Users, 
  Settings,
  Bell,
  TrendingUp,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../lib/api';

export default function AgentDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [agentData, setAgentData] = useState(null);
  const [companyData, setCompanyData] = useState(null);
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeOrders: 0,
    pendingInquiries: 0,
    completedTasks: 0
  });

  useEffect(() => {
    if (user) {
      loadAgentData();
    }
  }, [user]);

  const loadAgentData = async () => {
    try {
      setLoading(true);
      // You might need to create these API endpoints
      // For now, we'll use placeholder data
      
      // Simulate API calls
      setAgentData({
        role: 'Manager',
        permissions: ['manage_products', 'handle_orders', 'respond_inquiries'],
        joinedDate: '2024-01-15',
        status: 'active'
      });

      setCompanyData({
        name: 'Sample Company Ltd.',
        location: 'Manila, Philippines',
        industry: 'Electronics Manufacturing'
      });

      setStats({
        totalProducts: 45,
        activeOrders: 12,
        pendingInquiries: 8,
        completedTasks: 156
      });

    } catch (error) {
      console.error('Error loading agent data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
          <span className="text-secondary-600">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Agent Dashboard - Pinoy Global Supply</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-secondary-900">
              Welcome back, {user?.name}
            </h1>
            <p className="mt-1 text-secondary-600">
              Agent Dashboard - {companyData?.name}
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/products')}
            >
              <Package className="w-4 h-4 mr-2" />
              Manage Products
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/chat')}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Messages
            </Button>
          </div>
        </div>

        {/* Agent Status Card */}
        <Card>
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-secondary-900">
                  Agent Status
                </h3>
                <p className="text-secondary-600">
                  Role: {agentData?.role} • Status: 
                  <Badge 
                    variant={agentData?.status === 'active' ? 'success' : 'warning'}
                    className="ml-1"
                  >
                    {agentData?.status}
                  </Badge>
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </Card>

        {/* Company Info */}
        <Card>
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Building2 className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-secondary-900">
                {companyData?.name}
              </h3>
              <p className="text-secondary-600">
                {companyData?.location} • {companyData?.industry}
              </p>
            </div>
          </div>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Package className="w-4 h-4 text-blue-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600">Total Products</p>
                <p className="text-2xl font-bold text-secondary-900">{stats.totalProducts}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Clock className="w-4 h-4 text-yellow-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600">Active Orders</p>
                <p className="text-2xl font-bold text-secondary-900">{stats.activeOrders}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600">Pending Inquiries</p>
                <p className="text-2xl font-bold text-secondary-900">{stats.pendingInquiries}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600">Completed Tasks</p>
                <p className="text-2xl font-bold text-secondary-900">{stats.completedTasks}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-secondary-900">Quick Actions</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="justify-start h-auto p-4"
              onClick={() => router.push('/products/create')}
            >
              <div className="flex items-center space-x-3">
                <Package className="w-5 h-5 text-blue-600" />
                <div className="text-left">
                  <p className="font-medium">Add Product</p>
                  <p className="text-sm text-secondary-600">Create new product listing</p>
                </div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="justify-start h-auto p-4"
              onClick={() => router.push('/orders')}
            >
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 text-green-600" />
                <div className="text-left">
                  <p className="font-medium">View Orders</p>
                  <p className="text-sm text-secondary-600">Manage customer orders</p>
                </div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="justify-start h-auto p-4"
              onClick={() => router.push('/chat')}
            >
              <div className="flex items-center space-x-3">
                <MessageSquare className="w-5 h-5 text-purple-600" />
                <div className="text-left">
                  <p className="font-medium">Messages</p>
                  <p className="text-sm text-secondary-600">Respond to inquiries</p>
                </div>
              </div>
            </Button>
          </div>
        </Card>

        {/* Permissions */}
        <Card>
          <h3 className="text-lg font-medium text-secondary-900 mb-4">Your Permissions</h3>
          <div className="flex flex-wrap gap-2">
            {agentData?.permissions?.map((permission, index) => (
              <Badge key={index} variant="secondary">
                {permission.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </Badge>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}
