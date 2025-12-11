import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { MessageSquare, Users, Settings } from 'lucide-react';
import ConversationList from '../components/chat/ConversationList';
import ChatWindow from '../components/chat/ChatWindow';
import Button from '../components/common/Button';
import chatAPI from '../lib/api';
import websocketService from '../lib/websocket';
import { useAuth } from '../contexts/AuthContext';

export default function Chat() {
  const router = useRouter();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [wsConnected, setWsConnected] = useState(false);
  const { user } = useAuth();
  const chatWindowRef = useRef(null);

  // Initialize WebSocket connection and fetch data
  useEffect(() => {
    // Expose WebSocket service to window for debugging
    window.websocketService = websocketService;
    
    initializeChat();
    
    return () => {
      websocketService.disconnect();
    };
  }, []);

  // Handle URL query parameters for direct navigation
  useEffect(() => {
    const { company: companyId, order: orderId } = router.query;
    
    if (companyId && conversations.length > 0) {
      // Find conversation with this company
      const conversation = conversations.find(conv => 
        conv.company_id === parseInt(companyId) || 
        conv.company?.id === parseInt(companyId)
      );
      
      if (conversation) {
        console.log('📬 Opening conversation with company:', companyId);
        setSelectedConversation(conversation);
      } else {
        console.log('📭 No existing conversation found with company:', companyId);
        // TODO: Optionally create a new conversation or show message to start one
      }
    }
  }, [router.query, conversations]);

  // Subscribe to conversation when selected
  useEffect(() => {
    if (selectedConversation && currentUser) {
      // Fetch initial messages
      fetchMessages(selectedConversation.id);
      
      // Subscribe to WebSocket for real-time messages
      subscribeToConversation(selectedConversation.id);
    }
    
    return () => {
      // Clean up WebSocket subscription
      if (selectedConversation) {
        websocketService.unsubscribeFromConversation(selectedConversation.id);
      }
    };
  }, [selectedConversation, currentUser]);

  const initializeChat = async () => {
    try {
      // Get auth token from localStorage or context
      const token = localStorage.getItem('auth_token');
      if (!token) {
        router.push('/login');
        return;
      }

      // Set API token
      chatAPI.setToken(token);
      
      // Get current user info
      const userData = user;
      setCurrentUser(userData);

      // Connect WebSocket
      const pusherInstance = websocketService.connect(token);
      
      // Only subscribe if WebSocket connection was successful
      if (pusherInstance && userData?.id) {
        setWsConnected(true);
        websocketService.subscribeToUserChannel(userData.id, {
          onMessageNotification: handleNewMessageNotification
        });
      } else if (!pusherInstance) {
        console.warn('WebSocket not available. Real-time features will be disabled.');
        setWsConnected(false);
      }

      // Fetch conversations
      await fetchConversations();
      
    } catch (error) {
      console.error('Failed to initialize chat:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchConversations = async () => {
    try {
      let allConversations = [];
      
      // Fetch buyer-seller conversations
      const buyerSellerResponse = await chatAPI.getConversations();
      if (buyerSellerResponse.success) {
        allConversations = buyerSellerResponse.conversations.map(conv => ({
          ...conv,
          conversation_type: 'customer'
        }));
      }
      
      // Fetch agent-to-agent conversations if user is an agent
      if (user?.usertype === 'agent') {
        try {
          const agentResponse = await chatAPI.getAgentConversations();
          if (agentResponse.data) {
            const agentConversations = agentResponse.data.map(conv => ({
              id: conv.id,
              conversation_type: 'agent', // Mark as agent conversation
              other_agent: conv.other_agent,
              other_company: conv.other_company,
              last_message: conv.last_message,
              last_message_at: conv.last_message_at,
              unread_count: conv.unread_count,
              created_at: conv.created_at,
              // Map to match customer conversation format for display
              company: conv.other_company,
              buyer: conv.other_agent,
              seller: conv.other_agent,
            }));
            allConversations = [...allConversations, ...agentConversations];
          }
        } catch (error) {
          console.error('Failed to fetch agent conversations:', error);
        }
      }
      
      // Sort by last_message_at
      allConversations.sort((a, b) => 
        new Date(b.last_message_at || b.created_at) - new Date(a.last_message_at || a.created_at)
      );
      
      setConversations(allConversations);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    }
  };

  const fetchMessages = async (conversationId) => {
    setMessagesLoading(true);
    try {
      // Check if this is an agent conversation
      const conversation = conversations.find(c => c.id === conversationId);
      
      if (conversation?.conversation_type === 'agent') {
        // Fetch agent messages
        const response = await chatAPI.getAgentMessages(conversationId);
        const sortedMessages = (response.data || []).sort((a, b) => 
          new Date(a.created_at) - new Date(b.created_at)
        );
        setMessages(sortedMessages);
        await chatAPI.markAgentConversationRead(conversationId);
      } else {
        // Fetch customer messages
        const response = await chatAPI.getConversation(conversationId);
        if (response.success) {
          setMessages(response.messages);
          await chatAPI.markMessagesAsRead(conversationId);
        }
      }
      
      // Update conversation unread count in local state
      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversationId 
            ? { ...conv, unread_count: 0 }
            : conv
        )
      );
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setMessagesLoading(false);
    }
  };

  const subscribeToConversation = (conversationId) => {
    const conversation = conversations.find(c => c.id === conversationId);
    
    if (conversation?.conversation_type === 'agent') {
      // Subscribe to agent conversation channel
      const channelName = `agent-conversation.${conversationId}`;
      websocketService.subscribeToChannel(channelName, 'agent.message.sent', (data) => {
        handleNewMessage(data);
      });
    } else {
      // Subscribe to customer conversation channel
      websocketService.subscribeToConversation(conversationId, {
        onMessageReceived: handleNewMessage,
        onError: (error) => {
          console.error('Subscription error:', error);
        }
      });
    }
  };


  const handleNewMessage = useCallback((data) => {
    // Handle different message structures from WebSocket
    let messageData = data.message || data;
    
    // Check if message is from current conversation
    if (messageData && selectedConversation && messageData.conversation_id === selectedConversation.id) {
      // Check if message already exists to prevent duplicates
      setMessages(prev => {
        const messageExists = prev.some(msg => msg.id === messageData.id);
        if (!messageExists) {
          return [...prev, messageData];
        }
        return prev;
      });

      // Mark as read if the user is viewing this conversation
      if (messageData.receiver_id === currentUser?.id) {
        chatAPI.markMessagesAsRead(messageData.conversation_id, [messageData.id]);
      }
    }
    
    // Update conversations list
    if (messageData) {
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
              last_message_at: messageData.created_at,
              unread_count: messageData.receiver_id === currentUser?.id && 
                           (!selectedConversation || selectedConversation.id !== messageData.conversation_id)
                           ? conv.unread_count + 1 
                           : conv.unread_count
            };
          }
          return conv;
        })
      );
    }
  }, [selectedConversation, currentUser]);

  const handleNewMessageNotification = useCallback((messageData) => {
    // This handles messages from conversations not currently selected
    if (!selectedConversation || messageData.conversation_id !== selectedConversation.id) {
      // Show browser notification if supported
      if ('Notification' in window && Notification.permission === 'granted') {
        const senderName = messageData.sender?.name || messageData.message?.sender?.name || 'Someone';
        const messageText = messageData.message?.message || messageData.message || 'New message';
        
        new Notification(`New message from ${senderName}`, {
          body: messageText,
          icon: '/favicon.ico'
        });
      }
    }
  }, [selectedConversation]);

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    fetchMessages(conversation.id);
  };

  const handleSendMessage = async (message, attachment = null) => {
    if (!selectedConversation) return;

    try {
      let response;
      
      if (selectedConversation.conversation_type === 'agent') {
        // Send agent message
        const formData = new FormData();
        formData.append('conversation_id', selectedConversation.id);
        formData.append('message', message);
        if (attachment) {
          formData.append('images[]', attachment);
        }
        response = await chatAPI.sendAgentMessage(formData);
        // Wrap response to match customer message format
        response = { success: true, message: response.data };
      } else {
        // Send customer message
        response = await chatAPI.sendMessage(selectedConversation.id, message, attachment);
      }
      
      if (response.success || response.data) {
        const sentMessage = response.message || response.data;
        
        // Immediately add the sent message for instant UI update
        setMessages(prev => {
          const messageExists = prev.some(msg => msg.id === sentMessage.id);
          if (!messageExists) {
            return [...prev, sentMessage];
          }
          return prev;
        });
        
        // Update conversations list
        setConversations(prev => 
          prev.map(conv => {
            if (conv.id === selectedConversation.id) {
              return {
                ...conv,
                latest_message: {
                  message: sentMessage.message,
                  sender_id: sentMessage.sender_id,
                  created_at: sentMessage.created_at
                },
                last_message_at: sentMessage.created_at
              };
            }
            return conv;
          })
        );
        
        return response;
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  };

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  return (
    <>
      <Head>
        <title>Chat - Seller Portal</title>
      </Head>

      <div className="h-screen flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 p-6 border-b border-secondary-200 bg-white">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div>
              <h1 className="text-2xl font-bold text-secondary-900 flex items-center">
                <MessageSquare className="w-6 h-6 mr-2" />
                Chat
              </h1>
              <p className="mt-1 text-sm text-secondary-600">
                Communicate with buyers in real-time
              </p>
            </div>
            <div className="flex space-x-3 mt-4 sm:mt-0">
              <Button variant="outline" size="sm">
                <Users className="w-4 h-4 mr-2" />
                New Chat
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Conversations List */}
          <ConversationList
            conversations={conversations}
            selectedConversation={selectedConversation}
            onSelectConversation={handleSelectConversation}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            loading={loading}
          />

          {/* Chat Window */}
          <ChatWindow
            ref={chatWindowRef}
            conversation={selectedConversation}
            messages={messages}
            onSendMessage={handleSendMessage}
            currentUser={user}
            loading={messagesLoading}
            onMessagesUpdate={setMessages}
          />
        </div>
      </div>
    </>
  );
}
