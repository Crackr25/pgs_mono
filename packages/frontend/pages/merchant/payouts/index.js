import { useState, useEffect } from 'react';
import Head from 'next/head';
import { 
  DollarSign,
  Calendar,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  CreditCard,
  Building,
  Download,
  RefreshCw,
  Eye,
  Filter
} from 'lucide-react';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import Badge from '../../../components/common/Badge';
import Pagination from '../../../components/common/Pagination';
import apiService from '../../../lib/api';

export default function SellerPayouts() {
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    total_earnings: 0,
    pending_payouts: 0,
    completed_payouts: 0,
    total_platform_fees: 0
  });
  
  // Filters and pagination
  const [filters, setFilters] = useState({
    status: '',
    date_from: '',
    date_to: '',
    sort_by: 'created_at',
    sort_order: 'desc'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    fetchPayouts();
  }, [currentPage, filters]);

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

      const response = await apiService.getSellerPayouts(params);
      if (response.success) {
        setPayouts(response.payouts.data || []);
        setCurrentPage(response.payouts.current_page || 1);
        setTotalPages(response.payouts.last_page || 1);
        setTotalItems(response.payouts.total || 0);
        
        // Calculate summary from payouts
        calculateSummary(response.payouts.data || []);
      }
    } catch (error) {
      console.error('Error fetching payouts:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateSummary = (payoutData) => {
    const summary = payoutData.reduce((acc, payout) => {
      acc.total_earnings += payout.net_amount || 0;
      acc.total_platform_fees += payout.platform_fee || 0;
      
      if (payout.status === 'pending' || payout.status === 'processing') {
        acc.pending_payouts += payout.net_amount || 0;
      } else if (payout.status === 'completed') {
        acc.completed_payouts += payout.net_amount || 0;
      }
      
      return acc;
    }, {
      total_earnings: 0,
      pending_payouts: 0,
      completed_payouts: 0,
      total_platform_fees: 0
    });
    
    setSummary(summary);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'yellow', icon: Clock, text: 'Pending' },
      processing: { color: 'blue', icon: RefreshCw, text: 'Processing' },
      completed: { color: 'green', icon: CheckCircle, text: 'Completed' },
      failed: { color: 'red', icon: AlertCircle, text: 'Failed' }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <Badge color={config.color} className="flex items-center space-x-1">
        <Icon className="w-3 h-3" />
        <span>{config.text}</span>
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

  const getStatusMessage = (payout) => {
    switch (payout.status) {
      case 'pending':
        return payout.payout_method === 'stripe' 
          ? 'Awaiting automatic processing via Stripe'
          : 'Awaiting manual processing by platform';
      case 'processing':
        return 'Payout is being processed';
      case 'completed':
        return payout.processed_at 
          ? `Completed on ${new Date(payout.processed_at).toLocaleDateString()}`
          : 'Payout completed';
      case 'failed':
        return 'Payout failed - contact support';
      default:
        return 'Unknown status';
    }
  };

  return (
    <>
      <Head>
        <title>My Payouts - Seller Dashboard</title>
        <meta name="description" content="View your payout history and earnings" />
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Payouts</h1>
            <p className="text-gray-600">Track your earnings and payout history</p>
          </div>
          <Button onClick={fetchPayouts} className="flex items-center space-x-2">
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Earnings</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${summary.total_earnings.toFixed(2)}
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
                  ${summary.pending_payouts.toFixed(2)}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Completed Payouts</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${summary.completed_payouts.toFixed(2)}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Platform Fees</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${summary.total_platform_fees.toFixed(2)}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

            <div className="flex items-end">
              <Button
                onClick={() => {
                  setFilters({
                    status: '',
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

        {/* Payouts List */}
        <Card className="overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Payout History</h3>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading payouts...</p>
            </div>
          ) : payouts.length === 0 ? (
            <div className="p-8 text-center">
              <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No payouts yet</h3>
              <p className="text-gray-600">Your payouts will appear here once you start receiving orders.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {payouts.map((payout) => (
                <div key={payout.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-lg font-medium text-gray-900">
                          ${payout.net_amount?.toFixed(2)}
                        </h4>
                        {getStatusBadge(payout.status)}
                        {getMethodBadge(payout.payout_method)}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Order:</span> {payout.order?.order_number || `#${payout.order_id}`}
                        </div>
                        <div>
                          <span className="font-medium">Gross Amount:</span> ${payout.gross_amount?.toFixed(2)}
                        </div>
                        <div>
                          <span className="font-medium">Platform Fee:</span> ${payout.platform_fee?.toFixed(2)} ({payout.platform_fee_percentage}%)
                        </div>
                      </div>
                      
                      <div className="mt-2 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4" />
                          <span>Created: {new Date(payout.created_at).toLocaleDateString()}</span>
                          {payout.processed_at && (
                            <>
                              <span>•</span>
                              <span>Processed: {new Date(payout.processed_at).toLocaleDateString()}</span>
                            </>
                          )}
                        </div>
                      </div>
                      
                      <div className="mt-2">
                        <p className="text-sm text-gray-600">
                          {getStatusMessage(payout)}
                        </p>
                      </div>
                      
                      {payout.reference_number && (
                        <div className="mt-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Ref: {payout.reference_number}
                          </span>
                        </div>
                      )}
                      
                      {payout.notes && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-600 italic">
                            Note: {payout.notes}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div className="ml-4">
                      <div className="text-right">
                        <div className="text-sm text-gray-500">
                          Payout #{payout.id}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
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
      </div>
    </>
  );
}
