import { useState, useEffect } from 'react';
import Head from 'next/head';
import { 
  DollarSign,
  Filter,
  Search,
  Download,
  RefreshCw,
  CheckCircle,
  Clock,
  AlertCircle,
  CreditCard,
  Building,
  Calendar,
  TrendingUp,
  Users,
  Eye,
  Play,
  Check,
  RotateCcw,
  Receipt,
  Activity,
  FileText
} from 'lucide-react';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import Badge from '../../../components/common/Badge';
import Modal from '../../../components/common/Modal';
import Pagination from '../../../components/common/Pagination';
import apiService from '../../../lib/api';

export default function AdminPayouts() {
  // Tab management
  const [activeTab, setActiveTab] = useState('payouts');
  
  // Payouts data
  const [payouts, setPayouts] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState({});
  
  // Payments data
  const [payments, setPayments] = useState([]);
  const [paymentStatistics, setPaymentStatistics] = useState({});
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  
  // Filters and pagination for payouts
  const [filters, setFilters] = useState({
    status: '',
    payout_method: '',
    company_id: '',
    search: '',
    date_from: '',
    date_to: '',
    sort_by: 'created_at',
    sort_order: 'desc'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  // Filters and pagination for payments
  const [paymentFilters, setPaymentFilters] = useState({
    status: '',
    payment_method: '',
    search: '',
    date_from: '',
    date_to: '',
    amount_min: '',
    amount_max: ''
  });
  const [paymentCurrentPage, setPaymentCurrentPage] = useState(1);
  const [paymentTotalPages, setPaymentTotalPages] = useState(1);
  const [paymentTotalItems, setPaymentTotalItems] = useState(0);
  
  // Modals
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [selectedPayout, setSelectedPayout] = useState(null);
  const [completeData, setCompleteData] = useState({
    reference_number: '',
    notes: ''
  });

  useEffect(() => {
    if (activeTab === 'payouts') {
      fetchPayouts();
      fetchStatistics();
    } else if (activeTab === 'payments') {
      fetchPayments();
      fetchPaymentStatistics();
    }
  }, [activeTab, currentPage, filters, paymentCurrentPage, paymentFilters]);

  const fetchPayouts = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        per_page: 15,
        ...filters
      };
      
      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (params[key] === '') delete params[key];
      });

      const response = await apiService.getAdminPayouts(params);
      if (response.success) {
        setPayouts(response.payouts.data || []);
        setCurrentPage(response.payouts.current_page || 1);
        setTotalPages(response.payouts.last_page || 1);
        setTotalItems(response.payouts.total || 0);
      }
    } catch (error) {
      console.error('Error fetching payouts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await apiService.getPayoutStatistics();
      if (response.success) {
        setStatistics(response.statistics || {});
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const fetchPayments = async () => {
    try {
      setPaymentLoading(true);
      const params = {
        page: paymentCurrentPage,
        per_page: 15,
        ...paymentFilters
      };
      
      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (params[key] === '') delete params[key];
      });

      const response = await apiService.getAdminPayments(params);
      if (response.success) {
        setPayments(response.data || []);
        setPaymentCurrentPage(response.pagination?.current_page || 1);
        setPaymentTotalPages(response.pagination?.last_page || 1);
        setPaymentTotalItems(response.pagination?.total || 0);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setPaymentLoading(false);
    }
  };

  const fetchPaymentStatistics = async () => {
    try {
      const response = await apiService.getPaymentStatistics();
      if (response.success) {
        setPaymentStatistics(response.data || {});
      }
    } catch (error) {
      console.error('Error fetching payment statistics:', error);
    }
  };

  const handleViewPaymentDetails = async (paymentId) => {
    try {
      const response = await apiService.getPaymentDetails(paymentId);
      if (response.success) {
        setSelectedPayment(response.data);
        setShowPaymentModal(true);
      }
    } catch (error) {
      console.error('Error fetching payment details:', error);
      alert('Error fetching payment details: ' + error.message);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handlePaymentFilterChange = (key, value) => {
    setPaymentFilters(prev => ({ ...prev, [key]: value }));
    setPaymentCurrentPage(1);
  };

  const handleProcessStripePayout = async (payoutId) => {
    try {
      setProcessing(prev => ({ ...prev, [payoutId]: true }));
      const response = await apiService.processStripePayout(payoutId);
      
      if (response.success) {
        await fetchPayouts();
        alert('Stripe payout processed successfully!');
      } else {
        alert('Failed to process payout: ' + response.message);
      }
    } catch (error) {
      console.error('Error processing payout:', error);
      alert('Error processing payout: ' + error.message);
    } finally {
      setProcessing(prev => ({ ...prev, [payoutId]: false }));
    }
  };

  const handleCompleteManualPayout = async () => {
    try {
      setProcessing(prev => ({ ...prev, [selectedPayout.id]: true }));
      const response = await apiService.completeManualPayout(selectedPayout.id, completeData);
      
      if (response.success) {
        await fetchPayouts();
        setShowCompleteModal(false);
        setSelectedPayout(null);
        setCompleteData({ reference_number: '', notes: '' });
        alert('Manual payout completed successfully!');
      } else {
        alert('Failed to complete payout: ' + response.message);
      }
    } catch (error) {
      console.error('Error completing payout:', error);
      alert('Error completing payout: ' + error.message);
    } finally {
      setProcessing(prev => ({ ...prev, [selectedPayout?.id]: false }));
    }
  };

  const handleRetryPayout = async (payoutId) => {
    try {
      setProcessing(prev => ({ ...prev, [payoutId]: true }));
      const response = await apiService.retryPayout(payoutId);
      
      if (response.success) {
        await fetchPayouts();
        alert('Payout retry initiated successfully!');
      } else {
        alert('Failed to retry payout: ' + response.message);
      }
    } catch (error) {
      console.error('Error retrying payout:', error);
      alert('Error retrying payout: ' + error.message);
    } finally {
      setProcessing(prev => ({ ...prev, [payoutId]: false }));
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'yellow', icon: Clock },
      processing: { color: 'blue', icon: RefreshCw },
      completed: { color: 'green', icon: CheckCircle },
      failed: { color: 'red', icon: AlertCircle }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <Badge color={config.color} className="flex items-center space-x-1">
        <Icon className="w-3 h-3" />
        <span className="capitalize">{status}</span>
      </Badge>
    );
  };

  const getMethodBadge = (method) => {
    return method === 'stripe' ? (
      <Badge color="blue" className="flex items-center space-x-1">
        <CreditCard className="w-3 h-3" />
        <span>Stripe</span>
      </Badge>
    ) : (
      <Badge color="gray" className="flex items-center space-x-1">
        <Building className="w-3 h-3" />
        <span>Manual</span>
      </Badge>
    );
  };

  return (
    <>
      <Head>
        <title>Payout Management - Admin Dashboard</title>
        <meta name="description" content="Manage seller payouts and transactions" />
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Financial Management</h1>
            <p className="text-gray-600">Manage seller payouts and track payment transactions</p>
          </div>
          <Button 
            onClick={activeTab === 'payouts' ? fetchPayouts : fetchPayments} 
            className="flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </Button>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('payouts')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'payouts'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <DollarSign className="w-4 h-4" />
                <span>Seller Payouts</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('payments')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'payments'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Receipt className="w-4 h-4" />
                <span>Payment Ledger</span>
              </div>
            </button>
          </nav>
        </div>

        {/* Statistics Cards */}
        {activeTab === 'payouts' ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-green-100 rounded-lg">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Payouts</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${statistics.total_payouts?.toFixed(2) || '0.00'}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Pending Payouts</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${statistics.pending_payouts?.toFixed(2) || '0.00'}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Platform Fees</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${statistics.total_platform_fees?.toFixed(2) || '0.00'}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Active Sellers</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {statistics.active_sellers || 0}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Receipt className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${paymentStatistics.total_revenue?.toFixed(2) || '0.00'}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Successful Payments</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {paymentStatistics.successful_payments || 0}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Platform Fees Collected</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${paymentStatistics.platform_fees_collected?.total_platform_fees?.toFixed(2) || '0.00'}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-red-100 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Failed Payments</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {paymentStatistics.failed_payments || 0}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Method</label>
              <select
                value={filters.payout_method}
                onChange={(e) => handleFilterChange('payout_method', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Methods</option>
                <option value="stripe">Stripe</option>
                <option value="manual">Manual</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
              <input
                type="date"
                value={filters.date_from}
                onChange={(e) => handleFilterChange('date_from', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
              <input
                type="date"
                value={filters.date_to}
                onChange={(e) => handleFilterChange('date_to', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Company or order..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div className="flex items-end">
              <Button
                onClick={() => {
                  setFilters({
                    status: '',
                    payout_method: '',
                    company_id: '',
                    search: '',
                    date_from: '',
                    date_to: '',
                    sort_by: 'created_at',
                    sort_order: 'desc'
                  });
                  setCurrentPage(1);
                }}
                variant="outline"
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </Card>

        {/* Payouts Table */}
        <Card className="overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Seller Payouts</h3>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading payouts...</p>
            </div>
          ) : payouts.length === 0 ? (
            <div className="p-8 text-center">
              <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No payouts found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Seller
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Method
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {payouts.map((payout) => (
                    <tr key={payout.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {payout.company?.name || 'Unknown Company'}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {payout.company_id}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {payout.order?.order_number || `Order #${payout.order_id}`}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            ${payout.net_amount?.toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-500">
                            Gross: ${payout.gross_amount?.toFixed(2)} | Fee: ${payout.platform_fee?.toFixed(2)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getMethodBadge(payout.payout_method)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(payout.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(payout.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        {payout.status === 'pending' && payout.payout_method === 'stripe' && (
                          <Button
                            size="sm"
                            onClick={() => handleProcessStripePayout(payout.id)}
                            disabled={processing[payout.id]}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            {processing[payout.id] ? (
                              <RefreshCw className="w-3 h-3 animate-spin" />
                            ) : (
                              <Play className="w-3 h-3" />
                            )}
                          </Button>
                        )}
                        
                        {payout.status === 'pending' && payout.payout_method === 'manual' && (
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedPayout(payout);
                              setShowCompleteModal(true);
                            }}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <Check className="w-3 h-3" />
                          </Button>
                        )}
                        
                        {payout.status === 'failed' && (
                          <Button
                            size="sm"
                            onClick={() => handleRetryPayout(payout.id)}
                            disabled={processing[payout.id]}
                            className="bg-orange-600 hover:bg-orange-700 text-white"
                          >
                            {processing[payout.id] ? (
                              <RefreshCw className="w-3 h-3 animate-spin" />
                            ) : (
                              <RotateCcw className="w-3 h-3" />
                            )}
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={totalItems}
                itemsPerPage={15}
              />
            </div>
          )}
        </Card>

        {/* Complete Manual Payout Modal */}
        <Modal
          isOpen={showCompleteModal}
          onClose={() => {
            setShowCompleteModal(false);
            setSelectedPayout(null);
            setCompleteData({ reference_number: '', notes: '' });
          }}
          title="Complete Manual Payout"
        >
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-4">
                Complete the manual payout for <strong>{selectedPayout?.company?.name}</strong>
              </p>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-sm">
                  <div className="flex justify-between">
                    <span>Net Amount:</span>
                    <span className="font-medium">${selectedPayout?.net_amount?.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reference Number *
              </label>
              <input
                type="text"
                value={completeData.reference_number}
                onChange={(e) => setCompleteData(prev => ({ ...prev, reference_number: e.target.value }))}
                placeholder="Bank transfer reference number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes (Optional)
              </label>
              <textarea
                value={completeData.notes}
                onChange={(e) => setCompleteData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional notes about the payout"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <Button
                onClick={handleCompleteManualPayout}
                disabled={!completeData.reference_number || processing[selectedPayout?.id]}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                {processing[selectedPayout?.id] ? (
                  <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Check className="w-4 h-4 mr-2" />
                )}
                Complete Payout
              </Button>
              <Button
                onClick={() => {
                  setShowCompleteModal(false);
                  setSelectedPayout(null);
                  setCompleteData({ reference_number: '', notes: '' });
                }}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </>
  );
}
