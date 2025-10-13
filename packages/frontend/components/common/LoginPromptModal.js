import React from 'react';
import { useRouter } from 'next/router';
import { Lock, LogIn, X } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';

/**
 * LoginPromptModal - A reusable modal component that prompts unauthenticated users to log in
 * 
 * This modal is shown when unauthenticated users try to perform restricted actions
 * like messaging sellers, adding to cart, etc. It provides a clean UI with login/cancel options.
 * 
 * @param {boolean} isOpen - Whether the modal is open
 * @param {function} onClose - Function to close the modal
 * @param {string} title - Custom title for the modal (optional)
 * @param {string} message - Custom message to display (optional)
 * @param {string} actionText - Text describing the action that requires login (optional)
 */
const LoginPromptModal = ({ 
  isOpen, 
  onClose, 
  title = "Login Required",
  message = "You need to log in to continue with this action.",
  actionText = null
}) => {
  const router = useRouter();

  const handleLogin = () => {
    onClose();
    router.push('/login');
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      className="max-w-md"
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Lock className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="mb-6">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-full flex items-center justify-center">
              <Lock className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-gray-600 mb-2">
              {message}
            </p>
            {actionText && (
              <p className="text-sm text-gray-500">
                Action: <span className="font-medium">{actionText}</span>
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={handleLogin}
            variant="primary"
            className="flex-1 flex items-center justify-center space-x-2"
          >
            <LogIn className="w-4 h-4" />
            <span>Log In</span>
          </Button>
          <Button
            onClick={onClose}
            variant="secondary"
            className="flex-1"
          >
            Cancel
          </Button>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Don't have an account? You can register after clicking "Log In"
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default LoginPromptModal;
