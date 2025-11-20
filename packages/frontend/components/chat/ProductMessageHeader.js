import React from 'react';
import { Package, ShoppingCart } from 'lucide-react';
import { getImageUrl } from '../../lib/imageUtils';

const ProductMessageHeader = ({ productContext, messageType = 'message' }) => {
  if (!productContext) return null;

  const { name, image, has_image, price, unit, company_name } = productContext;

  // Use the utility function to get the correct image URL
  const imageSrc = has_image && image ? getImageUrl(image) : null;

  const getMessageTypeIcon = () => {
    switch (messageType) {
      case 'quote':
        return <ShoppingCart className="w-4 h-4 text-blue-600" />;
      case 'message':
      default:
        return <Package className="w-4 h-4 text-green-600" />;
    }
  };

  const getMessageTypeText = () => {
    switch (messageType) {
      case 'quote':
        return 'Quote Request';
      case 'message':
      default:
        return 'Product Inquiry';
    }
  };

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-2 mx-4">
      <div className="flex items-center gap-2 mb-2">
        {getMessageTypeIcon()}
        <span className="text-sm font-medium text-gray-700">
          {getMessageTypeText()}
        </span>
      </div>
      
      <div className="flex items-start gap-3">
        {/* Product Image */}
        <div className="flex-shrink-0">
          {imageSrc ? (
            <img
              src={imageSrc}
              alt={name}
              className="w-12 h-12 object-cover rounded-lg border border-gray-200"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          
          {/* Fallback placeholder */}
          <div 
            className={`w-12 h-12 bg-gray-200 rounded-lg border border-gray-300 flex items-center justify-center ${imageSrc ? 'hidden' : 'flex'}`}
          >
            <Package className="w-6 h-6 text-gray-400" />
          </div>
        </div>

        {/* Product Details */}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-gray-900 truncate">
            {name}
          </h4>
          
          <div className="flex items-center gap-4 mt-1">
            {price && (
              <span className="text-sm text-gray-600">
                ${parseFloat(price).toFixed(2)}{unit ? `/${unit}` : ''}
              </span>
            )}
            
            {company_name && (
              <span className="text-xs text-gray-500 truncate">
                by {company_name}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductMessageHeader;
