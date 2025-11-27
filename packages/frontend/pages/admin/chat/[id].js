import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { ArrowLeft, MessageSquare, User, Clock, Package, Send } from 'lucide-react';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import apiService from '../../../lib/api';
import { useAuth } from '../../../contexts/AuthContext';

export default function ConversationDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newStatus, setNewStatus] = useState('');

  // Redirect non-admin users
  useEffect(() => {
    if (user && user.usertype !== 'admin') {
      router.push('/login');
    }
  }, [user, router]);

  // Fetch conversation details
  useEffect(() => {
    if (id) {
      fetchConversation();
      fetchMessages();
    }
  }, [id]);

  const fetchConversation = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAdminConversation(id);
      if (response.success) {
        setConversation(response.data.conversation);
        setStats(response.data.stats);
        setNewStatus(response.data.conversation.status);
      }
    } catch (error) {
      console.error('Error fetching conversation:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await apiService.getAdminConversationMessages(id);
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleStatusUpdate = async () => {
    try {
      const response = await apiService.updateAdminConversationStatus(id, newStatus);
      if (response.success) {
        setConversation(response.data);
        alert('Status updated successfully');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { bg: 'bg-green-100', text: 'text-green-800', label: 'Active' },
      archived: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Archived' },
      closed: { bg: 'bg-red-100', text: 'text-red-800', label: 'Closed' },
    };
    const config = statusConfig[status] || statusConfig.active;
    return (
      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900">Conversation not found</h3>
          <Button onClick={() => router.push('/admin/chat')} className="mt-4">
            Back to Chat Monitoring
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Conversation #{id} - Admin Portal</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => router.push('/admin/chat')}
              className="flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Conversation #{id}</h1>
              <p className="mt-1 text-sm text-gray-500">
                Monitor and manage conversation details
              </p>
            </div>
          </div>
          {getStatusBadge(conversation.status)}
        </div>

        {/* Conversation Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-3 rounded-lg">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Buyer</p>
                <p className="text-lg font-semibold text-gray-900">{conversation.buyer?.name || 'N/A'}</p>
                <p className="text-sm text-gray-500">{conversation.buyer?.email || ''}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 p-3 rounded-lg">
                <User className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Seller</p>
                <p className="text-lg font-semibold text-gray-900">{conversation.seller?.name || 'N/A'}</p>
                <p className="text-sm text-gray-500">{conversation.seller?.email || ''}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center space-x-3">
              <div className="bg-purple-100 p-3 rounded-lg">
                <MessageSquare className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Messages</p>
                <p className="text-lg font-semibold text-gray-900">{stats?.total_messages || 0}</p>
                <p className="text-sm text-gray-500">{stats?.unread_messages || 0} unread</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Additional Info */}
        <Card>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Conversation Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Created At</p>
              <p className="text-sm font-medium text-gray-900">{formatDate(conversation.created_at)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Last Message At</p>
              <p className="text-sm font-medium text-gray-900">{formatDate(conversation.last_message_at)}</p>
            </div>
            {conversation.assigned_agent && (
              <div>
                <p className="text-sm text-gray-600">Assigned Agent</p>
                <p className="text-sm font-medium text-gray-900">{conversation.assigned_agent.name}</p>
              </div>
            )}
            {conversation.order && (
              <div>
                <p className="text-sm text-gray-600">Related Order</p>
                <p className="text-sm font-medium text-gray-900">#{conversation.order.order_number || conversation.order_id}</p>
              </div>
            )}
          </div>
        </Card>

        {/* Status Management */}
        <Card>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Manage Status</h3>
          <div className="flex items-center space-x-4">
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="active">Active</option>
              <option value="archived">Archived</option>
              <option value="closed">Closed</option>
            </select>
            <Button
              onClick={handleStatusUpdate}
              disabled={newStatus === conversation.status}
            >
              Update Status
            </Button>
          </div>
        </Card>

        {/* Messages */}
        <Card>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Messages</h3>
          <div className="space-y-4 max-h-[600px] overflow-y-auto">
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-500">No messages in this conversation</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender_id === conversation.buyer_id ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-4 ${
                      message.sender_id === conversation.buyer_id
                        ? 'bg-gray-100'
                        : 'bg-primary-100'
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      <User className="h-4 w-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-900">
                        {message.sender?.name || 'Unknown'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDate(message.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-900">{message.message}</p>
                    {message.read && (
                      <p className="text-xs text-gray-500 mt-1">Read</p>
                    )}
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-600">Attachments: {message.attachments.length}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </>
  );
}
