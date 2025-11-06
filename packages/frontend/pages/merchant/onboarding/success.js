import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { 
  CheckCircle, 
  ArrowRight, 
  CreditCard, 
  DollarSign,
  BarChart3,
  Settings
} from 'lucide-react';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import apiService from '../../../lib/api';

export default function OnboardingSuccess() {
  const router = useRouter();
  const [accountStatus, setAccountStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check account status after successful onboarding
    checkAccountStatus();
  }, []);

  const checkAccountStatus = async () => {
    try {
      const response = await apiService.request('/stripe/account-status');
      if (response.success) {
        setAccountStatus(response.data);
      }
    } catch (error) {
      console.error('Error checking account status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccessDashboard = async () => {
    try {
      const response = await apiService.request('/stripe/create-login-link', {
        method: 'POST'
      });

      if (response.success && response.login_url) {
        window.open(response.login_url, '_blank');
      }
    } catch (error) {
      console.error('Error accessing dashboard:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying your account setup...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Onboarding Complete - Pinoy Global Supply</title>
        <meta name="description" content="Your Stripe account setup is complete" />
      </Head>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Payment Setup Complete!
            </h1>
            <p className="text-lg text-gray-600">
              Your Stripe account is now active and ready to receive payments
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Account Status */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Account Status</h2>
              
              {accountStatus && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div>
                      <p className="font-medium text-green-900">Stripe Account</p>
                      <p className="text-sm text-green-700">Ready to accept payments</p>
                    </div>
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Account ID</p>
                      <p className="font-mono text-xs text-gray-900 break-all">
                        {accountStatus.stripe_account_id}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Status</p>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                        {accountStatus.onboarding_status === 'completed' ? 'Active' : 'Pending'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </Card>

            {/* Next Steps */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">What's Next?</h2>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-medium text-primary-600">1</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Start Selling</h3>
                    <p className="text-sm text-gray-600">Add products and start receiving orders from customers</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-medium text-primary-600">2</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Monitor Payments</h3>
                    <p className="text-sm text-gray-600">Track your earnings and payment history</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-medium text-primary-600">3</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Manage Account</h3>
                    <p className="text-sm text-gray-600">Access your Stripe dashboard for detailed analytics</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/merchant/dashboard">
              <Button className="w-full bg-primary-600 hover:bg-primary-700 text-white">
                <BarChart3 className="w-4 h-4 mr-2" />
                Go to Dashboard
              </Button>
            </Link>

            <Link href="/merchant/products">
              <Button variant="outline" className="w-full">
                <CreditCard className="w-4 h-4 mr-2" />
                Manage Products
              </Button>
            </Link>

            <Button 
              onClick={handleAccessDashboard}
              variant="outline" 
              className="w-full"
            >
              <DollarSign className="w-4 h-4 mr-2" />
              Stripe Dashboard
            </Button>

            <Link href="/merchant/settings">
              <Button variant="outline" className="w-full">
                <Settings className="w-4 h-4 mr-2" />
                Account Settings
              </Button>
            </Link>
          </div>

          {/* Important Information */}
          <Card className="p-6 mt-8">
            <h3 className="text-lg font-semibold mb-4">Important Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Payment Processing</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Platform fee: 2.5% per transaction</li>
                  <li>• Stripe processing fees apply</li>
                  <li>• Automatic payouts to your bank account</li>
                  <li>• Real-time payment notifications</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Support & Resources</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• 24/7 customer support available</li>
                  <li>• Comprehensive seller documentation</li>
                  <li>• Regular payout reports</li>
                  <li>• Dispute management assistance</li>
                </ul>
              </div>
            </div>
          </Card>

          {/* Footer */}
          <div className="text-center mt-8 pt-8 border-t border-gray-200">
            <p className="text-gray-600">
              Need help? <Link href="/support" className="text-primary-600 hover:text-primary-700">Contact our support team</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
