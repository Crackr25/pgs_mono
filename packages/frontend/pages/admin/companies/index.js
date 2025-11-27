import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Building2, Search, Filter, CheckCircle, XCircle, Clock, Eye, Trash2 } from 'lucide-react';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import ConfirmModal from '../../../components/common/ConfirmModal';
import { useToast } from '../../../components/common/Toast';
import apiService from '../../../lib/api';

export default function CompanyManagement() {
  const router = useRouter();
  const toast = useToast();
  const [companies, setCompanies] = useState([]);
  const [stats, setStats] = useState({
    total_companies: 0,
    verified: 0,
    pending: 0,
    rejected: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [verifyModal, setVerifyModal] = useState({ isOpen: false, companyId: null, companyName: '' });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, companyId: null, companyName: '' });
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchCompanies();
    fetchStatistics();
  }, [currentPage, searchTerm, filterStatus]);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        per_page: 10,
        search: searchTerm,
        verification_status: filterStatus !== 'all' ? filterStatus : undefined
      };
      const response = await apiService.getAdminCompanies(params);
      setCompanies(response.data || []);
      setPagination({
        current_page: response.current_page,
        last_page: response.last_page,
        total: response.total,
        from: response.from,
        to: response.to
      });
    } catch (error) {
      console.error('Error fetching companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await apiService.getAdminCompanyStatistics();
      setStats(response.data || {});
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const openVerifyModal = (companyId, companyName) => {
    setVerifyModal({ isOpen: true, companyId, companyName });
  };

  const handleVerify = async () => {
    const { companyId, companyName } = verifyModal;
    setVerifyModal({ ...verifyModal, isOpen: false });
    
    try {
      setIsProcessing(true);
      const loadingToastId = toast.showLoading('Verifying Company', 'Please wait while we verify this company...');
      
      await apiService.verifyAdminCompany(companyId);
      
      toast.removeToast(loadingToastId);
      toast.showSuccess(
        'Company Verified!',
        `${companyName} has been successfully verified and can now start selling.`,
        5000
      );
      
      fetchCompanies();
      fetchStatistics();
    } catch (error) {
      console.error('Error verifying company:', error);
      toast.showError(
        'Verification Failed',
        error.message || 'Failed to verify company. Please try again.',
        5000
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const openDeleteModal = (companyId, companyName) => {
    setDeleteModal({ isOpen: true, companyId, companyName });
  };

  const handleDelete = async () => {
    const { companyId, companyName } = deleteModal;
    setDeleteModal({ ...deleteModal, isOpen: false });
    
    try {
      setIsProcessing(true);
      const loadingToastId = toast.showLoading('Deleting Company', 'Please wait...');
      
      await apiService.deleteAdminCompany(companyId);
      
      toast.removeToast(loadingToastId);
      toast.showSuccess(
        'Company Deleted',
        `${companyName} has been permanently deleted.`,
        5000
      );
      
      fetchCompanies();
      fetchStatistics();
    } catch (error) {
      console.error('Error deleting company:', error);
      toast.showError(
        'Deletion Failed',
        error.message || 'Failed to delete company. Please try again.',
        5000
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const getVerificationBadge = (company) => {
    if (company.verified) {
      return { text: 'Verified', class: 'bg-green-100 text-green-800' };
    } else if (company.status === 'pending') {
      return { text: 'Pending', class: 'bg-yellow-100 text-yellow-800' };
    } else if (company.status === 'inactive') {
      return { text: 'Rejected', class: 'bg-red-100 text-red-800' };
    }
    return { text: 'Unknown', class: 'bg-gray-100 text-gray-800' };
  };

  const getStripeBadge = (company) => {
    if (company.stripe_onboarding_status === 'completed') {
      return { text: 'Connected', class: 'bg-blue-100 text-blue-800' };
    } else if (company.stripe_account_id) {
      return { text: 'Pending', class: 'bg-yellow-100 text-yellow-800' };
    }
    return { text: 'Not Connected', class: 'bg-gray-100 text-gray-800' };
  };
  return (
    <>
      <Head>
        <title>Company Management - Admin Portal</title>
      </Head>

      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Company Management</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage company profiles, verification, and onboarding
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Companies</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total_companies?.toLocaleString() || 0}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <Building2 className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Verified</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.verified?.toLocaleString() || 0}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.pending?.toLocaleString() || 0}</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.rejected?.toLocaleString() || 0}</p>
              </div>
              <div className="bg-red-100 p-3 rounded-lg">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search companies by name, ID, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Status</option>
              <option value="verified">Verified</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </Card>

        {/* Companies Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Verification
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stripe Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                      </div>
                    </td>
                  </tr>
                ) : companies.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                      No companies found
                    </td>
                  </tr>
                ) : (
                  companies.map((company) => {
                    const verificationBadge = getVerificationBadge(company);
                    const stripeBadge = getStripeBadge(company);
                    return (
                      <tr key={company.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded bg-purple-100 flex items-center justify-center">
                              <Building2 className="h-5 w-5 text-purple-600" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{company.name}</div>
                              <div className="text-sm text-gray-500">ID: #{company.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {company.location || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${verificationBadge.class}`}>
                            {verificationBadge.text}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${stripeBadge.class}`}>
                            {stripeBadge.text}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            {company.status === 'pending' && !company.verified && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openVerifyModal(company.id, company.name)}
                                className="text-green-600 hover:text-green-900"
                                disabled={isProcessing}
                              >
                                Verify
                              </Button>
                            )}
                            <button
                              onClick={() => router.push(`/admin/companies/${company.id}`)}
                              className="text-blue-600 hover:text-blue-900"
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => openDeleteModal(company.id, company.name)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete"
                              disabled={isProcessing}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination && (
            <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
              <div className="flex items-center justify-between">
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
            </div>
          )}
        </Card>

        {/* Verify Confirmation Modal */}
        <ConfirmModal
          isOpen={verifyModal.isOpen}
          onClose={() => setVerifyModal({ ...verifyModal, isOpen: false })}
          onConfirm={handleVerify}
          type="success"
          title="Verify Company"
          message={
            <>
              Are you sure you want to verify <span className="font-semibold text-gray-900">{verifyModal.companyName}</span>? 
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
          isLoading={isProcessing}
        />

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          isOpen={deleteModal.isOpen}
          onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
          onConfirm={handleDelete}
          type="danger"
          title="Delete Company"
          message={
            <>
              Are you sure you want to delete <span className="font-semibold text-gray-900">{deleteModal.companyName}</span>? 
              This action cannot be undone.
            </>
          }
          note={
            <>
              <strong>Warning:</strong> All company data, products, and associated records will be permanently deleted.
            </>
          }
          confirmText="Yes, Delete"
          cancelText="Cancel"
          isLoading={isProcessing}
        />
      </div>
    </>
  );
}
