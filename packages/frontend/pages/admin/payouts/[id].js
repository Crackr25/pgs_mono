import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { 
  ArrowLeft,
  DollarSign,
  Calendar,
  Building,
  CreditCard,
  CheckCircle,
  Clock,
  AlertCircle,
  RefreshCw,
  Play,
  Check,
  RotateCcw,
  Eye,
  User,
  Package
} from 'lucide-react';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import Badge from '../../../components/common/Badge';
import Modal from '../../../components/common/Modal';
import apiService from '../../../lib/api';

export default function PayoutDetail() {
  const router = useRouter();
  const { id } = router.query;
  
  const [payout, setPayout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  
  // Modals
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [completeData, setCompleteData] = useState({
    reference_number: '',
    notes: ''
  });

  useEffect(() => {
    if (id) {
      fetchPayoutDetail();
    }
  }, [id]);

  const fetchPayoutDetail = async () => {
    try {
      setLoading(true);
      // Since we don't have a specific detail endpoint, we'll get from the list
      // In a real implementation, you'd have GET /admin/payouts/{id}
      const response = await apiService.getAdminPayouts({ per_page: 1000 });
      if (response.success) {
        const payoutDetail = response.payouts.data.find(p => p.id === parseInt(id));
        setPayout(payoutDetail);
      }
    } catch (error) {
      console.error('Error fetching payout detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProcessStripePayout = async () => {
    try {
      setProcessing(true);
      const response = await apiService.processStripePayout(payout.id);
      
      if (response.success) {
        await fetchPayoutDetail();
        alert('Stripe payout processed successfully!');
      } else {
        alert('Failed to process payout: ' + response.message);
      }
    } catch (error) {
      console.error('Error processing payout:', error);
      alert('Error processing payout: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleCompleteManualPayout = async () => {
    try {
      setProcessing(true);
      const response = await apiService.completeManualPayout(payout.id, completeData);
      
      if (response.success) {
        await fetchPayoutDetail();
        setShowCompleteModal(false);
        setCompleteData({ reference_number: '', notes: '' });
        alert('Manual payout completed successfully!');
      } else {
        alert('Failed to complete payout: ' + response.message);
      }
    } catch (error) {
      console.error('Error completing payout:', error);
      alert('Error completing payout: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleRetryPayout = async () => {
    try {
      setProcessing(true);
      const response = await apiService.retryPayout(payout.id);
      
      if (response.success) {
        await fetchPayoutDetail();
        alert('Payout retry initiated successfully!');
      } else {
        alert('Failed to retry payout: ' + response.message);
      }
    } catch (error) {
      console.error('Error retrying payout:', error);
      alert('Error retrying payout: ' + error.message);
    } finally {
      setProcessing(false);
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
        <Icon className="w-4 h-4" />
        <span className="capitalize">{status}</span>
      </Badge>
    );
  };

  const getMethodBadge = (method) => {
    return method === 'stripe' ? (
      <Badge color="blue" className="flex items-center space-x-1">
        <CreditCard className="w-4 h-4" />
        <span>Stripe</span>
      </Badge>
    ) : (
      <Badge color="gray" className="flex items-center space-x-1">
        <Building className="w-4 h-4" />
        <span>Manual</span>
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="h-64 bg-gray-200 rounded"></div>
              <div className="h-48 bg-gray-200 rounded"></div>
            </div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!payout) {
    return (
      <div className="text-center py-16">
        <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Payout not found</h2>
        <p className="text-gray-600 mb-8">The payout you're looking for doesn't exist.</p>
        <Link href="/admin/payouts">
          <Button className="bg-primary-600 hover:bg-primary-700 text-white">
            Back to Payouts
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Payout #{payout.id} - Admin Dashboard</title>
        <meta name="description" content={`Payout details for ${payout.company?.name}`} />
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/admin/payouts">
              <button className="flex items-center space-x-2 text-gray-600 hover:text-primary-600">
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Payouts</span>
              </button>
            </Link>
            <div className="h-6 border-l border-gray-300"></div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Payout #{payout.id}</h1>
              <p className="text-gray-600">Manage payout details and processing</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {getStatusBadge(payout.status)}
            {getMethodBadge(payout.payout_method)}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Payout Information */}
          <div className="space-y-6">
            {/* Amount Details */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Amount Details</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-600">Gross Amount</span>
                  <span className="font-medium text-gray-900">${payout.gross_amount?.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-600">Platform Fee ({payout.platform_fee_percentage}%)</span>
                  <span className="font-medium text-red-600">-${payout.platform_fee?.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-t-2 border-gray-300">
                  <span className="text-lg font-semibold text-gray-900">Net Amount</span>
                  <span className="text-lg font-bold text-green-600">${payout.net_amount?.toFixed(2)}</span>
                </div>
              </div>
            </Card>

            {/* Order Information */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Information</h3>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Package className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Order Number:</span>
                  <span className="font-medium">{payout.order?.order_number || `#${payout.order_id}`}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Order Date:</span>
                  <span className="font-medium">
                    {payout.order?.created_at ? new Date(payout.order.created_at).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>
            </Card>

            {/* Processing Information */}
            {(payout.reference_number || payout.notes || payout.processed_at) && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Processing Information</h3>
                
                <div className="space-y-3">
                  {payout.processed_at && (
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-gray-600">Processed At:</span>
                      <span className="font-medium">{new Date(payout.processed_at).toLocaleString()}</span>
                    </div>
                  )}
                  
                  {payout.reference_number && (
                    <div className="flex items-center space-x-2">
                      <Eye className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">Reference:</span>
                      <span className="font-medium font-mono">{payout.reference_number}</span>
                    </div>
                  )}
                  
                  {payout.notes && (
                    <div>
                      <span className="text-gray-600">Notes:</span>
                      <p className="mt-1 text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{payout.notes}</p>
                    </div>
                  )}
                  
                  {payout.admin_user && (
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">Processed By:</span>
                      <span className="font-medium">{payout.admin_user.name}</span>
                    </div>
                  )}
                </div>
              </Card>
            )}
          </div>

          {/* Company Information & Actions */}
          <div className="space-y-6">
            {/* Company Details */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Seller Information</h3>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Building className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Company:</span>
                  <span className="font-medium">{payout.company?.name || 'Unknown Company'}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="text-gray-600">Company ID:</span>
                  <span className="font-medium">{payout.company_id}</span>
                </div>
                
                {payout.company?.country && (
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-600">Country:</span>
                    <span className="font-medium">{payout.company.country}</span>
                  </div>
                )}
              </div>
            </Card>

            {/* Timeline */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h3>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-gray-900">Payout Created</p>
                    <p className="text-sm text-gray-600">{new Date(payout.created_at).toLocaleString()}</p>
                  </div>
                </div>
                
                {payout.status !== 'pending' && (
                  <div className="flex items-start space-x-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      payout.status === 'completed' ? 'bg-green-500' : 
                      payout.status === 'failed' ? 'bg-red-500' : 'bg-yellow-500'
                    }`}></div>
                    <div>
                      <p className="font-medium text-gray-900 capitalize">Status: {payout.status}</p>
                      <p className="text-sm text-gray-600">
                        {payout.processed_at ? new Date(payout.processed_at).toLocaleString() : 'In progress'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Actions */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
              
              <div className="space-y-3">
                {payout.status === 'pending' && payout.payout_method === 'stripe' && (
                  <Button
                    onClick={handleProcessStripePayout}
                    disabled={processing}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {processing ? (
                      <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Play className="w-4 h-4 mr-2" />
                    )}
                    Process Stripe Payout
                  </Button>
                )}
                
                {payout.status === 'pending' && payout.payout_method === 'manual' && (
                  <Button
                    onClick={() => setShowCompleteModal(true)}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Complete Manual Payout
                  </Button>
                )}
                
                {payout.status === 'failed' && (
                  <Button
                    onClick={handleRetryPayout}
                    disabled={processing}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    {processing ? (
                      <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <RotateCcw className="w-4 h-4 mr-2" />
                    )}
                    Retry Payout
                  </Button>
                )}
                
                <Button
                  onClick={fetchPayoutDetail}
                  variant="outline"
                  className="w-full"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Details
                </Button>
              </div>
            </Card>
          </div>
        </div>

        {/* Complete Manual Payout Modal */}
        <Modal
          isOpen={showCompleteModal}
          onClose={() => {
            setShowCompleteModal(false);
            setCompleteData({ reference_number: '', notes: '' });
          }}
          title="Complete Manual Payout"
        >
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-4">
                Complete the manual payout for <strong>{payout.company?.name}</strong>
              </p>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-sm">
                  <div className="flex justify-between">
                    <span>Net Amount:</span>
                    <span className="font-medium">${payout.net_amount?.toFixed(2)}</span>
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
                disabled={!completeData.reference_number || processing}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                {processing ? (
                  <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Check className="w-4 h-4 mr-2" />
                )}
                Complete Payout
              </Button>
              <Button
                onClick={() => {
                  setShowCompleteModal(false);
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
