import { useState, useEffect, useCallback } from 'react';
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

  // Initialize WebSocket connection and fetch data
  useEffect(() => {
    // Expose WebSocket service to window for debugging
    window.websocketService = websocketService;
    
    initializeChat();
    
    return () => {
      websocketService.disconnect();
    };
  }, []);

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
      console.log('👤 Current user:', userData);
      console.log('🔑 User type:', userData?.usertype);
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
      const response = await chatAPI.getConversations();
      if (response.success) {
        console.log(response.conversations);
        setConversations(response.conversations);
      }
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    }
  };

  const fetchMessages = async (conversationId) => {
    setMessagesLoading(true);
    try {
      const response = await chatAPI.getConversation(conversationId);
      if (response.success) {
        console.log(response.messages);
        setMessages(response.messages);
        
        // Mark messages as read
        console.log('📖 Marking messages as read for conversation:', conversationId);
        console.log('👤 Current user type:', currentUser?.usertype);
        await chatAPI.markMessagesAsRead(conversationId);
        
        // Update conversation unread count in local state
        setConversations(prev => 
          prev.map(conv => 
            conv.id === conversationId 
              ? { ...conv, unread_count: 0 }
              : conv
          )
        );
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setMessagesLoading(false);
    }
  };

  const subscribeToConversation = (conversationId) => {
    websocketService.subscribeToConversation(conversationId, {
      onMessageReceived: handleNewMessage,
      onSubscribed: () => {
        console.log(`Subscribed to conversation ${conversationId}`);
      },
      onError: (error) => {
        console.error('Subscription error:', error);
      }
    });
  };


  const handleNewMessage = useCallback((data) => {
    console.log('🔔 Real-time message received:', data);
    console.log('📋 Current selected conversation:', selectedConversation?.id);
    
    // Handle different message structures from WebSocket
    let messageData = data.message || data; // Support both wrapped and direct message format
    
    console.log('📋 Message data:', messageData);
    console.log('📋 Message conversation_id:', messageData.conversation_id);
    console.log('📋 Current conversation id:', selectedConversation?.id);
    
    // Check if message is from current conversation
    if (messageData && selectedConversation && messageData.conversation_id === selectedConversation.id) {
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

      // Mark as read if the user is viewing this conversation
      if (messageData.receiver_id === currentUser?.id) {
        console.log('📖 Marking message as read');
        chatAPI.markMessagesAsRead(messageData.conversation_id, [messageData.id]);
      }
    } else {
      console.log('⚠️ Message not added - reason:');
      console.log('   - Has messageData:', !!messageData);
      console.log('   - Has selectedConversation:', !!selectedConversation);
      console.log('   - Conversation IDs match:', messageData?.conversation_id === selectedConversation?.id);
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
      const response = await chatAPI.sendMessage(selectedConversation.id, message, attachment);
      if (response.success) {
        console.log('Message sent successfully');
        
        // Immediately add the sent message for instant UI update
        setMessages(prev => {
          const messageExists = prev.some(msg => msg.id === response.message.id);
          if (!messageExists) {
            console.log('✅ Adding sent message to local state immediately');
            return [...prev, response.message];
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
                  message: response.message.message,
                  sender_id: response.message.sender_id,
                  created_at: response.message.created_at
                },
                last_message_at: response.message.created_at
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
