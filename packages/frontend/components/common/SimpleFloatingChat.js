import { useState, useEffect, useCallback, useRef } from 'react';
import { X, MessageCircle, Send, ArrowLeft, Users, Search } from 'lucide-react';
import Image from 'next/image';
import { getImageUrl } from '../../lib/imageUtils';
import apiService from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import websocketService from '../../lib/websocket';

// Helper function to get profile picture with fallback logic
const getProfilePicture = (conversation) => {
  // 1. Check if company owner has profile picture
  if (conversation?.seller?.profile_picture) {
    return getImageUrl(conversation.seller.profile_picture);
  }
  
  // 2. Check company agents for profile pictures
  if (conversation?.seller?.company?.agents && conversation.seller.company.agents.length > 0) {
    const agentWithPicture = conversation.seller.company.agents.find(agent => agent.profile_picture);
    if (agentWithPicture) {
      return getImageUrl(agentWithPicture.profile_picture);
    }
  }
  
  // 3. Random fallback image (female1-3 or male1-2)
  const randomImages = [
    '/female_1.png',
    '/female_2.png', 
    '/female_3.png',
    '/male_1.png',
    '/male_2.png'
  ];
  
  // Use conversation ID to consistently pick the same random image
  const index = conversation?.id ? conversation.id % randomImages.length : Math.floor(Math.random() * randomImages.length);
  return randomImages[index];
};

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
  const [lastMessageTimestamp, setLastMessageTimestamp] = useState(null);
  const [pollingInterval, setPollingInterval] = useState(null);
  const [wsConnected, setWsConnected] = useState(false);
  const [currentChannel, setCurrentChannel] = useState(null);
  
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

  // Initialize WebSocket connection and conversations when modal opens
  useEffect(() => {
    if (isOpen && user) {
      // Initialize WebSocket connection
      initializeWebSocket();
      loadConversations();
      if (product) {
        initializeConversation();
      }
    } else if (!isOpen) {
      // Clean up WebSocket connection when modal closes
      cleanupWebSocket();
    }
  }, [isOpen, product, user]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Subscribe to WebSocket conversation channel when a conversation is selected
  useEffect(() => {
    if (conversation && conversation.id && user && wsConnected) {
      subscribeToConversation(conversation.id);
    } else if (!conversation || !conversation.id) {
      // Unsubscribe from current channel if no conversation
      if (currentChannel) {
        websocketService.unsubscribeFromConversation(currentChannel);
        setCurrentChannel(null);
      }
    }
    
    return () => {
      // Clean up WebSocket subscription
      if (currentChannel) {
        websocketService.unsubscribeFromConversation(currentChannel);
        setCurrentChannel(null);
      }
    };
  }, [conversation, user, wsConnected]);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      // Clean up WebSocket connections and polling when component unmounts
      if (currentChannel) {
        websocketService.unsubscribeFromConversation(currentChannel);
      }
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const initializeWebSocket = async () => {
    try {
      // Get auth token from localStorage or API service
      const token = localStorage.getItem('auth_token');
      if (!token) {
        console.warn('No auth token found, cannot initialize WebSocket');
        return;
      }

      console.log('🔌 Initializing WebSocket connection...');
      const pusherInstance = websocketService.connect(token);
      
      if (pusherInstance) {
        console.log('✅ WebSocket service connected successfully');
        setWsConnected(true);
        
        // Add connection event listeners for debugging
        pusherInstance.connection.bind('connected', () => {
          console.log('🔗 Pusher connection established');
        });
        
        pusherInstance.connection.bind('disconnected', () => {
          console.log('❌ Pusher connection lost');
          setWsConnected(false);
        });
        
        pusherInstance.connection.bind('error', (error) => {
          console.error('❌ Pusher connection error:', error);
          setWsConnected(false);
        });
      } else {
        console.error('❌ Failed to initialize WebSocket service');
        setWsConnected(false);
      }
    } catch (error) {
      console.error('Failed to initialize WebSocket:', error);
      setWsConnected(false);
    }
  };

  const cleanupWebSocket = () => {
    console.log('🧹 Cleaning up WebSocket connection...');
    if (currentChannel) {
      websocketService.unsubscribeFromConversation(currentChannel);
      setCurrentChannel(null);
    }
    setWsConnected(false);
  };

  const subscribeToConversation = (conversationId) => {
    if (!conversationId || currentChannel === conversationId) {
      return; // Already subscribed to this conversation
    }

    // Unsubscribe from previous conversation if any
    if (currentChannel) {
      websocketService.unsubscribeFromConversation(currentChannel);
    }

    console.log('📡 Subscribing to conversation:', conversationId);
    
    const channel = websocketService.subscribeToConversation(conversationId, {
      onMessageReceived: (data) => {
        console.log('🔔 WebSocket message received in SimpleFloatingChat:', data);
        console.log('🔔 Message type:', typeof data);
        console.log('🔔 Message keys:', Object.keys(data || {}));
        handleRealTimeMessage(data);
      },
      onSubscribed: () => {
        console.log('✅ Successfully subscribed to conversation:', conversationId);
        console.log('✅ WebSocket channel active for conversation');
      },
      onError: (error) => {
        console.error('❌ Failed to subscribe to conversation:', error);
        // Fallback to polling if WebSocket fails
        startPollingFallback(conversationId);
      }
    });

    setCurrentChannel(conversationId);
  };

  const handleRealTimeMessage = (data) => {
    console.log('📨 Processing real-time message:', data);
    console.log('📋 Current conversation:', conversation);
    console.log('📋 Data structure:', JSON.stringify(data, null, 2));
    
    // Handle different message structures from WebSocket
    let messageData = data.message || data; // Support both wrapped and direct message format
    
    console.log('📋 Message data:', messageData);
    console.log('📋 Message conversation_id:', messageData.conversation_id);
    console.log('📋 Current conversation id:', conversation?.id);
    
    // Check if message is from current conversation
    if (messageData && conversation && messageData.conversation_id === conversation.id) {
      console.log('✅ Message matches current conversation, adding to messages');
      
      // Check if message already exists to prevent duplicates
      setMessages(prev => {
        const messageExists = prev.some(msg => msg.id === messageData.id);
        if (!messageExists) {
          console.log('✅ Adding new real-time message to conversation');
          console.log('📝 Message content:', messageData.message);
          return [...prev, messageData];
        } else {
          console.log('⚠️ Message already exists, skipping duplicate');
          return prev;
        }
      });

      // Update conversations list with latest message
      setConversations(prev => 
        prev.map(conv => {
          if (conv.id === messageData.conversation_id) {
            return {
              ...conv,
              latest_message: {
                message: messageData.message,
                sender_id: messageData.sender_id,
                created_at: messageData.created_at
              },
              last_message_at: messageData.created_at
            };
          }
          return conv;
        })
      );
    } else {
      console.log('⚠️ Message not added - reason:');
      console.log('   - Has messageData:', !!messageData);
      console.log('   - Has conversation:', !!conversation);
      console.log('   - Conversation IDs match:', messageData?.conversation_id === conversation?.id);
    }
  };

  const startPollingFallback = (conversationId) => {
    console.log('🔄 Starting polling fallback for conversation:', conversationId);
    
    // Clear any existing polling interval
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }
    
    // Start polling for new messages every 3 seconds as fallback
    const interval = setInterval(() => {
      pollForNewMessages(conversationId);
    }, 3000);
    
    setPollingInterval(interval);
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
      
      // Update last message timestamp for polling
      if (messagesResponse.messages && messagesResponse.messages.length > 0) {
        const latestMessage = messagesResponse.messages[messagesResponse.messages.length - 1];
        setLastMessageTimestamp(latestMessage.created_at);
        console.log('📅 Updated last message timestamp:', latestMessage.created_at);
      }
      
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
        
        // Update last message timestamp for polling
        if (messagesResponse.messages && messagesResponse.messages.length > 0) {
          const latestMessage = messagesResponse.messages[messagesResponse.messages.length - 1];
          setLastMessageTimestamp(latestMessage.created_at);
          console.log('📅 Updated last message timestamp:', latestMessage.created_at);
        }
        
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

  const pollForNewMessages = async (conversationId) => {
    if (!lastMessageTimestamp) {
      return; // No timestamp to compare against
    }
    
    try {
      console.log('🔄 Polling for new messages since:', lastMessageTimestamp);
      
      // Get messages after the last timestamp
      const response = await apiService.getBuyerMessagesAfter(conversationId, lastMessageTimestamp);
      
      if (response.success) {
        if (response.messages && response.messages.length > 0) {
          console.log('📨 Found', response.messages.length, 'new messages');
          
          // Filter out messages that already exist to prevent duplicates
          setMessages(prev => {
            const existingMessageIds = new Set(prev.map(msg => msg.id));
            const newMessages = response.messages.filter(msg => !existingMessageIds.has(msg.id));
            
            if (newMessages.length > 0) {
              console.log('✅ Adding', newMessages.length, 'truly new messages');
              const updatedMessages = [...prev, ...newMessages];
              console.log('📝 Total messages now:', updatedMessages.length);
              return updatedMessages;
            } else {
              console.log('⚠️ All messages were duplicates, not adding any');
              return prev;
            }
          });
          
          // Update last message timestamp only if we have new messages
          const latestMessage = response.messages[response.messages.length - 1];
          if (latestMessage.created_at > lastMessageTimestamp) {
            setLastMessageTimestamp(latestMessage.created_at);
            console.log('📅 Updated timestamp to:', latestMessage.created_at);
          }
          
          // Mark new messages as read if user is viewing this conversation
          const newMessageIds = response.messages.map(msg => msg.id);
          await apiService.markBuyerMessagesAsRead({
            conversation_id: conversationId,
            message_ids: newMessageIds
          });
          
          // Update conversations list with latest message
          const latestMessageData = response.messages[response.messages.length - 1];
          setConversations(prev => 
            prev.map(conv => {
              if (conv.id === conversationId) {
                return {
                  ...conv,
                  latest_message: {
                    message: latestMessageData.message,
                    sender_id: latestMessageData.sender_id,
                    created_at: latestMessageData.created_at
                  },
                  last_message_at: latestMessageData.created_at
                };
              }
              return conv;
            })
          );
        }
      }
    } catch (error) {
      console.error('Failed to poll for new messages:', error);
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
          // Immediately add the sent message to local state for instant UI update
          if (response.message) {
            setMessages(prev => {
              const messageExists = prev.some(msg => msg.id === response.message.id);
              if (!messageExists) {
                console.log('✅ Adding sent message to local state immediately');
                return [...prev, response.message];
              }
              return prev;
            });
            
            // Update timestamp for polling fallback
            setLastMessageTimestamp(response.message.created_at);
            console.log('📅 Updated timestamp after sending message:', response.message.created_at);
          } else {
            // Fallback: Refresh messages to get the latest
            const messagesResponse = await apiService.getBuyerConversationMessages(conversation.id);
            setMessages(messagesResponse.messages || []);
            
            // Update timestamp
            if (messagesResponse.messages && messagesResponse.messages.length > 0) {
              const latestMessage = messagesResponse.messages[messagesResponse.messages.length - 1];
              setLastMessageTimestamp(latestMessage.created_at);
            }
          }
          
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
          // Clear the message input immediately for better UX
          setNewMessage('');
          
          // If we get the message back immediately, add it to state
          if (response.message) {
            // Create a temporary conversation object if we don't have one yet
            if (!conversation.id) {
              setConversation(prev => ({
                ...prev,
                id: response.message.conversation_id
              }));
            }
            
            // Add the sent message immediately
            setMessages(prev => {
              const messageExists = prev.some(msg => msg.id === response.message.id);
              if (!messageExists) {
                console.log('✅ Adding sent message to new conversation immediately');
                return [...prev, response.message];
              }
              return prev;
            });
            
            // Update timestamp
            setLastMessageTimestamp(response.message.created_at);
          }
          
          // Refresh to get the complete conversation data
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
                
                // Only refresh messages if we didn't get them immediately
                if (!response.message) {
                  const newMessagesResponse = await apiService.getBuyerConversationMessages(newConversation.id);
                  setMessages(newMessagesResponse.messages || []);
                  
                  // Update timestamp for new conversation
                  if (newMessagesResponse.messages && newMessagesResponse.messages.length > 0) {
                    const latestMessage = newMessagesResponse.messages[newMessagesResponse.messages.length - 1];
                    setLastMessageTimestamp(latestMessage.created_at);
                    console.log('📅 Updated timestamp for new conversation:', latestMessage.created_at);
                  }
                }
              }
            } catch (refreshError) {
              console.error('Error refreshing conversation:', refreshError);
            }
          }, 500); // Reduced delay since we're showing the message immediately
          
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
                          <div className="w-10 h-10 rounded-full flex-shrink-0 overflow-hidden bg-gray-200">
                            <img 
                              src={getProfilePicture(conv)} 
                              alt={conv.seller?.company?.name || conv.seller?.name || 'Supplier'}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = '/female_1.png';
                              }}
                            />
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
                {conversation && (
                  <div className="w-10 h-10 rounded-full flex-shrink-0 overflow-hidden bg-gray-200">
                    <img 
                      src={getProfilePicture(conversation)} 
                      alt={conversation?.seller?.company?.name || conversation?.seller?.name || 'Supplier'}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/female_1.png';
                      }}
                    />
                  </div>
                )}
                {!conversation && <MessageCircle className="w-5 h-5 text-primary-600" />}
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
