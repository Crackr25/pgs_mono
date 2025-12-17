import { useState } from 'react';
import { CreditCard, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import Button from '../common/Button';
import { formatDistanceToNow } from 'date-fns';

export default function PaymentLinkMessage({ message, isReceiver, onPayClick }) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Debug log
  console.log('PaymentLinkMessage received:', message);

  // Safely get payment amount
  const amount = message.payment_amount || 0;
  const currency = message.payment_currency || 'USD';
  const description = message.payment_description || 'No description';

  const getStatusBadge = () => {
    switch (message.payment_status) {
      case 'paid':
        return (
          <div className="flex items-center space-x-1 text-green-600 bg-green-50 px-3 py-1 rounded-full">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm font-medium">Paid</span>
          </div>
        );
      case 'expired':
        return (
          <div className="flex items-center space-x-1 text-red-600 bg-red-50 px-3 py-1 rounded-full">
            <XCircle className="h-4 w-4" />
            <span className="text-sm font-medium">Expired</span>
          </div>
        );
      case 'cancelled':
        return (
          <div className="flex items-center space-x-1 text-gray-600 bg-gray-50 px-3 py-1 rounded-full">
            <XCircle className="h-4 w-4" />
            <span className="text-sm font-medium">Cancelled</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center space-x-1 text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm font-medium">Pending</span>
          </div>
        );
    }
  };

  const isExpired = message.payment_expires_at && new Date(message.payment_expires_at) < new Date();
  const canPay = isReceiver && message.payment_status === 'pending' && !isExpired;

  // Debug logging
  console.log('PaymentLinkMessage - canPay check:', {
    isReceiver,
    payment_status: message.payment_status,
    isExpired,
    canPay,
    message
  });

  return (
    <div className={`max-w-md ${isReceiver ? '' : 'ml-auto'}`}>
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg overflow-hidden shadow-sm">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-white">
              <CreditCard className="h-5 w-5" />
              <span className="font-semibold">Payment Request</span>
            </div>
            {getStatusBadge()}
          </div>
        </div>

        {/* Body */}
        <div className="p-4 space-y-3">
          {/* Amount */}
          <div className="text-center py-3 bg-white rounded-lg border border-blue-100">
            <p className="text-sm text-gray-600 mb-1">Amount Due</p>
            <p className="text-3xl font-bold text-gray-900">
              {currency} {parseFloat(amount).toFixed(2)}
            </p>
          </div>

          {/* Description */}
          <div className="bg-white rounded-lg p-3 border border-blue-100">
            <p className="text-sm font-medium text-gray-700 mb-1">Description:</p>
            <p className="text-sm text-gray-600">{description}</p>
          </div>

          {/* Expiration Info */}
          {message.payment_expires_at && (
            <div className="flex items-center space-x-2 text-sm">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-gray-600">
                {isExpired ? (
                  <span className="text-red-600 font-medium">Expired</span>
                ) : message.payment_status === 'paid' ? (
                  <span className="text-green-600">
                    Paid {formatDistanceToNow(new Date(message.payment_paid_at), { addSuffix: true })}
                  </span>
                ) : (
                  <>
                    Expires {formatDistanceToNow(new Date(message.payment_expires_at), { addSuffix: true })}
                  </>
                )}
              </span>
            </div>
          )}

          {/* Debug Info */}
          <div className="bg-yellow-50 border border-yellow-200 rounded p-2 text-xs">
            <p><strong>Debug:</strong></p>
            <p>isReceiver: {isReceiver ? 'Yes' : 'No'}</p>
            <p>Status: {message.payment_status}</p>
            <p>Expired: {isExpired ? 'Yes' : 'No'}</p>
            <p>Can Pay: {canPay ? 'Yes' : 'No'}</p>
          </div>

          {/* Payment Button */}
          {canPay ? (
            <Button
              onClick={() => onPayClick(message)}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Pay Now
            </Button>
          ) : (
            <Button
              onClick={() => {
                console.log('Button clicked but canPay is false');
                console.log('Forcing modal open for testing...');
                onPayClick(message);
              }}
              className="w-full bg-gradient-to-r from-gray-600 to-gray-700"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Pay Now (Test Mode)
            </Button>
          )}

          {/* Status Messages */}
          {message.payment_status === 'paid' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
              <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-green-800">
                Payment completed successfully
              </p>
            </div>
          )}

          {isExpired && message.payment_status === 'pending' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
              <XCircle className="h-6 w-6 text-red-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-red-800">
                This payment link has expired
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-4 py-2 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Payment ID: {message.payment_link_id}
          </p>
        </div>
      </div>
    </div>
  );
}
