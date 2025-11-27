import Head from 'next/head';
import { useState, useEffect } from 'react';
import { Mail, Search, Eye, Trash2, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import apiService from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/router';

export default function ContactInquiries() {
  const router = useRouter();
  const { user } = useAuth();
  const [inquiries, setInquiries] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Redirect non-admin users
  useEffect(() => {
    if (user && user.usertype !== 'admin') {
      router.push('/login');
    }
  }, [user, router]);

  // Fetch statistics
  useEffect(() => {
    fetchStatistics();
  }, []);

  // Fetch inquiries
  useEffect(() => {
    fetchInquiries();
  }, [currentPage, searchTerm, statusFilter, typeFilter]);

  const fetchStatistics = async () => {
    try {
      const response = await apiService.getAdminInquiryStatistics();
      if (response.success) {
        setStatistics(response.data);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        per_page: 15,
        search: searchTerm,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        inquiry_type: typeFilter !== 'all' ? typeFilter : undefined,
      };

      Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);

      const response = await apiService.getAdminInquiries(params);
      setInquiries(response.data);
      setCurrentPage(response.current_page);
      setTotalPages(response.last_page);
    } catch (error) {
      console.error('Error fetching inquiries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewInquiry = (inquiry) => {
    setSelectedInquiry(inquiry);
    setShowDetailModal(true);
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await apiService.updateAdminInquiry(id, { status });
      fetchInquiries();
      fetchStatistics();
      if (selectedInquiry?.id === id) {
        setSelectedInquiry({ ...selectedInquiry, status });
      }
      alert('Status updated successfully');
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  const handleDeleteInquiry = async (id) => {
    if (!confirm('Are you sure you want to delete this inquiry?')) return;
    
    try {
      await apiService.deleteAdminInquiry(id);
      fetchInquiries();
      fetchStatistics();
      setShowDetailModal(false);
      alert('Inquiry deleted successfully');
    } catch (error) {
      console.error('Error deleting inquiry:', error);
      alert('Failed to delete inquiry');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock, label: 'Pending' },
      in_progress: { bg: 'bg-blue-100', text: 'text-blue-800', icon: AlertCircle, label: 'In Progress' },
      resolved: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle, label: 'Resolved' },
      closed: { bg: 'bg-gray-100', text: 'text-gray-800', icon: XCircle, label: 'Closed' },
    };
    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;
    return (
      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${config.bg} ${config.text} items-center`}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </span>
    );
  };

  const getTypeBadge = (type) => {
    const typeConfig = {
      general: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'General' },
      technical: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Technical' },
      billing: { bg: 'bg-green-100', text: 'text-green-800', label: 'Billing' },
      partnership: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Partnership' },
      complaint: { bg: 'bg-red-100', text: 'text-red-800', label: 'Complaint' },
      feedback: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Feedback' },
    };
    const config = typeConfig[type] || typeConfig.general;
    return (
      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      <Head>
        <title>Contact Inquiries - Admin Portal</title>
      </Head>

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Contact Inquiries</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage and respond to customer inquiries
            </p>
          </div>
        </div>

        {/* Statistics */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {statistics.total_inquiries.toLocaleString()}
                  </p>
                </div>
                <div className="bg-indigo-100 p-3 rounded-lg">
                  <Mail className="h-6 w-6 text-indigo-600" />
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {statistics.pending.toLocaleString()}
                  </p>
                </div>
                <div className="bg-yellow-100 p-3 rounded-lg">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">In Progress</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {statistics.in_progress.toLocaleString()}
                  </p>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg">
                  <AlertCircle className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Resolved</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {statistics.resolved.toLocaleString()}
                  </p>
                </div>
                <div className="bg-green-100 p-3 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Recent (7d)</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {statistics.recent_inquiries.toLocaleString()}
                  </p>
                </div>
                <div className="bg-purple-100 p-3 rounded-lg">
                  <Mail className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name, email, or subject..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  />
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>

              <select
                value={typeFilter}
                onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="all">All Types</option>
                <option value="general">General</option>
                <option value="technical">Technical</option>
                <option value="billing">Billing</option>
                <option value="partnership">Partnership</option>
                <option value="complaint">Complaint</option>
                <option value="feedback">Feedback</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Inquiries Table */}
        <Card>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                <p className="mt-2 text-sm text-gray-500">Loading inquiries...</p>
              </div>
            ) : inquiries.length === 0 ? (
              <div className="text-center py-12">
                <Mail className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No inquiries found</h3>
                <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filters.</p>
              </div>
            ) : (
              <>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact Info
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Subject
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {inquiries.map((inquiry) => (
                      <tr key={inquiry.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{inquiry.name}</div>
                          <div className="text-sm text-gray-500">{inquiry.email}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{inquiry.subject}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {inquiry.message?.substring(0, 50)}...
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getTypeBadge(inquiry.inquiry_type)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(inquiry.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(inquiry.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewInquiry(inquiry)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-4">
                    <div className="flex-1 flex justify-between sm:hidden">
                      <Button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        variant="outline"
                        size="sm"
                      >
                        Previous
                      </Button>
                      <Button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        variant="outline"
                        size="sm"
                      >
                        Next
                      </Button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm text-gray-700">
                          Page <span className="font-medium">{currentPage}</span> of{' '}
                          <span className="font-medium">{totalPages}</span>
                        </p>
                      </div>
                      <div>
                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                          <Button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            variant="outline"
                            size="sm"
                          >
                            Previous
                          </Button>
                          <Button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            variant="outline"
                            size="sm"
                            className="ml-3"
                          >
                            Next
                          </Button>
                        </nav>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </Card>

        {/* Detail Modal */}
        {showDetailModal && selectedInquiry && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Inquiry Details</h2>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Name</label>
                    <p className="text-sm text-gray-900">{selectedInquiry.name}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-600">Email</label>
                    <p className="text-sm text-gray-900">{selectedInquiry.email}</p>
                  </div>

                  {selectedInquiry.phone && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Phone</label>
                      <p className="text-sm text-gray-900">{selectedInquiry.phone}</p>
                    </div>
                  )}

                  <div>
                    <label className="text-sm font-medium text-gray-600">Subject</label>
                    <p className="text-sm text-gray-900">{selectedInquiry.subject}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-600">Type</label>
                    <div className="mt-1">{getTypeBadge(selectedInquiry.inquiry_type)}</div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-600">Message</label>
                    <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedInquiry.message}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-600">Current Status</label>
                    <div className="mt-1">{getStatusBadge(selectedInquiry.status)}</div>
                  </div>

                  {selectedInquiry.admin_notes && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Admin Notes</label>
                      <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedInquiry.admin_notes}</p>
                    </div>
                  )}

                  <div>
                    <label className="text-sm font-medium text-gray-600">Submitted</label>
                    <p className="text-sm text-gray-900">{formatDate(selectedInquiry.created_at)}</p>
                  </div>

                  {selectedInquiry.responded_at && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Responded At</label>
                      <p className="text-sm text-gray-900">{formatDate(selectedInquiry.responded_at)}</p>
                    </div>
                  )}

                  <div className="border-t pt-4">
                    <label className="text-sm font-medium text-gray-600 block mb-2">Update Status</label>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant={selectedInquiry.status === 'pending' ? 'primary' : 'outline'}
                        onClick={() => handleUpdateStatus(selectedInquiry.id, 'pending')}
                      >
                        Pending
                      </Button>
                      <Button
                        size="sm"
                        variant={selectedInquiry.status === 'in_progress' ? 'primary' : 'outline'}
                        onClick={() => handleUpdateStatus(selectedInquiry.id, 'in_progress')}
                      >
                        In Progress
                      </Button>
                      <Button
                        size="sm"
                        variant={selectedInquiry.status === 'resolved' ? 'primary' : 'outline'}
                        onClick={() => handleUpdateStatus(selectedInquiry.id, 'resolved')}
                      >
                        Resolved
                      </Button>
                      <Button
                        size="sm"
                        variant={selectedInquiry.status === 'closed' ? 'primary' : 'outline'}
                        onClick={() => handleUpdateStatus(selectedInquiry.id, 'closed')}
                      >
                        Closed
                      </Button>
                    </div>
                  </div>

                  <div className="border-t pt-4 flex justify-between">
                    <Button
                      variant="outline"
                      onClick={() => setShowDetailModal(false)}
                    >
                      Close
                    </Button>
                    <Button
                      variant="outline"
                      className="text-red-600 hover:bg-red-50"
                      onClick={() => handleDeleteInquiry(selectedInquiry.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
