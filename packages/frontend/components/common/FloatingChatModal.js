import { useState, useEffect, useRef } from 'react';
import { X, Minus, Maximize2, Minimize2, MessageCircle, Package, DollarSign, ArrowLeft, Send, Plus } from 'lucide-react';
import Image from 'next/image';
import BuyerConversationList from '../buyer/BuyerConversationList';
import BuyerChatWindow from '../buyer/BuyerChatWindow';
import { getImageUrl } from '../../lib/imageUtils';
import apiService from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';

export default function FloatingChatModal({ 
  isOpen, 
  onClose, 
  product = null,
  className = '' 
}) {
  const [isMobile, setIsMobile] = useState(false);
  
  // Chat states
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [quickMessage, setQuickMessage] = useState('');
  const [sendingQuickMessage, setSendingQuickMessage] = useState(false);
  
  const { user } = useAuth();

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch conversations when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchConversations();
    }
  }, [isOpen]);

  // Auto-select or create conversation with product's supplier
  useEffect(() => {
    if (product && conversations.length > 0 && !selectedConversation) {
      const supplierConversation = conversations.find(
        conv => conv.supplier?.id === product.company?.id
      );
      if (supplierConversation) {
        handleSelectConversation(supplierConversation);
      } else {
        // Auto-create conversation if none exists
        handleStartConversation();
      }
    } else if (product && conversations.length === 0 && !loading) {
      // If no conversations at all, create one
      handleStartConversation();
    }
  }, [product, conversations, selectedConversation, loading]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await apiService.getBuyerConversations();
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
      const response = await apiService.getBuyerConversationMessages(conversationId);
      setMessages(response.messages || []);
      setSelectedConversation(response.conversation);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setMessagesLoading(false);
    }
  };

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    fetchMessages(conversation.id);
  };

  const handleSendMessage = async (message, attachment = null) => {
    if (!selectedConversation) return;

    try {
      const response = await apiService.sendBuyerMessageWithAttachment(
        selectedConversation.id,
        message,
        attachment
      );
      
      if (response.success) {
        setMessages(prev => [...prev, response.message]);
        setConversations(prev => 
          prev.map(conv => 
            conv.id === selectedConversation.id 
              ? {
                  ...conv,
                  latest_message: {
                    message: response.message.message,
                    sender_id: response.message.sender_id,
                    message_type: response.message.message_type,
                    created_at: response.message.created_at
                  },
                  last_message_at: response.message.created_at
                }
              : conv
          )
        );
        return response;
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  };

  // Handle quick message send from minimized state
  const handleQuickMessageSend = async () => {
    if (!quickMessage.trim() || sendingQuickMessage || !product) return;

    try {
      setSendingQuickMessage(true);

      // Create or find conversation with the supplier
      let targetConversation = conversations.find(
        conv => conv.supplier?.id === product.company?.id
      );

      if (!targetConversation) {
        // Create a new conversation by sending the first message
        const messagePayload = {
          recipient_id: product.company.id,
          recipient_type: 'company',
          message: quickMessage.trim(),
          product_id: product.id,
          message_type: 'product_inquiry'
        };

        const response = await apiService.sendBuyerMessage(messagePayload);
        
        if (response.success !== false) {
          // Refresh conversations to get the new one
          await fetchConversations();
          setQuickMessage('');
          
          // After refreshing, try to find and select the new conversation
          setTimeout(() => {
            const newConversation = conversations.find(
              conv => conv.supplier?.id === product.company?.id
            );
            if (newConversation) {
              handleSelectConversation(newConversation);
            }
          }, 500);
          
          // Show success feedback
          console.log('Message sent successfully');
        }
      } else {
        // Send message to existing conversation
        const response = await apiService.sendBuyerMessageWithAttachment(
          targetConversation.id,
          quickMessage.trim(),
          null
        );

        if (response.success) {
          // Update conversations list
          setConversations(prev => 
            prev.map(conv => 
              conv.id === targetConversation.id 
                ? {
                    ...conv,
                    latest_message: {
                      message: response.message.message,
                      sender_id: response.message.sender_id,
                      message_type: response.message.message_type,
                      created_at: response.message.created_at
                    },
                    last_message_at: response.message.created_at
                  }
                : conv
            )
          );
          
          // Update messages if this conversation is currently selected
          if (selectedConversation && selectedConversation.id === targetConversation.id) {
            setMessages(prev => [...prev, response.message]);
          }
          
          setQuickMessage('');
        }
      }
    } catch (error) {
      console.error('Failed to send quick message:', error);
    } finally {
      setSendingQuickMessage(false);
    }
  };

  // Handle starting a new conversation from empty state
  const handleStartConversation = async () => {
    if (!product) return;

    try {
      // Create a new conversation with a welcome message
      const welcomeMessage = `Hi! I'm interested in your ${product.name}. Could you please provide more information?`;
      
      const messagePayload = {
        recipient_id: product.company.id,
        recipient_type: 'company',
        message: welcomeMessage,
        product_id: product.id,
        message_type: 'product_inquiry'
      };

      const response = await apiService.sendBuyerMessage(messagePayload);
      
      if (response.success !== false) {
        // Refresh conversations to get the new one
        await fetchConversations();
        
        // After refreshing, find and select the new conversation
        setTimeout(() => {
          const newConversation = conversations.find(
            conv => conv.supplier?.id === product.company?.id
          );
          if (newConversation) {
            handleSelectConversation(newConversation);
          }
        }, 500);
      }
    } catch (error) {
      console.error('Failed to start conversation:', error);
    }
  };

  // Handle Enter key press in quick message input
  const handleQuickMessageKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleQuickMessageSend();
    }
  };

  // Drag functionality (only on desktop when not maximized)
  const handleMouseDown = (e) => {
    if (isMobile || isTablet || isMaximized) return;
    
    const rect = modalRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    setIsDragging(true);
  };

  const handleMouseMove = (e) => {
    if (!isDragging || isMobile || isTablet || isMaximized) return;
    
    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;
    
    // Keep within viewport bounds
    const maxX = window.innerWidth - 400; // modal width
    const maxY = window.innerHeight - 500; // modal height
    
    setPosition({
      x: Math.max(0, Math.min(maxX, newX)),
      y: Math.max(0, Math.min(maxY, newY))
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  // Handle quick message sendoggle
  const handleMinimize = () => {
    const newMinimized = !isMinimized;
    setIsMinimized(newMinimized);
    if (onMinimize) {
      onMinimize(newMinimized);
    }
  };

  // Responsive modal classes with smooth transitions
  const getModalClasses = () => {
    const baseClasses = 'fixed bg-white shadow-2xl border border-gray-200 overflow-hidden transition-all duration-300 ease-in-out';
    
    if (isMinimized) {
      // Taller minimized state to accommodate quick message input
      return `${baseClasses} z-[60] w-80 h-20 bottom-6 right-6 rounded-lg`;
    }
    
    if (isMobile) {
      return `${baseClasses} z-[60] inset-0 w-full h-full rounded-none`;
    }
    
    if (isTablet || isMaximized) {
      return `${baseClasses} z-[60] inset-4 w-auto h-auto rounded-lg max-h-[calc(100vh-2rem)]`;
    }
    
    // Desktop default - better positioning to avoid overlap
    return `${baseClasses} z-[60] w-[400px] h-[600px] bottom-6 right-6 rounded-lg`;
  };

  const modalStyle = (!isMobile && !isTablet && !isMaximized && !isMinimized) ? {
    transform: `translate(${position.x}px, ${position.y}px)`,
    bottom: 'auto',
    right: 'auto',
    top: 0,
    left: 0
  } : {};

  return (
    <div 
      ref={modalRef}
      className={`${getModalClasses()} ${className}`}
      style={modalStyle}
    >
      {/* Header */}
      <div 
        ref={headerRef}
        className={`${isMinimized ? 'p-2' : 'p-3 sm:p-4'} border-b border-gray-200 bg-gray-50 flex-shrink-0 ${
          !isMobile && !isTablet && !isMaximized && !isMinimized ? 'cursor-move' : ''
        }`}
        onMouseDown={!isMinimized ? handleMouseDown : undefined}
      >
        {isMinimized ? (
          /* Minimized state with quick message input */
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2 min-w-0 flex-1">
              <MessageCircle className="w-4 h-4 text-primary-600 flex-shrink-0" />
              <span className="text-xs font-medium text-gray-700 truncate">
                {product?.company?.name || 'Quick Message'}
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <button
                onClick={handleMinimize}
                className="p-1 hover:bg-gray-200 rounded transition-colors"
                title="Restore"
              >
                <Maximize2 className="w-3 h-3" />
              </button>
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-200 rounded transition-colors"
                title="Close"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        ) : (
          /* Normal state header */
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 min-w-0 flex-1">
              <MessageCircle className="w-5 h-5 text-primary-600 flex-shrink-0" />
              <h3 className="font-semibold text-gray-900 truncate text-sm sm:text-base">
                {selectedConversation ? selectedConversation.supplier?.name || 'Chat' : 'Messages'}
              </h3>
            </div>
            
            <div className="flex items-center space-x-1 flex-shrink-0">
              {/* Desktop controls */}
              {!isMobile && !isTablet && (
                <>
                  <button
                    onClick={handleMinimize}
                    className="p-1.5 hover:bg-gray-200 rounded transition-colors"
                    title="Minimize"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setIsMaximized(!isMaximized)}
                    className="p-1.5 hover:bg-gray-200 rounded transition-colors"
                    title={isMaximized ? "Restore" : "Maximize"}
                  >
                    {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  </button>
                </>
              )}
              {/* Tablet controls */}
              {isTablet && !isMobile && (
                <button
                  onClick={handleMinimize}
                  className="p-1.5 hover:bg-gray-200 rounded transition-colors"
                  title="Minimize"
                >
                  <Minus className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-gray-200 rounded transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Quick Message Input (when minimized) */}
      {isMinimized && product && (
        <div className="p-2 bg-white">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={quickMessage}
              onChange={(e) => setQuickMessage(e.target.value)}
              onKeyPress={handleQuickMessageKeyPress}
              placeholder={`Message ${product.company?.name}...`}
              className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              disabled={sendingQuickMessage}
            />
            <button
              onClick={handleQuickMessageSend}
              disabled={!quickMessage.trim() || sendingQuickMessage}
              className="p-1.5 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-md transition-colors flex-shrink-0"
              title="Send message"
            >
              {sendingQuickMessage ? (
                <div className="animate-spin w-3 h-3 border-2 border-white border-t-transparent rounded-full"></div>
              ) : (
                <Send className="w-3 h-3" />
              )}
            </button>
          </div>
        </div>
      )}

      {/* Product Context (if provided and not minimized) */}
      {product && !isMinimized && (
        <div className="p-3 sm:p-4 bg-blue-50 border-b border-blue-200 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className={`${isMobile ? 'w-8 h-8' : 'w-10 h-10'} bg-gray-200 rounded-lg overflow-hidden flex-shrink-0`}>
              {product.images && product.images.length > 0 ? (
                <Image
                  src={getImageUrl(product.images[0])}
                  alt={product.name}
                  width={isMobile ? 32 : 40}
                  height={isMobile ? 32 : 40}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-gray-400`} />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium text-gray-900 truncate leading-tight`}>
                {product.name}
              </h4>
              <div className={`flex items-center flex-wrap gap-1 sm:gap-2 ${isMobile ? 'text-xs' : 'text-xs'} text-gray-600 mt-1`}>
                <div className="flex items-center space-x-1">
                  <DollarSign className="w-3 h-3 flex-shrink-0" />
                  <span className="whitespace-nowrap">${product.price}/{product.unit}</span>
                </div>
                <span className="hidden sm:inline">•</span>
                <span className="whitespace-nowrap">MOQ: {product.moq}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chat Content */}
      {!isMinimized && (
        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* Conversation List - Responsive layout */}
          <div className={`
            ${isMobile && selectedConversation ? 'hidden' : 'block'} 
            ${isMobile ? 'w-full' : isTablet ? 'w-2/5' : 'w-1/3'} 
            border-r border-gray-200 flex flex-col min-h-0
          `}>
            <BuyerConversationList
              conversations={conversations}
              selectedConversation={selectedConversation}
              onSelectConversation={handleSelectConversation}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              loading={loading}
              compact={true}
            />
          </div>

          {/* Chat Window - Show when conversation selected */}
          {selectedConversation && (
            <div className={`
              ${isMobile ? 'w-full' : isTablet ? 'w-3/5' : 'w-2/3'} 
              flex flex-col min-h-0 overflow-hidden
            `}>
              {/* Mobile back button */}
              {isMobile && (
                <div className="p-3 border-b border-gray-200 flex-shrink-0 bg-white">
                  <button
                    onClick={() => setSelectedConversation(null)}
                    className="flex items-center space-x-2 text-sm text-primary-600 hover:text-primary-700 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to conversations</span>
                  </button>
                </div>
              )}
              
              <div className="flex-1 min-h-0 overflow-hidden">
                <BuyerChatWindow
                  conversation={selectedConversation}
                  messages={messages}
                  onSendMessage={handleSendMessage}
                  currentUser={user}
                  loading={messagesLoading}
                  onMessagesUpdate={setMessages}
                  compact={true}
                />
              </div>
            </div>
          )}

          {/* Empty state when no conversation selected on desktop/tablet */}
          {!selectedConversation && !isMobile && (
            <div className={`
              ${isTablet ? 'w-3/5' : 'w-2/3'} 
              flex items-center justify-center text-gray-500 p-8
            `}>
              <div className="text-center">
                <MessageCircle className={`${isTablet ? 'w-10 h-10' : 'w-12 h-12'} mx-auto mb-4 opacity-50`} />
                {product ? (
                  <div>
                    <p className={`${isTablet ? 'text-sm' : 'text-base'} mb-2`}>
                      Start a conversation with
                    </p>
                    <p className={`${isTablet ? 'text-base' : 'text-lg'} font-semibold text-gray-700 mb-3`}>
                      {product.company?.name}
                    </p>
                    <button
                      onClick={handleStartConversation}
                      className="inline-flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Start Conversation
                    </button>
                  </div>
                ) : (
                  <p className={`${isTablet ? 'text-sm' : 'text-base'}`}>
                    Select a conversation to start chatting
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
