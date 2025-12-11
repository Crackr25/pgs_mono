import { useState, useEffect, useRef } from 'react';
import { X, Send, Loader, Paperclip, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../lib/api';
import websocketService from '../../lib/websocket';
import { toast } from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

export default function AgentFloatingChat({ 
  isOpen, 
  onClose, 
  recipientAgent = null,
  className = '' 
}) {
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  
  const { user } = useAuth();
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Load or create conversation when modal opens
  useEffect(() => {
    if (isOpen && recipientAgent && user) {
      initializeConversation();
      // Initialize WebSocket
      websocketService.connect();
    } else if (!isOpen && conversation?.id) {
      // Unsubscribe when closing
      websocketService.unsubscribeFromChannel(`agent-conversation.${conversation.id}`);
    }
  }, [isOpen, recipientAgent, user]);

  // Subscribe to WebSocket when conversation is set
  useEffect(() => {
    if (conversation?.id && user) {
      const channelName = `agent-conversation.${conversation.id}`;
      
      websocketService.subscribeToChannel(channelName, 'agent.message.sent', (data) => {
        if (data.message.sender_id !== user.id) {
          const messageToAdd = {
            ...data.message,
            created_at: data.message.created_at || new Date().toISOString()
          };
          setMessages(prev => [...prev, messageToAdd]);
        }
      });

      return () => {
        websocketService.unsubscribeFromChannel(channelName);
      };
    }
  }, [conversation?.id, user]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-scroll when modal opens and loading completes
  useEffect(() => {
    if (isOpen && !loading) {
      // Use setTimeout to ensure DOM is updated
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    }
  }, [isOpen, loading]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  };

  const initializeConversation = async () => {
    try {
      setLoading(true);
      
      const conversationsResponse = await apiService.getAgentConversations();
      const existingConversation = conversationsResponse.data?.find(
        conv => conv.other_agent?.id === recipientAgent.id
      );

      if (existingConversation) {
        setConversation({
          id: existingConversation.id,
          agent1_id: user.id,
          agent2_id: recipientAgent.id,
          agent1: user,
          agent2: recipientAgent,
        });
        await loadMessages(existingConversation.id);
      } else {
        setConversation({
          id: null,
          agent1_id: user.id,
          agent2_id: recipientAgent.id,
          agent1: user,
          agent2: recipientAgent,
          isNew: true
        });
        setMessages([]);
      }
    } catch (error) {
      console.error('Error initializing conversation:', error);
      toast.error('Failed to load conversation');
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId) => {
    try {
      const response = await apiService.getAgentMessages(conversationId);
      // Sort messages by created_at to ensure proper order
      const sortedMessages = (response.data || []).sort((a, b) => 
        new Date(a.created_at) - new Date(b.created_at)
      );
      setMessages(sortedMessages);
      
      // Mark conversation as read
      await apiService.markAgentConversationRead(conversationId);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() && selectedFiles.length === 0) {
      return;
    }

    try {
      setSending(true);
      const formData = new FormData();
      
      if (conversation?.id) {
        formData.append('conversation_id', conversation.id);
      } else {
        formData.append('receiver_id', recipientAgent.id);
      }
      
      if (newMessage.trim()) {
        formData.append('message', newMessage);
      }

      selectedFiles.forEach((file) => {
        if (file.type.startsWith('image/')) {
          formData.append('images[]', file);
        } else if (file.type.startsWith('video/')) {
          formData.append('videos[]', file);
        } else {
          formData.append('files[]', file);
        }
      });

      const response = await apiService.sendAgentMessage(formData);
      const actualMessage = response.data;
      
      if (!conversation?.id && actualMessage.agent_conversation_id) {
        setConversation({
          ...conversation,
          id: actualMessage.agent_conversation_id
        });
      }

      const messageToAdd = {
        ...actualMessage,
        created_at: actualMessage.created_at || new Date().toISOString()
      };
      setMessages(prev => [...prev, messageToAdd]);
      setNewMessage('');
      setSelectedFiles([]);
      
      toast.success('Message sent');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  if (!isOpen) return null;

  const otherAgent = conversation?.agent1_id === user?.id ? conversation?.agent2 : conversation?.agent1;

  return (
    <div className={`fixed bottom-6 right-6 z-[60] ${className}`}>
      <div className="w-96 h-[600px] bg-white rounded-lg shadow-2xl flex flex-col overflow-hidden border border-secondary-200">
        {/* Header */}
        <div className="bg-primary-600 text-white p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium">
                {otherAgent?.name?.charAt(0).toUpperCase() || recipientAgent?.name?.charAt(0).toUpperCase() || 'A'}
              </span>
            </div>
            <div>
              <h3 className="font-semibold">
                {otherAgent?.name || recipientAgent?.name || 'Agent'}
              </h3>
              <p className="text-xs text-white/80">
                {otherAgent?.active_company?.name || recipientAgent?.active_company?.name || 'Company Agent'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-secondary-50">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader className="w-6 h-6 animate-spin text-primary-600" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-secondary-500">
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((message, index) => {
              const isMyMessage = message.sender_id === user?.id;
              return (
                <div
                  key={message.id || `temp-${index}`}
                  className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[70%] ${isMyMessage ? 'bg-primary-600 text-white' : 'bg-white text-secondary-900'} rounded-lg p-3 shadow-sm`}>
                    {message.message && (
                      <p className="text-sm whitespace-pre-wrap break-words">{message.message}</p>
                    )}
                    
                    {/* Images */}
                    {message.images && message.images.length > 0 && (
                      <div className="mt-2 space-y-2">
                        {message.images.map((image, idx) => (
                          <img
                            key={idx}
                            src={image.url}
                            alt="attachment"
                            className="rounded max-w-full cursor-pointer hover:opacity-90"
                            onClick={() => window.open(image.url, '_blank')}
                          />
                        ))}
                      </div>
                    )}
                    
                    {/* Videos */}
                    {message.videos && message.videos.length > 0 && (
                      <div className="mt-2 space-y-2">
                        {message.videos.map((video, idx) => (
                          <video
                            key={idx}
                            src={video.url}
                            controls
                            className="rounded max-w-full"
                          />
                        ))}
                      </div>
                    )}
                    
                    {message.created_at && (
                      <p className={`text-xs mt-1 ${isMyMessage ? 'text-white/70' : 'text-secondary-500'}`}>
                        {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                      </p>
                    )}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Selected Files Preview */}
        {selectedFiles.length > 0 && (
          <div className="px-4 py-2 bg-secondary-100 border-t border-secondary-200">
            <div className="flex flex-wrap gap-2">
              {selectedFiles.map((file, index) => (
                <div key={index} className="relative bg-white rounded px-2 py-1 text-xs flex items-center space-x-1">
                  <span className="truncate max-w-[100px]">{file.name}</span>
                  <button
                    onClick={() => removeFile(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-secondary-200">
          <div className="flex items-end space-x-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              multiple
              accept="image/*,video/*"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-secondary-600 hover:text-primary-600 hover:bg-secondary-100 rounded-lg transition-colors"
              title="Attach files"
            >
              <Paperclip className="w-5 h-5" />
            </button>
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
              placeholder="Type a message..."
              rows={1}
              className="flex-1 resize-none border border-secondary-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <button
              type="submit"
              onClick={(e) => {
                console.log('Send button clicked!');
                console.log('Button disabled?', sending || (!newMessage.trim() && selectedFiles.length === 0));
              }}
              disabled={sending || (!newMessage.trim() && selectedFiles.length === 0)}
              className="p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {sending ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
