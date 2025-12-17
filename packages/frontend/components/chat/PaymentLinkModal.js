import { useState } from 'react';
import { X, DollarSign, Clock, FileText } from 'lucide-react';
import Button from '../common/Button';
import apiService from '../../lib/api';
import { toast } from 'react-hot-toast';

export default function PaymentLinkModal({ isOpen, onClose, conversationId, onPaymentLinkSent }) {
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [description, setDescription] = useState('');
  const [expiresInHours, setExpiresInHours] = useState(24);
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (!description.trim()) {
      toast.error('Please enter a description');
      return;
    }

    try {
      setSending(true);
      const response = await apiService.sendPaymentLink(
        conversationId,
        parseFloat(amount),
        currency,
        description.trim(),
        expiresInHours
      );

      toast.success('Payment link sent successfully!');
      
      // Reset form
      setAmount('');
      setDescription('');
      setExpiresInHours(24);
      
      // Notify parent component
      if (onPaymentLinkSent) {
        onPaymentLinkSent(response.message);
      }
      
      onClose();
    } catch (error) {
      console.error('Error sending payment link:', error);
      toast.error(error.response?.data?.message || 'Failed to send payment link');
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

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
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white">
                  Send Payment Link
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
          <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
            {/* Amount and Currency */}
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Currency
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="USD">USD</option>
                  <option value="PHP">PHP</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="inline h-4 w-4 mr-1" />
                Description *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="e.g., Payment for Order #12345 - 100 units of Product XYZ"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                Provide a clear description of what this payment is for
              </p>
            </div>

            {/* Expiration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="inline h-4 w-4 mr-1" />
                Link Expires In
              </label>
              <select
                value={expiresInHours}
                onChange={(e) => setExpiresInHours(parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value={1}>1 hour</option>
                <option value={6}>6 hours</option>
                <option value={12}>12 hours</option>
                <option value={24}>24 hours (1 day)</option>
                <option value={48}>48 hours (2 days)</option>
                <option value={72}>72 hours (3 days)</option>
                <option value={168}>168 hours (7 days)</option>
              </select>
              <p className="mt-1 text-xs text-gray-500">
                The buyer must complete payment before this time
              </p>
            </div>

            {/* Preview */}
            {amount && description && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm font-medium text-blue-900 mb-2">Preview:</p>
                <div className="bg-white rounded p-3 text-sm">
                  <p className="font-semibold text-gray-900">💳 Payment Request</p>
                  <p className="text-gray-700 mt-2">{description}</p>
                  <p className="text-primary-600 font-bold mt-2">
                    Amount: {currency} {parseFloat(amount).toFixed(2)}
                  </p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={sending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={sending || !amount || !description.trim()}
              >
                {sending ? 'Sending...' : 'Send Payment Link'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
