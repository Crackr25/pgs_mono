import { useState } from 'react';
import { X, CreditCard, Lock, AlertCircle, ExternalLink } from 'lucide-react';
import Button from '../common/Button';
import apiService from '../../lib/api';
import { toast } from 'react-hot-toast';

function PaymentForm({ paymentLink, onSuccess, onCancel }) {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  const handleStripeCheckout = async () => {
    setProcessing(true);
    setError(null);

    try {
      // Create checkout session
      const response = await apiService.createPaymentCheckout(paymentLink.payment_link_id);
      
      if (response.success && response.checkout_url) {
        // Redirect to Stripe Checkout
        window.location.href = response.checkout_url;
      } else {
        setError('Failed to create checkout session');
        setProcessing(false);
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err.response?.data?.message || 'Failed to start payment process');
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Payment Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">Amount to Pay:</span>
          <span className="text-2xl font-bold text-gray-900">
            {paymentLink.payment_currency} {parseFloat(paymentLink.payment_amount).toFixed(2)}
          </span>
        </div>
        <p className="text-sm text-gray-600">{paymentLink.payment_description}</p>
      </div>

      {/* Payment Info */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-2">Payment Details</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Payment ID:</span>
            <span className="font-mono text-gray-900">{paymentLink.payment_link_id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Status:</span>
            <span className="text-blue-600 font-medium">{paymentLink.payment_status}</span>
          </div>
          {paymentLink.payment_expires_at && (
            <div className="flex justify-between">
              <span className="text-gray-600">Expires:</span>
              <span className="text-gray-900">
                {new Date(paymentLink.payment_expires_at).toLocaleString()}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start space-x-2">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Security Notice */}
      <div className="flex items-center space-x-2 text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
        <Lock className="h-4 w-4" />
        <span>Your payment will be processed securely through Stripe</span>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end space-x-3 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={processing}
        >
          Cancel
        </Button>
        <Button
          onClick={handleStripeCheckout}
          disabled={processing}
          className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
        >
          <CreditCard className="h-4 w-4 mr-2" />
          Proceed to Payment
        </Button>
      </div>
    </div>
  );
}

export default function PaymentModal({ isOpen, onClose, paymentLink }) {
  if (!isOpen || !paymentLink) return null;

  const handleSuccess = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        />

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                  <CreditCard className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white">
                  Complete Payment
                </h3>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="px-6 py-6">
            <PaymentForm
              paymentLink={paymentLink}
              onSuccess={handleSuccess}
              onCancel={onClose}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
