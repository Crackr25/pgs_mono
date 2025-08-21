import { useState, useEffect } from 'react';
import chatAPI from '../../lib/api';

export default function ChatNotificationBadge({ className = '' }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUnreadCount();
    
    // Poll for unread count every 30 seconds as fallback
    const interval = setInterval(fetchUnreadCount, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const response = await chatAPI.getUnreadCount();
      if (response.success) {
        setUnreadCount(response.unread_count);
      }
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    } finally {
      setLoading(false);
    }
  };

  // Method to update count from parent components
  const updateUnreadCount = (count) => {
    setUnreadCount(count);
  };

  // Method to increment count when new message received
  const incrementUnreadCount = () => {
    setUnreadCount(prev => prev + 1);
  };

  // Method to decrement count when messages are read
  const decrementUnreadCount = (amount = 1) => {
    setUnreadCount(prev => Math.max(0, prev - amount));
  };

  if (loading || unreadCount === 0) {
    return null;
  }

  return (
    <div className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-medium text-white bg-red-500 rounded-full ${className}`}>
      {unreadCount > 99 ? '99+' : unreadCount}
    </div>
  );
}

// Export methods for external use
ChatNotificationBadge.updateUnreadCount = null;
ChatNotificationBadge.incrementUnreadCount = null;
ChatNotificationBadge.decrementUnreadCount = null;
