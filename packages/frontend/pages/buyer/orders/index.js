import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { 
  Package, 
  Search, 
  Filter, 
  Eye, 
  Download, 
  MessageSquare,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  Calendar,
  DollarSign
} from 'lucide-react';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import Pagination from '../../../components/common/Pagination';
import { useAuth } from '../../../contexts/AuthContext';
import apiService from '../../../lib/api';

export default function Orders() {
  const { user, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

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
    if (isAuthenticated && user?.email) {
      fetchOrders();
    }
  }, [isAuthenticated, user?.email, currentPage, searchTerm, statusFilter, dateFilter]);

  const fetchOrders = async (page = currentPage) => {
    try {
      setLoading(true);
      setError(null);

      // Ensure user email is available
      if (!user?.email) {
        setError('User email not available. Please log in again.');
        return;
      }

      // Build API parameters
      const params = {
        page: page,
        per_page: itemsPerPage
      };

      // Add filters
      if (searchTerm) {
        params.search = searchTerm;
      }

      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      if (dateFilter !== 'all') {
        // Backend doesn't support date filtering yet, so we'll handle this client-side for now
        // TODO: Add date filtering to backend API
      }

      // Fetch orders from API
      const response = await apiService.getBuyerOrders(params);
      
      // Handle Laravel pagination response
      const ordersData = response.data || [];
      const paginationData = {
        current_page: response.current_page || 1,
        last_page: response.last_page || 1,
        per_page: response.per_page || itemsPerPage,
        total: response.total || 0,
        from: response.from || 0,
        to: response.to || 0
      };

      // Transform backend data to match frontend expectations
      const transformedOrders = ordersData.map(order => ({
        id: order.order_number || order.id,
        supplier: {
          id: order.company?.id || order.company_id,
          name: order.company?.name || 'Unknown Supplier',
          contact_person: order.company?.contact_person || 'N/A',
          phone: order.company?.phone || 'N/A',
          email: order.company?.email || 'N/A'
        },
        items: [
          {
            id: order.id,
            name: order.product_name,
            quantity: order.quantity,
            unit: 'pieces', // Default unit since backend doesn't store this
            unit_price: order.total_amount / order.quantity,
            total_price: order.total_amount
          }
        ],
        total_amount: parseFloat(order.total_amount),
        status: order.status,
        order_date: order.created_at,
        expected_delivery: order.estimated_delivery,
        delivery_address: order.shipping_address,
        payment_status: order.payment_status,
        payment_terms: 'Standard Terms', // Default since backend doesn't store this
        tracking_number: null, // Backend doesn't store tracking numbers yet
        notes: order.notes
      }));

      setOrders(transformedOrders);
      setCurrentPage(paginationData.current_page);
      setTotalPages(paginationData.last_page);
      setItemsPerPage(paginationData.per_page);
      setPaginationInfo({
        from: paginationData.from,
        to: paginationData.to,
        total: paginationData.total
      });

    } catch (error) {
      console.error('Error fetching orders:', error);
      setError(error.message || 'Failed to load orders. Please try again.');
    } finally {
      setLoading(false);
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

  const handleDateFilter = (period) => {
    setDateFilter(period);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePerPageChange = (perPage) => {
    setItemsPerPage(perPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'in_production': return 'bg-indigo-100 text-indigo-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'confirmed': return <CheckCircle className="w-4 h-4" />;
      case 'in_production': return <Package className="w-4 h-4" />;
      case 'shipped': return <Truck className="w-4 h-4" />;
      case 'delivered': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'partial': return 'bg-orange-100 text-orange-800';
      case 'refunded': return 'bg-gray-100 text-gray-800';
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

  return (
    <>
      <Head>
        <title>My Orders - Buyer Portal</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-secondary-900">My Orders</h1>
            <p className="mt-1 text-sm text-secondary-600">
              Track and manage your purchase orders
            </p>
          </div>
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search orders..."
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
                  onClick={() => handleStatusFilter('pending')}
                  className={`px-3 py-2 text-sm font-medium rounded-lg ${
                    statusFilter === 'pending'
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-secondary-600 hover:bg-secondary-100'
                  }`}
                >
                  Pending
                </button>
                <button
                  onClick={() => handleStatusFilter('confirmed')}
                  className={`px-3 py-2 text-sm font-medium rounded-lg ${
                    statusFilter === 'confirmed'
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-secondary-600 hover:bg-secondary-100'
                  }`}
                >
                  Confirmed
                </button>
                <button
                  onClick={() => handleStatusFilter('in_production')}
                  className={`px-3 py-2 text-sm font-medium rounded-lg ${
                    statusFilter === 'in_production'
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-secondary-600 hover:bg-secondary-100'
                  }`}
                >
                  In Production
                </button>
                <button
                  onClick={() => handleStatusFilter('shipped')}
                  className={`px-3 py-2 text-sm font-medium rounded-lg ${
                    statusFilter === 'shipped'
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-secondary-600 hover:bg-secondary-100'
                  }`}
                >
                  Shipped
                </button>
                <button
                  onClick={() => handleStatusFilter('delivered')}
                  className={`px-3 py-2 text-sm font-medium rounded-lg ${
                    statusFilter === 'delivered'
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-secondary-600 hover:bg-secondary-100'
                  }`}
                >
                  Delivered
                </button>
              </div>
            </div>

            <div className="flex space-x-2">
              <select
                value={dateFilter}
                onChange={(e) => handleDateFilter(e.target.value)}
                className="px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Loading State */}
        {loading && (
          <Card className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-2 text-secondary-600">Loading orders...</p>
          </Card>
        )}

        {/* Error State */}
        {error && (
          <Card className="p-6 bg-red-50 border-red-200">
            <div className="text-red-800">
              <p className="font-medium">Error loading orders</p>
              <p className="text-sm mt-1">{error}</p>
              <button 
                onClick={() => fetchOrders()}
                className="mt-3 text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
              >
                Try Again
              </button>
            </div>
          </Card>
        )}

        {/* Empty State */}
        {!loading && !error && orders.length === 0 && (
          <Card className="p-8 text-center">
            <Package className="w-12 h-12 text-secondary-400 mx-auto mb-4" />
            <p className="text-secondary-600">
              {searchTerm || statusFilter !== 'all' || dateFilter !== 'all'
                ? 'No orders found matching your criteria.' 
                : 'No orders found. Start by browsing products or creating an RFQ to get quotes from suppliers.'}
            </p>
            {!searchTerm && statusFilter === 'all' && dateFilter === 'all' && (
              <div className="flex flex-col sm:flex-row gap-3 justify-center mt-4">
                <Link href="/buyer">
                  <Button variant="outline">
                    Browse Products
                  </Button>
                </Link>
                <Link href="/buyer/rfqs/create">
                  <Button>
                    Create RFQ
                  </Button>
                </Link>
              </div>
            )}
          </Card>
        )}

        {/* Orders List */}
        {!loading && !error && orders.length > 0 && (
          <>
            <div className="space-y-4">
              {orders.map((order) => (
                <Card key={order.id} className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between space-y-4 lg:space-y-0">
                    {/* Order Info */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h3 className="text-lg font-medium text-secondary-900">
                          Order {order.id}
                        </h3>
                        <div className={`flex items-center space-x-1 px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          <span>{order.status.replace('_', ' ')}</span>
                        </div>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(order.payment_status)}`}>
                          {order.payment_status}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-secondary-600">Supplier</p>
                          <p className="font-medium text-secondary-900">{order.supplier.name}</p>
                          <p className="text-sm text-secondary-600">{order.supplier.contact_person}</p>
                        </div>
                        <div>
                          <p className="text-sm text-secondary-600">Order Date</p>
                          <p className="font-medium text-secondary-900">{formatDate(order.order_date)}</p>
                          <p className="text-sm text-secondary-600">Expected: {formatDate(order.expected_delivery)}</p>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="mb-4">
                        <p className="text-sm text-secondary-600 mb-2">Items:</p>
                        <div className="space-y-2">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                              <div>
                                <p className="font-medium text-secondary-900">{item.name}</p>
                                <p className="text-sm text-secondary-600">
                                  {item.quantity.toLocaleString()} {item.unit} × {formatCurrency(item.unit_price)}
                                </p>
                              </div>
                              <p className="font-medium text-secondary-900">
                                {formatCurrency(item.total_price)}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Delivery Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-secondary-600">Delivery Address</p>
                          <p className="text-secondary-900">{order.delivery_address}</p>
                        </div>
                        {order.tracking_number && (
                          <div>
                            <p className="text-secondary-600">Tracking Number</p>
                            <p className="text-secondary-900 font-mono">{order.tracking_number}</p>
                          </div>
                        )}
                      </div>

                      {order.notes && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm text-blue-800">
                            <strong>Notes:</strong> {order.notes}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Order Summary & Actions */}
                    <div className="lg:w-64 lg:ml-6">
                      <div className="bg-secondary-50 rounded-lg p-4 mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-secondary-600">Total Amount</span>
                          <span className="text-lg font-bold text-secondary-900">
                            {formatCurrency(order.total_amount)}
                          </span>
                        </div>
                        <p className="text-xs text-secondary-600">{order.payment_terms}</p>
                      </div>

                      <div className="space-y-2">
                        <Link href={`/buyer/orders/${order.id}`}>
                          <Button variant="outline" size="sm" className="w-full">
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                        </Link>
                        
                        {order.status === 'delivered' && (
                          <Button variant="outline" size="sm" className="w-full">
                            <Download className="w-4 h-4 mr-2" />
                            Download Invoice
                          </Button>
                        )}
                        
                        <Link href={`/chat?company=${order.supplier.id}&order=${order.id}`}>
                          <Button variant="outline" size="sm" className="w-full">
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Contact Supplier
                          </Button>
                        </Link>

                        {order.tracking_number && (
                          <Button variant="outline" size="sm" className="w-full">
                            <Truck className="w-4 h-4 mr-2" />
                            Track Shipment
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <Card>
                <Pagination
                  currentPage={currentPage}
                  lastPage={totalPages}
                  perPage={itemsPerPage}
                  onPageChange={handlePageChange}
                  onPerPageChange={handlePerPageChange}
                  showPerPageSelector={true}
                  from={paginationInfo.from}
                  to={paginationInfo.to}
                  total={paginationInfo.total}
                />
              </Card>
            )}
          </>
        )}
      </div>
    </>
  );
}
