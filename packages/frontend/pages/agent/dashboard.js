import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { 
  Building2, 
  MessageSquare, 
  Users, 
  CheckCircle,
  Clock,
  AlertCircle,
  UserCheck,
  Mail,
  Settings
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
  const [chatStats, setChatStats] = useState({
    totalConversations: 0,
    unreadMessages: 0,
    assignedToMe: 0,
    respondedToday: 0
  });

  useEffect(() => {
    if (user) {
      loadAgentData();
    }
  }, [user]);

  const loadAgentData = async () => {
    try {
      setLoading(true);
      
      // Load agent data
      setAgentData({
        role: user?.active_company?.pivot?.role || 'Agent',
        permissions: user?.active_company?.pivot?.permissions || [],
        joinedDate: user?.active_company?.pivot?.joined_at || new Date().toISOString(),
        status: user?.active_company?.pivot?.is_active ? 'active' : 'inactive'
      });

      setCompanyData(user?.active_company || {
        name: 'Company',
        location: 'Philippines',
        industry: 'Manufacturing'
      });

      // Load chat statistics
      // TODO: Replace with actual API call when backend endpoint is ready
      setChatStats({
        totalConversations: 0,
        unreadMessages: 0,
        assignedToMe: 0,
        respondedToday: 0
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
          <div className="mt-4 sm:mt-0">
            <Button
              onClick={() => router.push('/chat')}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Open Messages
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

        {/* Chat Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-blue-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600">Total Conversations</p>
                <p className="text-2xl font-bold text-secondary-900">{chatStats.totalConversations}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <Mail className="w-4 h-4 text-red-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600">Unread Messages</p>
                <p className="text-2xl font-bold text-secondary-900">{chatStats.unreadMessages}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <UserCheck className="w-4 h-4 text-purple-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600">Assigned to Me</p>
                <p className="text-2xl font-bold text-secondary-900">{chatStats.assignedToMe}</p>
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
                <p className="text-sm font-medium text-secondary-600">Responded Today</p>
                <p className="text-2xl font-bold text-secondary-900">{chatStats.respondedToday}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions - Chat Focused */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-secondary-900">Quick Actions</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button
              variant="outline"
              className="justify-start h-auto p-4"
              onClick={() => router.push('/chat')}
            >
              <div className="flex items-center space-x-3">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                <div className="text-left">
                  <p className="font-medium">View All Messages</p>
                  <p className="text-sm text-secondary-600">Access all customer conversations</p>
                </div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="justify-start h-auto p-4"
              onClick={() => router.push('/chat')}
            >
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-red-600" />
                <div className="text-left">
                  <p className="font-medium">Unread Messages</p>
                  <p className="text-sm text-secondary-600">View pending customer inquiries</p>
                </div>
              </div>
            </Button>
          </div>
        </Card>

        {/* Chat Instructions */}
        <Card>
          <h3 className="text-lg font-medium text-secondary-900 mb-4">Your Role as Agent</h3>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <MessageSquare className="w-3 h-3 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-secondary-900">Respond to Customer Inquiries</p>
                <p className="text-sm text-secondary-600">Handle customer messages and provide timely responses</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <UserCheck className="w-3 h-3 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-secondary-900">Manage Assigned Conversations</p>
                <p className="text-sm text-secondary-600">Conversations are automatically assigned to you when you respond</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle className="w-3 h-3 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-secondary-900">Provide Excellent Service</p>
                <p className="text-sm text-secondary-600">Represent {companyData?.name} professionally in all interactions</p>
              </div>
            </div>
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
