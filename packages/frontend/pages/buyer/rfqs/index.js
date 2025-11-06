import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Plus, Search, Filter, Eye, Edit, Trash2, Clock, CheckCircle, XCircle, Grid, List } from 'lucide-react';
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
  const [viewMode, setViewMode] = useState('card'); // 'card' or 'list'
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

  // Load saved view mode from localStorage on component mount
  useEffect(() => {
    const savedViewMode = localStorage.getItem('rfq-view-mode');
    if (savedViewMode && (savedViewMode === 'card' || savedViewMode === 'list')) {
      setViewMode(savedViewMode);
    }
  }, []);

  // Save view mode to localStorage when it changes
  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    localStorage.setItem('rfq-view-mode', mode);
  };

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

  // Helper functions for attachment handling
  const isImageAttachment = (attachment) => {
    if (!attachment) return false;
    const fileName = attachment.original_name || attachment.filename || '';
    const extension = fileName.split('.').pop()?.toLowerCase();
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    return imageExtensions.includes(extension);
  };

  const isVideoAttachment = (attachment) => {
    if (!attachment) return false;
    const fileName = attachment.original_name || attachment.filename || '';
    const extension = fileName.split('.').pop()?.toLowerCase();
    const videoExtensions = ['mp4', 'mov', 'avi', 'wmv', 'mkv', 'webm'];
    return videoExtensions.includes(extension);
  };

  const getAttachmentUrl = (attachment) => {
    if (!attachment) {
      console.log('No attachment provided');
      return '';
    }
    
    // If there's already a file_url, use it
    if (attachment.file_url) {
      console.log('Using existing file_url:', attachment.file_url);
      return attachment.file_url;
    }
    
    // Otherwise construct the URL based on your Laravel storage configuration
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const storagePath = attachment.path || attachment.file_path;
    
    if (!storagePath) {
      console.log('No storage path found for attachment:', attachment);
      return '';
    }
    
    // Remove 'rfq-attachments/' prefix if it exists in the path since we're adding it
    const cleanPath = storagePath.replace(/^rfq-attachments\//, '');
    
    const fullUrl = `${baseUrl}/storage/rfq-attachments/${cleanPath}`;
    console.log('Generated URL for attachment:', fullUrl);
    
    return fullUrl;
  };

  const getFileIcon = (filename) => {
    if (!filename) return '📎';
    
    const ext = filename.split('.').pop()?.toLowerCase();
    const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    const videoExts = ['mp4', 'mov', 'avi', 'wmv', 'mkv', 'webm'];
    const docExts = ['pdf', 'doc', 'docx'];
    
    if (imageExts.includes(ext)) return '🖼️';
    if (videoExts.includes(ext)) return '🎥';
    if (docExts.includes(ext)) return '📄';
    if (['xlsx', 'xls'].includes(ext)) return '📊';
    if (['pptx', 'ppt'].includes(ext)) return '📋';
    if (['zip', 'rar'].includes(ext)) return '📦';
    return '📎';
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

            {/* View Mode Toggle */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-secondary-600">View:</span>
              <div className="flex border border-secondary-300 rounded-lg">
                <button
                  onClick={() => handleViewModeChange('card')}
                  className={`px-3 py-2 text-sm font-medium rounded-l-lg ${
                    viewMode === 'card'
                      ? 'bg-primary-600 text-white'
                      : 'text-secondary-600 hover:bg-secondary-100'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleViewModeChange('list')}
                  className={`px-3 py-2 text-sm font-medium rounded-r-lg ${
                    viewMode === 'list'
                      ? 'bg-primary-600 text-white'
                      : 'text-secondary-600 hover:bg-secondary-100'
                  }`}
                >
                  <List className="w-4 h-4" />
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

        {/* RFQs Display */}
        {!loading && !error && rfqs.length > 0 && (
          <>
            {viewMode === 'card' ? (
              /* Card View */
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {rfqs.map((rfq) => (
                  <Card key={rfq.id} className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-medium text-secondary-900">
                            {rfq.title}
                          </h3>
                          {rfq.certifications_required?.length > 0 && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Certified
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-secondary-600 mb-3 line-clamp-2">
                          {rfq.description}
                        </p>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(rfq.status)}`}>
                          {rfq.status}
                        </span>
                        {rfq.status === 'published' && (
                          <div className="flex items-center text-xs text-orange-600">
                            <Clock className="w-3 h-3 mr-1" />
                            {getDaysRemaining(rfq.expires_at)} days left
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-secondary-50 p-3 rounded-lg">
                        <p className="text-xs text-secondary-500 mb-1">Quantity</p>
                        <p className="text-sm font-medium text-secondary-900">
                          {rfq.quantity.toLocaleString()} {rfq.unit}
                        </p>
                      </div>
                      <div className="bg-secondary-50 p-3 rounded-lg">
                        <p className="text-xs text-secondary-500 mb-1">Budget Range</p>
                        <p className="text-sm font-medium text-secondary-900">
                          {formatCurrency(rfq.budget_min)} - {formatCurrency(rfq.budget_max)}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-secondary-500">Category</p>
                        <p className="text-sm font-medium text-secondary-900">{rfq.category}</p>
                      </div>
                      <div>
                        <p className="text-xs text-secondary-500">Location</p>
                        <p className="text-sm font-medium text-secondary-900">{rfq.location}</p>
                      </div>
                    </div>

                    {/* Attachments preview */}
                    {rfq.attachments && rfq.attachments.length > 0 && (
                      <div className="mb-4">
                        <div className="flex items-center space-x-2 mb-3">
                          <span className="text-xs text-secondary-500 font-medium">
                            📎 {rfq.attachments.length} file{rfq.attachments.length > 1 ? 's' : ''} attached
                          </span>
                          {/* Debug button for attachment data */}
                          <button
                            type="button"
                            onClick={() => {
                              console.log('=== DEBUG: RFQ Attachment Data ===');
                              console.log('RFQ ID:', rfq.id);
                              console.log('Attachments:', rfq.attachments);
                              rfq.attachments.forEach((attachment, index) => {
                                console.log(`Attachment ${index}:`, {
                                  ...attachment,
                                  isImage: isImageAttachment(attachment),
                                  isVideo: isVideoAttachment(attachment),
                                  generatedUrl: getAttachmentUrl(attachment)
                                });
                              });
                            }}
                            className="text-xs text-blue-600 hover:text-blue-800"
                          >
                            Debug
                          </button>
                        </div>
                        
                        {/* Attachment thumbnails */}
                        <div className="flex flex-wrap gap-2">
                          {rfq.attachments.slice(0, 4).map((attachment, index) => (
                            <div key={index} className="relative group">
                              {isImageAttachment(attachment) ? (
                                <div 
                                  className="w-12 h-12 rounded border overflow-hidden bg-gray-100 hover:ring-2 hover:ring-primary-500 transition-all cursor-pointer"
                                  onClick={() => window.open(getAttachmentUrl(attachment), '_blank')}
                                >
                                  <img 
                                    src={getAttachmentUrl(attachment)} 
                                    alt={attachment.original_name || `Image ${index + 1}`}
                                    className="w-full h-full object-cover"
                                    onLoad={(e) => {
                                      console.log('Image loaded successfully:', attachment.original_name);
                                    }}
                                    onError={(e) => {
                                      console.error('Image failed to load:', attachment.original_name, getAttachmentUrl(attachment));
                                      e.target.style.display = 'none';
                                      const fallback = e.target.parentElement.querySelector('.fallback-display');
                                      if (fallback) fallback.style.display = 'flex';
                                    }}
                                  />
                                  <div className="fallback-display w-full h-full bg-gray-200 flex items-center justify-center text-lg absolute inset-0" style={{display: 'none'}}>
                                    🖼️
                                  </div>
                                </div>
                              ) : isVideoAttachment(attachment) ? (
                                <div 
                                  className="w-12 h-12 rounded border overflow-hidden bg-gray-100 hover:ring-2 hover:ring-primary-500 transition-all cursor-pointer relative"
                                  onClick={() => window.open(getAttachmentUrl(attachment), '_blank')}
                                >
                                  <video 
                                    src={getAttachmentUrl(attachment)}
                                    className="w-full h-full object-cover"
                                    muted
                                    preload="metadata"
                                    onLoadedMetadata={(e) => {
                                      console.log('Video loaded successfully:', attachment.original_name);
                                    }}
                                    onError={(e) => {
                                      console.error('Video failed to load:', attachment.original_name, getAttachmentUrl(attachment));
                                      e.target.style.display = 'none';
                                      const fallback = e.target.parentElement.querySelector('.fallback-display');
                                      if (fallback) fallback.style.display = 'flex';
                                    }}
                                  />
                                  <div className="fallback-display w-full h-full bg-gray-200 flex items-center justify-center text-lg absolute inset-0" style={{display: 'none'}}>
                                    🎥
                                  </div>
                                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20">
                                    <div className="w-4 h-4 bg-white bg-opacity-90 rounded-full flex items-center justify-center">
                                      <div className="w-0 h-0 border-l-[3px] border-l-black border-t-[2px] border-t-transparent border-b-[2px] border-b-transparent ml-0.5"></div>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div 
                                  className="w-12 h-12 rounded border bg-gray-100 flex items-center justify-center hover:ring-2 hover:ring-primary-500 transition-all cursor-pointer"
                                  onClick={() => window.open(getAttachmentUrl(attachment), '_blank')}
                                >
                                  <span className="text-lg">{getFileIcon(attachment.original_name)}</span>
                                </div>
                              )}
                              
                              {/* Tooltip with filename */}
                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                {attachment.original_name || 'Attachment'}
                              </div>
                            </div>
                          ))}
                          
                          {/* Show count if more than 4 files */}
                          {rfq.attachments.length > 4 && (
                            <div className="w-12 h-12 rounded border bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600">
                              +{rfq.attachments.length - 4}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Certifications indicator */}
                    {rfq.certifications_required && rfq.certifications_required.length > 0 && (
                      <div className="mb-4">
                        <div className="flex items-center space-x-2 text-xs text-blue-600">
                          <span>🏆</span>
                          <span>{rfq.certifications_required.length} certification{rfq.certifications_required.length > 1 ? 's' : ''} required</span>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between mb-4 pt-3 border-t border-secondary-200">
                      <div className="flex items-center space-x-4 text-sm text-secondary-600">
                        <span className="flex items-center">
                          <Eye className="w-4 h-4 mr-1" />
                          {rfq.responses_count} responses
                        </span>
                        <span>Created {formatDate(rfq.created_at)}</span>
                      </div>
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
            ) : (
              /* List View */
              <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-secondary-200">
                    <thead className="bg-secondary-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                          RFQ Details
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                          Category & Location
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                          Quantity & Budget
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                          Status & Responses
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-secondary-200">
                      {rfqs.map((rfq) => (
                        <tr key={rfq.id} className="hover:bg-secondary-50">
                          <td className="px-6 py-4">
                            <div className="flex items-start space-x-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2 mb-1">
                                  <p className="text-sm font-medium text-secondary-900 truncate">
                                    {rfq.title}
                                  </p>
                                  {rfq.certifications_required?.length > 0 && (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                      Certified
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-secondary-500 line-clamp-2">
                                  {rfq.description}
                                </p>
                                <div className="flex items-center space-x-4 mt-2">
                                  <span className="text-xs text-secondary-400">
                                    Created {formatDate(rfq.created_at)}
                                  </span>
                                  {rfq.attachments && rfq.attachments.length > 0 && (
                                    <span className="text-xs text-secondary-500">
                                      📎 {rfq.attachments.length} file{rfq.attachments.length > 1 ? 's' : ''}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-secondary-900">{rfq.category}</div>
                            <div className="text-sm text-secondary-500">{rfq.location}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-secondary-900">
                              {rfq.quantity.toLocaleString()} {rfq.unit}
                            </div>
                            <div className="text-sm text-secondary-500">
                              {formatCurrency(rfq.budget_min)} - {formatCurrency(rfq.budget_max)}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col space-y-2">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(rfq.status)}`}>
                                {rfq.status}
                              </span>
                              <div className="flex items-center text-sm text-secondary-600">
                                <Eye className="w-4 h-4 mr-1" />
                                {rfq.responses_count} responses
                              </div>
                              {rfq.status === 'published' && (
                                <div className="flex items-center text-xs text-orange-600">
                                  <Clock className="w-3 h-3 mr-1" />
                                  {getDaysRemaining(rfq.expires_at)} days left
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex space-x-2">
                              <Link href={`/buyer/rfqs/${rfq.id}`}>
                                <Button variant="outline" size="sm">
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </Link>
                              {(rfq.status === 'draft' || rfq.status === 'published') && (
                                <Link href={`/buyer/rfqs/${rfq.id}/edit`}>
                                  <Button variant="outline" size="sm">
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                </Link>
                              )}
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleDeleteRFQ(rfq)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}

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
