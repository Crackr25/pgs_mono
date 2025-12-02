import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { 
  ArrowLeft, Building2, User, Mail, Phone, MapPin, Globe, 
  CheckCircle, XCircle, Clock, CreditCard, Package, DollarSign,
  FileText, Calendar, Download, ExternalLink, File
} from 'lucide-react';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import ConfirmModal from '../../../components/common/ConfirmModal';
import apiService from '../../../lib/api';
import { useAuth } from '../../../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function CompanyDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);

  // Redirect non-admin users
  useEffect(() => {
    if (user && user.usertype !== 'admin') {
      router.push('/login');
    }
  }, [user, router]);

  // Fetch company details
  useEffect(() => {
    if (id) {
      fetchCompany();
    }
  }, [id]);

  const fetchCompany = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAdminCompany(id);
      setCompany(response.data);
    } catch (error) {
      console.error('Error fetching company:', error);
      alert('Failed to load company details');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setShowVerifyModal(false);
    
    try {
      setVerifying(true);
      const loadingToastId = toast.loading('Verifying company...');
      
      await apiService.verifyAdminCompany(id);
      
      toast.dismiss(loadingToastId);
      toast.success(`${company.name} has been successfully verified and can now start selling.`, { duration: 5000 });
      
      fetchCompany();
    } catch (error) {
      console.error('Error verifying company:', error);
      toast.error(error.message || 'Failed to verify company. Please try again.', { duration: 5000 });
    } finally {
      setVerifying(false);
    }
  };

  const handleReject = async () => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;
    
    try {
      const loadingToastId = toast.loading('Processing rejection...');
      
      await apiService.rejectAdminCompany(id, reason);
      
      toast.dismiss(loadingToastId);
      toast(`${company.name} has been rejected. The company owner will be notified.`, { icon: 'ℹ️', duration: 5000 });
      
      fetchCompany();
    } catch (error) {
      console.error('Error rejecting company:', error);
      toast.error('Failed to reject company. Please try again.', { duration: 5000 });
    }
  };

  const getVerificationBadge = () => {
    if (!company) return null;
    
    if (company.verified) {
      return (
        <span className="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-green-100 text-green-800">
          <CheckCircle className="h-4 w-4 mr-1" />
          Verified
        </span>
      );
    } else if (company.status === 'pending') {
      return (
        <span className="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
          <Clock className="h-4 w-4 mr-1" />
          Pending Verification
        </span>
      );
    } else if (company.status === 'inactive') {
      return (
        <span className="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-red-100 text-red-800">
          <XCircle className="h-4 w-4 mr-1" />
          Rejected
        </span>
      );
    }
    return null;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900">Company not found</h3>
          <Button onClick={() => router.push('/admin/companies')} className="mt-4">
            Back to Companies
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{company.name} - Company Details - Admin Portal</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => router.push('/admin/companies')}
              className="flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{company.name}</h1>
              <p className="mt-1 text-sm text-gray-500">Company ID: #{company.id}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {getVerificationBadge()}
            {company.status === 'pending' && !company.verified && (
              <>
                <Button
                  onClick={() => setShowVerifyModal(true)}
                  disabled={verifying}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {verifying ? 'Verifying...' : 'Verify Company'}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleReject}
                  className="text-red-600 hover:text-red-700"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Company Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-3 rounded-lg">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Owner</p>
                <p className="text-lg font-semibold text-gray-900">{company.user?.name || 'N/A'}</p>
                <p className="text-sm text-gray-500">{company.user?.email || ''}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 p-3 rounded-lg">
                <Package className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Products</p>
                <p className="text-lg font-semibold text-gray-900">{company.products_count || 0}</p>
                <p className="text-sm text-gray-500">Active listings</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center space-x-3">
              <div className="bg-purple-100 p-3 rounded-lg">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Orders</p>
                <p className="text-lg font-semibold text-gray-900">{company.orders_count || 0}</p>
                <p className="text-sm text-gray-500">Total orders</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Company Details */}
        <Card>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Company Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center text-sm font-medium text-gray-600 mb-1">
                <Building2 className="h-4 w-4 mr-2" />
                Company Name
              </label>
              <p className="text-sm text-gray-900">{company.name}</p>
            </div>

            <div>
              <label className="flex items-center text-sm font-medium text-gray-600 mb-1">
                <Mail className="h-4 w-4 mr-2" />
                Email
              </label>
              <p className="text-sm text-gray-900">{company.email || 'N/A'}</p>
            </div>

            <div>
              <label className="flex items-center text-sm font-medium text-gray-600 mb-1">
                <Phone className="h-4 w-4 mr-2" />
                Phone
              </label>
              <p className="text-sm text-gray-900">{company.phone || 'N/A'}</p>
            </div>

            <div>
              <label className="flex items-center text-sm font-medium text-gray-600 mb-1">
                <MapPin className="h-4 w-4 mr-2" />
                Location
              </label>
              <p className="text-sm text-gray-900">{company.location || 'N/A'}</p>
            </div>

            <div>
              <label className="flex items-center text-sm font-medium text-gray-600 mb-1">
                <Globe className="h-4 w-4 mr-2" />
                Website
              </label>
              <p className="text-sm text-gray-900">
                {company.website ? (
                  <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {company.website}
                  </a>
                ) : 'N/A'}
              </p>
            </div>

            <div>
              <label className="flex items-center text-sm font-medium text-gray-600 mb-1">
                <FileText className="h-4 w-4 mr-2" />
                Business Type
              </label>
              <p className="text-sm text-gray-900">{company.business_type || 'N/A'}</p>
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center text-sm font-medium text-gray-600 mb-1">
                <FileText className="h-4 w-4 mr-2" />
                Description
              </label>
              <p className="text-sm text-gray-900">{company.description || 'No description provided'}</p>
            </div>
          </div>
        </Card>

        {/* Stripe Integration */}
        <Card>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Stripe Integration</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center text-sm font-medium text-gray-600 mb-1">
                <CreditCard className="h-4 w-4 mr-2" />
                Stripe Account ID
              </label>
              <p className="text-sm text-gray-900 font-mono">{company.stripe_account_id || 'Not connected'}</p>
            </div>

            <div>
              <label className="flex items-center text-sm font-medium text-gray-600 mb-1">
                <CheckCircle className="h-4 w-4 mr-2" />
                Onboarding Status
              </label>
              <p className="text-sm text-gray-900">
                {company.stripe_onboarding_status === 'complete' ? (
                  <span className="text-green-600 font-medium">Complete</span>
                ) : company.stripe_account_id ? (
                  <span className="text-yellow-600 font-medium">Pending</span>
                ) : (
                  <span className="text-gray-500">Not Started</span>
                )}
              </p>
            </div>

            {company.stripe_country && (
              <div>
                <label className="flex items-center text-sm font-medium text-gray-600 mb-1">
                  <Globe className="h-4 w-4 mr-2" />
                  Stripe Country
                </label>
                <p className="text-sm text-gray-900">{company.stripe_country}</p>
              </div>
            )}
          </div>
        </Card>

        {/* Onboarding Documents */}
        <Card>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Onboarding Documents</h3>
          
          {company.documents && company.documents.length > 0 ? (
            <div className="space-y-3">
              {company.documents.map((doc, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="bg-blue-100 p-2 rounded">
                      <File className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {doc.document_type || doc.name || 'Document'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {doc.file_type || 'Unknown type'} • {doc.file_size ? `${(doc.file_size / 1024).toFixed(2)} KB` : 'Size unknown'}
                      </p>
                      {doc.uploaded_at && (
                        <p className="text-xs text-gray-400">
                          Uploaded: {formatDate(doc.uploaded_at)}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {doc.status && (
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        doc.status === 'verified' ? 'bg-green-100 text-green-800' :
                        doc.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {doc.status}
                      </span>
                    )}
                    {doc.url && (
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="View Document"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                    {doc.download_url && (
                      <a
                        href={doc.download_url}
                        download
                        className="p-2 text-green-600 hover:bg-green-50 rounded transition-colors"
                        title="Download Document"
                      >
                        <Download className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <File className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-500">No documents uploaded</p>
              <p className="text-xs text-gray-400">Documents will appear here once the company uploads them</p>
            </div>
          )}

          {/* Business Registration Documents */}
          {(company.business_registration || company.tax_id_document || company.bank_statement) && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Business Registration Documents</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {company.business_registration && (
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-blue-600" />
                      <span className="text-sm text-blue-900">Business Registration</span>
                    </div>
                    <a
                      href={company.business_registration}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                )}
                
                {company.tax_id_document && (
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-900">Tax ID Document</span>
                    </div>
                    <a
                      href={company.tax_id_document}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 hover:text-green-800"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                )}

                {company.bank_statement && (
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-purple-600" />
                      <span className="text-sm text-purple-900">Bank Statement</span>
                    </div>
                    <a
                      href={company.bank_statement}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-600 hover:text-purple-800"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Additional Verification Documents */}
          {(company.proof_of_address || company.identity_document) && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Verification Documents</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {company.proof_of_address && (
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm text-yellow-900">Proof of Address</span>
                    </div>
                    <a
                      href={company.proof_of_address}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-yellow-600 hover:text-yellow-800"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                )}

                {company.identity_document && (
                  <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-indigo-600" />
                      <span className="text-sm text-indigo-900">Identity Document</span>
                    </div>
                    <a
                      href={company.identity_document}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-800"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
        </Card>

        {/* Timestamps */}
        <Card>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Timeline</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center text-sm font-medium text-gray-600 mb-1">
                <Calendar className="h-4 w-4 mr-2" />
                Created At
              </label>
              <p className="text-sm text-gray-900">{formatDate(company.created_at)}</p>
            </div>

            <div>
              <label className="flex items-center text-sm font-medium text-gray-600 mb-1">
                <Calendar className="h-4 w-4 mr-2" />
                Last Updated
              </label>
              <p className="text-sm text-gray-900">{formatDate(company.updated_at)}</p>
            </div>

            {company.verified_at && (
              <div>
                <label className="flex items-center text-sm font-medium text-gray-600 mb-1">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Verified At
                </label>
                <p className="text-sm text-gray-900">{formatDate(company.verified_at)}</p>
              </div>
            )}
          </div>
        </Card>

        {/* Verification Confirmation Modal */}
        <ConfirmModal
          isOpen={showVerifyModal}
          onClose={() => setShowVerifyModal(false)}
          onConfirm={handleVerify}
          type="success"
          title="Verify Company"
          message={
            <>
              Are you sure you want to verify <span className="font-semibold text-gray-900">{company?.name}</span>? 
              This will allow them to start selling products on the platform.
            </>
          }
          note={
            <>
              <strong>Note:</strong> Once verified, the company will receive a notification and gain access to seller features.
            </>
          }
          confirmText="Yes, Verify"
          cancelText="Cancel"
          isLoading={verifying}
        />
      </div>
    </>
  );
}
