import { X, AlertTriangle, Trash2, UserX } from 'lucide-react';
import Button from './Button';

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'default', // 'default', 'danger', 'warning'
  icon
}) {
  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          iconBg: 'bg-red-100',
          iconColor: 'text-red-600',
          confirmButton: 'bg-red-600 hover:bg-red-700 text-white'
        };
      case 'warning':
        return {
          iconBg: 'bg-yellow-100',
          iconColor: 'text-yellow-600',
          confirmButton: 'bg-yellow-600 hover:bg-yellow-700 text-white'
        };
      default:
        return {
          iconBg: 'bg-blue-100',
          iconColor: 'text-blue-600',
          confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white'
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 animate-in fade-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-secondary-200">
          <div className="flex items-center space-x-3">
            {icon && (
              <div className={`w-10 h-10 rounded-full ${styles.iconBg} flex items-center justify-center`}>
                <div className={`w-5 h-5 ${styles.iconColor}`}>
                  {icon}
                </div>
              </div>
            )}
            <h3 className="text-lg font-semibold text-secondary-900">
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-secondary-400 hover:text-secondary-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-secondary-600 leading-relaxed">
            {message}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-secondary-200 bg-secondary-50">
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-secondary-600 hover:text-secondary-800"
          >
            {cancelText}
          </Button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${styles.confirmButton}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
