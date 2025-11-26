import { useState, useEffect, createContext, useContext } from 'react';
import { CheckCircle, AlertCircle, Info, X, Loader2 } from 'lucide-react';

const Toast = ({ type = 'info', title, message, duration = 5000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Wait for animation to complete
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const typeConfig = {
    success: {
      icon: CheckCircle,
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-800',
      iconColor: 'text-green-600'
    },
    error: {
      icon: AlertCircle,
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-800',
      iconColor: 'text-red-600'
    },
    info: {
      icon: Info,
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-800',
      iconColor: 'text-blue-600'
    },
    loading: {
      icon: Loader2,
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      textColor: 'text-yellow-800',
      iconColor: 'text-yellow-600'
    }
  };

  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <div className={`
      fixed top-4 right-4 z-50 transition-all duration-300 transform
      ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
    `}>
      <div className={`
        ${config.bgColor} ${config.borderColor} ${config.textColor}
        border rounded-lg shadow-lg p-4 max-w-sm w-full
      `}>
        <div className="flex items-start">
          <Icon className={`${config.iconColor} w-5 h-5 mt-0.5 mr-3 ${type === 'loading' ? 'animate-spin' : ''}`} />
          <div className="flex-1 min-w-0">
            {title && (
              <p className="text-sm font-medium">
                {title}
              </p>
            )}
            {message && (
              <p className={`text-sm ${title ? 'mt-1' : ''}`}>
                {message}
              </p>
            )}
          </div>
          <button
            onClick={() => {
              setIsVisible(false);
              setTimeout(onClose, 300);
            }}
            className={`ml-3 ${config.textColor} hover:opacity-70`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Toast Provider Context
const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = (toast) => {
    const id = Date.now();
    const newToast = { ...toast, id };
    setToasts(prev => [...prev, newToast]);
    return id;
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const showSuccess = (title, message, duration) => {
    return addToast({ type: 'success', title, message, duration });
  };

  const showError = (title, message, duration) => {
    return addToast({ type: 'error', title, message, duration });
  };

  const showInfo = (title, message, duration) => {
    return addToast({ type: 'info', title, message, duration });
  };

  const showLoading = (title, message) => {
    return addToast({ type: 'loading', title, message, duration: 0 });
  };

  return (
    <ToastContext.Provider value={{
      showSuccess,
      showError,
      showInfo,
      showLoading,
      removeToast
    }}>
      {children}
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          type={toast.type}
          title={toast.title}
          message={toast.message}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </ToastContext.Provider>
  );
};

export default Toast;
