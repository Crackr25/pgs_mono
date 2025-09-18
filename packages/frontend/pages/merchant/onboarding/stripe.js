import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { 
  CreditCard,
  CheckCircle,
  AlertCircle,
  Shield,
  ArrowLeft,
  ExternalLink,
  Clock,
  DollarSign,
  Users,
  User
} from 'lucide-react';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import { useAuth } from '../../../contexts/AuthContext';
import apiService from '../../../lib/api';
import AdditionalInfoForm from '../../../components/stripe/AdditionalInfoForm';

export default function StripeOnboarding() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [accountStatus, setAccountStatus] = useState(null);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [companyInfo, setCompanyInfo] = useState({
    email: '',
    country: 'PH'
  });
  const [businessAddress, setBusinessAddress] = useState({
    line1: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'US'
  });
  const [externalAccount, setExternalAccount] = useState({
    account_number: '',
    routing_number: ''
  });
  const [businessOwners, setBusinessOwners] = useState([{
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    dob: {
      day: '',
      month: '',
      year: ''
    },
    address: {
      line1: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'PH'
    },
    ownership_percentage: 100
  }]);
  const [includeBusinessAddress, setIncludeBusinessAddress] = useState(false);
  const [includeExternalAccount, setIncludeExternalAccount] = useState(false);
  const [includeBusinessOwners, setIncludeBusinessOwners] = useState(false);

  useEffect(() => {
    console.log('user', user);
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
        console.log('Existing Stripe account found:', response.data);
        
        setAccountStatus(response.data);
      }
    } catch (error) {
      // No existing account or error - that's fine for new onboarding
      console.log('No existing Stripe account found');
    }
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        if (!companyInfo.email.trim()) {
          setError('Email address is required');
          return false;
        }
        break;
      case 2:
        if (includeBusinessAddress) {
          if (!businessAddress.line1.trim() || !businessAddress.city.trim() || 
              !businessAddress.state.trim() || !businessAddress.postal_code.trim()) {
            setError('All business address fields are required');
            return false;
          }
        }
        break;
      case 3:
        if (includeExternalAccount) {
          if (!externalAccount.account_number.trim() || !externalAccount.routing_number.trim()) {
            setError('Both account number and routing number are required');
            return false;
          }
        }
        break;
      case 4:
        if (includeBusinessOwners) {
          const owner = businessOwners[0];
          if (!owner.first_name.trim() || !owner.last_name.trim()) {
            setError('Owner first name and last name are required');
            return false;
          }
        }
        break;
    }
    setError('');
    return true;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(currentStep - 1);
    setError('');
  };

  const handleCreateAccount = async () => {
    if (!validateStep(currentStep)) {
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Prepare account data
      const accountData = {
        email: companyInfo.email.trim(),
        country: companyInfo.country
      };

      // Add optional data if provided
      if (includeBusinessAddress && businessAddress.line1.trim()) {
        accountData.business_address = businessAddress;
      }

      if (includeExternalAccount && externalAccount.account_number.trim()) {
        accountData.external_account = externalAccount;
      }

      if (includeBusinessOwners && businessOwners[0].first_name.trim()) {
        // Filter out empty DOB fields
        const cleanedOwners = businessOwners.map(owner => {
          const cleanedOwner = { ...owner };
          if (!owner.dob.day || !owner.dob.month || !owner.dob.year) {
            delete cleanedOwner.dob;
          }
          if (!owner.address.line1.trim()) {
            delete cleanedOwner.address;
          }
          return cleanedOwner;
        });
        accountData.business_owners = cleanedOwners;
      }

      // First create the Express account
      const createResponse = await apiService.request('/stripe/create-express-account', {
        method: 'POST',
        data: accountData
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

              {/* Multi-Step Onboarding Form */}
              {!accountStatus && (
                <Card className="p-6">
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">Complete Payment Setup</h2>
                    <div className="flex items-center space-x-4">
                      {[1, 2, 3, 4, 5].map((step) => (
                        <div key={step} className="flex items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                            currentStep >= step ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'
                          }`}>
                            {step}
                          </div>
                          {step < 5 && <div className={`w-8 h-0.5 ${currentStep > step ? 'bg-primary-600' : 'bg-gray-200'}`} />}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Step 1: Basic Information */}
                  {currentStep === 1 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Basic Information</h3>
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

                      <div className="flex justify-end">
                        <Button onClick={handleNextStep} className="bg-primary-600 hover:bg-primary-700 text-white">
                          Next Step
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Business Address */}
                  {currentStep === 2 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Business Address</h3>
                      <div className="flex items-center space-x-2 mb-4">
                        <input
                          type="checkbox"
                          id="includeAddress"
                          checked={includeBusinessAddress}
                          onChange={(e) => setIncludeBusinessAddress(e.target.checked)}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <label htmlFor="includeAddress" className="text-sm text-gray-700">
                          Provide business address now (recommended to avoid delays)
                        </label>
                      </div>

                      {includeBusinessAddress && (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Address Line 1 *
                            </label>
                            <input
                              type="text"
                              value={businessAddress.line1}
                              onChange={(e) => setBusinessAddress({...businessAddress, line1: e.target.value})}
                              placeholder="123 Business Street"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                City *
                              </label>
                              <input
                                type="text"
                                value={businessAddress.city}
                                onChange={(e) => setBusinessAddress({...businessAddress, city: e.target.value})}
                                placeholder="Manila"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                State/Province *
                              </label>
                              <input
                                type="text"
                                value={businessAddress.state}
                                onChange={(e) => setBusinessAddress({...businessAddress, state: e.target.value})}
                                placeholder="Metro Manila"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Postal Code *
                            </label>
                            <input
                              type="text"
                              value={businessAddress.postal_code}
                              onChange={(e) => setBusinessAddress({...businessAddress, postal_code: e.target.value})}
                              placeholder="1000"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                          </div>
                        </div>
                      )}

                      <div className="flex justify-between">
                        <Button onClick={handlePrevStep} variant="outline">
                          Previous
                        </Button>
                        <Button onClick={handleNextStep} className="bg-primary-600 hover:bg-primary-700 text-white">
                          Next Step
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Bank Account */}
                  {currentStep === 3 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Bank Account</h3>
                      <div className="flex items-center space-x-2 mb-4">
                        <input
                          type="checkbox"
                          id="includeBank"
                          checked={includeExternalAccount}
                          onChange={(e) => setIncludeExternalAccount(e.target.checked)}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <label htmlFor="includeBank" className="text-sm text-gray-700">
                          Add bank account now (required for payouts)
                        </label>
                      </div>

                      {includeExternalAccount && (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Account Number *
                            </label>
                            <input
                              type="text"
                              value={externalAccount.account_number}
                              onChange={(e) => setExternalAccount({...externalAccount, account_number: e.target.value})}
                              placeholder="1234567890"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Routing Number *
                            </label>
                            <input
                              type="text"
                              value={externalAccount.routing_number}
                              onChange={(e) => setExternalAccount({...externalAccount, routing_number: e.target.value})}
                              placeholder="021000021"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                          </div>
                        </div>
                      )}

                      <div className="flex justify-between">
                        <Button onClick={handlePrevStep} variant="outline">
                          Previous
                        </Button>
                        <Button onClick={handleNextStep} className="bg-primary-600 hover:bg-primary-700 text-white">
                          Next Step
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Step 4: Business Owner */}
                  {currentStep === 4 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Business Owner Information</h3>
                      <div className="flex items-center space-x-2 mb-4">
                        <input
                          type="checkbox"
                          id="includeOwner"
                          checked={includeBusinessOwners}
                          onChange={(e) => setIncludeBusinessOwners(e.target.checked)}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <label htmlFor="includeOwner" className="text-sm text-gray-700">
                          Provide business owner information now (required for verification)
                        </label>
                      </div>

                      {includeBusinessOwners && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                First Name *
                              </label>
                              <input
                                type="text"
                                value={businessOwners[0].first_name}
                                onChange={(e) => {
                                  const updated = [...businessOwners];
                                  updated[0].first_name = e.target.value;
                                  setBusinessOwners(updated);
                                }}
                                placeholder="John"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Last Name *
                              </label>
                              <input
                                type="text"
                                value={businessOwners[0].last_name}
                                onChange={(e) => {
                                  const updated = [...businessOwners];
                                  updated[0].last_name = e.target.value;
                                  setBusinessOwners(updated);
                                }}
                                placeholder="Doe"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email
                              </label>
                              <input
                                type="email"
                                value={businessOwners[0].email}
                                onChange={(e) => {
                                  const updated = [...businessOwners];
                                  updated[0].email = e.target.value;
                                  setBusinessOwners(updated);
                                }}
                                placeholder="john@company.com"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Phone
                              </label>
                              <input
                                type="tel"
                                value={businessOwners[0].phone}
                                onChange={(e) => {
                                  const updated = [...businessOwners];
                                  updated[0].phone = e.target.value;
                                  setBusinessOwners(updated);
                                }}
                                placeholder="+63912345678"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Date of Birth (Optional)
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                              <select
                                value={businessOwners[0].dob.day}
                                onChange={(e) => {
                                  const updated = [...businessOwners];
                                  updated[0].dob.day = e.target.value;
                                  setBusinessOwners(updated);
                                }}
                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                              >
                                <option value="">Day</option>
                                {Array.from({length: 31}, (_, i) => (
                                  <option key={i+1} value={i+1}>{i+1}</option>
                                ))}
                              </select>
                              <select
                                value={businessOwners[0].dob.month}
                                onChange={(e) => {
                                  const updated = [...businessOwners];
                                  updated[0].dob.month = e.target.value;
                                  setBusinessOwners(updated);
                                }}
                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                              >
                                <option value="">Month</option>
                                {Array.from({length: 12}, (_, i) => (
                                  <option key={i+1} value={i+1}>{i+1}</option>
                                ))}
                              </select>
                              <select
                                value={businessOwners[0].dob.year}
                                onChange={(e) => {
                                  const updated = [...businessOwners];
                                  updated[0].dob.year = e.target.value;
                                  setBusinessOwners(updated);
                                }}
                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                              >
                                <option value="">Year</option>
                                {Array.from({length: 80}, (_, i) => {
                                  const year = new Date().getFullYear() - 18 - i;
                                  return <option key={year} value={year}>{year}</option>;
                                })}
                              </select>
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Ownership Percentage
                            </label>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={businessOwners[0].ownership_percentage}
                              onChange={(e) => {
                                const updated = [...businessOwners];
                                updated[0].ownership_percentage = parseInt(e.target.value) || 0;
                                setBusinessOwners(updated);
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                          </div>
                        </div>
                      )}

                      <div className="flex justify-between">
                        <Button onClick={handlePrevStep} variant="outline">
                          Previous
                        </Button>
                        <Button onClick={handleNextStep} className="bg-primary-600 hover:bg-primary-700 text-white">
                          Next Step
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Step 5: Review & Submit */}
                  {currentStep === 5 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Review & Submit</h3>
                      
                      <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                        <div>
                          <h4 className="font-medium text-gray-900">Basic Information</h4>
                          <p className="text-sm text-gray-600">Email: {companyInfo.email}</p>
                          <p className="text-sm text-gray-600">Country: {companyInfo.country}</p>
                        </div>

                        {includeBusinessAddress && (
                          <div>
                            <h4 className="font-medium text-gray-900">Business Address</h4>
                            <p className="text-sm text-gray-600">
                              {businessAddress.line1}, {businessAddress.city}, {businessAddress.state} {businessAddress.postal_code}
                            </p>
                          </div>
                        )}

                        {includeExternalAccount && (
                          <div>
                            <h4 className="font-medium text-gray-900">Bank Account</h4>
                            <p className="text-sm text-gray-600">Account ending in {externalAccount.account_number.slice(-4)}</p>
                          </div>
                        )}

                        {includeBusinessOwners && (
                          <div>
                            <h4 className="font-medium text-gray-900">Business Owner</h4>
                            <p className="text-sm text-gray-600">
                              {businessOwners[0].first_name} {businessOwners[0].last_name} ({businessOwners[0].ownership_percentage}%)
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-sm text-blue-800">
                          <strong>Next Steps:</strong> After creating your account, you'll be redirected to Stripe to complete 
                          any remaining verification steps. The more information you provide now, the faster your account will be approved.
                        </p>
                      </div>

                      <div className="flex justify-between">
                        <Button onClick={handlePrevStep} variant="outline">
                          Previous
                        </Button>
                        <Button
                          onClick={handleCreateAccount}
                          disabled={loading}
                          className="bg-primary-600 hover:bg-primary-700 text-white"
                        >
                          {loading ? (
                            <>
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                              Creating Account...
                            </>
                          ) : (
                            <>
                              <CreditCard className="w-5 h-5 mr-2" />
                              Create Stripe Account
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
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
                      <>
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

                        <Button
                          onClick={() => router.push('/merchant/stripe/additional-info')}
                          className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3"
                        >
                          <User className="w-5 h-5 mr-2" />
                          Update Additional Information
                        </Button>
                      </>
                    )}
                  </div>
                </Card>
              )}

              {/* Additional Information Update Section */}
              {accountStatus && (
                <Card className="p-6">
                  <h2 className="text-xl font-semibold mb-6">Update Account Information</h2>
                  <p className="text-sm text-gray-600 mb-4">
                    Add or update additional information required by Stripe for verification.
                  </p>
                  
                  <AdditionalInfoForm 
                    accountStatus={accountStatus}
                    onUpdate={checkExistingAccount}
                  />
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
