import { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, MoreVertical, Phone, Video, Info, MessageSquare, Clock, Check, AlertCircle, RotateCcw, Archive, Trash2, Flag, UserX, X, FileText, Image, Download } from 'lucide-react';
import Button from '../common/Button';
import ConfirmationModal from '../common/ConfirmationModal';

export default function ChatWindow({ 
  conversation, 
  messages = [], 
  onSendMessage, 
  currentUser,
  loading = false,
  onMessagesUpdate
}) {
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: '', data: null });
  const [selectedFile, setSelectedFile] = useState(null);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const dropdownRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };


  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleDropdownAction = (action) => {
    setShowDropdown(false);
    
    switch (action) {
      case 'info':
        // Show conversation info/details
        console.log('Show conversation info for:', conversation);
        break;
      case 'archive':
        // Archive conversation
        console.log('Archive conversation:', conversation.id);
        break;
      case 'delete':
        // Show delete confirmation modal
        setConfirmModal({
          isOpen: true,
          type: 'delete',
          data: conversation
        });
        break;
      case 'report':
        // Report conversation/user
        console.log('Report conversation:', conversation.id);
        break;
      case 'block':
        // Show block confirmation modal
        setConfirmModal({
          isOpen: true,
          type: 'block',
          data: conversation
        });
        break;
      default:
        break;
    }
  };

  const handleConfirmAction = () => {
    const { type, data } = confirmModal;
    
    switch (type) {
      case 'delete':
        console.log('Delete conversation:', data.id);
        // Add your delete conversation API call here
        break;
      case 'block':
        console.log('Block user:', data.buyer.id);
        // Add your block user API call here
        break;
      default:
        break;
    }
    
    setConfirmModal({ isOpen: false, type: '', data: null });
  };

  const handleCloseModal = () => {
    setConfirmModal({ isOpen: false, type: '', data: null });
  };

  const getModalConfig = () => {
    const { type, data } = confirmModal;
    
    switch (type) {
      case 'delete':
        return {
          title: 'Delete Conversation',
          message: 'Are you sure you want to delete this conversation? This action cannot be undone and all messages will be permanently removed.',
          confirmText: 'Delete',
          cancelText: 'Cancel',
          type: 'danger',
          icon: <Trash2 className="w-5 h-5" />
        };
      case 'block':
        return {
          title: 'Block User',
          message: `Are you sure you want to block ${data?.buyer?.name}? You won't receive messages from them anymore and they won't be able to contact you.`,
          confirmText: 'Block User',
          cancelText: 'Cancel',
          type: 'danger',
          icon: <UserX className="w-5 h-5" />
        };
      default:
        return {};
    }
  };

  const handleRetry = async (failedMessage) => {
    const updatedMessages = messages.map(msg => 
      msg.id === failedMessage.id ? { ...msg, status: 'sending' } : msg
    );
    onMessagesUpdate?.(updatedMessages);

    try {
      const response = await onSendMessage(failedMessage.message);
      
      if (response?.success) {
        const realMessage = { ...response.message, status: 'sent' };
        const finalMessages = messages.map(msg => 
          msg.id === failedMessage.id ? realMessage : msg
        );
        onMessagesUpdate?.(finalMessages);
      }
    } catch (error) {
      console.error('Failed to retry message:', error);
      
      const retryFailedMessages = messages.map(msg => 
        msg.id === failedMessage.id ? { ...msg, status: 'failed' } : msg
      );
      onMessagesUpdate?.(retryFailedMessages);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Check file size (limit to 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleAttachmentClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSend = async () => {
    if ((!newMessage.trim() && !selectedFile) || sending) return;

    const messageText = newMessage.trim() || '';
    const tempId = `temp-${Date.now()}`;
    
    // Optimistic update - add message immediately
    const optimisticMessage = {
      id: tempId,
      conversation_id: conversation.id,
      sender_id: currentUser?.id,
      receiver_id: conversation.buyer.id === currentUser?.id ? conversation.seller.id : conversation.buyer.id,
      message: messageText,
      attachment: selectedFile ? {
        name: selectedFile.name,
        size: selectedFile.size,
        type: selectedFile.type,
        uploading: true
      } : null,
      created_at: new Date().toISOString(),
      read: false,
      status: 'sending',
      sender: {
        id: currentUser?.id,
        name: currentUser?.name,
        email: currentUser?.email
      }
    };

    // Add to messages immediately
    const updatedMessages = [...messages, optimisticMessage];
    onMessagesUpdate?.(updatedMessages);

    setNewMessage('');
    const fileToSend = selectedFile;
    setSelectedFile(null);
    setSending(true);

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    try {
      const response = await onSendMessage(messageText, fileToSend);
      
      // Replace optimistic message with real message
      if (response?.success) {
        const realMessage = { ...response.message, status: 'sent' };
        const finalMessages = updatedMessages.map(msg => 
          msg.id === tempId ? realMessage : msg
        );
        onMessagesUpdate?.(finalMessages);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      
      // Mark message as failed
      const failedMessages = updatedMessages.map(msg => 
        msg.id === tempId ? { ...msg, status: 'failed' } : msg
      );
      onMessagesUpdate?.(failedMessages);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaChange = (e) => {
    setNewMessage(e.target.value);
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const shouldShowDateSeparator = (currentMessage, previousMessage) => {
    if (!previousMessage) return true;
    
    const currentDate = new Date(currentMessage.created_at).toDateString();
    const previousDate = new Date(previousMessage.created_at).toDateString();
    
    return currentDate !== previousDate;
  };

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-secondary-50">
        <div className="text-center">
          <MessageSquare className="w-12 h-12 text-secondary-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-secondary-900 mb-2">
            Select a conversation
          </h3>
          <p className="text-secondary-600">
            Choose a conversation from the sidebar to start messaging
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 p-4 border-b border-secondary-200 bg-white">
          <div className="animate-pulse flex items-center space-x-3">
            <div className="w-10 h-10 bg-secondary-200 rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-secondary-200 rounded w-1/3 mb-2"></div>
              <div className="h-3 bg-secondary-200 rounded w-1/4"></div>
            </div>
          </div>
        </div>
        
        {/* Messages */}
        <div className="flex-1 p-4 space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className={`animate-pulse flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
              <div className={`max-w-xs p-3 rounded-lg ${i % 2 === 0 ? 'bg-secondary-200' : 'bg-primary-200'}`}>
                <div className="h-4 bg-secondary-300 rounded mb-2"></div>
                <div className="h-3 bg-secondary-300 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-secondary-200 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-primary-600">
                {getInitials(conversation.buyer.name)}
              </span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-secondary-900">
                {conversation.buyer.name}
              </h3>
              <p className="text-sm text-secondary-500">{conversation.buyer.email}</p>
              {conversation.order_id && (
                <p className="text-xs text-blue-600">Order #{conversation.order_id}</p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="relative" ref={dropdownRef}>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
              
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-secondary-200 z-50">
                  <div className="py-1">
                    <button
                      onClick={() => handleDropdownAction('info')}
                      className="flex items-center w-full px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50 hover:text-secondary-900"
                    >
                      <Info className="w-4 h-4 mr-3" />
                      Conversation Info
                    </button>
                    
                    <button
                      onClick={() => handleDropdownAction('archive')}
                      className="flex items-center w-full px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50 hover:text-secondary-900"
                    >
                      <Archive className="w-4 h-4 mr-3" />
                      Archive Chat
                    </button>
                    
                    <div className="border-t border-secondary-100 my-1"></div>
                    
                    <button
                      onClick={() => handleDropdownAction('report')}
                      className="flex items-center w-full px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50 hover:text-secondary-900"
                    >
                      <Flag className="w-4 h-4 mr-3" />
                      Report User
                    </button>
                    
                    <button
                      onClick={() => handleDropdownAction('block')}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700"
                    >
                      <UserX className="w-4 h-4 mr-3" />
                      Block User
                    </button>
                    
                    <div className="border-t border-secondary-100 my-1"></div>
                    
                    <button
                      onClick={() => handleDropdownAction('delete')}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4 mr-3" />
                      Delete Chat
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-secondary-50">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-semibold text-primary-600">
                  {getInitials(conversation.buyer.name)}
                </span>
              </div>
              <h3 className="text-lg font-medium text-secondary-900 mb-2">
                Start a conversation with {conversation.buyer.name}
              </h3>
              <p className="text-secondary-600 text-sm">
                Send a message to begin your conversation
              </p>
            </div>
          </div>
        ) : (
          messages.map((message, index) => {
            const isCurrentUser = message.sender_id === currentUser?.id;
            const previousMessage = index > 0 ? messages[index - 1] : null;
            const showDateSeparator = shouldShowDateSeparator(message, previousMessage);

            return (
              <div key={message.id}>
                {showDateSeparator && (
                  <div className="flex items-center justify-center my-4">
                    <div className="bg-secondary-200 text-secondary-600 text-xs px-3 py-1 rounded-full">
                      {formatDate(message.created_at)}
                    </div>
                  </div>
                )}
                
                <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    isCurrentUser 
                      ? message.status === 'failed' 
                        ? 'bg-red-100 text-red-900 border border-red-200' 
                        : message.status === 'sending'
                        ? 'bg-primary-300 text-white opacity-70'
                        : 'bg-primary-600 text-white'
                      : 'bg-white text-secondary-900 border border-secondary-200'
                  }`}>
                    {message.message && (
                      <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                    )}
                    
                    {/* Attachment Display */}
                    {(message.attachment || message.attachments) && (
                      <div className="mt-2">
                        {(() => {
                          const attachment = message.attachment || message.attachments?.[0];
                          const isImage = attachment?.type?.startsWith('image/');
                          
                          if (isImage && attachment?.url) {
                            return (
                              <div className="max-w-xs">
                                <img 
                                  src={attachment.url?.startsWith('http') ? attachment.url : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8000'}${attachment.url}`} 
                                  alt={attachment.name}
                                  className="rounded-lg max-w-full h-auto cursor-pointer hover:opacity-90 transition-opacity"
                                  onClick={() => window.open(attachment.url?.startsWith('http') ? attachment.url : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8000'}${attachment.url}`, '_blank')}
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'block';
                                  }}
                                />
                                <div className="hidden p-2 bg-secondary-50 rounded border">
                                  <div className="flex items-center space-x-2">
                                    <Image className="w-4 h-4 text-secondary-600" />
                                    <span className="text-sm font-medium text-secondary-900">
                                      {attachment.name}
                                    </span>
                                    <a 
                                      href={attachment.url?.startsWith('http') ? attachment.url : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8000'}${attachment.url}`} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-xs text-blue-600 hover:text-blue-800"
                                    >
                                      <Download className="w-3 h-3" />
                                    </a>
                                  </div>
                                </div>
                                <div className="text-xs text-secondary-500 mt-1">
                                  {attachment.name} • {attachment.size ? `${(attachment.size / 1024).toFixed(1)} KB` : ''}
                                </div>
                              </div>
                            );
                          } else {
                            return (
                              <div className="p-2 bg-secondary-50 rounded border">
                                <div className="flex items-center space-x-2">
                                  <FileText className="w-4 h-4 text-secondary-600" />
                                  <span className="text-sm font-medium text-secondary-900">
                                    {attachment?.name}
                                  </span>
                                  {attachment?.uploading ? (
                                    <div className="text-xs text-secondary-500">Uploading...</div>
                                  ) : attachment?.url ? (
                                    <a 
                                      href={attachment.url?.startsWith('http') ? attachment.url : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8000'}${attachment.url}`} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-xs text-blue-600 hover:text-blue-800"
                                    >
                                      <Download className="w-3 h-3" />
                                    </a>
                                  ) : null}
                                </div>
                                {attachment?.size && (
                                  <div className="text-xs text-secondary-500 mt-1">
                                    {(attachment.size / 1024).toFixed(1)} KB
                                  </div>
                                )}
                              </div>
                            );
                          }
                        })()}
                      </div>
                    )}
                    
                    <div className={`flex items-center justify-end mt-1 space-x-1 ${
                      isCurrentUser 
                        ? message.status === 'failed' 
                          ? 'text-red-600' 
                          : message.status === 'sending'
                          ? 'text-primary-100'
                          : 'text-primary-200'
                        : 'text-secondary-500'
                    }`}>
                      <span className="text-xs">{formatTime(message.created_at)}</span>
                      {isCurrentUser && (
                        <>
                          {message.status === 'sending' && (
                            <Clock className="w-3 h-3 animate-spin" />
                          )}
                          {message.status === 'sent' && message.read && (
                            <div className="w-3 h-3 rounded-full bg-green-400"></div>
                          )}
                          {message.status === 'sent' && !message.read && (
                            <Check className="w-3 h-3" />
                          )}
                          {message.status === 'failed' && (
                            <div className="flex items-center space-x-1">
                              <AlertCircle className="w-3 h-3" />
                              <button 
                                onClick={() => handleRetry(message)}
                                className="text-xs underline hover:no-underline"
                              >
                                Retry
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="flex-shrink-0 p-4 bg-white border-t border-secondary-200">
        {/* File Preview */}
        {selectedFile && (
          <div className="mb-3 p-3 bg-secondary-50 rounded-lg border">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {selectedFile.type.startsWith('image/') ? (
                  <Image className="w-5 h-5 text-secondary-600" />
                ) : (
                  <FileText className="w-5 h-5 text-secondary-600" />
                )}
                <div>
                  <p className="text-sm font-medium text-secondary-900">{selectedFile.name}</p>
                  <p className="text-xs text-secondary-500">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              <button
                onClick={handleRemoveFile}
                className="text-secondary-400 hover:text-secondary-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        <div className="flex items-end space-x-3">
          <Button 
            variant="ghost" 
            size="sm" 
            className="mb-2"
            onClick={handleAttachmentClick}
          >
            <Paperclip className="w-4 h-4" />
          </Button>
          
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx,.txt,.zip,.rar"
          />
          
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={newMessage}
              onChange={handleTextareaChange}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              rows="1"
              style={{ minHeight: '40px', maxHeight: '120px' }}
              disabled={sending}
            />
          </div>
          
          <Button 
            onClick={handleSend} 
            disabled={(!newMessage.trim() && !selectedFile) || sending}
            className="mb-2"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmAction}
        {...getModalConfig()}
      />
    </div>
  );
}
