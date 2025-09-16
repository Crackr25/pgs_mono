import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { 
  CreditCard, 
  Building, 
  Shield, 
  CheckCircle, 
  AlertCircle, 
  ArrowLeft,
  ExternalLink,
  Clock,
  DollarSign,
  Users
} from 'lucide-react';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import { useAuth } from '../../../contexts/AuthContext';
import apiService from '../../../lib/api';

export default function StripeOnboarding() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [accountStatus, setAccountStatus] = useState(null);
  const [error, setError] = useState('');
  const [companyInfo, setCompanyInfo] = useState({
    email: '',
    country: 'PH'
  });

  useEffect(() => {
    checkExistingAccount();
    // Pre-populate email from user data
    if (user?.email) {
      setCompanyInfo(prev => ({
        ...prev,
        email: user.email
      }));
    }
  }, [user]);

  const checkExistingAccount = async () => {
    try {
      const response = await apiService.request('/stripe/account-status', {
        method: 'GET'
      });
      if (response.success && response.data) {
        setAccountStatus(response.data);
      }
    } catch (error) {
      // No existing account or error - that's fine for new onboarding
      console.log('No existing Stripe account found');
    }
  };

  const handleCreateAccount = async () => {
    if (!companyInfo.email.trim()) {
      setError('Email address is required');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // First create the Express account
      const createResponse = await apiService.request('/stripe/create-express-account', {
        method: 'POST',
        data: {
          email: companyInfo.email.trim(),
          country: companyInfo.country
        }
      });

      if (!createResponse.success) {
        throw new Error(createResponse.message || 'Failed to create Stripe account');
      }

      // Then generate the onboarding link
      const onboardingResponse = await apiService.request('/stripe/create-onboarding-link', {
        method: 'POST',
        data: {
          refresh_url: `${window.location.origin}/merchant/onboarding/stripe`,
          return_url: `${window.location.origin}/merchant/onboarding/success`
        }
      });

      if (onboardingResponse.success && onboardingResponse.onboarding_url) {
        // Redirect to Stripe onboarding
        window.location.href = onboardingResponse.onboarding_url;
      } else {
        throw new Error(onboardingResponse.message || 'Failed to generate onboarding link');
      }

    } catch (error) {
      console.error('Onboarding error:', error);
      setError(error.message || 'Failed to start onboarding process');
    } finally {
      setLoading(false);
    }
  };

  const handleContinueOnboarding = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await apiService.request('/stripe/create-onboarding-link', {
        method: 'POST',
        data: {
          refresh_url: `${window.location.origin}/merchant/onboarding/stripe`,
          return_url: `${window.location.origin}/merchant/onboarding/success`
        }
      });

      if (response.success && response.onboarding_url) {
        window.location.href = response.onboarding_url;
      } else {
        throw new Error(response.message || 'Failed to generate onboarding link');
      }

    } catch (error) {
      console.error('Continue onboarding error:', error);
      setError(error.message || 'Failed to continue onboarding process');
    } finally {
      setLoading(false);
    }
  };

  const handleAccessDashboard = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await apiService.request('/stripe/create-login-link', {
        method: 'POST'
      });

      if (response.success && response.login_url) {
        window.open(response.login_url, '_blank');
      } else {
        throw new Error(response.message || 'Failed to generate dashboard link');
      }

    } catch (error) {
      console.error('Dashboard access error:', error);
      setError(error.message || 'Failed to access dashboard');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'restricted': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return 'Active';
      case 'pending': return 'Pending';
      case 'restricted': return 'Restricted';
      default: return 'Not Started';
    }
  };

  return (
    <>
      <Head>
        <title>Stripe Payment Setup - Pinoy Global Supply</title>
        <meta name="description" content="Set up your Stripe account to receive payments" />
      </Head>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <Link href="/merchant/dashboard">
              <button className="flex items-center space-x-2 text-secondary-600 hover:text-primary-600 mb-4">
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Dashboard</span>
              </button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Payment Setup</h1>
            <p className="text-lg text-gray-600 mt-2">
              Set up your Stripe account to start receiving payments from customers
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Current Status */}
              {accountStatus && (
                <Card className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Current Status</h2>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Stripe Account</p>
                      <p className="text-sm text-gray-600">Account ID: {accountStatus.stripe_account_id}</p>
                    </div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(accountStatus.onboarding_status)}`}>
                      {getStatusText(accountStatus.onboarding_status)}
                    </span>
                  </div>

                  {accountStatus.onboarding_status === 'completed' && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-start space-x-2">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-green-900">Account Active</h4>
                          <p className="text-sm text-green-700 mt-1">
                            Your Stripe account is fully set up and ready to receive payments.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {accountStatus.onboarding_status === 'pending' && (
                    <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-start space-x-2">
                        <Clock className="w-5 h-5 text-yellow-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-yellow-900">Onboarding Incomplete</h4>
                          <p className="text-sm text-yellow-700 mt-1">
                            You need to complete your Stripe onboarding to start receiving payments.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              )}

              {/* Error Display */}
              {error && (
                <Card className="p-6">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-red-900">Error</h4>
                      <p className="text-sm text-red-700 mt-1">{error}</p>
                    </div>
                  </div>
                </Card>
              )}

              {/* Onboarding Form */}
              {!accountStatus && (
                <Card className="p-6">
                  <h2 className="text-xl font-semibold mb-6">Start Payment Setup</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Business Email Address *
                      </label>
                      <input
                        type="email"
                        value={companyInfo.email}
                        onChange={(e) => setCompanyInfo({...companyInfo, email: e.target.value})}
                        placeholder="business@company.com"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        This will be used for your Stripe account and payment notifications
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Country
                      </label>
                      <select
                        value={companyInfo.country}
                        onChange={(e) => setCompanyInfo({...companyInfo, country: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="PH">Philippines</option>
                        <option value="US">United States</option>
                        <option value="SG">Singapore</option>
                        <option value="MY">Malaysia</option>
                      </select>
                    </div>

                    <Button
                      onClick={handleCreateAccount}
                      disabled={loading}
                      className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Setting up account...
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-5 h-5 mr-2" />
                          Start Stripe Setup
                        </>
                      )}
                    </Button>
                  </div>
                </Card>
              )}

              {/* Action Buttons for Existing Account */}
              {accountStatus && (
                <Card className="p-6">
                  <h2 className="text-xl font-semibold mb-6">Account Actions</h2>
                  
                  <div className="space-y-4">
                    {accountStatus.onboarding_status !== 'completed' && (
                      <Button
                        onClick={handleContinueOnboarding}
                        disabled={loading}
                        className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3"
                      >
                        {loading ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                            Loading...
                          </>
                        ) : (
                          <>
                            <ExternalLink className="w-5 h-5 mr-2" />
                            Continue Stripe Onboarding
                          </>
                        )}
                      </Button>
                    )}

                    {accountStatus.onboarding_status === 'completed' && (
                      <Button
                        onClick={handleAccessDashboard}
                        disabled={loading}
                        variant="outline"
                        className="w-full py-3"
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
                    )}
                  </div>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Benefits */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Why Stripe?</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Shield className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-gray-900">Secure Payments</h4>
                      <p className="text-sm text-gray-600">Bank-level security and PCI compliance</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <DollarSign className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-gray-900">Fast Payouts</h4>
                      <p className="text-sm text-gray-600">Get paid quickly with automatic transfers</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Users className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-gray-900">Global Reach</h4>
                      <p className="text-sm text-gray-600">Accept payments from customers worldwide</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Process Steps */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Setup Process</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 rounded-full bg-primary-600 text-white text-xs flex items-center justify-center font-medium">1</div>
                    <span className="text-sm text-gray-700">Provide business information</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 rounded-full bg-primary-600 text-white text-xs flex items-center justify-center font-medium">2</div>
                    <span className="text-sm text-gray-700">Verify your identity</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 rounded-full bg-primary-600 text-white text-xs flex items-center justify-center font-medium">3</div>
                    <span className="text-sm text-gray-700">Add bank account details</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 rounded-full bg-primary-600 text-white text-xs flex items-center justify-center font-medium">4</div>
                    <span className="text-sm text-gray-700">Start receiving payments</span>
                  </div>
                </div>
              </Card>

              {/* Support */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Need Help?</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Our support team is here to help you with the onboarding process.
                </p>
                <Link href="/support">
                  <Button variant="outline" className="w-full">
                    Contact Support
                  </Button>
                </Link>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
