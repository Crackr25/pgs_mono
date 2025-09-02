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

  const handleSendMessage = useCallback(async (message, attachment = null) => {
    if (!selectedConversation) return;

    try {
      const response = await apiService.sendBuyerMessageWithAttachment(
        selectedConversation.id,
        message,
        attachment
      );
      
      if (response.success) {
        // Update the messages list locally instead of reloading everything
        setMessages(prev => [...prev, response.message]);
        
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
