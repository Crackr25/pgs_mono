import { useState, useEffect, useCallback, useRef } from 'react';
import { X, MessageCircle, Send, ArrowLeft, Users, Search } from 'lucide-react';
import Image from 'next/image';
import { getImageUrl } from '../../lib/imageUtils';
import apiService from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';

export default function SimpleFloatingChat({ 
  isOpen, 
  onClose, 
  product = null,
  className = '' 
}) {
  const [conversation, setConversation] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [conversationsLoading, setConversationsLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  
  const { user } = useAuth();
  const messagesEndRef = useRef(null);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Initialize conversations when modal opens
  useEffect(() => {
    if (isOpen) {
      loadConversations();
      if (product) {
        initializeConversation();
      }
    }
  }, [isOpen, product]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = async () => {
    try {
      setConversationsLoading(true);
      const conversationsResponse = await apiService.getBuyerConversations();
      setConversations(conversationsResponse.conversations || []);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setConversationsLoading(false);
    }
  };

  const selectConversation = async (selectedConversation) => {
    try {
      setLoading(true);
      setConversation(selectedConversation);
      
      // Load messages for selected conversation
      const messagesResponse = await apiService.getBuyerConversationMessages(selectedConversation.id);
      setMessages(messagesResponse.messages || []);
      
      // Hide sidebar on mobile after selection
      if (isMobile) {
        setShowSidebar(false);
      }
    } catch (error) {
      console.error('Error loading conversation messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const initializeConversation = async () => {
    try {
      setLoading(true);
      
      // First, try to find existing conversation
      const conversationsResponse = await apiService.getBuyerConversations();
      const existingConversation = conversationsResponse.conversations?.find(
        conv => conv.seller.company?.id === product.company?.id
      );

      console.log('Existing conversation:', conversationsResponse);
      console.log('Product company:', product.company);
      

      if (existingConversation) {
        // Load existing conversation and all its messages
        setConversation(existingConversation);
        const messagesResponse = await apiService.getBuyerConversationMessages(existingConversation.id);
        setMessages(messagesResponse.messages || []);
        console.log('Loaded existing conversation with', messagesResponse.messages?.length || 0, 'messages');
      } else {
        // No existing conversation - just set up for new conversation
        // Don't auto-send welcome message, let user send first message
        setConversation({
          id: null,
          supplier: {
            id: product.company.id,
            name: product.company.name
          }
        });
        setMessages([]);
        console.log('No existing conversation found, ready for new conversation');
      }
    } catch (error) {
      console.error('Error initializing conversation:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = useCallback(async () => {
    if (!newMessage.trim() || sending || !conversation) return;

    try {
      setSending(true);
      
      if (conversation.id) {
        // Existing conversation - send message to it with product context
        const messagePayload = {
          conversation_id: conversation.id,
          message: newMessage.trim(),
          product_id: product?.id || null,
          product_context: product ? {
            id: product.id,
            name: product.name,
            price: product.price,
            unit: product.unit,
            moq: product.moq,
            image: product.images && product.images.length > 0 ? product.images[0] : null,
            has_image: product.images && product.images.length > 0,
            company_name: product.company.name,
            company: {
              id: product.company.id,
              name: product.company.name
            }
          } : null,
          message_type: product ? 'product_inquiry' : 'text'
        };

        const response = await apiService.sendBuyerMessage(messagePayload);
        
        if (response.success !== false) {
          // Refresh messages to get the latest
          const messagesResponse = await apiService.getBuyerConversationMessages(conversation.id);
          setMessages(messagesResponse.messages || []);
          setNewMessage('');
          
          // Refresh conversations list to update last message
          loadConversations();
        }
      } else {
        // New conversation - create it by sending first message
        const messagePayload = {
          recipient_id: product.company.user_id || product.company.id,
          recipient_type: 'company',
          message: newMessage.trim(),
          product_id: product.id,
          product_context: {
            id: product.id,
            name: product.name,
            price: product.price,
            unit: product.unit,
            moq: product.moq,
            image: product.images && product.images.length > 0 ? product.images[0] : null,
            has_image: product.images && product.images.length > 0,
            company_name: product.company.name,
            company: {
              id: product.company.id,
              name: product.company.name
            }
          },
          message_type: 'product_inquiry'
        };

        const response = await apiService.sendBuyerMessage(messagePayload);
        
        console.log('New conversation response:', response); // Debug log
        
        if (response.success !== false) {
          // Refresh to get the new conversation and messages
          setTimeout(async () => {
            try {
              // Refresh conversations list
              await loadConversations();
              
              const newConversationsResponse = await apiService.getBuyerConversations();
              const newConversation = newConversationsResponse.conversations?.find(
                conv => conv.seller?.company?.id === product.company?.id ||
                       conv.supplier?.id === product.company?.id ||
                       conv.seller?.id === product.company?.user_id
              );
              
              if (newConversation) {
                setConversation(newConversation);
                const newMessagesResponse = await apiService.getBuyerConversationMessages(newConversation.id);
                setMessages(newMessagesResponse.messages || []);
              }
            } catch (refreshError) {
              console.error('Error refreshing conversation:', refreshError);
            }
          }, 1000); // Increased delay to allow backend processing
          
          setNewMessage('');
        } else {
          console.error('Failed to send message:', response);
        }
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      
      // Show error to user (you might want to add a toast notification here)
      if (error.response?.data?.message) {
        console.error('Server error:', error.response.data.message);
      } else if (error.message) {
        console.error('Error message:', error.message);
      }
    } finally {
      setSending(false);
    }
  }, [newMessage, sending, conversation, product]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed bottom-6 right-6 z-[60] ${className}`}>
      <div className={`bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden ${
        isMobile ? 'w-[calc(100vw-2rem)] h-[calc(100vh-2rem)]' : 'w-[700px] h-[500px]'
      }`}>
        <div className="flex h-full">
          {/* Sidebar - Conversations List */}
          {(!isMobile || showSidebar) && (
            <div className={`${isMobile ? 'w-full' : 'w-80'} border-r border-gray-200 flex flex-col`}>
              {/* Sidebar Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-primary-600" />
                  <h3 className="font-semibold text-gray-900">Conversations</h3>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                  title="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Conversations List */}
              <div className="flex-1 overflow-y-auto">
                {conversationsLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    <MessageCircle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No conversations yet</p>
                    {product && (
                      <p className="text-xs mt-1">Start chatting about {product.name}</p>
                    )}
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {conversations.map((conv) => (
                      <button
                        key={conv.id}
                        onClick={() => selectConversation(conv)}
                        className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                          conversation?.id === conv.id ? 'bg-primary-50 border-r-2 border-primary-500' : ''
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <MessageCircle className="w-5 h-5 text-primary-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-medium text-gray-900 truncate">
                                {conv.seller?.company?.name || conv.seller?.name || 'Unknown Supplier'}
                              </h4>
                              <span className="text-xs text-gray-500">
                                {new Date(conv.last_message_at).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-xs text-gray-600 truncate mt-1">
                              {conv.latest_message?.message || 'No messages yet'}
                            </p>
                            {conv.unread_count > 0 && (
                              <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full mt-1">
                                {conv.unread_count}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Main Chat Area */}
          <div className={`flex-1 flex flex-col overflow-hidden ${isMobile && showSidebar ? 'hidden' : ''}`}>
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center space-x-3">
                {isMobile && !showSidebar && (
                  <button
                    onClick={() => setShowSidebar(true)}
                    className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                )}
                <MessageCircle className="w-5 h-5 text-primary-600" />
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {conversation?.seller?.company?.name || conversation?.seller?.name || product?.company?.name || 'Chat'}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {conversation ? 'Online' : 'Starting conversation...'}
                  </p>
                </div>
              </div>
              {!isMobile && (
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                  title="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Product Context */}
            {product && (
              <div className="p-3 bg-blue-50 border-b border-blue-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                    {product.images && product.images.length > 0 ? (
                      <Image
                        src={getImageUrl(product.images[0])}
                        alt={product.name}
                        width={40}
                        height={40}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <MessageCircle className="w-5 h-5 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {product.name}
                    </h4>
                    <p className="text-xs text-gray-600">
                      ${product.price}/{product.unit} • MOQ: {product.moq}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-4">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-2"></div>
                    <p className="text-sm text-gray-500">Loading conversation...</p>
                  </div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <MessageCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm text-gray-500">Start your conversation</p>
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.sender_id === user?.id
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-200 text-gray-900'
                        }`}
                      >
                        <p className="text-sm">{message.message}</p>
                        <p className={`text-xs mt-1 ${
                          message.sender_id === user?.id ? 'text-primary-200' : 'text-gray-500'
                        }`}>
                          {new Date(message.created_at).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 bg-white flex-shrink-0">
              <div className="flex items-center space-x-2 w-full">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={`Message ${conversation?.seller?.company?.name || conversation?.seller?.name || product?.company?.name || 'supplier'}...`}
                  className="flex-1 min-w-0 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  disabled={sending || !conversation}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sending || !conversation}
                  className="flex-shrink-0 p-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                  title="Send message"
                >
                  {sending ? (
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
