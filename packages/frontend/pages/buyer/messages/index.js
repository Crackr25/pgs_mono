import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { 
  MessageSquare,
  Search,
  Clock,
  User,
  Building2,
  Shield,
  Package,
  Send,
  Paperclip,
  MoreVertical,
  ArrowLeft,
  Phone,
  Video
} from 'lucide-react';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import Skeleton from '../../../components/common/Skeleton';
import apiService from '../../../lib/api';

export default function BuyerMessages() {
  const router = useRouter();
  const { conversation_id } = router.query;
  
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (conversation_id && conversations.length > 0) {
      const conversation = conversations.find(c => c.id === parseInt(conversation_id));
      if (conversation) {
        setSelectedConversation(conversation);
        fetchMessages(conversation_id);
      }
    }
  }, [conversation_id, conversations]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await apiService.request('/buyer/conversations');
      setConversations(response.conversations || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      setMessagesLoading(true);
      const response = await apiService.request(`/buyer/conversations/${conversationId}`);
      setMessages(response.messages || []);
      setSelectedConversation(response.conversation);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setMessagesLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation || sending) return;

    try {
      setSending(true);
      const response = await apiService.request('/buyer/messages/send', {
        method: 'POST',
        body: JSON.stringify({
          conversation_id: selectedConversation.id,
          message: newMessage,
          message_type: 'text'
        })
      });

      if (response.success) {
        setMessages(prev => [...prev, response.message]);
        setNewMessage('');
        // Update conversation list
        fetchConversations();
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const selectConversation = (conversation) => {
    setSelectedConversation(conversation);
    fetchMessages(conversation.id);
    router.push(`/buyer/messages?conversation_id=${conversation.id}`, undefined, { shallow: true });
  };

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
      <div className="h-screen flex">
        <div className="w-1/3 border-r border-secondary-200 p-4">
          <Skeleton className="h-10 w-full mb-4" />
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="mb-4">
              <Skeleton className="h-16 w-full" />
            </div>
          ))}
        </div>
        <div className="flex-1 p-4">
          <Skeleton className="h-full w-full" />
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Messages - Pinoy Global Supply</title>
      </Head>

      <div className="h-screen flex bg-white">
        {/* Conversations Sidebar */}
        <div className="w-1/3 border-r border-secondary-200 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-secondary-200">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-semibold text-secondary-900">Messages</h1>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/buyer')}
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
                  onClick={() => selectConversation(conversation)}
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

        {/* Messages Area */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-secondary-200 bg-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      {selectedConversation.seller.company ? (
                        <Building2 className="w-5 h-5 text-primary-600" />
                      ) : (
                        <User className="w-5 h-5 text-primary-600" />
                      )}
                    </div>
                    <div>
                      <h2 className="font-semibold text-secondary-900">
                        {selectedConversation.seller.company?.name || selectedConversation.seller.name}
                      </h2>
                      {selectedConversation.seller.company && (
                        <p className="text-sm text-secondary-600">
                          {selectedConversation.seller.company.location}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Phone className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Video className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messagesLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Skeleton key={i} className="h-16 w-3/4" />
                    ))}
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center text-secondary-500 py-8">
                    <MessageSquare className="w-12 h-12 mx-auto mb-2 text-secondary-300" />
                    <p>No messages yet</p>
                    <p className="text-sm">Start the conversation!</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender_id === selectedConversation.seller.id ? 'justify-start' : 'justify-end'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.sender_id === selectedConversation.seller.id
                            ? 'bg-secondary-100 text-secondary-900'
                            : 'bg-primary-600 text-white'
                        }`}
                      >
                        {message.message_type === 'product_inquiry' && (
                          <div className="flex items-center space-x-1 mb-1 text-xs opacity-75">
                            <Package className="w-3 h-3" />
                            <span>Product Inquiry</span>
                          </div>
                        )}
                        <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                        <p className={`text-xs mt-1 ${
                          message.sender_id === selectedConversation.seller.id
                            ? 'text-secondary-500'
                            : 'text-primary-100'
                        }`}>
                          {formatTime(message.created_at)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-secondary-200 bg-white">
                <form onSubmit={sendMessage} className="flex items-end space-x-2">
                  <div className="flex-1">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      rows={1}
                      className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage(e);
                        }
                      }}
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                  >
                    <Paperclip className="w-4 h-4" />
                  </Button>
                  <Button
                    type="submit"
                    disabled={!newMessage.trim() || sending}
                    className="bg-primary-600 hover:bg-primary-700 text-white"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-secondary-500">
              <div className="text-center">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 text-secondary-300" />
                <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
                <p>Choose a conversation from the sidebar to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
