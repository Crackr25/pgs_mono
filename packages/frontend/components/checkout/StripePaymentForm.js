import { useState } from 'react';
import {
  useStripe,
  useElements,
  PaymentElement,
  AddressElement
} from '@stripe/react-stripe-js';
import { AlertCircle, Lock, CreditCard } from 'lucide-react';
import Button from '../common/Button';

export default function StripePaymentForm({ 
  clientSecret, 
  onSuccess, 
  onError, 
  loading = false,
  orderTotal,
  merchantName 
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage('');

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/buyer/orders/success`,
        },
        redirect: 'if_required',
      });

      if (error) {
        setErrorMessage(error.message);
        onError?.(error);
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        onSuccess?.(paymentIntent);
      }
    } catch (err) {
      setErrorMessage('An unexpected error occurred.');
      onError?.(err);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!clientSecret) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Preparing secure payment...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Payment Summary */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">Payment to:</span>
          <span className="font-medium text-gray-900">{merchantName}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Total Amount:</span>
          <span className="text-lg font-bold text-gray-900">${orderTotal}</span>
        </div>
      </div>

      {/* Payment Element */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 mb-4">
          <CreditCard className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-medium text-gray-900">Payment Details</h3>
        </div>
        
        <PaymentElement 
          options={{
            layout: 'tabs',
            paymentMethodOrder: ['card', 'apple_pay', 'google_pay']
          }}
        />
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-red-900">Payment Error</h4>
              <p className="text-sm text-red-700 mt-1">{errorMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Security Notice */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start space-x-2">
          <Lock className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-blue-900">Secure Payment</h4>
            <p className="text-sm text-blue-700 mt-1">
              Your payment information is encrypted and secure. We use Stripe's industry-leading security.
            </p>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={!stripe || !elements || isProcessing || loading}
        className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg font-medium"
      >
        {isProcessing ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Processing Payment...
          </>
        ) : (
          <>
            <Lock className="w-5 h-5 mr-2" />
            Pay ${orderTotal}
          </>
        )}
      </Button>
    </form>
  );
}
