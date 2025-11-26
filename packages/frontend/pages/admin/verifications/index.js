import { useState, useEffect } from 'react';
import Head from 'next/head';
import { CheckCircle, XCircle, Clock, Eye, FileText, Building2, Mail, Phone, MapPin } from 'lucide-react';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import apiService from '../../../lib/api';

export default function VerificationQueue() {
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchVerifications();
  }, [currentPage]);

  const fetchVerifications = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAdminPendingVerifications({ page: currentPage, per_page: 10 });
      setVerifications(response.data || []);
      setPagination({
        current_page: response.current_page,
        last_page: response.last_page,
        total: response.total,
        from: response.from,
        to: response.to
      });
    } catch (error) {
      console.error('Error fetching verifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (company) => {
    setSelectedCompany(company);
    setShowDetailsModal(true);
  };

  const handleVerify = async (companyId) => {
    if (!confirm('Are you sure you want to verify this company?')) return;
    
    try {
      setActionLoading(true);
      await apiService.verifyAdminCompany(companyId);
      alert('Company verified successfully');
      fetchVerifications();
      setShowDetailsModal(false);
    } catch (error) {
      console.error('Error verifying company:', error);
      alert(error.message || 'Failed to verify company');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (companyId) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;
    
    try {
      setActionLoading(true);
      await apiService.rejectAdminCompany(companyId, { reason });
      alert('Company verification rejected');
      fetchVerifications();
      setShowDetailsModal(false);
    } catch (error) {
      console.error('Error rejecting company:', error);
      alert(error.message || 'Failed to reject company');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Verification Queue - Admin Portal</title>
      </Head>

      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Verification Queue</h1>
            <p className="mt-1 text-sm text-gray-500">
              Review and verify pending company registrations
            </p>
          </div>
        </div>

        {/* Stats Card */}
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Verifications</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{pagination?.total || 0}</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </Card>

        {/* Verifications List */}
        <Card>
          <div className="space-y-4">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : verifications.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No pending verifications</h3>
                <p className="mt-1 text-sm text-gray-500">All companies have been verified or rejected.</p>
              </div>
            ) : (
              verifications.map((company) => (
                <div key={company.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary-100 p-2 rounded-lg">
                          <Building2 className="h-5 w-5 text-primary-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{company.name}</h3>
                          <p className="text-sm text-gray-500">ID: {company.id}</p>
                        </div>
                      </div>
                      
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="h-4 w-4" />
                          <span>{company.user?.email || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="h-4 w-4" />
                          <span>{company.phone || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="h-4 w-4" />
                          <span>{company.location || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="h-4 w-4" />
                          <span>Submitted: {new Date(company.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {company.description && (
                        <p className="mt-3 text-sm text-gray-600 line-clamp-2">{company.description}</p>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(company)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Review
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {pagination && pagination.last_page > 1 && (
            <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{pagination.from || 0}</span> to{' '}
                <span className="font-medium">{pagination.to || 0}</span> of{' '}
                <span className="font-medium">{pagination.total || 0}</span> results
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === pagination.last_page}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedCompany && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Company Verification Review</h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Company Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Company Name</label>
                    <p className="text-sm text-gray-900 mt-1">{selectedCompany.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Business Type</label>
                    <p className="text-sm text-gray-900 mt-1">{selectedCompany.business_type || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Location</label>
                    <p className="text-sm text-gray-900 mt-1">{selectedCompany.location || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Phone</label>
                    <p className="text-sm text-gray-900 mt-1">{selectedCompany.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Email</label>
                    <p className="text-sm text-gray-900 mt-1">{selectedCompany.email || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Website</label>
                    <p className="text-sm text-gray-900 mt-1">{selectedCompany.website || 'N/A'}</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-600">Description</label>
                    <p className="text-sm text-gray-900 mt-1">{selectedCompany.description || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Owner Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Owner Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Name</label>
                    <p className="text-sm text-gray-900 mt-1">{selectedCompany.user?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Email</label>
                    <p className="text-sm text-gray-900 mt-1">{selectedCompany.user?.email || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Documents */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Submitted Documents</h3>
                <div className="space-y-2">
                  {selectedCompany.dti_sec_certificate && (
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-600" />
                        <span className="text-sm text-gray-900">DTI/SEC Certificate</span>
                      </div>
                      <a
                        href={`${process.env.NEXT_PUBLIC_API_URL}/storage/${selectedCompany.dti_sec_certificate}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary-600 hover:text-primary-700"
                      >
                        View
                      </a>
                    </div>
                  )}
                  {selectedCompany.business_permits && (
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-600" />
                        <span className="text-sm text-gray-900">Business Permits</span>
                      </div>
                      <a
                        href={`${process.env.NEXT_PUBLIC_API_URL}/storage/${selectedCompany.business_permits}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary-600 hover:text-primary-700"
                      >
                        View
                      </a>
                    </div>
                  )}
                  {!selectedCompany.dti_sec_certificate && !selectedCompany.business_permits && (
                    <p className="text-sm text-gray-500">No documents uploaded yet</p>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowDetailsModal(false)}
                disabled={actionLoading}
              >
                Close
              </Button>
              <Button
                variant="outline"
                onClick={() => handleReject(selectedCompany.id)}
                disabled={actionLoading}
                className="text-red-600 border-red-600 hover:bg-red-50"
              >
                <XCircle className="h-4 w-4 mr-1" />
                Reject
              </Button>
              <Button
                onClick={() => handleVerify(selectedCompany.id)}
                disabled={actionLoading}
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                {actionLoading ? 'Processing...' : 'Verify Company'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
