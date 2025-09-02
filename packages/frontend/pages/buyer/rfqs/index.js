import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Plus, Search, Filter, Eye, Edit, Trash2, Clock, CheckCircle, XCircle } from 'lucide-react';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import Pagination from '../../../components/common/Pagination';
import Modal from '../../../components/common/Modal';
import { useAuth } from '../../../contexts/AuthContext';
import apiService from '../../../lib/api';

export default function RFQs() {
  const { user, isAuthenticated } = useAuth();
  const [rfqs, setRfqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [rfqToDelete, setRfqToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [paginationInfo, setPaginationInfo] = useState({
    from: 0,
    to: 0,
    total: 0
  });

  useEffect(() => {
    if (isAuthenticated) {
      fetchRFQs();
    }
  }, [isAuthenticated, currentPage, searchTerm, statusFilter]);

  const fetchRFQs = async (page = currentPage) => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: page,
        search: searchTerm,
        status: statusFilter !== 'all' ? statusFilter : undefined
      };

      // Remove empty params
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null || params[key] === undefined) {
          delete params[key];
        }
      });

      const response = await apiService.getBuyerRFQs(params);
      
      if (response.success !== false) {
        setRfqs(response.data || []);
        setTotalPages(response.last_page || 1);
        setItemsPerPage(response.per_page || 15);
        setPaginationInfo({
          from: response.from || 0,
          to: response.to || 0,
          total: response.total || 0
        });
      } else {
        throw new Error(response.message || 'Failed to fetch RFQs');
      }
    } catch (error) {
      console.error('Error fetching RFQs:', error);
      setError('Failed to load RFQs. Please try again.');
      setRfqs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRFQ = (rfq) => {
    setRfqToDelete(rfq);
    setShowDeleteModal(true);
  };

  const confirmDeleteRFQ = async () => {
    if (!rfqToDelete) return;

    setIsDeleting(true);
    try {
      const response = await apiService.deleteBuyerRFQ(rfqToDelete.id);
      
      if (response.success) {
        setRfqs(prev => prev.filter(r => r.id !== rfqToDelete.id));
        setShowDeleteModal(false);
        setRfqToDelete(null);
      } else {
        setError(response.message || 'Failed to delete RFQ. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting RFQ:', error);
      setError('Failed to delete RFQ. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePerPageChange = (newPerPage) => {
    setItemsPerPage(newPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'active': return 'bg-green-100 text-green-800'; // Legacy support
      case 'closed': return 'bg-gray-100 text-gray-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysRemaining = (expiresAt) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffTime = expiry - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <>
      <Head>
        <title>My RFQs - Buyer Portal</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-secondary-900">My RFQs</h1>
            <p className="mt-1 text-sm text-secondary-600">
              Manage your requests for quotations
            </p>
          </div>
          <Link href="/buyer/rfqs/create">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create RFQ
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search RFQs..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="pl-10 pr-4 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => handleStatusFilter('all')}
                  className={`px-3 py-2 text-sm font-medium rounded-lg ${
                    statusFilter === 'all'
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-secondary-600 hover:bg-secondary-100'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => handleStatusFilter('published')}
                  className={`px-3 py-2 text-sm font-medium rounded-lg ${
                    statusFilter === 'published'
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-secondary-600 hover:bg-secondary-100'
                  }`}
                >
                  Published
                </button>
                <button
                  onClick={() => handleStatusFilter('draft')}
                  className={`px-3 py-2 text-sm font-medium rounded-lg ${
                    statusFilter === 'draft'
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-secondary-600 hover:bg-secondary-100'
                  }`}
                >
                  Draft
                </button>
                <button
                  onClick={() => handleStatusFilter('closed')}
                  className={`px-3 py-2 text-sm font-medium rounded-lg ${
                    statusFilter === 'closed'
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-secondary-600 hover:bg-secondary-100'
                  }`}
                >
                  Closed
                </button>
              </div>
            </div>
          </div>
        </Card>

        {/* Loading State */}
        {loading && (
          <Card className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-2 text-secondary-600">Loading RFQs...</p>
          </Card>
        )}

        {/* Error State */}
        {error && (
          <Card className="p-6 bg-red-50 border-red-200">
            <div className="text-red-800">
              <p className="font-medium">Error loading RFQs</p>
              <p className="text-sm mt-1">{error}</p>
              <button 
                onClick={() => fetchRFQs()}
                className="mt-3 text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
              >
                Try Again
              </button>
            </div>
          </Card>
        )}

        {/* Empty State */}
        {!loading && !error && rfqs.length === 0 && (
          <Card className="p-8 text-center">
            <p className="text-secondary-600">
              {searchTerm || statusFilter !== 'all' 
                ? 'No RFQs found matching your criteria.' 
                : 'No RFQs found. Create your first RFQ to get started.'}
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <Link href="/buyer/rfqs/create">
                <Button className="mt-4">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First RFQ
                </Button>
              </Link>
            )}
          </Card>
        )}

        {/* RFQs Grid */}
        {!loading && !error && rfqs.length > 0 && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {rfqs.map((rfq) => (
                <Card key={rfq.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-secondary-900 mb-2">
                        {rfq.title}
                      </h3>
                      <p className="text-sm text-secondary-600 mb-3">
                        {rfq.description}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(rfq.status)}`}>
                      {rfq.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-secondary-500">Quantity</p>
                      <p className="text-sm font-medium text-secondary-900">
                        {rfq.quantity.toLocaleString()} {rfq.unit}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-secondary-500">Budget Range</p>
                      <p className="text-sm font-medium text-secondary-900">
                        {formatCurrency(rfq.budget_min)} - {formatCurrency(rfq.budget_max)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-secondary-500">Category</p>
                      <p className="text-sm font-medium text-secondary-900">{rfq.category}</p>
                    </div>
                    <div>
                      <p className="text-xs text-secondary-500">Location</p>
                      <p className="text-sm font-medium text-secondary-900">{rfq.location}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4 text-sm text-secondary-600">
                      <span>{rfq.responses_count} responses</span>
                      <span>Created {formatDate(rfq.created_at)}</span>
                    </div>
                    {rfq.status === 'published' && (
                      <div className="flex items-center text-sm">
                        <Clock className="w-4 h-4 text-orange-500 mr-1" />
                        <span className="text-orange-600">
                          {getDaysRemaining(rfq.expires_at)} days left
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    <Link href={`/buyer/rfqs/${rfq.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    </Link>
                    {(rfq.status === 'draft' || rfq.status === 'published') && (
                      <Link href={`/buyer/rfqs/${rfq.id}/edit`}>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                      </Link>
                    )}
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeleteRFQ(rfq)}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                lastPage={totalPages}
                total={paginationInfo.total}
                perPage={itemsPerPage}
                from={paginationInfo.from}
                to={paginationInfo.to}
                onPageChange={handlePageChange}
                onPerPageChange={handlePerPageChange}
                showPerPageSelector={true}
                showInfo={true}
              />
            )}
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete RFQ"
        size="md"
      >
        <div className="space-y-4">
          <div className="flex items-center space-x-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <XCircle className="h-6 w-6 text-red-600 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-red-800">
                Are you sure you want to delete this RFQ?
              </h3>
              <p className="text-sm text-red-700 mt-1">
                This action cannot be undone. All responses will be lost.
              </p>
            </div>
          </div>

          {rfqToDelete && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900">{rfqToDelete.title}</h4>
              <p className="text-sm text-gray-600 mt-1">{rfqToDelete.description}</p>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={confirmDeleteRFQ}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete RFQ
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
