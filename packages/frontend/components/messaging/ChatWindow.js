import { useState } from 'react';
import { Send, Paperclip, Smile, MoreVertical } from 'lucide-react';
import Button from '../common/Button';
import Badge from '../common/Badge';

export default function ChatWindow({ conversation, onSendMessage }) {
  const [message, setMessage] = useState('');
  const [showTranslate, setShowTranslate] = useState(false);

  const handleSendMessage = () => {
    if (message.trim()) {
      onSendMessage && onSendMessage(message);
      setMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const mockMessages = [
    {
      id: 1,
      sender: 'buyer',
      senderName: 'John Smith',
      message: 'Hi, I\'m interested in your LED light fixtures. Can you provide more details about the 100W variant?',
      timestamp: '10:30 AM',
      translated: false
    },
    {
      id: 2,
      sender: 'supplier',
      senderName: 'You',
      message: 'Hello! Thank you for your interest. The 100W LED fixture has the following specifications: IP65 rating, 5000K color temperature, and 10,000 lumens output. Would you like me to send you the detailed spec sheet?',
      timestamp: '10:35 AM',
      translated: false
    },
    {
      id: 3,
      sender: 'buyer',
      senderName: 'John Smith',
      message: 'Yes, please send the spec sheet. Also, what\'s your MOQ and lead time for this product?',
      timestamp: '10:40 AM',
      translated: false
    },
    {
      id: 4,
      sender: 'supplier',
      senderName: 'You',
      message: 'I\'ll send you the spec sheet right away. Our MOQ is 100 units and lead time is 15-20 days. For quantities over 500 units, we can offer better pricing.',
      timestamp: '10:42 AM',
      translated: false
    }
  ];

  return (
    <div className="flex flex-col h-full bg-white rounded-lg border border-secondary-200">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-secondary-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-primary-600">JS</span>
          </div>
          <div>
            <h3 className="font-medium text-secondary-900">John Smith</h3>
            <p className="text-sm text-secondary-500">ABC Trading Co.</p>
          </div>
          <Badge variant="success" size="xs">Online</Badge>
        </div>
        
        <div className="flex items-center space-x-2">
          <select 
            className="text-sm border border-secondary-300 rounded px-2 py-1"
            onChange={(e) => setShowTranslate(e.target.value !== 'en')}
          >
            <option value="en">English</option>
            <option value="zh">中文</option>
            <option value="es">Español</option>
            <option value="tl">Tagalog</option>
          </select>
          <button className="p-2 text-secondary-400 hover:text-secondary-600">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {mockMessages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'supplier' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
              msg.sender === 'supplier'
                ? 'bg-primary-600 text-white'
                : 'bg-secondary-100 text-secondary-900'
            }`}>
              <p className="text-sm">{msg.message}</p>
              {showTranslate && (
                <div className="mt-2 pt-2 border-t border-opacity-20 border-white">
                  <p className="text-xs opacity-75">
                    [Translated] {msg.message}
                  </p>
                </div>
              )}
              <p className={`text-xs mt-1 ${
                msg.sender === 'supplier' ? 'text-primary-100' : 'text-secondary-500'
              }`}>
                {msg.timestamp}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-secondary-200">
        <div className="flex items-end space-x-2">
          <div className="flex-1">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              rows={2}
              className="w-full px-3 py-2 border border-secondary-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div className="flex flex-col space-y-2">
            <button className="p-2 text-secondary-400 hover:text-secondary-600">
              <Paperclip className="w-4 h-4" />
            </button>
            <button className="p-2 text-secondary-400 hover:text-secondary-600">
              <Smile className="w-4 h-4" />
            </button>
          </div>
          <Button onClick={handleSendMessage} disabled={!message.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
