import { useState } from 'react';
import { AlertCircle, LogOut } from 'lucide-react';
import apiService from '../../lib/api';
import ConfirmDialog from './ConfirmDialog';

export default function ImpersonationBanner() {
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleExitClick = () => {
    setShowConfirm(true);
  };

  const handleExitConfirm = async () => {
    setShowConfirm(false);
    
    try {
      setLoading(true);
      
      // Get the admin token before clearing everything
      const adminToken = localStorage.getItem('admin_token');
      
      // Call API to stop impersonation (this will delete the impersonation token)
      try {
        await apiService.stopImpersonation();
      } catch (error) {
        // Continue even if API call fails - we still want to restore admin session
        console.warn('Stop impersonation API call failed:', error);
      }
      
      // Clear impersonation data from localStorage
      localStorage.removeItem('impersonation_token');
      localStorage.removeItem('impersonator_id');
      localStorage.removeItem('impersonator_name');
      localStorage.removeItem('is_impersonating');
      
      // Restore the admin token
      if (adminToken) {
        apiService.setToken(adminToken);
        localStorage.removeItem('admin_token'); // Clean up
      }
      
      // Redirect back to admin portal
      window.location.href = '/admin/users';
    } catch (error) {
      console.error('Error exiting impersonation:', error);
      setLoading(false);
    }
  };

  const impersonatorName = typeof window !== 'undefined' 
    ? localStorage.getItem('impersonator_name') 
    : null;

  return (
    <>
      <div className="bg-yellow-500 text-white px-4 py-3 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5" />
            <div>
              <p className="font-semibold">Impersonation Mode Active</p>
              <p className="text-sm text-yellow-100">
                You are viewing this portal as another user. Admin: {impersonatorName}
              </p>
            </div>
          </div>
          <button
            onClick={handleExitClick}
            disabled={loading}
            className="flex items-center gap-2 bg-white text-yellow-600 px-4 py-2 rounded-lg font-medium hover:bg-yellow-50 transition-colors disabled:opacity-50"
          >
            <LogOut className="h-4 w-4" />
            {loading ? 'Exiting...' : 'Exit Impersonation'}
          </button>
        </div>
      </div>

      {/* Exit Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleExitConfirm}
        title="Exit Impersonation"
        message="Are you sure you want to exit impersonation mode and return to the admin portal? You will be logged back in as the administrator."
        confirmText="Exit Impersonation"
        cancelText="Stay Here"
        type="warning"
        loading={loading}
      />
    </>
  );
}
