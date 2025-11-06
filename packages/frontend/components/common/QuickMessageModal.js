import { useState } from 'react';
import { X, MessageSquare, Send, Package, Building } from 'lucide-react';
import Button from './Button';
import apiService from '../../lib/api';

export default function QuickMessageModal({ isOpen, onClose, product, onSuccess }) {
  const [formData, setFormData] = useState({
    selectedTemplate: 'price_inquiry',
    customMessage: '',
    quantity: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const inquiryTemplates = [
    {
      id: 'price_inquiry',
      title: 'Price Inquiry',
      template: 'Hi, I am interested in your {product_name}. Could you please provide me with your best pricing for a quantity of {quantity} {unit}? I would also like to know about your payment terms and delivery timeline.'
    },
    {
      id: 'sample_request',
      title: 'Sample Request',
      template: 'Hello, I would like to request samples of your {product_name} for evaluation. We are considering this product for our upcoming project. Could you please let me know the sample availability and costs?'
    },
    {
      id: 'bulk_order',
      title: 'Bulk Order Inquiry',
      template: 'Good day! We are interested in placing a bulk order for {product_name}. Our required quantity is {quantity} {unit}. Please provide your best wholesale pricing, minimum order requirements, and delivery schedule.'
    },
    {
      id: 'technical_specs',
      title: 'Technical Specifications',
      template: 'Hi, I need more detailed technical specifications for {product_name}. Could you please provide additional documentation, certifications, and compatibility information for our technical evaluation?'
    },
    {
      id: 'custom',
      title: 'Custom Message',
      template: ''
    }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getProcessedMessage = () => {
    const template = inquiryTemplates.find(t => t.id === formData.selectedTemplate);
    if (!template || formData.selectedTemplate === 'custom') {
      return formData.customMessage;
    }

    return template.template
      .replace(/{product_name}/g, product?.name || 'this product')
      .replace(/{quantity}/g, formData.quantity || '[quantity]')
      .replace(/{unit}/g, product?.unit || 'units');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    console.log(product);
    

    try {
      const messageData = {
        product_id: product.id,
        supplier_id: product.company.user_id,
        message: getProcessedMessage(),
        quantity: formData.quantity,
        template_used: formData.selectedTemplate,
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

      await apiService.sendProductMessage(messageData);
      
      onSuccess?.({
        type: 'success',
        title: 'Message Sent!',
        message: `Your inquiry about ${product.name} has been sent to ${product.company.name}.`,
        duration: 3000
      });

      // Reset form
      setFormData({
        selectedTemplate: 'price_inquiry',
        customMessage: '',
        quantity: ''
      });

      onClose();
    } catch (error) {
      console.error('Error sending message:', error);
      onSuccess?.({
        type: 'error',
        title: 'Failed to Send Message',
        message: 'Please try again or contact the supplier directly.',
        duration: 3000
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Send Message</h2>
              <p className="text-sm text-gray-600">Contact supplier about this product</p>
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
              </div>
            </div>
          </div>
        </div>

        {/* Message Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message Template
            </label>
            <select
              name="selectedTemplate"
              value={formData.selectedTemplate}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              {inquiryTemplates.map(template => (
                <option key={template.id} value={template.id}>
                  {template.title}
                </option>
              ))}
            </select>
          </div>

          {formData.selectedTemplate !== 'custom' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity (optional)
              </label>
              <input
                type="text"
                name="quantity"
                value={formData.quantity}
                onChange={handleInputChange}
                placeholder="e.g., 100, 50 kg, 200 pcs"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {formData.selectedTemplate === 'custom' ? 'Your Message' : 'Message Preview'}
            </label>
            {formData.selectedTemplate === 'custom' ? (
              <textarea
                name="customMessage"
                value={formData.customMessage}
                onChange={handleInputChange}
                rows={6}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                placeholder="Enter your custom message..."
              />
            ) : (
              <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 min-h-[120px]">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {getProcessedMessage()}
                </p>
              </div>
            )}
          </div>

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
              disabled={isSubmitting || (formData.selectedTemplate === 'custom' && !formData.customMessage.trim())}
              className="min-w-[120px]"
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Sending...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Send className="w-4 h-4" />
                  <span>Send Message</span>
                </div>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
