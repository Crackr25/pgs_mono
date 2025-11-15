import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { 
  MessageSquare, 
  Search, 
  Filter, 
  Star, 
  Archive,
  MoreVertical,
  Globe
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import ChatWindow from '../components/messaging/ChatWindow';
import MessageTemplates from '../components/messaging/MessageTemplates';
import { messages } from '../lib/dummyData';

export default function Messages() {
  const router = useRouter();
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');

  // Redirect to real chat system
  useEffect(() => {
    router.replace('/chat');
  }, [router]);

  const filteredMessages = messages.filter(message =>
    message.sender.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectConversation = (message) => {
    setSelectedConversation(message);
  };

  const handleSendMessage = (messageText) => {
    console.log('Sending message:', messageText);
    // Here you would typically send the message to your backend
  };

  const handleSelectTemplate = (templateContent) => {
    setCurrentMessage(templateContent);
    setShowTemplates(false);
  };

  return (
    <>
      <Head>
        <title>Messages - SupplierHub</title>
      </Head>

      <div className="h-screen flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 p-6 border-b border-secondary-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div>
              <h1 className="text-2xl font-bold text-secondary-900">Messages</h1>
              <p className="mt-1 text-sm text-secondary-600">
                Communicate with buyers and manage your conversations
              </p>
            </div>
            <div className="flex space-x-3 mt-4 sm:mt-0">
              <Button
                variant="outline"
                onClick={() => setShowTemplates(!showTemplates)}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Templates
              </Button>
              <Button variant="outline">
                <Archive className="w-4 h-4 mr-2" />
                Archive
              </Button>
            </div>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar - Conversations List */}
          <div className="w-80 flex-shrink-0 bg-white border-r border-secondary-200 flex flex-col">
            {/* Search */}
            <div className="p-4 border-b border-secondary-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex border-b border-secondary-200">
              <button className="flex-1 px-4 py-2 text-sm font-medium text-primary-600 border-b-2 border-primary-600">
                All ({messages.length})
              </button>
              <button className="flex-1 px-4 py-2 text-sm font-medium text-secondary-500 hover:text-secondary-700">
                Unread ({messages.filter(m => m.unread).length})
              </button>
              <button className="flex-1 px-4 py-2 text-sm font-medium text-secondary-500 hover:text-secondary-700">
                Starred
              </button>
            </div>

            {/* Conversations */}
            <div className="flex-1 overflow-y-auto">
              {filteredMessages.map((message) => (
                <div
                  key={message.id}
                  onClick={() => handleSelectConversation(message)}
                  className={`p-4 border-b border-secondary-100 cursor-pointer hover:bg-secondary-50 ${
                    selectedConversation?.id === message.id ? 'bg-primary-50 border-primary-200' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-medium text-primary-600">
                        {message.sender.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-secondary-900 truncate">
                          {message.sender}
                        </h3>
                        <div className="flex items-center space-x-1">
                          {message.unread && (
                            <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                          )}
                          <span className="text-xs text-secondary-500">
                            {message.timestamp}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-secondary-500 mb-1">{message.company}</p>
                      <p className="text-sm text-secondary-600 truncate">
                        {message.message}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex">
            {/* Chat Window */}
            <div className="flex-1 flex flex-col">
              {selectedConversation ? (
                <ChatWindow
                  conversation={selectedConversation}
                  onSendMessage={handleSendMessage}
                />
              ) : (
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
              )}
            </div>

            {/* Templates Sidebar */}
            {showTemplates && (
              <div className="w-80 flex-shrink-0 border-l border-secondary-200">
                <MessageTemplates onSelectTemplate={handleSelectTemplate} />
              </div>
            )}
          </div>
        </div>

        {/* Translation Notice */}
        <div className="flex-shrink-0 bg-blue-50 border-t border-blue-200 p-3">
          <div className="flex items-center justify-center space-x-2 text-sm text-blue-700">
            <Globe className="w-4 h-4" />
            <span>Auto-translation is enabled. Messages will be translated automatically.</span>
          </div>
        </div>
      </div>
    </>
  );
}
