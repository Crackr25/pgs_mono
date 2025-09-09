import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Clock, 
  MapPin, 
  Package, 
  DollarSign,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  Eye,
  Play,
  User,
  Building,
  Mail,
  Phone,
  Star,
  MessageSquare,
  FileText,
  Image as ImageIcon,
  Video
} from 'lucide-react';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import Modal from '../../../components/common/Modal';
import { useAuth } from '../../../contexts/AuthContext';
import apiService from '../../../lib/api';

export default function RFQDetails() {
  const router = useRouter();
  const { id } = router.query;
  const { user, isAuthenticated } = useAuth();
  
  const [rfq, setRfq] = useState(null);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [previewModal, setPreviewModal] = useState({ isOpen: false, file: null, type: null });
  const [activeTab, setActiveTab] = useState('details'); // details, responses, timeline

  useEffect(() => {
    if (id && isAuthenticated) {
      fetchRFQDetails();
      fetchRFQResponses();
    }
  }, [id, isAuthenticated]);

  const fetchRFQDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching RFQ details for ID:', id);
      const response = await apiService.getBuyerRFQ(id);
      console.log('RFQ API Response:', response);
      
      if (response.success !== false) {
        setRfq(response.data || response);
        console.log('RFQ loaded successfully:', response.data || response);
      } else {
        console.error('API returned error:', response.message);
        throw new Error(response.message || 'Failed to fetch RFQ details');
      }
    } catch (error) {
      console.error('Error fetching RFQ details:', error);
      setError('Failed to load RFQ details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchRFQResponses = async () => {
    try {
      // Assuming there's an API endpoint for getting responses to an RFQ
      const response = await apiService.getRFQResponses(id);
      if (response.success !== false) {
        setResponses(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching RFQ responses:', error);
      // Don't set error state for responses as it's not critical
    }
  };

  const handleDeleteRFQ = async () => {
    if (!rfq) return;

    setIsDeleting(true);
    try {
      const response = await apiService.deleteBuyerRFQ(rfq.id);
      
      if (response.success) {
        router.push('/buyer/rfqs');
      } else {
        setError(response.message || 'Failed to delete RFQ. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting RFQ:', error);
      setError('Failed to delete RFQ. Please try again.');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'published': return CheckCircle;
      case 'active': return CheckCircle;
      case 'closed': return XCircle;
      case 'expired': return AlertCircle;
      case 'draft': return Clock;
      default: return Clock;
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
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDaysRemaining = (expiryDate) => {
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  // Attachment helper functions
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
    if (!attachment) return '';
    
    if (attachment.file_url) {
      return attachment.file_url;
    }
    
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const storagePath = attachment.path || attachment.file_path;
    
    if (!storagePath) return '';
    
    const cleanPath = storagePath.replace(/^rfq-attachments\//, '');
    return `${baseUrl}/storage/rfq-attachments/${cleanPath}`;
  };

  const getFileIcon = (filename) => {
    if (!filename) return '📎';
    const extension = filename.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'pdf': return '📄';
      case 'doc':
      case 'docx': return '📝';
      case 'xls':
      case 'xlsx': return '📊';
      case 'zip':
      case 'rar': return '📦';
      default: return '📎';
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown size';
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleAttachmentClick = (attachment) => {
    if (isImageAttachment(attachment)) {
      setPreviewModal({ isOpen: true, file: attachment, type: 'image' });
    } else if (isVideoAttachment(attachment)) {
      setPreviewModal({ isOpen: true, file: attachment, type: 'video' });
    } else {
      // Download or open in new tab for other file types
      window.open(getAttachmentUrl(attachment), '_blank');
    }
  };

  if (loading) {
    return (
      <>
        <Head>
          <title>Loading RFQ - Buyer Portal</title>
        </Head>
        <div className="space-y-6">
          <Card className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-2 text-secondary-600">Loading RFQ details...</p>
          </Card>
        </div>
      </>
    );
  }

  if (error || !rfq) {
    return (
      <>
        <Head>
          <title>RFQ Not Found - Buyer Portal</title>
        </Head>
        <div className="space-y-6">
          <Card className="p-8 text-center">
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-secondary-900 mb-2">RFQ Not Found</h2>
            <p className="text-secondary-600 mb-4">
              {error || 'The requested RFQ could not be found.'}
            </p>
            <Link href="/buyer/rfqs">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to RFQs
              </Button>
            </Link>
          </Card>
        </div>
      </>
    );
  }

  const StatusIcon = getStatusIcon(rfq.status);

  return (
    <>
      <Head>
        <title>{rfq.title} - RFQ Details - Buyer Portal</title>
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
              <h1 className="text-2xl font-bold text-secondary-900">{rfq.title}</h1>
              <div className="flex items-center space-x-4 mt-1">
                <div className="flex items-center space-x-2">
                  <StatusIcon className="w-4 h-4" />
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(rfq.status)}`}>
                    {rfq.status}
                  </span>
                </div>
                {rfq.status === 'published' && (
                  <div className="flex items-center text-sm text-orange-600">
                    <Clock className="w-4 h-4 mr-1" />
                    {getDaysRemaining(rfq.expires_at)} days remaining
                  </div>
                )}
                <span className="text-sm text-secondary-500">
                  Created {formatDate(rfq.created_at)}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-2">
            {(rfq.status === 'draft' || rfq.status === 'published') && (
              <Link href={`/buyer/rfqs/${rfq.id}/edit`}>
                <Button variant="outline">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </Link>
            )}
            <Button
              variant="danger"
              onClick={() => setShowDeleteModal(true)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-secondary-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('details')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'details'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
              }`}
            >
              RFQ Details
            </button>
            <button
              onClick={() => setActiveTab('responses')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'responses'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
              }`}
            >
              Supplier Responses ({responses.length})
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'details' && (
          <div className="space-y-6">
            {/* Overview */}
            <Card>
              <div className="p-6">
                <h2 className="text-lg font-medium text-secondary-900 mb-4">Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Package className="w-4 h-4 text-secondary-400" />
                      <span className="text-sm font-medium text-secondary-500">Quantity</span>
                    </div>
                    <p className="text-lg font-semibold text-secondary-900">
                      {rfq.quantity?.toLocaleString()} {rfq.unit}
                    </p>
                  </div>
                  
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <DollarSign className="w-4 h-4 text-secondary-400" />
                      <span className="text-sm font-medium text-secondary-500">Budget Range</span>
                    </div>
                    <p className="text-lg font-semibold text-secondary-900">
                      {formatCurrency(rfq.budget_min)} - {formatCurrency(rfq.budget_max)}
                    </p>
                  </div>
                  
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <MapPin className="w-4 h-4 text-secondary-400" />
                      <span className="text-sm font-medium text-secondary-500">Delivery Location</span>
                    </div>
                    <p className="text-lg font-semibold text-secondary-900">{rfq.delivery_location}</p>
                  </div>
                  
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Calendar className="w-4 h-4 text-secondary-400" />
                      <span className="text-sm font-medium text-secondary-500">Required Date</span>
                    </div>
                    <p className="text-lg font-semibold text-secondary-900">
                      {new Date(rfq.delivery_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Description */}
            <Card>
              <div className="p-6">
                <h2 className="text-lg font-medium text-secondary-900 mb-4">Description</h2>
                <p className="text-secondary-700 whitespace-pre-wrap">{rfq.description}</p>
              </div>
            </Card>

            {/* Specifications */}
            {rfq.specifications && rfq.specifications.length > 0 && (
              <Card>
                <div className="p-6">
                  <h2 className="text-lg font-medium text-secondary-900 mb-4">Technical Specifications</h2>
                  <div className="space-y-3">
                    {rfq.specifications.map((spec, index) => (
                      <div key={index} className="flex justify-between py-2 border-b border-secondary-100 last:border-b-0">
                        <span className="font-medium text-secondary-700">{spec.key || spec.name}</span>
                        <span className="text-secondary-900">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            )}

            {/* Attachments */}
            {rfq.attachments && rfq.attachments.length > 0 && (
              <Card>
                <div className="p-6">
                  <h2 className="text-lg font-medium text-secondary-900 mb-4">
                    Attachments ({rfq.attachments.length})
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {rfq.attachments.map((attachment, index) => (
                      <div
                        key={index}
                        className="border border-secondary-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => handleAttachmentClick(attachment)}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            {isImageAttachment(attachment) ? (
                              <div className="w-12 h-12 rounded overflow-hidden">
                                <img
                                  src={getAttachmentUrl(attachment)}
                                  alt={attachment.original_name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                  }}
                                />
                                <div className="w-full h-full bg-gray-200 flex items-center justify-center text-xl" style={{display: 'none'}}>
                                  🖼️
                                </div>
                              </div>
                            ) : isVideoAttachment(attachment) ? (
                              <div className="w-12 h-12 rounded overflow-hidden relative">
                                <video
                                  src={getAttachmentUrl(attachment)}
                                  className="w-full h-full object-cover"
                                  muted
                                  preload="metadata"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                  }}
                                />
                                <div className="w-full h-full bg-gray-200 flex items-center justify-center text-xl absolute inset-0" style={{display: 'none'}}>
                                  🎥
                                </div>
                                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20">
                                  <Play className="w-6 h-6 text-white" />
                                </div>
                              </div>
                            ) : (
                              <div className="w-12 h-12 bg-secondary-100 rounded flex items-center justify-center">
                                <span className="text-2xl">{getFileIcon(attachment.original_name)}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-secondary-900 truncate">
                              {attachment.original_name || 'Unnamed file'}
                            </p>
                            <p className="text-xs text-secondary-500">
                              {formatFileSize(attachment.size)}
                            </p>
                            <div className="flex items-center space-x-2 mt-1">
                              {isImageAttachment(attachment) && (
                                <span className="inline-flex items-center text-xs text-green-600">
                                  <ImageIcon className="w-3 h-3 mr-1" />
                                  Image
                                </span>
                              )}
                              {isVideoAttachment(attachment) && (
                                <span className="inline-flex items-center text-xs text-blue-600">
                                  <Video className="w-3 h-3 mr-1" />
                                  Video
                                </span>
                              )}
                            </div>
                          </div>
                          <div>
                            <Download className="w-4 h-4 text-secondary-400" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            )}

            {/* Quality Requirements */}
            {(rfq.certifications_required?.length > 0 || rfq.quality_standards || rfq.sample_requirements) && (
              <Card>
                <div className="p-6">
                  <h2 className="text-lg font-medium text-secondary-900 mb-4">Quality Requirements</h2>
                  
                  {rfq.certifications_required?.length > 0 && (
                    <div className="mb-4">
                      <h3 className="text-sm font-medium text-secondary-700 mb-2">Required Certifications</h3>
                      <div className="flex flex-wrap gap-2">
                        {rfq.certifications_required.map((cert, index) => (
                          <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {cert}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {rfq.quality_standards && (
                    <div className="mb-4">
                      <h3 className="text-sm font-medium text-secondary-700 mb-2">Quality Standards</h3>
                      <p className="text-sm text-secondary-600">{rfq.quality_standards}</p>
                    </div>
                  )}
                  
                  {rfq.sample_requirements && (
                    <div>
                      <h3 className="text-sm font-medium text-secondary-700 mb-2">Sample Requirements</h3>
                      <p className="text-sm text-secondary-600">{rfq.sample_requirements}</p>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Terms & Conditions */}
            {(rfq.payment_terms || rfq.terms_conditions) && (
              <Card>
                <div className="p-6">
                  <h2 className="text-lg font-medium text-secondary-900 mb-4">Terms & Conditions</h2>
                  
                  {rfq.payment_terms && (
                    <div className="mb-4">
                      <h3 className="text-sm font-medium text-secondary-700 mb-2">Payment Terms</h3>
                      <p className="text-sm text-secondary-600">{rfq.payment_terms}</p>
                    </div>
                  )}
                  
                  {rfq.terms_conditions && (
                    <div>
                      <h3 className="text-sm font-medium text-secondary-700 mb-2">Additional Terms</h3>
                      <p className="text-sm text-secondary-600">{rfq.terms_conditions}</p>
                    </div>
                  )}
                </div>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'responses' && (
          <div className="space-y-6">
            {responses.length === 0 ? (
              <Card className="p-8 text-center">
                <MessageSquare className="w-12 h-12 text-secondary-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-secondary-900 mb-2">No Responses Yet</h3>
                <p className="text-secondary-600">
                  Suppliers haven't submitted any quotes for this RFQ yet. Check back later or share your RFQ with more suppliers.
                </p>
              </Card>
            ) : (
              <div className="space-y-4">
                {responses.map((response, index) => (
                  <Card key={response.id || index}>
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                            <Building className="w-5 h-5 text-primary-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-medium text-secondary-900">
                              {response.supplier_name || 'Supplier'}
                            </h3>
                            <div className="flex items-center space-x-4 text-sm text-secondary-500">
                              <span>Submitted {formatDate(response.created_at)}</span>
                              {response.rating && (
                                <div className="flex items-center">
                                  <Star className="w-4 h-4 text-yellow-400 mr-1" />
                                  <span>{response.rating}/5</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-secondary-900">
                            {formatCurrency(response.quoted_price || 0)}
                          </p>
                          <p className="text-sm text-secondary-500">Total Quote</p>
                        </div>
                      </div>
                      
                      {response.message && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-secondary-700 mb-2">Message</h4>
                          <p className="text-sm text-secondary-600">{response.message}</p>
                        </div>
                      )}
                      
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-1" />
                          View Details
                        </Button>
                        <Button size="sm">
                          <MessageSquare className="w-4 h-4 mr-1" />
                          Contact Supplier
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
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
                This action cannot be undone. All responses and related data will be permanently removed.
              </p>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-secondary-900">{rfq?.title}</h4>
            <p className="text-sm text-secondary-600 mt-1">
              Status: {rfq?.status} • Created {rfq?.created_at && formatDate(rfq.created_at)}
            </p>
          </div>
          
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteRFQ}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Deleting...
                </>
              ) : (
                'Delete RFQ'
              )}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Attachment Preview Modal */}
      {previewModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-full bg-white rounded-lg overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-medium text-gray-900">
                {previewModal.file?.original_name || 'Attachment'}
              </h3>
              <button
                onClick={() => setPreviewModal({ isOpen: false, file: null, type: null })}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              {previewModal.type === 'image' ? (
                <img
                  src={getAttachmentUrl(previewModal.file)}
                  alt={previewModal.file?.original_name}
                  className="max-w-full max-h-[70vh] object-contain mx-auto"
                />
              ) : previewModal.type === 'video' ? (
                <video
                  src={getAttachmentUrl(previewModal.file)}
                  controls
                  autoPlay
                  className="max-w-full max-h-[70vh] mx-auto"
                >
                  Your browser does not support the video tag.
                </video>
              ) : null}
            </div>
            <div className="px-4 pb-4">
              <p className="text-sm text-gray-600">
                File size: {formatFileSize(previewModal.file?.size)}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
