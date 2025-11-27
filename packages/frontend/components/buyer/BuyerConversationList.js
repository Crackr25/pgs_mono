import { useState } from 'react';
import { 
  MessageSquare, 
  Search, 
  User, 
  Building2, 
  Shield, 
  Package 
} from 'lucide-react';
import Skeleton from '../common/Skeleton';

export default function BuyerConversationList({
  conversations,
  selectedConversation,
  onSelectConversation,
  searchTerm,
  onSearchChange,
  loading = false
}) {
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const filteredConversations = conversations.filter(conversation =>
    conversation.seller.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (conversation.seller.company?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="w-1/3 border-r border-secondary-200 p-4">
        <Skeleton className="h-10 w-full mb-4" />
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="mb-4">
            <Skeleton className="h-16 w-full" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="w-80 lg:w-96 border-r border-secondary-200 flex flex-col bg-white flex-shrink-0">
      {/* Header */}
      <div className="p-4 border-b border-secondary-200 bg-white">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-secondary-900">Conversations</h2>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="p-4 text-center text-secondary-500">
            <MessageSquare className="w-12 h-12 mx-auto mb-2 text-secondary-300" />
            <p>No conversations yet</p>
            <p className="text-sm">Start messaging suppliers from product pages</p>
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
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                  {conversation.seller.company ? (
                    <Building2 className="w-6 h-6 text-primary-600" />
                  ) : (
                    <User className="w-6 h-6 text-primary-600" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium text-secondary-900 truncate">
                        {conversation.seller.company?.name || conversation.seller.name}
                      </h3>
                      {conversation.seller.company?.verified && (
                        <Shield className="w-4 h-4 text-green-500" />
                      )}
                    </div>
                    <span className="text-xs text-secondary-500 flex-shrink-0">
                      {formatTime(conversation.last_message_at)}
                    </span>
                  </div>
                  
                  {conversation.seller.company && (
                    <p className="text-sm text-secondary-600 mb-1">
                      {conversation.seller.company.location}
                    </p>
                  )}
                  
                  {conversation.latest_message && (
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-secondary-600 truncate">
                        {conversation.latest_message.message_type === 'product_inquiry' && (
                          <Package className="w-3 h-3 inline mr-1" />
                        )}
                        {conversation.latest_message.message}
                      </p>
                      {conversation.unread_count > 0 && (
                        <span className="bg-primary-600 text-white text-xs rounded-full px-2 py-1 ml-2">
                          {conversation.unread_count}
                        </span>
                      )}
                    </div>
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
