import { CheckCircle, AlertCircle, Download, Users, TrendingUp, Package, X, ArrowRight } from 'lucide-react';
import Button from '../common/Button';

const AnalyticsNotification = ({ 
  type, 
  title, 
  message, 
  data = null, 
  onClose, 
  onAction = null,
  actionLabel = null,
  isOpen = true 
}) => {
  if (!isOpen) return null;

  const getTypeConfig = () => {
    switch (type) {
      case 'products':
        return {
          icon: Package,
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          iconColor: 'text-blue-600',
          headerColor: 'text-blue-900',
          textColor: 'text-blue-800'
        };
      case 'buyers':
        return {
          icon: Users,
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          iconColor: 'text-green-600',
          headerColor: 'text-green-900',
          textColor: 'text-green-800'
        };
      case 'trends':
        return {
          icon: TrendingUp,
          bgColor: 'bg-purple-50',
          borderColor: 'border-purple-200',
          iconColor: 'text-purple-600',
          headerColor: 'text-purple-900',
          textColor: 'text-purple-800'
        };
      case 'optimization':
        return {
          icon: Package,
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          iconColor: 'text-orange-600',
          headerColor: 'text-orange-900',
          textColor: 'text-orange-800'
        };
      case 'export':
        return {
          icon: Download,
          bgColor: 'bg-indigo-50',
          borderColor: 'border-indigo-200',
          iconColor: 'text-indigo-600',
          headerColor: 'text-indigo-900',
          textColor: 'text-indigo-800'
        };
      case 'error':
        return {
          icon: AlertCircle,
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          iconColor: 'text-red-600',
          headerColor: 'text-red-900',
          textColor: 'text-red-800'
        };
      case 'success':
        return {
          icon: CheckCircle,
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          iconColor: 'text-green-600',
          headerColor: 'text-green-900',
          textColor: 'text-green-800'
        };
      default:
        return {
          icon: CheckCircle,
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          iconColor: 'text-gray-600',
          headerColor: 'text-gray-900',
          textColor: 'text-gray-800'
        };
    }
  };

  const config = getTypeConfig();
  const Icon = config.icon;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Notification Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div 
          className={`
            relative w-full max-w-md transform overflow-hidden rounded-xl bg-white shadow-2xl transition-all
            ${config.borderColor} border-l-4
          `}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className={`${config.bgColor} px-6 py-4`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Icon className={`${config.iconColor} w-6 h-6 mr-3`} />
                <h3 className={`text-lg font-semibold ${config.headerColor}`}>
                  {title}
                </h3>
              </div>
              <button
                onClick={onClose}
                className={`${config.textColor} hover:opacity-70 transition-opacity`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* Content */}
          <div className="px-6 py-4">
            <p className="text-secondary-700 mb-4">
              {message}
            </p>
            
            {/* Data Preview */}
            {data && data.length > 0 && (
              <div className="bg-secondary-50 rounded-lg p-4 mb-4 max-h-64 overflow-y-auto">
                <h4 className="text-sm font-medium text-secondary-900 mb-3">
                  {type === 'trends' ? 'Traffic Sources' : 'Results Preview'}:
                </h4>
                
                {/* Traffic Sources Layout */}
                {type === 'trends' && data.some(item => item.percentage) ? (
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    {data.slice(0, 3).map((item, index) => (
                      <div key={index} className="text-center">
                        <div className="text-2xl font-bold text-secondary-900 mb-1">
                          {item.percentage || Math.round((item.value / data.reduce((sum, d) => sum + (d.value || 0), 0)) * 100)}%
                        </div>
                        <div className="text-xs text-secondary-600 leading-tight">
                          {item.source || item.name || item.label}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* Standard List Layout */
                  <div className="space-y-2">
                    {data.slice(0, 5).map((item, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <div className="flex items-center flex-1">
                          <div className={`w-2 h-2 rounded-full mr-3 ${
                            index === 0 ? 'bg-blue-500' : 
                            index === 1 ? 'bg-green-500' : 
                            index === 2 ? 'bg-purple-500' : 
                            index === 3 ? 'bg-orange-500' : 'bg-gray-500'
                          }`} />
                          <span className="text-secondary-700 truncate">
                            {item.name || item.company || item.category || item.product_name || item.label || 'Item'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 ml-2">
                          {item.percentage && (
                            <span className="text-xs text-secondary-500 bg-secondary-100 px-2 py-1 rounded">
                              {item.percentage}%
                            </span>
                          )}
                          <span className="text-secondary-900 font-medium">
                            {item.quote_count || item.inquiries || item.total_quotes || item.value || item.priority || ''}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {data.length > (type === 'trends' ? 3 : 5) && (
                  <div className="text-xs text-secondary-500 text-center pt-3 border-t border-secondary-200 mt-3">
                    +{data.length - (type === 'trends' ? 3 : 5)} more {type === 'trends' ? 'sources' : 'items'}
                  </div>
                )}
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Close
              </Button>
              {onAction && actionLabel && (
                <Button
                  variant="primary"
                  onClick={onAction}
                  className="flex-1"
                >
                  {actionLabel}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsNotification;
