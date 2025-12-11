import { useState, useEffect, useRef } from 'react';
import { Bell, Heart, MessageCircle, X } from 'lucide-react';
import apiService from '../../lib/api';
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'next/router';

export default function NotificationBell({ variant = 'primary' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    // Fetch unread count on mount
    fetchUnreadCount().catch(err => console.error('Failed to fetch unread count:', err));
    
    // Poll every 30 seconds
    const interval = setInterval(() => {
      fetchUnreadCount().catch(err => console.error('Failed to fetch unread count:', err));
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const response = await apiService.getUnreadNotificationsCount();
      console.log('Unread count response:', response);
      setUnreadCount(response.count || 0);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await apiService.getWallNotifications(1, 10);
      console.log('Notifications response:', response);
      // Handle both paginated and non-paginated responses
      const notificationData = response.data || response.notifications || [];
      setNotifications(notificationData);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = async (notification) => {
    try {
      // Mark as read
      if (!notification.is_read) {
        await apiService.markNotificationAsRead(notification.id);
        setUnreadCount(prev => Math.max(0, prev - 1));
        setNotifications(prev =>
          prev.map(n => n.id === notification.id ? { ...n, is_read: true } : n)
        );
      }

      // Navigate to post
      if (notification.wall_post_id) {
        router.push(`/agent/wall-feed?post=${notification.wall_post_id}`);
        setIsOpen(false);
      }
    } catch (error) {
      console.error('Error handling notification:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await apiService.markAllNotificationsAsRead();
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'post_like':
      case 'reply_like':
        return <Heart className="w-4 h-4 text-red-500" />;
      case 'post_reply':
        return <MessageCircle className="w-4 h-4 text-blue-500" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  const getNotificationText = (notification) => {
    const actorName = notification.actor?.name || 'Someone';
    switch (notification.type) {
      case 'post_like':
        return `${actorName} liked your post`;
      case 'reply_like':
        return `${actorName} liked your reply`;
      case 'post_reply':
        return `${actorName} replied to your post`;
      default:
        return 'New notification';
    }
  };

  // Style variants for different navbar styles
  const buttonStyles = variant === 'light' 
    ? "relative p-2 text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100 rounded-full transition-colors duration-200 cursor-pointer"
    : "relative p-2 text-white hover:bg-white/10 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-white cursor-pointer";

  return (
    <div className="relative z-50" ref={dropdownRef}>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log('Notification bell clicked!', isOpen);
          setIsOpen(!isOpen);
        }}
        className={buttonStyles}
        aria-label="Notifications"
        type="button"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex items-center justify-center min-w-[20px] h-5 px-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-secondary-200 z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-secondary-200">
            <h3 className="text-lg font-semibold text-secondary-900">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-secondary-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-secondary-500">
                <Bell className="w-12 h-12 mx-auto mb-2 text-secondary-300" />
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-4 border-b border-secondary-100 cursor-pointer hover:bg-secondary-50 transition-colors ${
                    !notification.is_read ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-secondary-900">
                        {getNotificationText(notification)}
                      </p>
                      {notification.content && (
                        <p className="text-sm text-secondary-600 mt-1 truncate">
                          {notification.content}
                        </p>
                      )}
                      <p className="text-xs text-secondary-500 mt-1">
                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                      </p>
                    </div>
                    {!notification.is_read && (
                      <div className="flex-shrink-0">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-secondary-200 text-center">
              <button
                onClick={() => {
                  router.push('/agent/notifications');
                  setIsOpen(false);
                }}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
