import { useState, useEffect } from 'react';
import { CheckCircle, ShoppingCart, X } from 'lucide-react';

export default function CartNotification({ show, onClose, productName, quantity }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      // Auto-hide after 4 seconds
      const timer = setTimeout(() => {
        handleClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [show]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300); // Wait for animation to complete
  };

  if (!show) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 transition-all duration-300 transform ${
      isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
    }`}>
      <div className="bg-white rounded-lg shadow-lg border border-green-200 p-4 max-w-sm">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <CheckCircle className="w-6 h-6 text-green-500" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-900">
                Added to Cart!
              </h4>
              <button
                onClick={handleClose}
                className="ml-2 flex-shrink-0 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {quantity} × {productName}
            </p>
            <div className="mt-3 flex space-x-2">
              <button
                onClick={handleClose}
                className="text-xs font-medium text-gray-600 hover:text-gray-800"
              >
                Continue Shopping
              </button>
              <span className="text-gray-300">|</span>
              <a
                href="/buyer/cart"
                className="text-xs font-medium text-primary-600 hover:text-primary-800 flex items-center space-x-1"
              >
                <ShoppingCart className="w-3 h-3" />
                <span>View Cart</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
