import { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';

export default function FloatingChatIcon({ onClick, isVisible = true, className = '' }) {
  const [isHovered, setIsHovered] = useState(false);

  if (!isVisible) return null;

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`fixed bottom-6 right-6 z-[50] w-14 h-14 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group transform hover:scale-105 ${className}`}
      aria-label="Open chat"
    >
      <MessageCircle className={`w-6 h-6 transition-transform duration-300 ${isHovered ? 'scale-110' : 'scale-100'}`} />
      
      {/* Pulse animation */}
      <div className="absolute inset-0 rounded-full bg-primary-600 animate-ping opacity-20"></div>
      
      {/* Tooltip */}
      <div className="absolute right-full mr-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
        Chat with supplier
        <div className="absolute top-1/2 left-full transform -translate-y-1/2 w-0 h-0 border-l-4 border-l-gray-900 border-t-4 border-t-transparent border-b-4 border-b-transparent"></div>
      </div>
    </button>
  );
}
