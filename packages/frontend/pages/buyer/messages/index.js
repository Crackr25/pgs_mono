import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { ArrowLeft } from 'lucide-react';
import Button from '../../../components/common/Button';
import BuyerConversationList from '../../../components/buyer/BuyerConversationList';
import BuyerChatWindow from '../../../components/buyer/BuyerChatWindow';
import apiService from '../../../lib/api';
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
  const [pollingInterval, setPollingInterval] = useState(null);
  const { user } = useAuth();

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

  // Start polling when a conversation is selected
  useEffect(() => {
    if (selectedConversation && user) {
      // Clear any existing polling interval
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
      
      // Start polling for new messages every 2 seconds
      const interval = setInterval(() => {
        pollForNewMessages(selectedConversation.id);
      }, 2000);
      
      setPollingInterval(interval);
    }
    
    return () => {
      // Clean up polling interval
      if (pollingInterval) {
        clearInterval(pollingInterval);
        setPollingInterval(null);
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

  const handleSendMessage = useCallback(async (message, attachment = null) => {
    if (!selectedConversation) return;

    try {
      const response = await apiService.sendBuyerMessageWithAttachment(
        selectedConversation.id,
        message,
        attachment
      );
      
      if (response.success) {
        // Immediately add the sent message to prevent polling duplicates
        setMessages(prev => {
          const messageExists = prev.some(msg => msg.id === response.message.id);
          if (!messageExists) {
            console.log('✅ Adding sent message to local state');
            return [...prev, response.message];
          }
          return prev;
        });
        
        // Update timestamp to prevent polling from fetching this message again
        setLastMessageTimestamp(response.message.created_at);
        console.log('📅 Updated timestamp after sending message:', response.message.created_at);
        
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
