import { useState } from 'react';
import { X, DollarSign, Send, Package, Building, Calendar } from 'lucide-react';
import Button from './Button';
import apiService from '../../lib/api';

export default function QuickQuoteModal({ isOpen, onClose, product, onSuccess }) {
  const [formData, setFormData] = useState({
    quantity: '',
    targetPrice: '',
    deadline: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const quoteData = {
        product_id: product.id,
        supplier_id: product.company.user_id,
        quantity: parseInt(formData.quantity),
        target_price: parseFloat(formData.targetPrice) || null,
        deadline: formData.deadline,
        message: formData.message || `Quote request for ${product.name}`,
        product_name: product.name,
        supplier_name: product.company.name,
        product_context: {
          id: product.id,
          name: product.name,
          image: product.image,
          has_image: product.has_image,
          price: product.price,
          unit: product.unit,
          company_name: product.company.name
        }
      };

      await apiService.requestProductQuote(quoteData);
      
      onSuccess?.({
        type: 'success',
        title: 'Quote Request Sent!',
        message: `Your quote request for ${product.name} has been sent to ${product.company.name}.`,
        duration: 3000
      });

      // Reset form
      setFormData({
        quantity: '',
        targetPrice: '',
        deadline: '',
        message: ''
      });

      onClose();
    } catch (error) {
      console.error('Error requesting quote:', error);
      onSuccess?.({
        type: 'error',
        title: 'Failed to Send Quote Request',
        message: 'Please try again or contact the supplier directly.',
        duration: 3000
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate minimum date (tomorrow)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Request Quote</h2>
              <p className="text-sm text-gray-600">Get a custom quote for this product</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Product Info */}
        <div className="p-6 bg-gray-50 border-b border-gray-200">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              {product.has_image ? (
                <img
                  src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8000'}${product.image}`}
                  alt={product.name}
                  className="w-16 h-16 object-cover rounded-lg"
                />
              ) : (
                <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                  <Package className="w-8 h-8 text-gray-400" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-medium text-gray-900 truncate">{product.name}</h3>
              <p className="text-sm text-gray-600 flex items-center">
                <Building className="w-4 h-4 mr-1" />
                {product.company.name}
              </p>
              <div className="flex items-center space-x-4 mt-2">
                <span className="text-lg font-bold text-primary-600">
                  ${parseFloat(product.price).toFixed(2)}{product.unit ? `/${product.unit}` : ''}
                </span>
                <span className="text-sm text-gray-500">MOQ: {product.moq}</span>
                <span className="text-sm text-gray-500">Lead time: {product.lead_time}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quote Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity Required *
              </label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleInputChange}
                min={product.moq || 1}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder={`Min: ${product.moq || 1} ${product.unit || 'units'}`}
              />
              <p className="text-xs text-gray-500 mt-1">
                Minimum order quantity: {product.moq || 1} {product.unit || 'units'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Price per {product.unit || 'unit'} (optional)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">$</span>
                <input
                  type="number"
                  name="targetPrice"
                  value={formData.targetPrice}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="0.00"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Current price: ${parseFloat(product.price).toFixed(2)}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Required Delivery Date *
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input
                type="date"
                name="deadline"
                value={formData.deadline}
                onChange={handleInputChange}
                min={minDate}
                required
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Standard lead time: {product.lead_time}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Requirements (optional)
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
              placeholder="Any specific requirements, customizations, or questions about this product..."
            />
          </div>

          {/* Quote Summary */}
          {formData.quantity && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Quote Summary</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-700">Product:</span>
                  <span className="text-blue-900 font-medium">{product.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Quantity:</span>
                  <span className="text-blue-900 font-medium">{formData.quantity} {product.unit || 'units'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Est. Total (current price):</span>
                  <span className="text-blue-900 font-medium">
                    ${(parseFloat(product.price) * parseInt(formData.quantity || 0)).toFixed(2)}
                  </span>
                </div>
                {formData.targetPrice && (
                  <div className="flex justify-between">
                    <span className="text-blue-700">Target Total:</span>
                    <span className="text-blue-900 font-medium">
                      ${(parseFloat(formData.targetPrice) * parseInt(formData.quantity || 0)).toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                isSubmitting || 
                !formData.quantity || 
                parseInt(formData.quantity) < (product.moq || 1) ||
                !formData.deadline
              }
              className="min-w-[140px] bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Sending...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4" />
                  <span>Request Quote</span>
                </div>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
