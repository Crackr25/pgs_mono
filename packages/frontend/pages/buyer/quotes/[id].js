import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  MessageSquare,
  Package,
  Building2,
  Calendar,
  DollarSign,
  Star,
  Phone,
  Mail,
  Globe,
  Download,
  Share2,
  MoreHorizontal,
  MapPin,
  Truck,
  Shield,
  Award,
  Edit,
  Copy,
  Eye,
  FileText
} from 'lucide-react';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import Badge from '../../../components/common/Badge';
import Modal from '../../../components/common/Modal';
import Skeleton from '../../../components/common/Skeleton';
import { useAuth } from '../../../contexts/AuthContext';
import apiService from '../../../lib/api';

export default function QuoteDetails() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('details');
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  // Utility functions
  const getDaysRemaining = (deadline) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const formatCurrency = (amount) => {
    if (!amount) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  useEffect(() => {
    if (id) {
      fetchQuoteDetails();
    }
  }, [id]);

  const handleAcceptQuote = async () => {
    try {
      setActionLoading(true);
      await apiService.updateQuoteStatus(quote.id, 'accepted');
      
      // Update local state
      setQuote(prev => ({ ...prev, status: 'accepted' }));
      setShowAcceptModal(false);
      
      // Show success message
      alert('Quote accepted successfully! The supplier will be notified.');
      
    } catch (error) {
      console.error('Error accepting quote:', error);
      alert('Failed to accept quote. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectQuote = async () => {
    try {
      setActionLoading(true);
      await apiService.updateQuoteStatus(quote.id, 'rejected', { 
        rejection_reason: rejectionReason.trim() || undefined 
      });
      
      // Update local state
      setQuote(prev => ({ 
        ...prev, 
        status: 'rejected', 
        rejection_reason: rejectionReason.trim() || null 
      }));
      setShowRejectModal(false);
      setRejectionReason('');
      
      // Show success message
      alert('Quote declined. The supplier will be notified.');
      
    } catch (error) {
      console.error('Error rejecting quote:', error);
      alert('Failed to decline quote. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const fetchQuoteDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      try {
        const response = await apiService.getBuyerQuote(id);
        
        if (response.success !== false) {
          setQuote(response.data || response);
        } else {
          throw new Error(response.message || 'Failed to fetch quote details');
        }
      } catch (apiError) {
        console.error('Error fetching quote details:', apiError);
        setError('Failed to load quote details. Please try again.');
      }
    } catch (error) {
      console.error('Error fetching quote details:', error);
      setError('Failed to load quote details. Please try again.');
    } finally {
      setLoading(false);
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

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-secondary-300'
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-96" />
            <Skeleton className="h-64" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-64" />
            <Skeleton className="h-48" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !quote) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Quote Not Found</h2>
        <p className="text-gray-600 mb-4">{error || 'The quote you are looking for does not exist.'}</p>
        <Link href="/buyer/quotes">
          <Button>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to My Quotes
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Quote #{quote.id.toString().padStart(6, '0')} - My Quotes</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-secondary-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-secondary-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-secondary-900">
                Quote #{quote.id.toString().padStart(6, '0')}
              </h1>
              <div className="flex items-center space-x-4 mt-1">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(quote.status)}
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(quote.status)}`}>
                    {quote.status}
                  </span>
                </div>
                {quote.deadline && (
                  <div className="flex items-center text-sm text-orange-600">
                    <Clock className="w-4 h-4 mr-1" />
                    {getDaysRemaining(quote.deadline) > 0 
                      ? `${getDaysRemaining(quote.deadline)} days remaining`
                      : 'Expired'
                    }
                  </div>
                )}
                <span className="text-sm text-secondary-500">
                  Created {formatDate(quote.created_at)}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button variant="outline">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
            <Button variant="outline">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Product Information */}
            <Card>
              <div className="p-6">
                <h2 className="text-lg font-medium text-secondary-900 mb-4">Product Information</h2>
                
                <div className="flex items-start space-x-4">
                  {/* Product Image */}
                  <div className="w-24 h-24 bg-secondary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    {quote.product?.image ? (
                      <Image
                        src={quote.product.image}
                        alt={quote.product.name}
                        width={96}
                        height={96}
                        className="object-cover rounded-lg"
                      />
                    ) : (
                      <Package className="w-8 h-8 text-secondary-400" />
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-semibold text-secondary-900 mb-2">
                          {quote.product?.name || 'Product'}
                        </h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-secondary-600">Quantity:</span>
                            <span className="ml-2 font-medium">{quote.quantity?.toLocaleString()} {quote.unit}</span>
                          </div>
                          {quote.target_price && (
                            <div>
                              <span className="text-secondary-600">Target Price:</span>
                              <span className="ml-2 font-medium">{formatCurrency(quote.target_price)}</span>
                            </div>
                          )}
                          <div>
                            <span className="text-secondary-600">Deadline:</span>
                            <span className="ml-2 font-medium">{formatDate(quote.deadline)}</span>
                          </div>
                          <div>
                            <span className="text-secondary-600">Category:</span>
                            <span className="ml-2 font-medium">{quote.product?.category || 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                      
                      {quote.product && (
                        <Link href={`/buyer/products/${quote.product.id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-1" />
                            View Product
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quote Message */}
                {quote.message && (
                  <div className="mt-6 p-4 bg-secondary-50 rounded-lg">
                    <h4 className="font-medium text-secondary-900 mb-2">Your Message</h4>
                    <p className="text-secondary-700 whitespace-pre-wrap">{quote.message}</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Supplier Response */}
            {quote.status === 'responded' && quote.response_message && (
              <Card>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-medium text-secondary-900">Supplier Response</h2>
                    <Badge variant="success">Responded</Badge>
                  </div>
                  
                  {/* Quote Details */}
                  {quote.quoted_price && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="text-center">
                        <p className="text-sm text-green-600 font-medium">Quoted Price</p>
                        <p className="text-2xl font-bold text-green-800">
                          {formatCurrency(quote.quoted_price)}
                        </p>
                        <p className="text-xs text-green-600">per {quote.unit}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-green-600 font-medium">Total Value</p>
                        <p className="text-2xl font-bold text-green-800">
                          {formatCurrency(quote.quoted_price * quote.quantity)}
                        </p>
                        <p className="text-xs text-green-600">{quote.quantity} {quote.unit}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-green-600 font-medium">Lead Time</p>
                        <p className="text-2xl font-bold text-green-800">
                          {quote.quoted_lead_time || 'TBD'}
                        </p>
                        <p className="text-xs text-green-600">business days</p>
                      </div>
                    </div>
                  )}

                  {/* Response Message */}
                  <div className="p-4 bg-white border border-secondary-200 rounded-lg">
                    <h4 className="font-medium text-secondary-900 mb-2">Message from Supplier</h4>
                    <p className="text-secondary-700 whitespace-pre-wrap">{quote.response_message}</p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-3 mt-6">
                    <Button 
                      className="bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => setShowAcceptModal(true)}
                      disabled={actionLoading || quote.status !== 'responded'}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Accept Quote
                    </Button>
                    <Button variant="outline">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Negotiate
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => setShowRejectModal(true)}
                      disabled={actionLoading || quote.status !== 'responded'}
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Decline
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Quote History/Timeline */}
            <Card>
              <div className="p-6">
                <h2 className="text-lg font-medium text-secondary-900 mb-4">Quote Timeline</h2>
                
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <FileText className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-secondary-900">Quote Request Submitted</p>
                      <p className="text-sm text-secondary-600">{formatDate(quote.created_at)}</p>
                    </div>
                  </div>
                  
                  {quote.status === 'responded' && (
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <MessageSquare className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-secondary-900">Supplier Responded</p>
                        <p className="text-sm text-secondary-600">{formatDate(quote.updated_at)}</p>
                      </div>
                    </div>
                  )}
                  
                  {quote.status === 'pending' && (
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                        <Clock className="w-4 h-4 text-yellow-600" />
                      </div>
                      <div>
                        <p className="font-medium text-secondary-900">Waiting for Response</p>
                        <p className="text-sm text-secondary-600">
                          Deadline: {formatDate(quote.deadline)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Supplier Information */}
            <Card>
              <div className="p-6">
                <h2 className="text-lg font-medium text-secondary-900 mb-4">Supplier Information</h2>
                
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                    <Shield className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-secondary-900">
                        {quote.supplier?.name || quote.company?.name || 'Supplier'}
                      </h3>
                      {quote.supplier?.verified && (
                        <Shield className="w-4 h-4 text-green-500" />
                      )}
                    </div>
                    <div className="flex items-center space-x-1 text-sm text-secondary-600">
                      <MapPin className="w-3 h-3" />
                      <span>{quote.supplier?.location || quote.company?.location || 'Location'}</span>
                    </div>
                    <div className="flex items-center space-x-1 mt-1">
                      {renderStars(quote.supplier?.rating || quote.company?.rating || 4.5)}
                      <span className="text-sm text-secondary-600 ml-1">
                        ({quote.supplier?.total_reviews || quote.company?.total_reviews || 0} reviews)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between">
                    <span className="text-secondary-600">Response Time:</span>
                    <span>{quote.supplier?.response_time || quote.company?.response_time || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary-600">Established:</span>
                    <span>{quote.supplier?.established || quote.company?.established || 'N/A'}</span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Link href={`/buyer/messages?supplier=${quote.company_id}&quote=${quote.id}`}>
                    <Button variant="outline" size="sm" className="flex-1">
                      <MessageSquare className="w-4 h-4 mr-1" />
                      Message
                    </Button>
                  </Link>
                  <Link href={`/buyer/suppliers/${quote.company_id}`}>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="w-4 h-4 mr-1" />
                      View Profile
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>

            {/* Quick Actions */}
            <Card>
              <div className="p-6">
                <h2 className="text-lg font-medium text-secondary-900 mb-4">Quick Actions</h2>
                
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Copy className="w-4 h-4 mr-2" />
                    Duplicate Quote Request
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Edit className="w-4 h-4 mr-2" />
                    Modify Request
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="w-4 h-4 mr-2" />
                    Download Quote
                  </Button>
                  <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700">
                    <XCircle className="w-4 h-4 mr-2" />
                    Cancel Request
                  </Button>
                </div>
              </div>
            </Card>

            {/* Quote Summary */}
            <Card>
              <div className="p-6">
                <h2 className="text-lg font-medium text-secondary-900 mb-4">Quote Summary</h2>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-secondary-600">Quote ID:</span>
                    <span className="font-medium">#{quote.id.toString().padStart(6, '0')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary-600">Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(quote.status).replace('border-', 'border ')}`}>
                      {quote.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary-600">Created:</span>
                    <span>{formatDate(quote.created_at)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary-600">Deadline:</span>
                    <span>{formatDate(quote.deadline)}</span>
                  </div>
                  {quote.quoted_price && (
                    <>
                      <hr className="my-3" />
                      <div className="flex justify-between font-medium">
                        <span className="text-secondary-900">Total Quote:</span>
                        <span className="text-green-600">
                          {formatCurrency(quote.quoted_price * quote.quantity)}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Accept Quote Modal */}
      <Modal
        isOpen={showAcceptModal}
        onClose={() => setShowAcceptModal(false)}
        title="Accept Quote"
        size="md"
      >
        <div className="space-y-4">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-secondary-900 mb-2">
              Accept this quote?
            </h3>
            <p className="text-sm text-secondary-600 mb-4">
              You are about to accept this quote from the supplier. This action cannot be undone.
            </p>
            
            {/* Quote Summary */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-left">
                  <span className="text-secondary-600">Product:</span>
                  <span className="ml-2 font-medium">{quote?.product?.name}</span>
                </div>
                <div className="text-left">
                  <span className="text-secondary-600">Quantity:</span>
                  <span className="ml-2 font-medium">{quote?.quantity} units</span>
                </div>
                <div className="text-left">
                  <span className="text-secondary-600">Unit Price:</span>
                  <span className="ml-2 font-medium text-green-600">{formatCurrency(quote?.quoted_price)}</span>
                </div>
                <div className="text-left">
                  <span className="text-secondary-600">Total Value:</span>
                  <span className="ml-2 font-bold text-green-600">
                    {formatCurrency(quote?.quoted_price * quote?.quantity)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Button 
              variant="outline" 
              onClick={() => setShowAcceptModal(false)}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button 
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={handleAcceptQuote}
              disabled={actionLoading}
            >
              {actionLoading ? 'Processing...' : 'Yes, Accept Quote'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reject Quote Modal */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => {
          setShowRejectModal(false);
          setRejectionReason('');
        }}
        title="Decline Quote"
        size="md"
      >
        <div className="space-y-4">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-medium text-secondary-900 mb-2">
              Decline this quote?
            </h3>
            <p className="text-sm text-secondary-600 mb-4">
              You are about to decline this quote. The supplier will be notified of your decision.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Reason for declining (optional)
            </label>
            <textarea
              rows={4}
              className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Let the supplier know why you're declining their quote. This helps them improve their future offers."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              maxLength={500}
            />
            <p className="text-xs text-secondary-500 mt-1">
              {rejectionReason.length}/500 characters
            </p>
          </div>

          <div className="flex justify-end space-x-3">
            <Button 
              variant="outline" 
              onClick={() => {
                setShowRejectModal(false);
                setRejectionReason('');
              }}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button 
              variant="outline"
              className="text-red-600 border-red-200 hover:bg-red-50"
              onClick={handleRejectQuote}
              disabled={actionLoading}
            >
              {actionLoading ? 'Processing...' : 'Decline Quote'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
