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
    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated, currentPage, searchTerm, statusFilter, dateFilter]);

  const fetchOrders = async (page = currentPage) => {
    try {
      setLoading(true);
      setError(null);

      // Mock data for now - replace with actual API calls
      const mockOrders = [
        {
          id: 'ORD-2024-001',
          supplier: {
            id: 1,
            name: 'Manila Manufacturing Corp',
            contact_person: 'Juan Dela Cruz',
            phone: '+63 2 8123 4567',
            email: 'sales@manilamfg.com'
          },
          items: [
            {
              id: 1,
              name: 'LED Light Fixtures',
              quantity: 1000,
              unit: 'pieces',
              unit_price: 25.00,
              total_price: 25000.00
            }
          ],
          total_amount: 25000.00,
          status: 'in_production',
          order_date: '2024-01-10T10:00:00Z',
          expected_delivery: '2024-02-15T10:00:00Z',
          delivery_address: 'Makati City, Metro Manila',
          payment_status: 'paid',
          payment_terms: '30% advance, 70% on delivery',
          tracking_number: 'TRK123456789',
          notes: 'Rush order for new office building project'
        },
        {
          id: 'ORD-2024-002',
          supplier: {
            id: 2,
            name: 'Cebu Industrial Solutions',
            contact_person: 'Maria Santos',
            phone: '+63 32 234 5678',
            email: 'info@cebuindustrial.com'
          },
          items: [
            {
              id: 2,
              name: 'Industrial Water Pumps',
              quantity: 50,
              unit: 'pieces',
              unit_price: 850.00,
              total_price: 42500.00
            }
          ],
          total_amount: 42500.00,
          status: 'shipped',
          order_date: '2024-01-08T14:30:00Z',
          expected_delivery: '2024-01-25T14:30:00Z',
          delivery_address: 'Cebu City, Cebu',
          payment_status: 'paid',
          payment_terms: '50% advance, 50% on delivery',
          tracking_number: 'TRK987654321',
          notes: 'Include installation manual and warranty certificate'
        },
        {
          id: 'ORD-2024-003',
          supplier: {
            id: 3,
            name: 'Davao Steel Works',
            contact_person: 'Roberto Garcia',
            phone: '+63 82 345 6789',
            email: 'sales@davaosteel.com'
          },
          items: [
            {
              id: 3,
              name: 'Galvanized Steel Pipes',
              quantity: 200,
              unit: 'meters',
              unit_price: 45.00,
              total_price: 9000.00
            }
          ],
          total_amount: 9000.00,
          status: 'pending_payment',
          order_date: '2024-01-12T09:15:00Z',
          expected_delivery: '2024-02-10T09:15:00Z',
          delivery_address: 'Davao City, Davao del Sur',
          payment_status: 'pending',
          payment_terms: '100% advance payment',
          tracking_number: null,
          notes: 'Quality inspection required before delivery'
        },
        {
          id: 'ORD-2024-004',
          supplier: {
            id: 4,
            name: 'Iloilo Textile Mills',
            contact_person: 'Ana Reyes',
            phone: '+63 33 456 7890',
            email: 'orders@iloilotextile.com'
          },
          items: [
            {
              id: 4,
              name: 'Cotton T-Shirts',
              quantity: 5000,
              unit: 'pieces',
              unit_price: 8.50,
              total_price: 42500.00
            }
          ],
          total_amount: 42500.00,
          status: 'delivered',
          order_date: '2024-01-05T11:20:00Z',
          expected_delivery: '2024-01-20T11:20:00Z',
          delivery_address: 'Quezon City, Metro Manila',
          payment_status: 'paid',
          payment_terms: '30% advance, 70% on delivery',
          tracking_number: 'TRK456789123',
          notes: 'Custom branding and packaging required'
        },
        {
          id: 'ORD-2024-005',
          supplier: {
            id: 1,
            name: 'Manila Manufacturing Corp',
            contact_person: 'Juan Dela Cruz',
            phone: '+63 2 8123 4567',
            email: 'sales@manilamfg.com'
          },
          items: [
            {
              id: 5,
              name: 'Electronic Components',
              quantity: 2000,
              unit: 'pieces',
              unit_price: 15.75,
              total_price: 31500.00
            }
          ],
          total_amount: 31500.00,
          status: 'cancelled',
          order_date: '2024-01-03T16:45:00Z',
          expected_delivery: '2024-01-18T16:45:00Z',
          delivery_address: 'Pasig City, Metro Manila',
          payment_status: 'refunded',
          payment_terms: '50% advance, 50% on delivery',
          tracking_number: null,
          notes: 'Cancelled due to specification changes'
        }
      ];

      // Apply filters
      let filteredOrders = mockOrders;

      if (searchTerm) {
        filteredOrders = filteredOrders.filter(order =>
          order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.items.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      }

      if (statusFilter !== 'all') {
        filteredOrders = filteredOrders.filter(order => order.status === statusFilter);
      }

      if (dateFilter !== 'all') {
        const now = new Date();
        const filterDate = new Date();
        
        switch (dateFilter) {
          case 'today':
            filterDate.setHours(0, 0, 0, 0);
            filteredOrders = filteredOrders.filter(order => 
              new Date(order.order_date) >= filterDate
            );
            break;
          case 'week':
            filterDate.setDate(now.getDate() - 7);
            filteredOrders = filteredOrders.filter(order => 
              new Date(order.order_date) >= filterDate
            );
            break;
          case 'month':
            filterDate.setMonth(now.getMonth() - 1);
            filteredOrders = filteredOrders.filter(order => 
              new Date(order.order_date) >= filterDate
            );
            break;
        }
      }

      setOrders(filteredOrders);
      setTotalPages(1);
      setPaginationInfo({
        from: filteredOrders.length > 0 ? 1 : 0,
        to: filteredOrders.length,
        total: filteredOrders.length
      });
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to load orders. Please try again.');
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
      case 'pending_payment': return 'bg-yellow-100 text-yellow-800';
      case 'in_production': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending_payment': return <Clock className="w-4 h-4" />;
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
      case 'refunded': return 'bg-gray-100 text-gray-800';
      case 'overdue': return 'bg-red-100 text-red-800';
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
                  onClick={() => handleStatusFilter('pending_payment')}
                  className={`px-3 py-2 text-sm font-medium rounded-lg ${
                    statusFilter === 'pending_payment'
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-secondary-600 hover:bg-secondary-100'
                  }`}
                >
                  Pending Payment
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
                : 'No orders found. Start by creating an RFQ to get quotes from suppliers.'}
            </p>
            {!searchTerm && statusFilter === 'all' && dateFilter === 'all' && (
              <Link href="/buyer/rfqs/create">
                <Button className="mt-4">
                  Create Your First RFQ
                </Button>
              </Link>
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
                        
                        <Link href={`/chat?supplier=${order.supplier.id}&order=${order.id}`}>
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
