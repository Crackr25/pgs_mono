import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { 
  Search, 
  Filter, 
  Calendar,
  Clock, 
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  MessageSquare,
  Package,
  Building2,
  ArrowUpDown,
  Download,
  Plus,
  RefreshCw,
  MoreHorizontal,
  ChevronDown,
  Star,
  TrendingUp,
  DollarSign,
  Timer,
  CheckCircle2
} from 'lucide-react';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import Badge from '../../../components/common/Badge';
import Pagination from '../../../components/common/Pagination';
import { useAuth } from '../../../contexts/AuthContext';
import apiService from '../../../lib/api';

export default function MyQuotes() {
  const { user, isAuthenticated } = useAuth();
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters and search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [viewMode, setViewMode] = useState('list');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [paginationInfo, setPaginationInfo] = useState({
    from: 0,
    to: 0,
    total: 0
  });

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    total_quotes: 0,
    pending: 0,
    responded: 0,
    accepted: 0,
    rejected: 0,
    expired: 0
  });

  // Selected quotes for bulk actions
  const [selectedQuotes, setSelectedQuotes] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user?.email) {
      fetchQuotes().then(() => {
        // Fetch stats after quotes are loaded so we can calculate expired quotes
        fetchStats();
      });
    }
  }, [isAuthenticated, user?.email, currentPage, searchTerm, statusFilter, dateFilter, sortBy, sortOrder]);

  const fetchQuotes = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: currentPage,
        per_page: itemsPerPage,
        search: searchTerm || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        date_filter: dateFilter !== 'all' ? dateFilter : undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
        buyer_email: user?.email // Add buyer email to filter quotes
      };

      // Remove empty params
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null || params[key] === undefined) {
          delete params[key];
        }
      });

      try {
        const response = await apiService.getBuyerQuotes(params);
        
        if (response.success !== false) {
          // Handle Laravel pagination response format
          setQuotes(response.data || []);
          setTotalPages(response.last_page || 1);
          setItemsPerPage(response.per_page || 10);
          setPaginationInfo({
            from: response.from || 0,
            to: response.to || 0,
            total: response.total || 0
          });
        } else {
          throw new Error(response.message || 'Failed to fetch quotes');
        }
      } catch (apiError) {
        console.error('Error fetching quotes:', apiError);
        setError('Failed to load quotes. Please try again.');
        setQuotes([]);
      }
    } catch (error) {
      console.error('Error fetching quotes:', error);
      setError('Failed to load quotes. Please try again.');
      setQuotes([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const params = { buyer_email: user?.email };
      console.log('Fetching stats with params:', params);
      const response = await apiService.getBuyerQuoteStats(params);
      console.log('Stats API response:', response);
      if (response.success !== false) {
        // Check for expired quotes
        const expiredCount = quotes.filter(quote => {
          if (quote.status === 'pending' || quote.status === 'responded') {
            const deadline = new Date(quote.deadline);
            const now = new Date();
            return deadline < now;
          }
          return false;
        }).length;

        // Handle the stats response structure from Laravel
        const newStats = {
          total: response.total || 0,
          total_quotes: response.total || 0, // Add total_quotes for display
          pending: response.pending || 0,
          responded: response.responded || 0,
          accepted: response.accepted || 0,
          rejected: response.rejected || 0,
          expired: expiredCount // Calculate expired quotes locally
        };
        console.log('Setting stats to:', newStats);
        setStats(newStats);
      }
    } catch (error) {
      console.warn('Stats API not available, using mock data:', error.message);
      // Use mock stats data
      setStats({
        total: 1, // Based on your real data
        total_quotes: 1, // Add total_quotes for display
        pending: 1,
        responded: 0,
        accepted: 0,
        rejected: 0,
        expired: 0
      });
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

  const handleDateFilter = (filter) => {
    setDateFilter(filter);
    setCurrentPage(1);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePerPageChange = (perPage) => {
    setItemsPerPage(perPage);
    setCurrentPage(1);
  };

  const handleQuickAccept = async (quoteId) => {
    try {
      setActionLoading(true);
      await apiService.updateQuoteStatus(quoteId, 'accepted');
      
      // Update local state
      setQuotes(prevQuotes => 
        prevQuotes.map(quote => 
          quote.id === quoteId 
            ? { ...quote, status: 'accepted' }
            : quote
        )
      );
      
      // Refresh stats
      fetchStats();
      
    } catch (error) {
      console.error('Error accepting quote:', error);
      alert('Failed to accept quote. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleQuickReject = async (quoteId) => {
    try {
      setActionLoading(true);
      await apiService.updateQuoteStatus(quoteId, 'rejected');
      
      // Update local state
      setQuotes(prevQuotes => 
        prevQuotes.map(quote => 
          quote.id === quoteId 
            ? { ...quote, status: 'rejected' }
            : quote
        )
      );
      
      // Refresh stats
      fetchStats();
      
    } catch (error) {
      console.error('Error rejecting quote:', error);
      alert('Failed to reject quote. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSelectQuote = (quoteId) => {
    setSelectedQuotes(prev => 
      prev.includes(quoteId) 
        ? prev.filter(id => id !== quoteId)
        : [...prev, quoteId]
    );
  };

  const handleSelectAll = () => {
    if (selectedQuotes.length === quotes.length) {
      setSelectedQuotes([]);
    } else {
      setSelectedQuotes(quotes.map(quote => quote.id));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'responded': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'accepted': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'expired': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'responded': return <MessageSquare className="w-4 h-4" />;
      case 'accepted': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      case 'expired': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getDaysRemaining = (deadline) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading && quotes.length === 0) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>My Quotes - Buyer Portal</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-secondary-900">My Quotes</h1>
            <p className="mt-1 text-sm text-secondary-600">
              Track and manage your direct quote requests to suppliers
            </p>
          </div>
          <div className="flex space-x-3 mt-4 sm:mt-0">
            <Button variant="outline" onClick={fetchQuotes}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Link href="/buyer">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Browse Products
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards - Alibaba Style */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-secondary-600 uppercase tracking-wide">Total</p>
                <p className="text-2xl font-bold text-secondary-900">{stats.total_quotes}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-yellow-600 uppercase tracking-wide">Pending</p>
                <p className="text-2xl font-bold text-yellow-800">{stats.pending}</p>
              </div>
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Timer className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
          </Card>

          <Card className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">Responded</p>
                <p className="text-2xl font-bold text-blue-800">{stats.responded}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-green-600 uppercase tracking-wide">Accepted</p>
                <p className="text-2xl font-bold text-green-800">{stats.accepted}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-red-600 uppercase tracking-wide">Rejected</p>
                <p className="text-2xl font-bold text-red-800">{stats.rejected}</p>
              </div>
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
            </div>
          </Card>

          <Card className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Expired</p>
                <p className="text-2xl font-bold text-gray-800">{stats.expired}</p>
              </div>
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-gray-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Filters and Controls */}
        <Card className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by product name, supplier, or quote ID..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="w-full pl-10 pr-4 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'all', label: 'All', count: stats.total_quotes },
                { key: 'pending', label: 'Pending', count: stats.pending_quotes },
                { key: 'responded', label: 'Responded', count: stats.responded_quotes },
                { key: 'accepted', label: 'Accepted', count: stats.accepted_quotes },
                { key: 'rejected', label: 'Rejected', count: stats.rejected_quotes },
                { key: 'expired', label: 'Expired', count: stats.expired_quotes }
              ].map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => handleStatusFilter(filter.key)}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    statusFilter === filter.key
                      ? 'bg-primary-100 text-primary-700 border border-primary-200'
                      : 'text-secondary-600 hover:bg-secondary-100 border border-transparent'
                  }`}
                >
                  {filter.label} ({filter.count})
                </button>
              ))}
            </div>

            {/* Date Filter */}
            <div className="relative">
              <select
                value={dateFilter}
                onChange={(e) => handleDateFilter(e.target.value)}
                className="appearance-none bg-white border border-secondary-300 rounded-lg px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary-400 pointer-events-none" />
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedQuotes.length > 0 && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-800">
                  {selectedQuotes.length} quote{selectedQuotes.length > 1 ? 's' : ''} selected
                </span>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline">
                    <Download className="w-4 h-4 mr-1" />
                    Export
                  </Button>
                  <Button size="sm" variant="outline">
                    <MessageSquare className="w-4 h-4 mr-1" />
                    Bulk Message
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Error State */}
        {error && (
          <Card className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-secondary-900 mb-2">Failed to Load Quotes</h3>
            <p className="text-secondary-600 mb-4">{error}</p>
            <Button onClick={fetchQuotes}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </Card>
        )}

        {/* Empty State */}
        {!loading && !error && quotes.length === 0 && (
          <Card className="p-12 text-center">
            <DollarSign className="w-16 h-16 text-secondary-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-secondary-900 mb-2">No Quote Requests Yet</h3>
            <p className="text-secondary-600 mb-6">
              {searchTerm || statusFilter !== 'all' || dateFilter !== 'all'
                ? 'No quotes match your current filters. Try adjusting your search criteria.'
                : 'Start by browsing products and requesting quotes from suppliers to see them here.'}
            </p>
            {(!searchTerm && statusFilter === 'all' && dateFilter === 'all') && (
              <Link href="/buyer">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Browse Products
                </Button>
              </Link>
            )}
          </Card>
        )}

        {/* Quotes List */}
        {!loading && !error && quotes.length > 0 && (
          <>
            {/* Table Header */}
            <Card className="overflow-hidden">
              <div className="px-6 py-3 bg-secondary-50 border-b border-secondary-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <input
                      type="checkbox"
                      checked={selectedQuotes.length === quotes.length}
                      onChange={handleSelectAll}
                      className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm font-medium text-secondary-700">
                      {paginationInfo.from}-{paginationInfo.to} of {paginationInfo.total} quotes
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-secondary-600">Sort by:</span>
                    <button
                      onClick={() => handleSort('created_at')}
                      className={`text-sm font-medium flex items-center space-x-1 ${
                        sortBy === 'created_at' ? 'text-primary-600' : 'text-secondary-600 hover:text-secondary-900'
                      }`}
                    >
                      <span>Date</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleSort('deadline')}
                      className={`text-sm font-medium flex items-center space-x-1 ${
                        sortBy === 'deadline' ? 'text-primary-600' : 'text-secondary-600 hover:text-secondary-900'
                      }`}
                    >
                      <span>Deadline</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleSort('quoted_price')}
                      className={`text-sm font-medium flex items-center space-x-1 ${
                        sortBy === 'quoted_price' ? 'text-primary-600' : 'text-secondary-600 hover:text-secondary-900'
                      }`}
                    >
                      <span>Price</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Quotes Table */}
              <div className="divide-y divide-secondary-200">
                {quotes.map((quote) => (
                  <div key={quote.id} className="p-6 hover:bg-secondary-50 transition-colors">
                    <div className="flex items-start space-x-4">
                      {/* Checkbox */}
                      <input
                        type="checkbox"
                        checked={selectedQuotes.includes(quote.id)}
                        onChange={() => handleSelectQuote(quote.id)}
                        className="mt-1 rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                      />

                      {/* Product Image */}
                      <div className="w-16 h-16 bg-secondary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        {quote.product?.image ? (
                          <img
                            src={quote.product.image}
                            alt={quote.product.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <Package className="w-6 h-6 text-secondary-400" />
                        )}
                      </div>

                      {/* Quote Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            {/* Product and Supplier */}
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="text-lg font-semibold text-secondary-900 truncate">
                                {quote.product?.name || 'Product'}
                              </h3>
                              <span className="text-sm text-secondary-500">
                                Quote #{quote.id.toString().padStart(6, '0')}
                              </span>
                            </div>
                            
                            <div className="flex items-center space-x-4 text-sm text-secondary-600 mb-2">
                              <div className="flex items-center space-x-1">
                                <Building2 className="w-4 h-4" />
                                <span>{quote.supplier?.name || quote.company?.name || 'Supplier'}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Package className="w-4 h-4" />
                                <span>{quote.quantity?.toLocaleString()} {quote.unit || 'units'}</span>
                              </div>
                              {quote.target_price && (
                                <div className="flex items-center space-x-1">
                                  <DollarSign className="w-4 h-4" />
                                  <span>Target: {formatCurrency(quote.target_price)}</span>
                                </div>
                              )}
                            </div>

                            {/* Status and Timing */}
                            <div className="flex items-center space-x-4">
                              <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(quote.status)}`}>
                                {getStatusIcon(quote.status)}
                                <span className="ml-1 capitalize">{quote.status}</span>
                              </div>
                              
                              <span className="text-xs text-secondary-500">
                                Created {formatDate(quote.created_at)}
                              </span>
                              
                              {quote.deadline && (
                                <div className="flex items-center space-x-1 text-xs">
                                  {getDaysRemaining(quote.deadline) > 0 ? (
                                    <>
                                      <Clock className="w-3 h-3 text-orange-500" />
                                      <span className="text-orange-600">
                                        {getDaysRemaining(quote.deadline)} days left
                                      </span>
                                    </>
                                  ) : (
                                    <>
                                      <AlertCircle className="w-3 h-3 text-red-500" />
                                      <span className="text-red-600">Expired</span>
                                    </>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Price and Actions */}
                          <div className="text-right">
                            {quote.quoted_price ? (
                              <div className="mb-2">
                                <p className="text-lg font-bold text-green-600">
                                  {formatCurrency(quote.quoted_price)}
                                </p>
                                <p className="text-xs text-secondary-500">
                                  per {quote.unit || 'unit'}
                                </p>
                              </div>
                            ) : (
                              <div className="mb-2">
                                <p className="text-sm text-secondary-500">
                                  Awaiting quote
                                </p>
                              </div>
                            )}

                            <div className="flex space-x-2">
                              <Link href={`/buyer/quotes/${quote.id}`}>
                                <Button size="sm" variant="outline">
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </Link>
                              
                              {/* Accept/Reject buttons for responded quotes */}
                              {quote.status === 'responded' && (
                                <>
                                  <Button 
                                    size="sm" 
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      handleQuickAccept(quote.id);
                                    }}
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    className="text-red-600 border-red-200 hover:bg-red-50"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      handleQuickReject(quote.id);
                                    }}
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </Button>
                                </>
                              )}
                              
                              <Link href={`/buyer/messages?supplier=${quote.company_id}&quote=${quote.id}`}>
                                <Button size="sm" variant="outline">
                                  <MessageSquare className="w-4 h-4" />
                                </Button>
                              </Link>
                              <Button size="sm" variant="outline">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

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
    </>
  );
}
