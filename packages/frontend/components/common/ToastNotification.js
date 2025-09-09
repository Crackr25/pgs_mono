import { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, X, Mail } from 'lucide-react';

export default function ToastNotification({ 
  show, 
  onClose, 
  type = 'success', // 'success', 'error', 'info', 'warning'
  title, 
  message,
  duration = 5000 
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      // Auto-hide after duration
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300); // Wait for animation to complete
  };

  if (!show) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-6 h-6 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-6 h-6 text-yellow-500" />;
      case 'info':
        return <Info className="w-6 h-6 text-blue-500" />;
      case 'quote':
        return <Mail className="w-6 h-6 text-green-500" />;
      default:
        return <CheckCircle className="w-6 h-6 text-green-500" />;
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case 'success':
      case 'quote':
        return 'border-green-200';
      case 'error':
        return 'border-red-200';
      case 'warning':
        return 'border-yellow-200';
      case 'info':
        return 'border-blue-200';
      default:
        return 'border-green-200';
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
      case 'quote':
        return 'bg-green-50';
      case 'error':
        return 'bg-red-50';
      case 'warning':
        return 'bg-yellow-50';
      case 'info':
        return 'bg-blue-50';
      default:
        return 'bg-white';
    }
  };

  return (
    <div className={`fixed top-20 right-4 z-50 transition-all duration-300 transform ${
      isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
    }`}>
      <div className={`${getBackgroundColor()} rounded-lg shadow-lg border ${getBorderColor()} p-4 max-w-sm min-w-[320px]`}>
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-gray-900">
                {title}
              </h4>
              <button
                onClick={handleClose}
                className="ml-2 flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {message && (
              <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                {message}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
