import { Loader2 } from 'lucide-react';

const LoadingNotification = ({ message = 'Processing your request...', isOpen = true }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
      
      {/* Loading Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative transform overflow-hidden rounded-xl bg-white shadow-2xl transition-all p-8 text-center max-w-sm w-full">
          <div className="mb-4">
            <Loader2 className="w-12 h-12 mx-auto text-primary-600 animate-spin" />
          </div>
          <h3 className="text-lg font-medium text-secondary-900 mb-2">
            Please Wait
          </h3>
          <p className="text-secondary-600">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoadingNotification;
