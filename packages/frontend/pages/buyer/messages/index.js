import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { ArrowLeft } from 'lucide-react';
import Button from '../../../components/common/Button';
import BuyerConversationList from '../../../components/buyer/BuyerConversationList';
import BuyerChatWindow from '../../../components/buyer/BuyerChatWindow';
import apiService from '../../../lib/api';
import websocketService from '../../../lib/websocket';
import { useAuth } from '../../../contexts/AuthContext';

export default function BuyerMessages() {
  const router = useRouter();
  const { conversation_id } = router.query;
  
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [lastMessageTimestamp, setLastMessageTimestamp] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchConversations();
    initializeWebSocket();
    
    return () => {
      websocketService.disconnect();
    };
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

  // Subscribe to WebSocket when conversation is selected
  useEffect(() => {
    if (selectedConversation && user) {
      subscribeToConversation(selectedConversation.id);
    }
    
    return () => {
      if (selectedConversation) {
        websocketService.unsubscribeFromConversation(selectedConversation.id);
      }
    };
  }, [selectedConversation, user]);

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
      
      // Update last message timestamp for polling
      if (response.messages && response.messages.length > 0) {
        const latestMessage = response.messages[response.messages.length - 1];
        setLastMessageTimestamp(latestMessage.created_at);
        console.log('📅 Updated last message timestamp:', latestMessage.created_at);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setMessagesLoading(false);
    }
  };

  const initializeWebSocket = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      // Connect WebSocket
      websocketService.connect(token);
      
      // Subscribe to user channel for notifications
      if (user?.id) {
        websocketService.subscribeToUserChannel(user.id, {
          onMessageNotification: handleNewMessageNotification
        });
      }
    } catch (error) {
      console.error('Failed to initialize WebSocket:', error);
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
    console.log('🔔 New message received via WebSocket:', messageData);
    
    // Add message to current conversation if it matches
    if (selectedConversation && messageData.conversation_id === selectedConversation.id) {
      setMessages(prev => {
        const messageExists = prev.some(msg => msg.id === messageData.id);
        if (!messageExists) {
          return [...prev, messageData];
        }
        return prev;
      });
      
      // Mark as read if the user is viewing this conversation
      if (messageData.receiver_id === user?.id) {
        apiService.markBuyerMessagesAsRead({
          conversation_id: messageData.conversation_id,
          message_ids: [messageData.id]
        });
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
            unread_count: messageData.receiver_id === user?.id && 
                         (!selectedConversation || selectedConversation.id !== messageData.conversation_id)
                         ? conv.unread_count + 1 
                         : conv.unread_count
          };
        }
        return conv;
      })
    );
  }, [selectedConversation, user]);

  const handleNewMessageNotification = useCallback((messageData) => {
    // Show browser notification for messages not in current conversation
    if (!selectedConversation || messageData.conversation_id !== selectedConversation.id) {
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(`New message from ${messageData.sender.name}`, {
          body: messageData.message,
          icon: '/favicon.ico'
        });
      }
    }
  }, [selectedConversation]);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const handleSendMessage = useCallback(async (message, attachment = null) => {
    if (!selectedConversation) return;

    try {
      const response = await apiService.sendBuyerMessageWithAttachment(
        selectedConversation.id,
        message,
        attachment
      );
      
      if (response.success) {
        // Immediately add the sent message to local state
        setMessages(prev => {
          const messageExists = prev.some(msg => msg.id === response.message.id);
          if (!messageExists) {
            console.log('✅ Adding sent message to local state');
            return [...prev, response.message];
          }
          return prev;
        });
        
        // Update the conversation's last message info without full reload
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
  }, [selectedConversation]);

  const handleSelectConversation = (conversation) => {
    // Clear any existing polling interval
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }
    
    setSelectedConversation(conversation);
    fetchMessages(conversation.id);
    router.push(`/buyer/messages?conversation_id=${conversation.id}`, undefined, { shallow: true });
  };



  return (
    <>
      <Head>
        <title>Messages - Pinoy Global Supply</title>
      </Head>

      <div className="h-screen flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 p-6 border-b border-secondary-200 bg-white">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div>
              <h1 className="text-2xl font-bold text-secondary-900">Messages</h1>
              <p className="mt-1 text-sm text-secondary-600">
                Communicate with suppliers
              </p>
            </div>
            <div className="flex space-x-3 mt-4 sm:mt-0">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => router.push('/buyer')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Conversations List */}
          <BuyerConversationList
            conversations={conversations}
            selectedConversation={selectedConversation}
            onSelectConversation={handleSelectConversation}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            loading={loading}
          />

          {/* Chat Window */}
          <BuyerChatWindow
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
