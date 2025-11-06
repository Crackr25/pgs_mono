import { useState, useEffect } from 'react';
import Head from 'next/head';
import { 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  DollarSign,
  Search,
  Filter,
  Eye,
  Download
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import Table from '../components/common/Table';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../lib/api';
import { formatDate, getProgressColor } from '../lib/utils';

export default function Orders() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const companies = await apiService.getCompanies();
      const userCompany = companies.data?.find(comp => comp.user_id === user.id);
      const response = await apiService.getOrders(userCompany.id);
      setOrders(response.data || response);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to load orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.product_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'in_production':
        return <Package className="w-4 h-4" />;
      case 'shipped':
        return <Truck className="w-4 h-4" />;
      case 'delivered':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'success';
      case 'pending':
        return 'warning';
      case 'overdue':
        return 'danger';
      default:
        return 'default';
    }
  };

  const orderSteps = [
    { name: 'Order Confirmed', completed: true },
    { name: 'Payment Received', completed: true },
    { name: 'In Production', completed: true },
    { name: 'Quality Check', completed: false },
    { name: 'Shipped', completed: false },
    { name: 'Delivered', completed: false }
  ];

  const columns = [
    {
      header: 'Order',
      key: 'order_number',
      render: (value, row) => (
        <div>
          <div className="font-medium text-secondary-900">{value}</div>
          <div className="text-sm text-secondary-500">{row.productName}</div>
        </div>
      )
    },
    {
      header: 'Quantity',
      key: 'quantity',
      render: (value) => (
        <span className="text-secondary-900">{value.toLocaleString()} units</span>
      )
    },
    {
      header: 'Amount',
      key: 'total_amount',
      render: (value) => (
        <span className="font-medium text-secondary-900">{value}</span>
      )
    },
    {
      header: 'Status',
      key: 'status',
      render: (value) => {
        const getStatusVariant = (status) => {
          switch (status) {
            case 'pending': return 'warning';
            case 'in_production': return 'info';
            case 'shipped': return 'primary';
            case 'delivered': return 'success';
            default: return 'default';
          }
        };
        
        return (
          <Badge variant={getStatusVariant(value)}>
            <div className="flex items-center space-x-1">
              {getStatusIcon(value)}
              <span>{value.replace('_', ' ')}</span>
            </div>
          </Badge>
        );
      }
    },
    {
      header: 'Payment',
      key: 'payment_status',
      render: (value) => (
        <Badge variant={getPaymentStatusColor(value)}>
          {value ? value.charAt(0).toUpperCase() + value.slice(1) : 'Unknown'}
        </Badge>
      )
    },
    {
      header: 'Delivery',
      key: 'estimated_delivery',
      render: (value) => (
        <span className="text-secondary-900">{formatDate(value)}</span>
      )
    },
    {
      header: 'Progress',
      key: 'progress',
      render: (value) => (
        <div className="w-full bg-secondary-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full ${getProgressColor(value)}`}
            style={{ width: `${value}%` }}
          />
        </div>
      )
    },
    {
      header: 'Actions',
      key: 'actions',
      render: (_, row) => (
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedOrder(row)}
          >
            <Eye className="w-4 h-4 mr-1" />
            Track
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-1" />
            Invoice
          </Button>
        </div>
      )
    }
  ];

  return (
    <>
      <Head>
        <title>Orders - SupplierHub</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-secondary-900">Orders</h1>
            <p className="mt-1 text-sm text-secondary-600">
              Track and manage your customer orders
            </p>
          </div>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Orders
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600">Total Orders</p>
                <p className="text-2xl font-semibold text-secondary-900">{orders.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600">In Production</p>
                <p className="text-2xl font-semibold text-secondary-900">
                  {orders.filter(o => o.status === 'in_production').length}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Truck className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600">Shipped</p>
                <p className="text-2xl font-semibold text-secondary-900">
                  {orders.filter(o => o.status === 'shipped').length}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600">Revenue</p>
                <p className="text-2xl font-semibold text-secondary-900">$24,150</p>
              </div>
            </div>
          </Card>
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
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="in_production">In Production</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
              </select>
            </div>
            
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              More Filters
            </Button>
          </div>
        </Card>

        {/* Orders Table */}
        <Card>
          <Table columns={columns} data={filteredOrders} />
        </Card>

        {/* Recent Activity */}
        <Card>
          <h3 className="text-lg font-medium text-secondary-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-secondary-50 rounded-lg">
              <div className="flex-shrink-0">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-secondary-900">
                  Order ORD-2024-002 has been shipped
                </p>
                <p className="text-xs text-secondary-500">2 hours ago</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-secondary-50 rounded-lg">
              <div className="flex-shrink-0">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-secondary-900">
                  Payment received for Order ORD-2024-001
                </p>
                <p className="text-xs text-secondary-500">5 hours ago</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-secondary-50 rounded-lg">
              <div className="flex-shrink-0">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-secondary-900">
                  New order ORD-2024-003 received
                </p>
                <p className="text-xs text-secondary-500">1 day ago</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Order Tracking Modal */}
      {selectedOrder && (
        <Modal
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          title={`Order Tracking - ${selectedOrder.orderNumber}`}
          size="lg"
        >
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-secondary-50 p-4 rounded-lg">
              <h4 className="font-medium text-secondary-900 mb-3">Order Summary</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-secondary-500">Product:</span>
                  <span className="ml-2 font-medium">{selectedOrder.product_name}</span>
                </div>
                <div>
                  <span className="text-secondary-500">Quantity:</span>
                  <span className="ml-2 font-medium">{selectedOrder.quantity} units</span>
                </div>
                <div>
                  <span className="text-secondary-500">Total Amount:</span>
                  <span className="ml-2 font-medium">{selectedOrder.total_amount}</span>
                </div>
                <div>
                  <span className="text-secondary-500">Estimated Delivery:</span>
                  <span className="ml-2 font-medium">{formatDate(selectedOrder.estimated_delivery)}</span>
                </div>
              </div>
            </div>

            {/* Progress Tracker */}
            <div>
              <h4 className="font-medium text-secondary-900 mb-4">Order Progress</h4>
              <div className="space-y-4">
                {orderSteps.map((step, index) => (
                  <div key={index} className="flex items-center">
                    <div className={`
                      flex items-center justify-center w-8 h-8 rounded-full border-2
                      ${step.completed 
                        ? 'border-green-500 bg-green-500 text-white' 
                        : 'border-secondary-300 bg-white text-secondary-500'
                      }
                    `}>
                      {step.completed ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <span className="text-sm font-medium">{index + 1}</span>
                      )}
                    </div>
                    <div className="ml-4">
                      <p className={`text-sm font-medium ${
                        step.completed ? 'text-green-600' : 'text-secondary-500'
                      }`}>
                        {step.name}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Status */}
            <div className="bg-white border border-secondary-200 p-4 rounded-lg">
              <h4 className="font-medium text-secondary-900 mb-3">Payment Status</h4>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-secondary-600">Payment Method: Bank Transfer</p>
                  <p className="text-sm text-secondary-600">Amount: {selectedOrder.totalAmount}</p>
                </div>
                <Badge variant={getPaymentStatusColor(selectedOrder.paymentStatus)}>
                  {selectedOrder.payment_status.charAt(0).toUpperCase() + selectedOrder.payment_status.slice(1)}
                </Badge>
              </div>
            </div>

            {/* Shipping Information */}
            <div className="bg-white border border-secondary-200 p-4 rounded-lg">
              <h4 className="font-medium text-secondary-900 mb-3">Shipping Information</h4>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-secondary-500">Tracking Number:</span>
                  <span className="ml-2 font-medium">TRK123456789</span>
                </div>
                <div>
                  <span className="text-secondary-500">Carrier:</span>
                  <span className="ml-2 font-medium">DHL Express</span>
                </div>
                <div>
                  <span className="text-secondary-500">Estimated Delivery:</span>
                  <span className="ml-2 font-medium">{formatDate(selectedOrder.estimated_delivery)}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setSelectedOrder(null)}>
                Close
              </Button>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Download Invoice
              </Button>
              <Button>
                Update Status
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
