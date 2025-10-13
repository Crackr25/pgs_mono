import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

/**
 * useLoginPrompt - Custom hook for handling authentication-required actions
 * 
 * This hook provides a clean way to handle actions that require authentication.
 * It automatically shows a login prompt modal when unauthenticated users
 * try to perform restricted actions.
 * 
 * @returns {object} Object containing:
 *   - requireAuth: Function to wrap actions that need authentication
 *   - showLoginPrompt: Boolean indicating if login modal should be shown
 *   - hideLoginPrompt: Function to hide the login modal
 *   - promptConfig: Configuration for the login prompt modal
 */
export const useLoginPrompt = () => {
  const { isAuthenticated } = useAuth();
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [promptConfig, setPromptConfig] = useState({
    title: "Login Required",
    message: "You need to log in to continue with this action.",
    actionText: null
  });

  /**
   * Wraps an action to require authentication
   * If user is authenticated, executes the action
   * If not authenticated, shows login prompt modal
   * 
   * @param {function} action - The action to execute if authenticated
   * @param {object} config - Configuration for the login prompt
   * @param {string} config.title - Custom title for the modal
   * @param {string} config.message - Custom message to display
   * @param {string} config.actionText - Text describing the action
   */
  const requireAuth = (action, config = {}) => {
    if (isAuthenticated) {
      // User is authenticated, execute the action
      action();
    } else {
      // User is not authenticated, show login prompt
      setPromptConfig({
        title: config.title || "Login Required",
        message: config.message || "You need to log in to continue with this action.",
        actionText: config.actionText || null
      });
      setShowLoginPrompt(true);
    }
  };

  const hideLoginPrompt = () => {
    setShowLoginPrompt(false);
  };

  return {
    requireAuth,
    showLoginPrompt,
    hideLoginPrompt,
    promptConfig
  };
};

export default useLoginPrompt;
