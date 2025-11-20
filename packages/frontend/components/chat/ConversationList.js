import { useState, useEffect } from 'react';
import { Search, MessageSquare, Clock, User } from 'lucide-react';

export default function ConversationList({ 
  conversations, 
  selectedConversation, 
  onSelectConversation, 
  searchTerm, 
  onSearchChange,
  loading = false 
}) {
  const [filteredConversations, setFilteredConversations] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' or 'unread'

  useEffect(() => {
    if (!conversations) return;
    
    // First apply search filter
    let filtered = conversations.filter(conversation =>
      conversation.buyer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conversation.buyer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (conversation.latest_message?.message || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    // Then apply active filter (all or unread)
    if (activeFilter === 'unread') {
      filtered = filtered.filter(conversation => conversation.unread_count > 0);
    }
    
    setFilteredConversations(filtered);
  }, [conversations, searchTerm, activeFilter]);

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Helper functions to get counts for each filter
  const getAllConversationsCount = () => {
    if (!conversations) return 0;
    return conversations.filter(conversation =>
      conversation.buyer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conversation.buyer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (conversation.latest_message?.message || '').toLowerCase().includes(searchTerm.toLowerCase())
    ).length;
  };

  const getUnreadConversationsCount = () => {
    if (!conversations) return 0;
    return conversations.filter(conversation => {
      const matchesSearch = conversation.buyer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conversation.buyer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (conversation.latest_message?.message || '').toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch && conversation.unread_count > 0;
    }).length;
  };

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
  };

  if (loading) {
    return (
      <div className="w-80 flex-shrink-0 bg-white border-r border-secondary-200 flex flex-col">
        <div className="p-4 border-b border-secondary-200">
          <div className="animate-pulse">
            <div className="h-10 bg-secondary-200 rounded-lg"></div>
          </div>
        </div>
        <div className="flex-1 p-4 space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse flex items-start space-x-3">
              <div className="w-10 h-10 bg-secondary-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-secondary-200 rounded w-3/4"></div>
                <div className="h-3 bg-secondary-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 flex-shrink-0 bg-white border-r border-secondary-200 flex flex-col">
      {/* Search */}
      <div className="p-4 border-b border-secondary-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex border-b border-secondary-200">
        <button 
          onClick={() => handleFilterChange('all')}
          className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
            activeFilter === 'all' 
              ? 'text-primary-600 border-b-2 border-primary-600' 
              : 'text-secondary-500 hover:text-secondary-700 border-b-2 border-transparent hover:border-secondary-300'
          }`}
        >
          All ({getAllConversationsCount()})
        </button>
        <button 
          onClick={() => handleFilterChange('unread')}
          className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
            activeFilter === 'unread' 
              ? 'text-primary-600 border-b-2 border-primary-600' 
              : 'text-secondary-500 hover:text-secondary-700 border-b-2 border-transparent hover:border-secondary-300'
          }`}
        >
          Unread ({getUnreadConversationsCount()})
        </button>
      </div>

      {/* Conversations */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-secondary-500">
            <MessageSquare className="w-12 h-12 mb-4" />
            <p className="text-sm text-center">
              {searchTerm 
                ? 'No conversations match your search' 
                : activeFilter === 'unread' 
                  ? 'No unread conversations' 
                  : 'No conversations yet'
              }
            </p>
          </div>
        ) : (
          filteredConversations.map((conversation) => (
            <div
              key={conversation.id}
              onClick={() => onSelectConversation(conversation)}
              className={`p-4 border-b border-secondary-100 cursor-pointer hover:bg-secondary-50 transition-colors ${
                selectedConversation?.id === conversation.id ? 'bg-primary-50 border-primary-200' : ''
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-medium text-primary-600">
                    {getInitials(conversation.buyer.name)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-medium text-secondary-900 truncate">
                      {conversation.buyer.name}
                    </h3>
                    <div className="flex items-center space-x-1">
                      {conversation.unread_count > 0 && (
                        <div className="w-5 h-5 bg-primary-600 text-white text-xs rounded-full flex items-center justify-center">
                          {conversation.unread_count > 9 ? '9+' : conversation.unread_count}
                        </div>
                      )}
                      <span className="text-xs text-secondary-500 flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatTime(conversation.last_message_at)}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-secondary-500 mb-1 flex items-center">
                    <User className="w-3 h-3 mr-1" />
                    {conversation.buyer.email}
                  </p>
                  {conversation.latest_message && (
                    <p className="text-sm text-secondary-600 truncate">
                      {conversation.latest_message.sender_id === conversation.buyer.id ? '' : 'You: '}
                      {conversation.latest_message.message}
                    </p>
                  )}
                  {conversation.order_id && (
                    <p className="text-xs text-blue-600 mt-1">
                      Order #{conversation.order_id}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
