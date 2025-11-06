import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '../../../components/layout/Layout';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import { useAuth } from '../../../contexts/AuthContext';
import apiService from '../../../lib/api';
import AdditionalInfoForm from '../../../components/stripe/AdditionalInfoForm';
import { 
  ArrowLeft,
  CreditCard,
  AlertCircle,
  CheckCircle,
  ExternalLink,
  Shield
} from 'lucide-react';

export default function StripeAdditionalInfo() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [accountStatus, setAccountStatus] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    checkAccountStatus();
  }, []);

  const checkAccountStatus = async () => {
    try {
      setLoading(true);
      const response = await apiService.request('/stripe/account-status');
      if (response.success) {
        setAccountStatus(response);
      }
    } catch (error) {
      console.error('Failed to fetch account status:', error);
      setError('Failed to load account information');
    } finally {
      setLoading(false);
    }
  };

  const handleAccessDashboard = async () => {
    try {
      setLoading(true);
      const response = await apiService.request('/stripe/create-login-link', {
        method: 'POST'
      });

      if (response.success && response.login_url) {
        window.open(response.login_url, '_blank');
      } else {
        setError(response.message || 'Failed to create dashboard link');
      }
    } catch (error) {
      setError(error.message || 'Failed to access dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !accountStatus) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading account information...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>Stripe Additional Information - PGS Merchant Portal</title>
        <meta name="description" content="Update additional Stripe account information" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <Button
              onClick={() => router.back()}
              variant="outline"
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            
            <div className="flex items-center space-x-3">
              <CreditCard className="w-8 h-8 text-primary-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Stripe Account Information
                </h1>
                <p className="text-gray-600 mt-1">
                  Update additional information required for account verification
                </p>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <Card className="p-4 mb-6 bg-red-50 border-red-200">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-red-900">Error</h4>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </Card>
          )}

          {!accountStatus ? (
            <Card className="p-8 text-center">
              <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                No Stripe Account Found
              </h2>
              <p className="text-gray-600 mb-6">
                You need to create a Stripe account first before updating additional information.
              </p>
              <Button
                onClick={() => router.push('/merchant/onboarding/stripe')}
                className="bg-primary-600 hover:bg-primary-700 text-white"
              >
                <CreditCard className="w-5 h-5 mr-2" />
                Create Stripe Account
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Account Status */}
                <Card className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Account Status</h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Account ID:</span>
                      <span className="font-mono text-sm">{accountStatus.stripe_account_id}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Onboarding Status:</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        accountStatus.onboarding_status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {accountStatus.onboarding_status === 'completed' ? 'Completed' : 'Pending'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Charges Enabled:</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        accountStatus.charges_enabled
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {accountStatus.charges_enabled ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Payouts Enabled:</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        accountStatus.payouts_enabled
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {accountStatus.payouts_enabled ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t">
                    <Button
                      onClick={handleAccessDashboard}
                      disabled={loading}
                      variant="outline"
                      className="w-full"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600 mr-2"></div>
                          Loading...
                        </>
                      ) : (
                        <>
                          <ExternalLink className="w-5 h-5 mr-2" />
                          Access Stripe Dashboard
                        </>
                      )}
                    </Button>
                  </div>
                </Card>

                {/* Additional Information Form */}
                <Card className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Update Additional Information</h2>
                  <p className="text-gray-600 mb-6">
                    Provide additional information to complete your account verification and 
                    meet compliance requirements.
                  </p>
                  
                  <AdditionalInfoForm 
                    accountStatus={accountStatus}
                    onUpdate={checkAccountStatus}
                  />
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Information Notice */}
                <Card className="p-6">
                  <div className="flex items-start space-x-3">
                    <Shield className="w-6 h-6 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">
                        Why This Information?
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">
                        Stripe requires additional information to verify your identity and 
                        comply with financial regulations.
                      </p>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• SSN for tax reporting</li>
                        <li>• Address for verification</li>
                        <li>• ID for identity confirmation</li>
                        <li>• DOB for age verification</li>
                      </ul>
                    </div>
                  </div>
                </Card>

                {/* Security Notice */}
                <Card className="p-6 bg-green-50 border-green-200">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-green-900 mb-2">
                        Secure & Encrypted
                      </h3>
                      <p className="text-sm text-green-700">
                        All information is encrypted and securely transmitted to Stripe. 
                        Your data is protected with bank-level security.
                      </p>
                    </div>
                  </div>
                </Card>

                {/* Help */}
                <Card className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Need Help?</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    If you have questions about the required information, contact our support team.
                  </p>
                  <Button
                    onClick={() => router.push('/contact')}
                    variant="outline"
                    className="w-full"
                  >
                    Contact Support
                  </Button>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
