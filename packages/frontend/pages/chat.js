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
  const { user } = useAuth();

  // Initialize WebSocket connection and fetch data
  useEffect(() => {
    initializeChat();
    
    return () => {
      websocketService.disconnect();
    };
  }, []);

  // Subscribe to conversation when selected
  useEffect(() => {
    if (selectedConversation && currentUser) {
      subscribeToConversation(selectedConversation.id);
      fetchMessages(selectedConversation.id);
    }
    
    return () => {
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
      websocketService.connect(token);
      
      // Subscribe to user channel for notifications
      if (userData?.id) {
        websocketService.subscribeToUserChannel(userData.id, {
          onMessageNotification: handleNewMessageNotification
        });
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

  const handleNewMessage = useCallback((messageData) => {
    // Add message to current conversation if it matches
    if (selectedConversation && messageData.conversation_id === selectedConversation.id) {
      setMessages(prev => [...prev, messageData]);
      
      // Mark as read if the user is viewing this conversation
      if (messageData.receiver_id === currentUser?.id) {
        chatAPI.markMessagesAsRead(messageData.conversation_id, [messageData.id]);
      }
    }
    
    // Update conversations list
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
  }, [selectedConversation, currentUser]);

  const handleNewMessageNotification = useCallback((messageData) => {
    // This handles messages from conversations not currently selected
    if (!selectedConversation || messageData.conversation_id !== selectedConversation.id) {
      // Show browser notification if supported
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(`New message from ${messageData.sender.name}`, {
          body: messageData.message,
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
        // Message will be added via WebSocket event
        console.log('Message sent successfully');
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
